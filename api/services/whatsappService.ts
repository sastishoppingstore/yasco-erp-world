/**
 * WhatsApp Notification Service — Twilio WhatsApp API
 *
 * Setup:
 *   1. twilio.com pe free account banao
 *   2. WhatsApp Sandbox activate karo (free trial)
 *   3. .env mein yeh add karo:
 *      TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *      TWILIO_AUTH_TOKEN=your_auth_token
 *      TWILIO_WHATSAPP_FROM=whatsapp:+14155238886   ← Twilio sandbox number
 *
 * Production ke liye:
 *   - WhatsApp Business API approve karwao
 *   - Apna number use karo: whatsapp:+966XXXXXXXXX
 */

const TWILIO_API = "https://api.twilio.com/2010-04-01";

interface WhatsAppMessage {
  to: string;          // e.g. "+966501234567"
  message: string;
  mediaUrl?: string;   // image/PDF URL (optional)
}

interface TwilioConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;  // "whatsapp:+14155238886"
}

function getTwilioConfig(): TwilioConfig | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";

  if (!accountSid || !authToken) return null;
  return { accountSid, authToken, fromNumber };
}

/**
 * WhatsApp message bhejo
 */
export async function sendWhatsApp(msg: WhatsAppMessage): Promise<{ success: boolean; sid?: string; error?: string }> {
  const config = getTwilioConfig();

  if (!config) {
    console.warn("⚠️  WhatsApp: TWILIO_ACCOUNT_SID ya TWILIO_AUTH_TOKEN .env mein nahi hai");
    return { success: false, error: "Twilio not configured" };
  }

  // Phone number format karo
  const toNumber = msg.to.startsWith("+") ? `whatsapp:${msg.to}` : `whatsapp:+${msg.to}`;

  const body = new URLSearchParams({
    From: config.fromNumber,
    To: toNumber,
    Body: msg.message,
    ...(msg.mediaUrl ? { MediaUrl: msg.mediaUrl } : {}),
  });

  try {
    const response = await fetch(
      `${TWILIO_API}/Accounts/${config.accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64")}`,
        },
        body: body.toString(),
      }
    );

    const data = await response.json() as any;

    if (!response.ok) {
      console.error("❌ WhatsApp send failed:", data);
      return { success: false, error: data.message || "Send failed" };
    }

    console.log(`✅ WhatsApp sent to ${msg.to} | SID: ${data.sid}`);
    return { success: true, sid: data.sid };
  } catch (err: any) {
    console.error("❌ WhatsApp network error:", err.message);
    return { success: false, error: err.message };
  }
}

// ── Ready-made Templates ───────────────────────────────────────────

/**
 * Invoice payment reminder
 */
export async function sendInvoiceReminder(params: {
  customerPhone: string;
  customerName: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  dueDate: string;
  companyName: string;
  language?: "ar" | "en" | "ur";
}) {
  const { language = "ar" } = params;

  const messages = {
    ar: `مرحباً ${params.customerName} 👋

📄 تذكير بالفاتورة رقم: *${params.invoiceNumber}*
💰 المبلغ المستحق: *${params.amount.toLocaleString()} ${params.currency}*
📅 تاريخ الاستحقاق: *${params.dueDate}*

يرجى سداد المبلغ في أقرب وقت ممكن.
شكراً لثقتكم بـ ${params.companyName} 🙏`,

    en: `Hello ${params.customerName} 👋

📄 Invoice Reminder: *${params.invoiceNumber}*
💰 Amount Due: *${params.amount.toLocaleString()} ${params.currency}*
📅 Due Date: *${params.dueDate}*

Please make your payment at your earliest convenience.
Thank you for choosing ${params.companyName} 🙏`,

    ur: `السلام علیکم ${params.customerName} 👋

📄 بل یاددہانی: *${params.invoiceNumber}*
💰 واجب الادا رقم: *${params.amount.toLocaleString()} ${params.currency}*
📅 ادائیگی کی تاریخ: *${params.dueDate}*

براہ کرم جلد از جلد ادائیگی کریں۔
${params.companyName} پر اعتماد کا شکریہ 🙏`,
  };

  return sendWhatsApp({
    to: params.customerPhone,
    message: messages[language],
  });
}

/**
 * Invoice bhejne ke baad confirmation
 */
export async function sendInvoiceCreatedNotification(params: {
  customerPhone: string;
  customerName: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  companyName: string;
  language?: "ar" | "en" | "ur";
}) {
  const { language = "ar" } = params;

  const messages = {
    ar: `مرحباً ${params.customerName} 👋

✅ تم إصدار فاتورتك رقم *${params.invoiceNumber}*
💰 المبلغ الإجمالي: *${params.amount.toLocaleString()} ${params.currency}*

للاستفسار يرجى التواصل معنا.
${params.companyName} 🏢`,

    en: `Hello ${params.customerName} 👋

✅ Invoice *${params.invoiceNumber}* has been created
💰 Total Amount: *${params.amount.toLocaleString()} ${params.currency}*

Contact us for any questions.
${params.companyName} 🏢`,

    ur: `السلام علیکم ${params.customerName} 👋

✅ آپ کا بل *${params.invoiceNumber}* بنا دیا گیا ہے
💰 کل رقم: *${params.amount.toLocaleString()} ${params.currency}*

کسی سوال کے لیے ہم سے رابطہ کریں۔
${params.companyName} 🏢`,
  };

  return sendWhatsApp({
    to: params.customerPhone,
    message: messages[language],
  });
}

/**
 * Payment receive hua confirmation
 */
export async function sendPaymentReceivedNotification(params: {
  customerPhone: string;
  customerName: string;
  amount: number;
  currency: string;
  receiptNumber: string;
  companyName: string;
  language?: "ar" | "en" | "ur";
}) {
  const { language = "ar" } = params;

  const messages = {
    ar: `شكراً ${params.customerName} 🎉

✅ تم استلام دفعتك بنجاح!
💰 المبلغ: *${params.amount.toLocaleString()} ${params.currency}*
🧾 رقم الإيصال: *${params.receiptNumber}*

نقدر تعاملكم معنا 🙏
${params.companyName}`,

    en: `Thank you ${params.customerName} 🎉

✅ Payment received successfully!
💰 Amount: *${params.amount.toLocaleString()} ${params.currency}*
🧾 Receipt: *${params.receiptNumber}*

We appreciate your business 🙏
${params.companyName}`,

    ur: `شکریہ ${params.customerName} 🎉

✅ آپ کی ادائیگی کامیابی سے موصول ہوئی!
💰 رقم: *${params.amount.toLocaleString()} ${params.currency}*
🧾 رسید نمبر: *${params.receiptNumber}*

آپ کے کاروبار کا شکریہ 🙏
${params.companyName}`,
  };

  return sendWhatsApp({
    to: params.customerPhone,
    message: messages[language],
  });
}

/**
 * Low stock alert — owner/manager ko
 */
export async function sendLowStockAlert(params: {
  managerPhone: string;
  productName: string;
  currentStock: number;
  minStock: number;
  unit: string;
  companyName: string;
}) {
  return sendWhatsApp({
    to: params.managerPhone,
    message: `⚠️ *تنبيه المخزون المنخفض* | *Low Stock Alert*

🏭 ${params.companyName}
📦 المنتج / Product: *${params.productName}*
📊 الكمية الحالية / Current: *${params.currentStock} ${params.unit}*
📉 الحد الأدنى / Minimum: *${params.minStock} ${params.unit}*

يرجى إعادة الطلب فوراً!
Please reorder immediately! 🚨`,
  });
}

/**
 * New employee welcome
 */
export async function sendEmployeeWelcome(params: {
  employeePhone: string;
  employeeName: string;
  position: string;
  startDate: string;
  companyName: string;
  language?: "ar" | "en" | "ur";
}) {
  const { language = "ar" } = params;

  const messages = {
    ar: `مرحباً ${params.employeeName} 🎉

يسعدنا انضمامك لفريق *${params.companyName}*!

💼 المنصب: ${params.position}
📅 تاريخ الانضمام: ${params.startDate}

نتمنى لك مسيرة ناجحة معنا 🌟`,
    en: `Welcome ${params.employeeName} 🎉

We're thrilled to have you join *${params.companyName}*!

💼 Position: ${params.position}
📅 Start Date: ${params.startDate}

Wishing you a successful journey with us 🌟`,
    ur: `خوش آمدید ${params.employeeName} 🎉

*${params.companyName}* کی ٹیم میں شامل ہونے پر مبارک ہو!

💼 عہدہ: ${params.position}
📅 شروع تاریخ: ${params.startDate}

آپ کی کامیابی کی دعا ہے 🌟`,
  };

  return sendWhatsApp({
    to: params.employeePhone,
    message: messages[language],
  });
}

/**
 * Salary slip notification
 */
export async function sendSalaryNotification(params: {
  employeePhone: string;
  employeeName: string;
  month: string;
  netSalary: number;
  currency: string;
  companyName: string;
  language?: "ar" | "en" | "ur";
}) {
  const { language = "ar" } = params;

  const messages = {
    ar: `السلام عليكم ${params.employeeName} 👋

💰 تم صرف راتبك لشهر *${params.month}*
💵 صافي الراتب: *${params.netSalary.toLocaleString()} ${params.currency}*

للاستفسار تواصل مع قسم الموارد البشرية.
${params.companyName} 🏢`,
    en: `Hello ${params.employeeName} 👋

💰 Your salary for *${params.month}* has been processed
💵 Net Salary: *${params.netSalary.toLocaleString()} ${params.currency}*

Contact HR for any questions.
${params.companyName} 🏢`,
    ur: `السلام علیکم ${params.employeeName} 👋

💰 *${params.month}* کی تنخواہ جاری کر دی گئی ہے
💵 خالص تنخواہ: *${params.netSalary.toLocaleString()} ${params.currency}*

کسی سوال کے لیے HR سے رابطہ کریں۔
${params.companyName} 🏢`,
  };

  return sendWhatsApp({
    to: params.employeePhone,
    message: messages[language],
  });
}
