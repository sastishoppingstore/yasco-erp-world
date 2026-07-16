import Dexie, { type EntityTable } from "dexie";

interface SyncableRecord {
  id?: number;
  serverId?: number;
  tenantId?: number;
  localUuid: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  syncStatus: "pending" | "synced" | "failed" | "conflict";
  lastSyncedAt?: string;
  version?: number;
  deviceId?: string;
  createdBy?: number;
  updatedBy?: number;
}

export interface LocalProduct extends SyncableRecord {
  name: string;
  sku?: string;
  barcode?: string;
  description?: string;
  price: number;
  cost: number;
  stock: number;
  categoryId?: number;
  unit: string;
  isActive: number;
}

export interface LocalCustomer extends SyncableRecord {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  taxNumber?: string;
  creditLimit: number;
  isActive: number;
}

export interface LocalSupplier extends SyncableRecord {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  taxNumber?: string;
  isActive: number;
}

export interface LocalInvoice extends SyncableRecord {
  invoiceNumber?: string;
  customerId?: number;
  customerName?: string;
  invoiceDate?: string;
  dueDate?: string;
  subtotal: number;
  taxAmount: number;
  discount: number;
  total: number;
  status: string;
  notes?: string;
  taxStatus: string;
  items?: LocalInvoiceItem[];
}

export interface LocalInvoiceItem {
  id?: number;
  serverId?: number;
  localUuid: string;
  invoiceId?: number;
  invoiceLocalUuid?: string;
  productId?: number;
  productName?: string;
  quantity: number;
  price: number;
  total: number;
  syncStatus: string;
}

export interface LocalSale extends SyncableRecord {
  saleNumber?: string;
  customerId?: number;
  customerName?: string;
  saleDate?: string;
  subtotal: number;
  taxAmount: number;
  discount: number;
  total: number;
  status: string;
  paymentMethod?: string;
  items?: LocalSaleItem[];
}

export interface LocalSaleItem {
  id?: number;
  localUuid: string;
  saleId?: number;
  saleLocalUuid?: string;
  productId?: number;
  productName?: string;
  quantity: number;
  price: number;
  total: number;
  syncStatus: string;
}

export interface LocalPurchase extends SyncableRecord {
  purchaseNumber?: string;
  supplierId?: number;
  supplierName?: string;
  purchaseDate?: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  status: string;
}

export interface LocalPayment extends SyncableRecord {
  paymentNumber?: string;
  customerId?: number;
  supplierId?: number;
  amount: number;
  paymentDate?: string;
  paymentMethod?: string;
  reference?: string;
  notes?: string;
}

export interface LocalTask extends SyncableRecord {
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignedTo?: number;
  dueDate?: string;
}

export interface LocalMeeting extends SyncableRecord {
  title: string;
  description?: string;
  meetingDate?: string;
  startTime?: string;
  endTime?: string;
  participants?: string;
  status: string;
}

export interface SyncQueueItem {
  id?: number;
  entityType: string;
  entityId: string;
  action: "create" | "update" | "delete";
  payloadJson?: string;
  status: "pending" | "syncing" | "synced" | "failed" | "conflict";
  retryCount: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  syncedAt?: string;
}

export interface SyncLogItem {
  id?: number;
  direction: "push" | "pull";
  entityType?: string;
  entityId?: string;
  action?: string;
  status: string;
  message?: string;
  detailsJson?: string;
  createdAt: string;
}

export interface DeviceInfo {
  id?: number;
  deviceId: string;
  deviceName?: string;
  platform?: string;
  userId?: number;
  tenantId?: number;
  lastSeen?: string;
  lastSyncAt?: string;
  appVersion?: string;
  isActive: number;
}

const db = new Dexie("ErpLocalDB") as Dexie & {
  products: EntityTable<LocalProduct, "localUuid">;
  customers: EntityTable<LocalCustomer, "localUuid">;
  suppliers: EntityTable<LocalSupplier, "localUuid">;
  invoices: EntityTable<LocalInvoice, "localUuid">;
  invoiceItems: EntityTable<LocalInvoiceItem, "localUuid">;
  sales: EntityTable<LocalSale, "localUuid">;
  saleItems: EntityTable<LocalSaleItem, "localUuid">;
  purchases: EntityTable<LocalPurchase, "localUuid">;
  payments: EntityTable<LocalPayment, "localUuid">;
  tasks: EntityTable<LocalTask, "localUuid">;
  meetings: EntityTable<LocalMeeting, "localUuid">;
  syncQueue: EntityTable<SyncQueueItem, "id">;
  syncLogs: EntityTable<SyncLogItem, "id">;
  devices: EntityTable<DeviceInfo, "deviceId">;
};

db.version(1).stores({
  products: "localUuid, serverId, syncStatus, updatedAt, deletedAt",
  customers: "localUuid, serverId, syncStatus, updatedAt, deletedAt",
  suppliers: "localUuid, serverId, syncStatus, updatedAt, deletedAt",
  invoices: "localUuid, serverId, syncStatus, updatedAt, deletedAt",
  invoiceItems: "localUuid, invoiceLocalUuid, syncStatus",
  sales: "localUuid, serverId, syncStatus, updatedAt, deletedAt",
  saleItems: "localUuid, saleLocalUuid, syncStatus",
  purchases: "localUuid, serverId, syncStatus, updatedAt, deletedAt",
  payments: "localUuid, serverId, syncStatus, updatedAt, deletedAt",
  tasks: "localUuid, serverId, syncStatus, updatedAt, deletedAt",
  meetings: "localUuid, serverId, syncStatus, updatedAt, deletedAt",
  syncQueue: "++id, status, entityType, createdAt",
  syncLogs: "++id, direction, status, createdAt",
  devices: "deviceId",
});

db.on("ready", () => {
  console.log("[LocalDB] IndexedDB ready");
});

function generateUuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function getLocalDb() {
  await db.open();
  return db;
}

export { generateUuid };
export type LocalDatabase = typeof db;
export default db;
