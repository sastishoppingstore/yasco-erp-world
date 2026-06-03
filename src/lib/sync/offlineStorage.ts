import db, {
  generateUuid,
  type LocalProduct,
  type LocalCustomer,
  type LocalSupplier,
  type LocalInvoice,
  type LocalInvoiceItem,
  type LocalSale,
  type LocalSaleItem,
  type LocalPurchase,
  type LocalPayment,
  type LocalTask,
  type LocalMeeting,
} from "../db/localDatabase";

let deviceId = localStorage.getItem("device_id") || generateUuid();
if (!localStorage.getItem("device_id")) {
  localStorage.setItem("device_id", deviceId);
}

function now() {
  return new Date().toISOString();
}

function addToSyncQueue(entityType: string, entityId: string, action: "create" | "update" | "delete", payload: any) {
  db.syncQueue.add({
    entityType,
    entityId,
    action,
    payloadJson: JSON.stringify(payload),
    status: "pending",
    retryCount: 0,
    createdAt: now(),
    updatedAt: now(),
  });
}

function addSyncLog(direction: "push" | "pull", entityType: string | undefined, entityId: string | undefined, action: string | undefined, status: string, message?: string) {
  db.syncLogs.add({
    direction,
    entityType,
    entityId,
    action,
    status,
    message,
    createdAt: now(),
  });
}

// Products
export async function createProductOffline(data: Omit<LocalProduct, "localUuid" | "syncStatus" | "createdAt" | "updatedAt" | "deviceId">) {
  const localUuid = generateUuid();
  const record: LocalProduct = {
    ...data,
    localUuid,
    syncStatus: "pending",
    createdAt: now(),
    updatedAt: now(),
    deviceId,
    version: 1,
  };
  await db.products.add(record);
  addToSyncQueue("products", localUuid, "create", record);
  return record;
}

export async function updateProductOffline(localUuid: string, data: Partial<LocalProduct>) {
  const existing = await db.products.get(localUuid);
  if (!existing) throw new Error("Product not found");
  const updated = { ...existing, ...data, updatedAt: now(), version: (existing.version || 1) + 1 };
  await db.products.put(updated);
  addToSyncQueue("products", localUuid, "update", updated);
  return updated;
}

export async function deleteProductOffline(localUuid: string) {
  const existing = await db.products.get(localUuid);
  if (!existing) throw new Error("Product not found");
  existing.deletedAt = now();
  existing.syncStatus = "pending";
  existing.updatedAt = now();
  await db.products.put(existing);
  addToSyncQueue("products", localUuid, "delete", { localUuid, deletedAt: existing.deletedAt });
}

export async function getLocalProducts() {
  return db.products.where("deletedAt").equals(null as any).or("deletedAt").notEqual(null as any).toArray()
    .then((items) => items.filter((i) => !i.deletedAt));
}

// Customers
export async function createCustomerOffline(data: Omit<LocalCustomer, "localUuid" | "syncStatus" | "createdAt" | "updatedAt" | "deviceId">) {
  const localUuid = generateUuid();
  const record: LocalCustomer = {
    ...data,
    localUuid,
    syncStatus: "pending",
    createdAt: now(),
    updatedAt: now(),
    deviceId,
    version: 1,
  };
  await db.customers.add(record);
  addToSyncQueue("customers", localUuid, "create", record);
  return record;
}

export async function updateCustomerOffline(localUuid: string, data: Partial<LocalCustomer>) {
  const existing = await db.customers.get(localUuid);
  if (!existing) throw new Error("Customer not found");
  const updated = { ...existing, ...data, updatedAt: now(), version: (existing.version || 1) + 1 };
  await db.customers.put(updated);
  addToSyncQueue("customers", localUuid, "update", updated);
  return updated;
}

export async function deleteCustomerOffline(localUuid: string) {
  const existing = await db.customers.get(localUuid);
  if (!existing) throw new Error("Customer not found");
  existing.deletedAt = now();
  existing.syncStatus = "pending";
  existing.updatedAt = now();
  await db.customers.put(existing);
  addToSyncQueue("customers", localUuid, "delete", { localUuid, deletedAt: existing.deletedAt });
}

export async function getLocalCustomers() {
  return db.customers.where("deletedAt").equals(null as any).toArray()
    .then((items) => items.filter((i) => !i.deletedAt));
}

// Invoices
export async function createInvoiceOffline(data: Omit<LocalInvoice, "localUuid" | "syncStatus" | "createdAt" | "updatedAt" | "deviceId">) {
  const localUuid = generateUuid();
  const record: LocalInvoice = {
    ...data,
    localUuid,
    syncStatus: "pending",
    createdAt: now(),
    updatedAt: now(),
    deviceId,
    version: 1,
  };
  await db.invoices.add(record);
  addToSyncQueue("invoices", localUuid, "create", record);

  if (data.items?.length) {
    for (const item of data.items) {
      const itemLocalUuid = generateUuid();
      await db.invoiceItems.add({
        ...item,
        localUuid: itemLocalUuid,
        invoiceLocalUuid: localUuid,
        syncStatus: "pending",
      });
    }
  }

  return record;
}

export async function getLocalInvoices() {
  return db.invoices.where("deletedAt").equals(null as any).toArray()
    .then((items) => items.filter((i) => !i.deletedAt));
}

// Sales
export async function createSaleOffline(data: Omit<LocalSale, "localUuid" | "syncStatus" | "createdAt" | "updatedAt" | "deviceId">) {
  const localUuid = generateUuid();
  const record: LocalSale = {
    ...data,
    localUuid,
    syncStatus: "pending",
    createdAt: now(),
    updatedAt: now(),
    deviceId,
    version: 1,
  };
  await db.sales.add(record);
  addToSyncQueue("sales", localUuid, "create", record);

  if (data.items?.length) {
    for (const item of data.items) {
      const itemLocalUuid = generateUuid();
      await db.saleItems.add({
        ...item,
        localUuid: itemLocalUuid,
        saleLocalUuid: localUuid,
        syncStatus: "pending",
      });
    }
  }

  return record;
}

export async function getLocalSales() {
  return db.sales.where("deletedAt").equals(null as any).toArray()
    .then((items) => items.filter((i) => !i.deletedAt));
}

// Tasks
export async function createTaskOffline(data: Omit<LocalTask, "localUuid" | "syncStatus" | "createdAt" | "updatedAt" | "deviceId">) {
  const localUuid = generateUuid();
  const record: LocalTask = {
    ...data,
    localUuid,
    syncStatus: "pending",
    createdAt: now(),
    updatedAt: now(),
    deviceId,
    version: 1,
  };
  await db.tasks.add(record);
  addToSyncQueue("tasks", localUuid, "create", record);
  return record;
}

export async function updateTaskOffline(localUuid: string, data: Partial<LocalTask>) {
  const existing = await db.tasks.get(localUuid);
  if (!existing) throw new Error("Task not found");
  const updated = { ...existing, ...data, updatedAt: now(), version: (existing.version || 1) + 1 };
  await db.tasks.put(updated);
  addToSyncQueue("tasks", localUuid, "update", updated);
  return updated;
}

export async function deleteTaskOffline(localUuid: string) {
  const existing = await db.tasks.get(localUuid);
  if (!existing) throw new Error("Task not found");
  existing.deletedAt = now();
  existing.syncStatus = "pending";
  existing.updatedAt = now();
  await db.tasks.put(existing);
  addToSyncQueue("tasks", localUuid, "delete", { localUuid, deletedAt: existing.deletedAt });
}

export async function getLocalTasks() {
  return db.tasks.where("deletedAt").equals(null as any).toArray()
    .then((items) => items.filter((i) => !i.deletedAt));
}

// Suppliers
export async function createSupplierOffline(data: Omit<LocalSupplier, "localUuid" | "syncStatus" | "createdAt" | "updatedAt" | "deviceId">) {
  const localUuid = generateUuid();
  const record: LocalSupplier = {
    ...data,
    localUuid,
    syncStatus: "pending",
    createdAt: now(),
    updatedAt: now(),
    deviceId,
    version: 1,
  };
  await db.suppliers.add(record);
  addToSyncQueue("suppliers", localUuid, "create", record);
  return record;
}

export async function getLocalSuppliers() {
  return db.suppliers.where("deletedAt").equals(null as any).toArray()
    .then((items) => items.filter((i) => !i.deletedAt));
}

// Payments
export async function createPaymentOffline(data: Omit<LocalPayment, "localUuid" | "syncStatus" | "createdAt" | "updatedAt" | "deviceId">) {
  const localUuid = generateUuid();
  const record: LocalPayment = {
    ...data,
    localUuid,
    syncStatus: "pending",
    createdAt: now(),
    updatedAt: now(),
    deviceId,
    version: 1,
  };
  await db.payments.add(record);
  addToSyncQueue("payments", localUuid, "create", record);
  return record;
}

export async function getLocalPayments() {
  return db.payments.where("deletedAt").equals(null as any).toArray()
    .then((items) => items.filter((i) => !i.deletedAt));
}

// Meetings
export async function createMeetingOffline(data: Omit<LocalMeeting, "localUuid" | "syncStatus" | "createdAt" | "updatedAt" | "deviceId">) {
  const localUuid = generateUuid();
  const record: LocalMeeting = {
    ...data,
    localUuid,
    syncStatus: "pending",
    createdAt: now(),
    updatedAt: now(),
    deviceId,
    version: 1,
  };
  await db.meetings.add(record);
  addToSyncQueue("meetings", localUuid, "create", record);
  return record;
}

export async function getLocalMeetings() {
  return db.meetings.where("deletedAt").equals(null as any).toArray()
    .then((items) => items.filter((i) => !i.deletedAt));
}

// Purchases
export async function createPurchaseOffline(data: Omit<LocalPurchase, "localUuid" | "syncStatus" | "createdAt" | "updatedAt" | "deviceId">) {
  const localUuid = generateUuid();
  const record: LocalPurchase = {
    ...data,
    localUuid,
    syncStatus: "pending",
    createdAt: now(),
    updatedAt: now(),
    deviceId,
    version: 1,
  };
  await db.purchases.add(record);
  addToSyncQueue("purchases", localUuid, "create", record);
  return record;
}

export async function getLocalPurchases() {
  return db.purchases.where("deletedAt").equals(null as any).toArray()
    .then((items) => items.filter((i) => !i.deletedAt));
}

// Sync Queue helpers
export async function getPendingSyncItems() {
  return db.syncQueue.where("status").equals("pending").toArray();
}

export async function getFailedSyncItems() {
  return db.syncQueue.where("status").equals("failed").toArray();
}

export async function getConflictItems() {
  return db.syncQueue.where("status").equals("conflict").toArray();
}

export async function markSyncQueueItem(id: number, status: "synced" | "failed" | "conflict", errorMessage?: string) {
  await db.syncQueue.put({
    id,
    status,
    errorMessage,
    updatedAt: now(),
    syncedAt: status === "synced" ? now() : undefined,
  } as any);
}

export async function getSyncLogs(limit = 50, offset = 0) {
  return db.syncLogs
    .orderBy("id")
    .reverse()
    .offset(offset)
    .limit(limit)
    .toArray();
}

// Device ID
export function getDeviceId() {
  return deviceId;
}

export function setDeviceId(id: string) {
  deviceId = id;
  localStorage.setItem("device_id", id);
}
