import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import * as schema from "@db/schema";
import { eq, and } from "drizzle-orm";
import { generate80mmThermal, generate58mmThermal, ThermalInvoiceData } from "./escpos";

export const thermalPrintRouter = createRouter({
  generate: authedQuery
    .input(z.object({
      invoiceId: z.number(),
      format: z.enum(["80mm", "58mm"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const tenantId = ctx.user.tenantId!;

      const invoice = await db.query.invoices.findFirst({
        where: and(eq(schema.invoices.id, input.invoiceId), eq(schema.invoices.tenantId, tenantId)),
      });
      if (!invoice) throw new Error("Invoice not found");

      const company = await db.query.companySettings.findFirst({
        where: eq(schema.companySettings.tenantId, tenantId),
      });

      const items = await db.select().from(schema.invoiceItems).where(eq(schema.invoiceItems.invoiceId, input.invoiceId));

      const data: ThermalInvoiceData = {
        companyNameAr: company?.companyNameAr || company?.companyName || "شركة",
        companyNameEn: company?.companyName || "Company",
        vatNumber: company?.taxNumber || "",
        address: company?.address,
        invoiceNumber: invoice.invoiceNumber,
        date: invoice.date,
        customerName: undefined, // fetch if needed
        items: items.map(i => ({
          description: i.description || "",
          qty: i.quantity,
          unitPrice: Number(i.unitPrice),
          total: Number(i.totalAmount),
        })),
        subtotal: Number(invoice.subTotal),
        vatAmount: Number(invoice.taxAmount),
        grandTotal: Number(invoice.totalAmount),
        qrData: invoice.zatcaQrCode || "",
        isSimplified: invoice.invoiceType === "simplified",
      };

      const buffer = input.format === "80mm" 
        ? generate80mmThermal(data) 
        : generate58mmThermal(data);

      return {
        success: true,
        data: buffer.toString("base64"),
        format: input.format,
      };
    }),
});
