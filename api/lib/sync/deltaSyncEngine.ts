import { z } from "zod";
import { getDb } from "../../queries/connection";
import {
  syncLogs, syncQueue, conflictResolutions, offlineOperations,
  pendingSync, deletedRecordsTombstone, deviceRegistrations,
} from "@db/schema";
import { eq, and, gte, lt, or, sql, desc, inArray } from "drizzle-orm";

export interface SyncChange {
  entityType: string;
  entityId: string | number;
  action: "create" | "update" | "delete";
  payload: Record<string, any>;
  version: number;
  deviceId?: string;
  localUuid?: string;
  timestamp: string;
}

export interface SyncConflict {
  entityType: string;
  entityId: string | number;
  localUuid: string;
  serverVersion: number;
  clientVersion: number;
  serverData: Record<string, any>;
  clientData: Record<string, any>;
  isFinancialEntry: boolean;
}

const FINANCIAL_ENTITY_TYPES = [
  "invoices", "invoiceItems", "customerPayments", "supplierPayments",
  "journalEntries", "journalEntryLines", "cashboxTransactions",
  "salarySlips", "payrollPeriods",
];

export function isFinancialEntity(entityType: string): boolean {
  return FINANCIAL_ENTITY_TYPES.includes(entityType);
}

export function generateUuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class DeltaSyncEngine {
  private db: ReturnType<typeof getDb>;

  constructor() {
    this.db = getDb();
  }

  async detectConflicts(
    changes: SyncChange[],
    tenantId: number,
  ): Promise<{ conflicts: SyncConflict[]; cleanChanges: SyncChange[] }> {
    const conflicts: SyncConflict[] = [];
    const cleanChanges: SyncChange[] = [];

    for (const change of changes) {
      const localUuid = change.localUuid || String(change.entityId);
      const tableName = this.resolveTableName(change.entityType);
      if (!tableName) {
        cleanChanges.push(change);
        continue;
      }

      try {
        const existing = await this.db.execute(
          sql`SELECT * FROM ${sql.identifier(tableName)} WHERE ${sql.identifier("local_uuid")} = ${localUuid} AND ${sql.identifier("tenant_id")} = ${tenantId} LIMIT 1`
        );

        if (existing.rows.length > 0) {
          const serverRecord = existing.rows[0] as any;
          const serverVersion = serverRecord.version || 0;
          const clientVersion = change.version || 0;

          if (clientVersion < serverVersion) {
            const isFinancial = isFinancialEntity(change.entityType);
            conflicts.push({
              entityType: change.entityType,
              entityId: change.entityId,
              localUuid,
              serverVersion,
              clientVersion,
              serverData: serverRecord,
              clientData: change.payload,
              isFinancialEntry: isFinancial,
            });

            if (!isFinancial) {
              cleanChanges.push(change);
            }
          } else {
            cleanChanges.push(change);
          }
        } else {
          cleanChanges.push(change);
        }
      } catch {
        cleanChanges.push(change);
      }
    }

    return { conflicts, cleanChanges };
  }

  async applyChanges(changes: SyncChange[], tenantId: number): Promise<{
    applied: number;
    failed: Array<{ entityId: string | number; error: string }>;
  }> {
    let applied = 0;
    const failed: Array<{ entityId: string | number; error: string }> = [];

    for (const change of changes) {
      try {
        const tableName = this.resolveTableName(change.entityType);
        if (!tableName) {
          failed.push({ entityId: change.entityId, error: `Unknown entity type: ${change.entityType}` });
          continue;
        }

        const localUuid = change.localUuid || String(change.entityId);
        const existing = await this.db.execute(
          sql`SELECT id FROM ${sql.identifier(tableName)} WHERE ${sql.identifier("local_uuid")} = ${localUuid} AND ${sql.identifier("tenant_id")} = ${tenantId} LIMIT 1`
        );

        if (change.action === "delete") {
          await this.db.execute(
            sql`UPDATE ${sql.identifier(tableName)} SET ${sql.identifier("deleted_at")} = NOW(), ${sql.identifier("updated_at")} = NOW() WHERE ${sql.identifier("local_uuid")} = ${localUuid} AND ${sql.identifier("tenant_id")} = ${tenantId}`
          );
          await this.db.insert(deletedRecordsTombstone).values({
            entityType: change.entityType,
            entityId: localUuid,
            tenantId,
            deletedAt: new Date(),
          });
        } else if (existing.rows.length > 0) {
          const setClauses = Object.entries(change.payload)
            .filter(([key]) => !["id", "tenantId", "tenant_id", "localUuid", "createdAt", "created_at"].includes(key))
            .map(([key, value]) => {
              const col = key.replace(/([A-Z])/g, "_$1").toLowerCase();
              return `${col} = ${typeof value === "string" ? `'${value.replace(/'/g, "''")}'` : value}`;
            })
            .join(", ");
          if (setClauses) {
            await this.db.execute(
              sql`UPDATE ${sql.identifier(tableName)} SET ${sql.raw(setClauses)}, ${sql.identifier("version")} = ${sql.identifier("version")} + 1, ${sql.identifier("updated_at")} = NOW() WHERE ${sql.identifier("local_uuid")} = ${localUuid}`
            );
          }
        } else {
          const insertData: Record<string, any> = {
            ...change.payload,
            tenant_id: tenantId,
            local_uuid: localUuid,
            version: 1,
            created_at: new Date(),
            updated_at: new Date(),
          };
          delete insertData.id;
          delete insertData.tenantId;
          const cols = Object.keys(insertData).map(k => k.replace(/([A-Z])/g, "_$1").toLowerCase());
          const vals = Object.values(insertData).map(v => typeof v === "string" ? `'${v.replace(/'/g, "''")}'` : v ?? "NULL");
          await this.db.execute(
            sql`INSERT INTO ${sql.identifier(tableName)} (${sql.raw(cols.join(", "))}) VALUES (${sql.raw(vals.join(", "))})`
          );
        }

        await this.logSync(tenantId, change.entityType, String(change.entityId), change.action, "synced");
        applied++;
      } catch (error: any) {
        failed.push({ entityId: change.entityId, error: error.message });
        await this.logSync(tenantId, change.entityType, String(change.entityId), change.action, "failed", error.message);
      }
    }

    return { applied, failed };
  }

  async logSync(
    tenantId: number,
    entityType: string,
    entityId: string,
    action: string,
    status: string,
    message?: string,
  ): Promise<void> {
    await this.db.insert(syncLogs).values({
      tenantId,
      direction: "push",
      entityType,
      entityId,
      action,
      status,
      message,
    });
  }

  private resolveTableName(entityType: string): string | null {
    const tableMap: Record<string, string> = {
      products: "products",
      customers: "customers",
      suppliers: "suppliers",
      invoices: "invoices",
      invoiceItems: "invoice_items",
      sales: "sales_orders",
      purchases: "purchase_orders",
      payments: "customer_payments",
      tasks: "project_tasks",
      meetings: "meetings",
      employees: "employees",
      attendance: "attendance",
      leaveRequests: "leave_requests",
      salarySlips: "salary_slips",
      journalEntries: "journal_entries",
      journalEntryLines: "journal_entry_lines",
      cashboxTransactions: "cashbox_transactions",
      inventoryBalances: "inventory_balances",
      products_categories: "product_categories",
    };
    return tableMap[entityType] || null;
  }
}

export const deltaSyncEngine = new DeltaSyncEngine();
