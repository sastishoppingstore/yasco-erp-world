import { z } from "zod";
import { getDb } from "../../queries/connection";
import { syncLogs, deviceRegistrations, deletedRecordsTombstone, syncStats } from "@db/schema";
import { eq, and, gte, sql, desc } from "drizzle-orm";
import { generateUuid } from "./deltaSyncEngine";

const PULLABLE_TABLES: Record<string, string> = {
  products: "products",
  customers: "customers",
  suppliers: "suppliers",
  invoices: "invoices",
  invoiceItems: "invoice_items",
  salesOrders: "sales_orders",
  salesOrderItems: "sales_order_items",
  purchaseOrders: "purchase_orders",
  purchaseOrderItems: "purchase_order_items",
  customerPayments: "customer_payments",
  supplierPayments: "supplier_payments",
  employees: "employees",
  attendance: "attendance",
  leaveRequests: "leave_requests",
  salarySlips: "salary_slips",
  journalEntries: "journal_entries",
  journalEntryLines: "journal_entry_lines",
  chartOfAccounts: "chart_of_accounts",
  products_categories: "product_categories",
  warehouses: "warehouses",
  inventoryBalances: "inventory_balances",
  inventoryMovements: "inventory_movements",
  projectTasks: "project_tasks",
  meetings: "meetings",
  supportTickets: "support_tickets",
};

export const pullInputSchema = z.object({
  tenantId: z.number(),
  deviceId: z.string().optional(),
  since: z.string().optional(),
  entityTypes: z.array(z.string()).optional(),
  batchSize: z.number().default(500),
  page: z.number().default(1),
});

export type PullInput = z.infer<typeof pullInputSchema>;

export class PullEngine {
  private db: ReturnType<typeof getDb>;

  constructor() {
    this.db = getDb();
  }

  async pullChanges(input: PullInput): Promise<{
    data: Record<string, any[]>;
    tombstones: any[];
    serverTime: string;
    hasMore: boolean;
    totalCount: number;
  }> {
    const startTime = Date.now();
    const tenantId = input.tenantId;
    const sinceDate = input.since || new Date(0).toISOString();
    const types = input.entityTypes || Object.keys(PULLABLE_TABLES);
    const result: Record<string, any[]> = {};
    let totalCount = 0;
    let hasMore = false;

    for (const type of types) {
      const tableName = PULLABLE_TABLES[type];
      if (!tableName) continue;

      try {
        const offset = (input.page - 1) * input.batchSize;
        const records = await this.db.execute(
          sql`
            SELECT * FROM ${sql.identifier(tableName)} 
            WHERE ${sql.identifier("tenant_id")} = ${tenantId} 
            AND (${sql.identifier("updated_at")} >= ${new Date(sinceDate)} OR ${sql.identifier("created_at")} >= ${new Date(sinceDate)})
            AND (${sql.identifier("deleted_at")} IS NULL)
            ORDER BY ${sql.identifier("updated_at")} DESC
            LIMIT ${input.batchSize} OFFSET ${offset}
          `
        );

        const rows = records.rows || [];
        result[type] = rows.map((r: any) => ({
          ...r,
          local_uuid: r.local_uuid || r.id,
          sync_status: "synced",
        }));

        totalCount += rows.length;
        if (rows.length >= input.batchSize) hasMore = true;
      } catch {
        result[type] = [];
      }
    }

    const tombstones = await this.db.select().from(deletedRecordsTombstone)
      .where(and(
        eq(deletedRecordsTombstone.tenantId, tenantId),
        gte(deletedRecordsTombstone.deletedAt, new Date(sinceDate)),
        eq(deletedRecordsTombstone.synced, false),
      ));

    if (input.deviceId) {
      await this.db.update(deviceRegistrations)
        .set({ lastSyncAt: new Date(), lastSeen: new Date() })
        .where(eq(deviceRegistrations.deviceId, input.deviceId));
    }

    await this.updatePullStats(tenantId, input.deviceId, totalCount, Date.now() - startTime);

    await this.db.insert(syncLogs).values({
      tenantId,
      direction: "pull",
      entityType: "batch",
      action: "pull",
      status: "synced",
      durationMs: Date.now() - startTime,
      recordCount: totalCount,
    });

    return {
      data: result,
      tombstones,
      serverTime: new Date().toISOString(),
      hasMore,
      totalCount,
    };
  }

  private async updatePullStats(
    tenantId: number,
    deviceId: string | undefined,
    count: number,
    durationMs: number,
  ) {
    try {
      const existing = await this.db.query.syncStats.findFirst({
        where: and(
          eq(syncStats.tenantId, tenantId),
          deviceId ? eq(syncStats.deviceId, deviceId) : sql`1=1`,
        ),
      });

      if (existing) {
        await this.db.update(syncStats)
          .set({
            totalPulls: sql`${syncStats.totalPulls} + 1`,
            successfulPulls: sql`${syncStats.successfulPulls} + ${count}`,
            lastSyncAt: new Date(),
            avgSyncDurationMs: sql`(${syncStats.avgSyncDurationMs} + ${durationMs}) / 2`,
          })
          .where(eq(syncStats.id, existing.id));
      } else {
        await this.db.insert(syncStats).values({
          tenantId,
          deviceId: deviceId || "unknown",
          totalPulls: 1,
          successfulPulls: count,
          lastSyncAt: new Date(),
          avgSyncDurationMs: durationMs,
        });
      }
    } catch {
      // Stats update is best-effort
    }
  }

  getPullableTables(): string[] {
    return Object.keys(PULLABLE_TABLES);
  }
}

export const pullEngine = new PullEngine();
