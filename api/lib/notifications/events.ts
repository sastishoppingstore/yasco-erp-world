import { getDb } from "../../queries/connection";
import * as schema from "@db/schema";
import { eq, lt, and } from "drizzle-orm";
import { templateEngine } from "./templates";
import { notificationDispatcher, type ChannelType } from "./channels";
import { sendEmailJob } from "../../queue/email.queue";

export interface NotificationEvent {
  tenantId: number;
  eventType: string;
  recipientEmail?: string;
  recipientUserId?: number;
  variables: Record<string, string | number>;
  channels?: ChannelType[];
}

async function sendNotification(event: NotificationEvent) {
  const channels = event.channels ?? ["email"];
  const template = await templateEngine.getTemplate(event.tenantId, event.eventType);

  if (!template) return;

  const compiledEn = templateEngine.compile(template, event.variables, "en");
  const compiledAr = templateEngine.compile(template, event.variables, "ar");

  if (event.recipientEmail) {
    try {
      await sendEmailJob({
        to: event.recipientEmail,
        subject: compiledEn.subject,
        body: `${compiledEn.body}\n\n---\n${compiledAr.body}`,
        tenantId: event.tenantId,
        userId: event.recipientUserId,
      });
    } catch (err) {
      console.error(`[notify] Failed to queue email for ${event.eventType}:`, err);
    }
  }

  if (event.recipientUserId) {
    await notificationDispatcher.dispatch(
      event.tenantId,
      event.recipientUserId,
      channels,
      {
        to: event.recipientEmail ?? "",
        subject: compiledEn.subject,
        body: compiledEn.body,
        bodyAr: compiledAr.body,
      }
    );
  }
}

export async function onInvoiceCreated(tenantId: number, invoiceId: number) {
  const db = getDb();
  const invoice = await db.query.invoices.findFirst({
    where: eq(schema.invoices.id, invoiceId),
  });
  if (!invoice) return;

  const customer = await db.query.customers.findFirst({
    where: eq(schema.customers.id, invoice.customerId),
  });
  if (!customer) return;

  const settings = await db.query.companySettings.findFirst({
    where: eq(schema.companySettings.tenantId, tenantId),
  });

  if (customer.email) {
    await sendNotification({
      tenantId,
      eventType: "invoice_created",
      recipientEmail: customer.email,
      recipientUserId: invoice.createdBy ?? undefined,
      variables: {
        customer_name: customer.name,
        invoice_number: invoice.invoiceNumber,
        amount: invoice.totalAmount,
        due_date: invoice.dueDate ?? "N/A",
      },
    });
  }

  const ownerEmail = settings?.email;
  if (ownerEmail && ownerEmail !== customer.email) {
    await sendNotification({
      tenantId,
      eventType: "sale_notification_owner",
      recipientEmail: ownerEmail,
      variables: {
        customer_name: customer.name,
        invoice_number: invoice.invoiceNumber,
        amount: invoice.totalAmount,
        invoice_date: invoice.date,
      },
    });
  }
}

export async function onPaymentReceived(tenantId: number, customerId: number, invoiceId: number, amount: string) {
  const db = getDb();
  const invoice = await db.query.invoices.findFirst({
    where: eq(schema.invoices.id, invoiceId),
  });
  if (!invoice) return;

  const customer = await db.query.customers.findFirst({
    where: eq(schema.customers.id, customerId),
  });

  if (customer?.email) {
    await sendNotification({
      tenantId,
      eventType: "payment_received",
      recipientEmail: customer.email,
      variables: {
        customer_name: customer.name,
        invoice_number: invoice.invoiceNumber,
        amount,
      },
    });
  }
}

export async function checkLowStockAndNotify(tenantId: number) {
  const db = getDb();
  const lowStockItems = await db
    .select({
      productId: schema.products.id,
      productName: schema.products.name,
      productNameAr: schema.products.nameAr,
      sku: schema.products.sku,
      reorderLevel: schema.products.reorderLevel,
      currentQty: schema.inventoryBalances.quantity,
    })
    .from(schema.inventoryBalances)
    .innerJoin(schema.products, eq(schema.inventoryBalances.productId, schema.products.id))
    .where(
      and(
        eq(schema.inventoryBalances.tenantId, tenantId),
        lt(schema.inventoryBalances.quantity, schema.products.reorderLevel)
      )
    );

  if (lowStockItems.length === 0) return;

  const settings = await db.query.companySettings.findFirst({
    where: eq(schema.companySettings.tenantId, tenantId),
  });

  const ownerEmail = settings?.email;
  if (!ownerEmail) return;

  for (const item of lowStockItems) {
    await sendNotification({
      tenantId,
      eventType: "low_stock",
      recipientEmail: ownerEmail,
      variables: {
        product_name: item.productName,
        sku: item.sku ?? "",
        current_qty: String(item.currentQty ?? 0),
        reorder_level: String(item.reorderLevel ?? 0),
      },
    });
  }
}
