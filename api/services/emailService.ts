import nodemailer from "nodemailer";
import { z } from "zod";

/**
 * EMAIL SERVICE - Complete Email Functionality
 * Supports SMTP, attachments, templates, and Saudi-specific formats
 */

// Email configuration
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
};

const FROM_EMAIL = process.env.SMTP_FROM || "noreply@yasco.sa";

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport(SMTP_CONFIG);
  }
  return transporter;
}

// Email schemas
const emailSchema = z.object({
  to: z.string().email(),
  subject: z.string(),
  text: z.string().optional(),
  html: z.string().optional(),
  attachments: z.array(
    z.object({
      filename: z.string(),
      content: z.union([z.string(), z.instanceof(Buffer)]),
      contentType: z.string().optional(),
    })
  ).optional(),
});

export type EmailOptions = z.infer<typeof emailSchema>;

/**
 * SEND EMAIL - Core function
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    emailSchema.parse(options);

    const mailOptions = {
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    };

    const transport = getTransporter();
    await transport.sendMail(mailOptions);
    
    console.log(`✅ Email sent to: ${options.to}`);
    return true;
  } catch (error: any) {
    console.error("❌ Email send failed:", error);
    return false;
  }
}

/**
 * SEND INVOICE EMAIL
 */
export async function sendInvoiceEmail(params: {
  to: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  currency: string;
  pdfBuffer: Buffer;
  dueDate?: Date;
}): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3B82F6;">Invoice ${params.invoiceNumber}</h2>
      <p>Dear ${params.customerName},</p>
      <p>Please find attached your invoice.</p>
      
      <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <table style="width: 100%;">
          <tr>
            <td><strong>Invoice Number:</strong></td>
            <td>${params.invoiceNumber}</td>
          </tr>
          <tr>
            <td><strong>Amount Due:</strong></td>
            <td style="font-size: 24px; color: #EF4444;">${params.currency} ${params.amount.toLocaleString()}</td>
          </tr>
          ${params.dueDate ? `
          <tr>
            <td><strong>Due Date:</strong></td>
            <td>${params.dueDate.toLocaleDateString('en-SA')}</td>
          </tr>
          ` : ''}
        </table>
      </div>

      <p>If you have any questions, please don't hesitate to contact us.</p>
      
      <p style="color: #6B7280; font-size: 12px; margin-top: 40px;">
        This is an automated message from YASCO ERP<br>
        Saudi Arabia Construction Management System
      </p>
    </div>
  `;

  return await sendEmail({
    to: params.to,
    subject: `Invoice ${params.invoiceNumber} - ${params.currency} ${params.amount.toLocaleString()}`,
    html,
    attachments: [
      {
        filename: `Invoice-${params.invoiceNumber}.pdf`,
        content: params.pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
}

/**
 * SEND PAYMENT CERTIFICATE EMAIL
 */
export async function sendPaymentCertificateEmail(params: {
  to: string;
  certificateNumber: string;
  projectName: string;
  amount: number;
  stage: string;
  pdfBuffer: Buffer;
}): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10B981;">Payment Certificate ${params.certificateNumber}</h2>
      <p>Payment Certificate for project: <strong>${params.projectName}</strong></p>
      
      <div style="background: #F0FDF4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
        <table style="width: 100%;">
          <tr>
            <td><strong>Certificate No:</strong></td>
            <td>${params.certificateNumber}</td>
          </tr>
          <tr>
            <td><strong>Project:</strong></td>
            <td>${params.projectName}</td>
          </tr>
          <tr>
            <td><strong>Stage:</strong></td>
            <td>${params.stage}</td>
          </tr>
          <tr>
            <td><strong>Amount:</strong></td>
            <td style="font-size: 20px; color: #059669;">SAR ${params.amount.toLocaleString()}</td>
          </tr>
        </table>
      </div>

      <p>Please review the attached certificate and proceed with payment processing.</p>
      
      <p style="color: #6B7280; font-size: 12px; margin-top: 40px;">
        YASCO Construction ERP - Payment Certificate System<br>
        Compliant with Saudi Arabia Standards
      </p>
    </div>
  `;

  return await sendEmail({
    to: params.to,
    subject: `Payment Certificate ${params.certificateNumber} - ${params.projectName}`,
    html,
    attachments: [
      {
        filename: `Certificate-${params.certificateNumber}.pdf`,
        content: params.pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
}

/**
 * SEND COMPLIANCE ALERT EMAIL
 */
export async function sendComplianceAlertEmail(params: {
  to: string;
  alertType: "qiwa" | "nitaqat" | "zatca" | "hse" | "balady";
  message: string;
  severity: "critical" | "high" | "medium" | "low";
  actionRequired: string;
  deadline?: Date;
}): Promise<boolean> {
  const colors = {
    critical: "#DC2626",
    high: "#F59E0B",
    medium: "#3B82F6",
    low: "#10B981",
  };

  const typeLabels = {
    qiwa: "Qiwa Visa Compliance",
    nitaqat: "Nitaqat Saudization",
    zatca: "ZATCA E-Invoicing",
    hse: "Health & Safety",
    balady: "Municipality Permit",
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: ${colors[params.severity]}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0;">⚠️ Compliance Alert</h2>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">${typeLabels[params.alertType]}</p>
      </div>
      
      <div style="background: #F9FAFB; padding: 20px;">
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: ${colors[params.severity]};">Alert Details</h3>
          <p>${params.message}</p>
        </div>

        <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; border-left: 4px solid #F59E0B;">
          <strong>Action Required:</strong>
          <p style="margin: 5px 0 0 0;">${params.actionRequired}</p>
          ${params.deadline ? `
          <p style="margin: 10px 0 0 0;"><strong>Deadline:</strong> ${params.deadline.toLocaleDateString('en-SA')}</p>
          ` : ''}
        </div>

        <div style="margin-top: 20px; text-align: center;">
          <a href="https://your-erp.com/compliance" 
             style="background: ${colors[params.severity]}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View in Dashboard
          </a>
        </div>
      </div>

      <p style="color: #6B7280; font-size: 12px; text-align: center; margin-top: 20px;">
        YASCO ERP - Saudi Compliance Management
      </p>
    </div>
  `;

  return await sendEmail({
    to: params.to,
    subject: `🚨 [${params.severity.toUpperCase()}] ${typeLabels[params.alertType]} Alert`,
    html,
  });
}

/**
 * SEND HSE INCIDENT NOTIFICATION
 */
export async function sendHseIncidentEmail(params: {
  to: string[];
  incidentId: string;
  type: string;
  severity: string;
  location: string;
  description: string;
  reportedBy: string;
  timestamp: Date;
}): Promise<boolean> {
  const recipients = params.to.join(", ");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #DC2626; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0;">🛡️ HSE Incident Report</h2>
        <p style="margin: 5px 0 0 0;">Incident ID: ${params.incidentId}</p>
      </div>
      
      <div style="background: white; padding: 20px; border: 1px solid #E5E7EB;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #E5E7EB;">
            <td style="padding: 10px; font-weight: bold;">Type:</td>
            <td style="padding: 10px;">${params.type}</td>
          </tr>
          <tr style="border-bottom: 1px solid #E5E7EB;">
            <td style="padding: 10px; font-weight: bold;">Severity:</td>
            <td style="padding: 10px;"><span style="background: #FEE2E2; color: #DC2626; padding: 4px 8px; border-radius: 4px;">${params.severity}</span></td>
          </tr>
          <tr style="border-bottom: 1px solid #E5E7EB;">
            <td style="padding: 10px; font-weight: bold;">Location:</td>
            <td style="padding: 10px;">${params.location}</td>
          </tr>
          <tr style="border-bottom: 1px solid #E5E7EB;">
            <td style="padding: 10px; font-weight: bold;">Reported By:</td>
            <td style="padding: 10px;">${params.reportedBy}</td>
          </tr>
          <tr style="border-bottom: 1px solid #E5E7EB;">
            <td style="padding: 10px; font-weight: bold;">Time:</td>
            <td style="padding: 10px;">${params.timestamp.toLocaleString('en-SA')}</td>
          </tr>
        </table>

        <div style="margin-top: 20px; padding: 15px; background: #FEF3C7; border-radius: 8px;">
          <strong>Description:</strong>
          <p style="margin: 5px 0 0 0;">${params.description}</p>
        </div>

        <div style="margin-top: 20px; text-align: center;">
          <a href="https://your-erp.com/hse/incidents/${params.incidentId}" 
             style="background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Full Report
          </a>
        </div>
      </div>

      <p style="color: #6B7280; font-size: 12px; text-align: center; margin-top: 20px;">
        YASCO ERP - HSE Management System
      </p>
    </div>
  `;

  // Send to all recipients
  const promises = params.to.map((email) =>
    sendEmail({
      to: email,
      subject: `🚨 HSE Incident Report - ${params.type} (${params.severity})`,
      html,
    })
  );

  const results = await Promise.all(promises);
  return results.every((r) => r === true);
}

/**
 * SEND OTP EMAIL
 */
export async function sendOtpEmail(params: {
  to: string;
  otp: string;
  expiryMinutes: number;
}): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0;">🔐 Login Verification</h2>
      </div>
      
      <div style="background: white; padding: 40px; text-align: center; border: 1px solid #E5E7EB;">
        <p>Your one-time password (OTP) is:</p>
        
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0; display: inline-block;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #3B82F6;">${params.otp}</span>
        </div>

        <p style="color: #EF4444; font-weight: bold;">This code expires in ${params.expiryMinutes} minutes</p>
        
        <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
          If you didn't request this code, please ignore this email.
        </p>
      </div>

      <p style="color: #6B7280; font-size: 12px; text-align: center; margin-top: 20px;">
        YASCO ERP - Secure Authentication
      </p>
    </div>
  `;

  return await sendEmail({
    to: params.to,
    subject: `Your OTP Code - ${params.otp}`,
    html,
  });
}

/**
 * SEND BUDGET ALERT EMAIL
 */
export async function sendBudgetAlertEmail(params: {
  to: string;
  projectName: string;
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  variancePercent: number;
}): Promise<boolean> {
  const isOverBudget = params.variance > 0;
  const color = isOverBudget ? "#DC2626" : "#10B981";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: ${color}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0;">💰 Budget Alert</h2>
        <p style="margin: 5px 0 0 0;">${params.projectName}</p>
      </div>
      
      <div style="background: white; padding: 20px; border: 1px solid #E5E7EB;">
        <div style="text-align: center; padding: 20px;">
          <p style="font-size: 18px; margin: 0;">Budget Status</p>
          <p style="font-size: 48px; font-weight: bold; color: ${color}; margin: 10px 0;">
            ${isOverBudget ? '+' : ''}${params.variancePercent.toFixed(1)}%
          </p>
          <p style="color: #6B7280;">${isOverBudget ? 'Over Budget' : 'Under Budget'}</p>
        </div>

        <table style="width: 100%; margin-top: 20px;">
          <tr style="border-bottom: 1px solid #E5E7EB;">
            <td style="padding: 10px;">Budgeted Amount:</td>
            <td style="padding: 10px; text-align: right; font-weight: bold;">SAR ${params.budgetAmount.toLocaleString()}</td>
          </tr>
          <tr style="border-bottom: 1px solid #E5E7EB;">
            <td style="padding: 10px;">Actual Spent:</td>
            <td style="padding: 10px; text-align: right; font-weight: bold;">SAR ${params.actualAmount.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 10px;">Variance:</td>
            <td style="padding: 10px; text-align: right; font-weight: bold; color: ${color};">SAR ${Math.abs(params.variance).toLocaleString()}</td>
          </tr>
        </table>

        <div style="margin-top: 20px; text-align: center;">
          <a href="https://your-erp.com/costing" 
             style="background: ${color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Job Costing Dashboard
          </a>
        </div>
      </div>
    </div>
  `;

  return await sendEmail({
    to: params.to,
    subject: `Budget Alert: ${params.projectName} - ${isOverBudget ? 'Over' : 'Under'} by ${Math.abs(params.variancePercent).toFixed(1)}%`,
    html,
  });
}

/**
 * TEST EMAIL CONFIGURATION
 */
export async function testEmailConfig(): Promise<boolean> {
  try {
    const transport = getTransporter();
    await transport.verify();
    console.log("✅ Email configuration is valid");
    return true;
  } catch (error) {
    console.error("❌ Email configuration is invalid:", error);
    return false;
  }
}
