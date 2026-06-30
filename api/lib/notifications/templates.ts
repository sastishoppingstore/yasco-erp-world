import { getDb } from "../../queries/connection";
import * as schema from "@db/schema";
import { eq, and } from "drizzle-orm";
import type { ChannelType } from "./channels";

export interface NotificationTemplate {
  id: number;
  templateKey: string;
  name: string;
  title: string;
  titleAr?: string;
  message: string;
  messageAr?: string;
  variables: Record<string, string>;
  type: string;
  icon?: string;
}

export interface CompiledMessage {
  subject: string;
  body: string;
  bodyAr?: string;
}

interface TemplateVariable {
  name: string;
  label: string;
  labelAr?: string;
  defaultValue?: string;
}

export const SYSTEM_TEMPLATES: { key: string; name: string; nameAr: string; title: string; titleAr: string; message: string; messageAr: string; variables: TemplateVariable[] }[] = [
  {
    key: "invoice_created", name: "Invoice Created", nameAr: "تم إنشاء الفاتورة",
    title: "New Invoice {{invoice_number}}", titleAr: "فاتورة جديدة {{invoice_number}}",
    message: "Dear {{customer_name}}, invoice {{invoice_number}} for SAR {{amount}} has been created. Due date: {{due_date}}.",
    messageAr: "عزيزي {{customer_name}}، تم إنشاء الفاتورة {{invoice_number}} بمبلغ {{amount}} ريال. تاريخ الاستحقاق: {{due_date}}.",
    variables: [
      { name: "customer_name", label: "Customer Name", labelAr: "اسم العميل" },
      { name: "invoice_number", label: "Invoice Number", labelAr: "رقم الفاتورة" },
      { name: "amount", label: "Amount", labelAr: "المبلغ" },
      { name: "due_date", label: "Due Date", labelAr: "تاريخ الاستحقاق" },
    ],
  },
  {
    key: "payment_received", name: "Payment Received", nameAr: "تم استلام الدفعة",
    title: "Payment Received - {{invoice_number}}", titleAr: "تم استلام الدفعة - {{invoice_number}}",
    message: "Payment of SAR {{amount}} received for invoice {{invoice_number}}. Thank you {{customer_name}}!",
    messageAr: "تم استلام دفعة بمبلغ {{amount}} ريال للفاتورة {{invoice_number}}. شكراً {{customer_name}}!",
    variables: [
      { name: "customer_name", label: "Customer Name", labelAr: "اسم العميل" },
      { name: "invoice_number", label: "Invoice Number", labelAr: "رقم الفاتورة" },
      { name: "amount", label: "Amount", labelAr: "المبلغ" },
    ],
  },
  {
    key: "invoice_overdue", name: "Invoice Overdue", nameAr: "فاتورة متأخرة",
    title: "Payment Reminder - Invoice {{invoice_number}}", titleAr: "تذكير بالدفع - الفاتورة {{invoice_number}}",
    message: "Dear {{customer_name}}, invoice {{invoice_number}} of SAR {{amount}} is {{days_overdue}} days overdue. Please arrange payment.",
    messageAr: "عزيزي {{customer_name}}، الفاتورة {{invoice_number}} بمبلغ {{amount}} ريال متأخرة {{days_overdue}} يوم. يرجى ترتيب الدفع.",
    variables: [
      { name: "customer_name", label: "Customer Name", labelAr: "اسم العميل" },
      { name: "invoice_number", label: "Invoice Number", labelAr: "رقم الفاتورة" },
      { name: "amount", label: "Amount", labelAr: "المبلغ" },
      { name: "days_overdue", label: "Days Overdue", labelAr: "أيام التأخير" },
    ],
  },
  {
    key: "approval_request", name: "Approval Request", nameAr: "طلب موافقة",
    title: "Approval Required: {{entity_type}} #{{entity_id}}", titleAr: "موافقة مطلوبة: {{entity_type}} #{{entity_id}}",
    message: "{{requester_name}} requests your approval for {{entity_type}} #{{entity_id}}. Please review and take action.",
    messageAr: "يطلب {{requester_name}} موافقتك على {{entity_type}} #{{entity_id}}. يرجى المراجعة واتخاذ الإجراء.",
    variables: [
      { name: "requester_name", label: "Requester Name", labelAr: "اسم الطالب" },
      { name: "entity_type", label: "Entity Type", labelAr: "نوع الكيان" },
      { name: "entity_id", label: "Entity ID", labelAr: "رقم الكيان" },
    ],
  },
  {
    key: "document_expiring", name: "Document Expiring", nameAr: "وثيقة تنتهي قريباً",
    title: "Document Expiry Alert: {{document_title}}", titleAr: "تنبيه انتهاء الوثيقة: {{document_title}}",
    message: "The document '{{document_title}}' ({{document_type}}) will expire on {{expiry_date}}. Only {{days_remaining}} days remaining.",
    messageAr: "الوثيقة '{{document_title}}' ({{document_type}}) ستنتهي في {{expiry_date}}. متبقي {{days_remaining}} يوم.",
    variables: [
      { name: "document_title", label: "Document Title", labelAr: "عنوان الوثيقة" },
      { name: "document_type", label: "Document Type", labelAr: "نوع الوثيقة" },
      { name: "expiry_date", label: "Expiry Date", labelAr: "تاريخ الانتهاء" },
      { name: "days_remaining", label: "Days Remaining", labelAr: "الأيام المتبقية" },
    ],
  },
  {
    key: "low_stock", name: "Low Stock Alert", nameAr: "تنبيه مخزون منخفض",
    title: "Low Stock: {{product_name}}", titleAr: "مخزون منخفض: {{product_name}}",
    message: "Product '{{product_name}}' (SKU: {{sku}}) is low on stock. Current: {{current_qty}}, Reorder level: {{reorder_level}}.",
    messageAr: "المنتج '{{product_name}}' (رمز: {{sku}}) مخزونه منخفض. الحالي: {{current_qty}}، مستوى إعادة الطلب: {{reorder_level}}.",
    variables: [
      { name: "product_name", label: "Product Name", labelAr: "اسم المنتج" },
      { name: "sku", label: "SKU", labelAr: "رمز المنتج" },
      { name: "current_qty", label: "Current Quantity", labelAr: "الكمية الحالية" },
      { name: "reorder_level", label: "Reorder Level", labelAr: "مستوى إعادة الطلب" },
    ],
  },
  {
    key: "iot_alert", name: "IoT Alert", nameAr: "تنبيه إنترنت الأشياء",
    title: "IoT Alert: {{sensor_type}} - {{device_name}}", titleAr: "تنبيه: {{sensor_type}} - {{device_name}}",
    message: "Sensor '{{sensor_type}}' on device '{{device_name}}' exceeded threshold. Value: {{current_value}}, Threshold: {{threshold}}.",
    messageAr: "جهاز الاستشعار '{{sensor_type}}' في الجهاز '{{device_name}}' تجاوز الحد. القيمة: {{current_value}}، الحد: {{threshold}}.",
    variables: [
      { name: "device_name", label: "Device Name", labelAr: "اسم الجهاز" },
      { name: "sensor_type", label: "Sensor Type", labelAr: "نوع المستشعر" },
      { name: "current_value", label: "Current Value", labelAr: "القيمة الحالية" },
      { name: "threshold", label: "Threshold", labelAr: "الحد المسموح" },
    ],
  },
  {
    key: "sale_notification_owner", name: "Sale Notification to Owner", nameAr: "إشعار مبيعات للمالك",
    title: "New Sale: {{invoice_number}} - SAR {{amount}}", titleAr: "بيع جديد: {{invoice_number}} - {{amount}} ريال",
    message: "A new sale has been made.\nCustomer: {{customer_name}}\nInvoice: {{invoice_number}}\nAmount: SAR {{amount}}\nDate: {{invoice_date}}",
    messageAr: "تم إجراء عملية بيع جديدة.\nالعميل: {{customer_name}}\nالفاتورة: {{invoice_number}}\nالمبلغ: {{amount}} ريال\nالتاريخ: {{invoice_date}}",
    variables: [
      { name: "customer_name", label: "Customer Name", labelAr: "اسم العميل" },
      { name: "invoice_number", label: "Invoice Number", labelAr: "رقم الفاتورة" },
      { name: "amount", label: "Amount", labelAr: "المبلغ" },
      { name: "invoice_date", label: "Invoice Date", labelAr: "تاريخ الفاتورة" },
    ],
  },
  {
    key: "account_otp", name: "Account OTP", nameAr: "رمز التحقق للحساب",
    title: "Your OTP Code", titleAr: "رمز التحقق الخاص بك",
    message: "Your OTP code is: {{otp_code}}\nThis code expires in {{expiry_minutes}} minutes.\nIf you did not request this, please ignore this email.",
    messageAr: "رمز التحقق الخاص بك هو: {{otp_code}}\nتنتهي صلاحية هذا الرمز خلال {{expiry_minutes}} دقيقة.\nإذا لم تطلب هذا، يرجى تجاهل هذا البريد الإلكتروني.",
    variables: [
      { name: "otp_code", label: "OTP Code", labelAr: "رمز التحقق" },
      { name: "expiry_minutes", label: "Expiry Minutes", labelAr: "دقائق الصلاحية" },
    ],
  },
  {
    key: "password_reset_otp", name: "Password Reset OTP", nameAr: "رمز إعادة تعيين كلمة المرور",
    title: "Password Reset OTP", titleAr: "رمز إعادة تعيين كلمة المرور",
    message: "You requested to reset your password.\nYour OTP is: {{otp_code}}\nThis code expires in {{expiry_minutes}} minutes.\nIf you did not request this, please ignore this email.",
    messageAr: "لقد طلبت إعادة تعيين كلمة المرور الخاصة بك.\nرمز التحقق الخاص بك هو: {{otp_code}}\nتنتهي صلاحية هذا الرمز خلال {{expiry_minutes}} دقيقة.\nإذا لم تطلب هذا، يرجى تجاهل هذا البريد الإلكتروني.",
    variables: [
      { name: "otp_code", label: "OTP Code", labelAr: "رمز التحقق" },
      { name: "expiry_minutes", label: "Expiry Minutes", labelAr: "دقائق الصلاحية" },
    ],
  },
  {
    key: "employee_checkin", name: "Employee Check-in", nameAr: "تسجيل دخول موظف",
    title: "{{employee_name}} checked in", titleAr: "سجل {{employee_name}} دخوله",
    message: "{{employee_name}} checked in at {{time}} from {{location}}.",
    messageAr: "سجل {{employee_name}} دخوله الساعة {{time}} من {{location}}.",
    variables: [
      { name: "employee_name", label: "Employee Name", labelAr: "اسم الموظف" },
      { name: "time", label: "Time", labelAr: "الوقت" },
      { name: "location", label: "Location", labelAr: "الموقع" },
    ],
  },
];

export class TemplateEngine {
  async getTemplate(tenantId: number | null, key: string): Promise<NotificationTemplate | null> {
    if (tenantId) {
      const db = getDb();
      const tpl = await db.query.notificationTemplates.findFirst({
        where: and(eq(schema.notificationTemplates.tenantId, tenantId), eq(schema.notificationTemplates.templateKey, key)),
      });
      if (tpl) {
        return {
          id: tpl.id, templateKey: tpl.templateKey, name: tpl.name,
          title: tpl.title, titleAr: tpl.titleAr ?? undefined,
          message: tpl.message, messageAr: tpl.messageAr ?? undefined,
          variables: (typeof tpl.variables === "string" ? JSON.parse(tpl.variables) : tpl.variables) ?? {},
          type: tpl.type, icon: tpl.icon ?? undefined,
        };
      }
    }
    const system = SYSTEM_TEMPLATES.find(t => t.key === key);
    if (!system) return null;
    return {
      id: 0, templateKey: system.key, name: system.name,
      title: system.title, titleAr: system.titleAr,
      message: system.message, messageAr: system.messageAr,
      variables: Object.fromEntries(system.variables.map(v => [v.name, v.defaultValue ?? ""])),
      type: "info",
    };
  }

  compile(template: NotificationTemplate, variables: Record<string, string | number>, language: "en" | "ar" = "en"): CompiledMessage {
    const title = language === "ar" && template.titleAr ? template.titleAr : template.title;
    const body = language === "ar" && template.messageAr ? template.messageAr : template.message;
    const bodyAr = language === "ar" ? undefined : template.messageAr;
    const compiled = (text: string) => text.replace(/\{\{(\w+)\}\}/g, (_, key) => String(variables[key] ?? `{{${key}}}`));
    return { subject: compiled(title), body: compiled(body), bodyAr: bodyAr ? compiled(bodyAr) : undefined };
  }

  async listTemplates(tenantId: number | null): Promise<NotificationTemplate[]> {
    const system: NotificationTemplate[] = SYSTEM_TEMPLATES.map(t => ({
      id: 0, templateKey: t.key, name: t.name,
      title: t.title, titleAr: t.titleAr,
      message: t.message, messageAr: t.messageAr,
      variables: Object.fromEntries(t.variables.map(v => [v.name, v.defaultValue ?? ""])),
      type: "info",
    }));
    if (!tenantId) return system;
    const db = getDb();
    const custom = await db.select().from(schema.notificationTemplates).where(
      eq(schema.notificationTemplates.tenantId, tenantId),
    );
    const customMapped: NotificationTemplate[] = custom.map(t => ({
      id: t.id, templateKey: t.templateKey, name: t.name,
      title: t.title, titleAr: t.titleAr ?? undefined,
      message: t.message, messageAr: t.messageAr ?? undefined,
      variables: (typeof t.variables === "string" ? JSON.parse(t.variables) : t.variables) ?? {},
      type: t.type, icon: t.icon ?? undefined,
    }));
    return [...customMapped, ...system.filter(s => !custom.find(c => c.templateKey === s.templateKey))];
  }

  async saveTemplate(tenantId: number, data: {
    templateKey: string; name: string; title: string; titleAr?: string;
    message: string; messageAr?: string; type?: string; variables?: Record<string, string>;
  }): Promise<number> {
    const db = getDb();
    const existing = await db.query.notificationTemplates.findFirst({
      where: and(eq(schema.notificationTemplates.tenantId, tenantId), eq(schema.notificationTemplates.templateKey, data.templateKey)),
    });
    if (existing) {
      await db.update(schema.notificationTemplates).set({
        name: data.name, title: data.title, titleAr: data.titleAr,
        message: data.message, messageAr: data.messageAr,
        type: (data.type as any) ?? "info",
        variables: data.variables ?? null,
      }).where(eq(schema.notificationTemplates.id, existing.id));
      return existing.id;
    }
    const [ins] = await db.insert(schema.notificationTemplates).values({
      tenantId, templateKey: data.templateKey, name: data.name,
      title: data.title, titleAr: data.titleAr,
      message: data.message, messageAr: data.messageAr,
      type: (data.type as any) ?? "info", variables: data.variables ?? null,
    }).$returningId();
    return ins.id;
  }

  getVariables(templateKey: string): TemplateVariable[] {
    return SYSTEM_TEMPLATES.find(t => t.key === templateKey)?.variables ?? [];
  }
}

export const templateEngine = new TemplateEngine();
