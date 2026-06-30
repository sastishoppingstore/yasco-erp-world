/**
 * Payment Notification Service
 * 
 * Handles notifications for payment workflow events:
 * - Approval requests
 * - Payment reminders
 * - Status updates
 * - Alert escalations
 */

import { z } from "zod";
import nodemailer from "nodemailer";

export type NotificationChannel = "email" | "sms" | "in_app" | "webhook";
export type NotificationPriority = "low" | "medium" | "high" | "urgent";

export interface NotificationPayload {
  certificateId: number;
  tenantId: number;
  userId: number;
  channel: NotificationChannel;
  priority: NotificationPriority;
  subject: string;
  body: string;
  metadata?: Record<string, any>;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  bodyTemplate: string;
  variables: string[];
  channels: NotificationChannel[];
}

/**
 * Built-in notification templates
 */
const NOTIFICATION_TEMPLATES: Record<string, NotificationTemplate> = {
  APPROVAL_REQUEST: {
    id: "approval_request",
    name: "Approval Request",
    subject: "Certificate {{certificateNumber}} awaiting your approval",
    bodyTemplate: `Dear {{approverName}},

A payment certificate ({{certificateNumber}}) for amount {{amount}} requires your approval.

Project: {{projectName}}
Billing Period: {{billingPeriod}}
Due Date: {{dueDate}}

Please review and approve: {{approvalLink}}

Regards,
Payment System`,
    variables: ["certificateNumber", "amount", "projectName", "billingPeriod", "dueDate", "approverName", "approvalLink"],
    channels: ["email", "in_app"],
  },

  PAYMENT_APPROVED: {
    id: "payment_approved",
    name: "Payment Approved",
    subject: "Certificate {{certificateNumber}} has been approved",
    bodyTemplate: `Dear {{requesterName}},

Your payment certificate {{certificateNumber}} has been approved.

Amount: {{amount}}
Approver: {{approverName}}
Timestamp: {{approvedAt}}

Next step: Certificate signature

Regards,
Payment System`,
    variables: ["certificateNumber", "amount", "requesterName", "approverName", "approvedAt"],
    channels: ["email", "in_app"],
  },

  PAYMENT_SIGNED: {
    id: "payment_signed",
    name: "Payment Signed",
    subject: "Certificate {{certificateNumber}} ready for payment",
    bodyTemplate: `Dear {{requesterName}},

Your payment certificate {{certificateNumber}} has been signed and is ready for payment.

Amount: {{amount}}
Signed By: {{signerName}}
Timestamp: {{signedAt}}

Process payment: {{paymentLink}}

Regards,
Payment System`,
    variables: ["certificateNumber", "amount", "requesterName", "signerName", "signedAt", "paymentLink"],
    channels: ["email", "in_app"],
  },

  PAYMENT_REMINDER: {
    id: "payment_reminder",
    name: "Payment Reminder",
    subject: "Reminder: Certificate {{certificateNumber}} due in {{daysUntilDue}} days",
    bodyTemplate: `Dear {{payerName}},

This is a payment reminder for certificate {{certificateNumber}}.

Amount: {{amount}}
Due Date: {{dueDate}}
Days Remaining: {{daysUntilDue}}

Please process payment: {{paymentLink}}

Regards,
Payment System`,
    variables: ["certificateNumber", "amount", "payerName", "dueDate", "daysUntilDue", "paymentLink"],
    channels: ["email", "sms", "in_app"],
  },

  OVERDUE_PAYMENT: {
    id: "overdue_payment",
    name: "Overdue Payment Alert",
    subject: "URGENT: Certificate {{certificateNumber}} is overdue by {{daysOverdue}} days",
    bodyTemplate: `Dear {{payerName}},

Certificate {{certificateNumber}} is OVERDUE.

Amount: {{amount}}
Due Date: {{dueDate}}
Days Overdue: {{daysOverdue}}
Penalty Interest Rate: {{penaltyRate}}%

Immediate action required: {{paymentLink}}

Regards,
Payment System`,
    variables: ["certificateNumber", "amount", "payerName", "dueDate", "daysOverdue", "penaltyRate", "paymentLink"],
    channels: ["email", "sms", "in_app"],
  },

  DISPUTE_RAISED: {
    id: "dispute_raised",
    name: "Payment Dispute",
    subject: "Dispute raised on certificate {{certificateNumber}}",
    bodyTemplate: `Dear {{participantName}},

A dispute has been raised on payment certificate {{certificateNumber}}.

Amount: {{amount}}
Dispute Reason: {{disputeReason}}
Raised By: {{raisedByName}}
Timestamp: {{raisedAt}}

View details: {{disputeLink}}

Regards,
Payment System`,
    variables: ["certificateNumber", "amount", "participantName", "disputeReason", "raisedByName", "raisedAt", "disputeLink"],
    channels: ["email", "in_app"],
  },
};

/**
 * Get notification template
 */
export function getTemplate(templateId: string): NotificationTemplate | undefined {
  return NOTIFICATION_TEMPLATES[templateId];
}

/**
 * Render template with variables
 */
export function renderTemplate(
  template: NotificationTemplate,
  variables: Record<string, any>
): { subject: string; body: string } {
  let subject = template.subject;
  let body = template.bodyTemplate;

  template.variables.forEach((variable) => {
    const value = variables[variable] || `[${variable}]`;
    const regex = new RegExp(`{{${variable}}}`, "g");
    subject = subject.replace(regex, String(value));
    body = body.replace(regex, String(value));
  });

  return { subject, body };
}

/**
 * Email notification transport
 */
export class EmailNotificationService {
  private transporter: nodemailer.Transporter;

  constructor(config: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
    from: string;
  }) {
    this.transporter = nodemailer.createTransport(config);
  }

  async send(options: {
    to: string;
    subject: string;
    html: string;
    cc?: string[];
    bcc?: string[];
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const info = await this.transporter.sendMail({
        to: options.to,
        subject: options.subject,
        html: options.html,
        cc: options.cc,
        bcc: options.bcc,
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async verify(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error("SMTP verification failed:", error);
      return false;
    }
  }
}

/**
 * In-app notification service
 */
export class InAppNotificationService {
  async send(options: {
    userId: number;
    tenantId: number;
    title: string;
    message: string;
    priority: NotificationPriority;
    metadata?: Record<string, any>;
  }): Promise<{ success: boolean; notificationId?: string }> {
    // This would integrate with your notification database/service
    // For now, returning success
    const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      success: true,
      notificationId,
    };
  }
}

/**
 * SMS notification service
 */
export class SMSNotificationService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async send(options: {
    phoneNumber: string;
    message: string;
  }): Promise<{ success: boolean; smsId?: string; error?: string }> {
    try {
      // Integration with SMS provider (e.g., Twilio, AWS SNS)
      // This is a placeholder implementation
      const smsId = `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return {
        success: true,
        smsId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "SMS send failed",
      };
    }
  }
}

/**
 * Webhook notification service
 */
export class WebhookNotificationService {
  async send(options: {
    webhookUrl: string;
    event: string;
    payload: Record<string, any>;
  }): Promise<{ success: boolean; responseCode?: number; error?: string }> {
    try {
      const response = await fetch(options.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Event": options.event,
          "X-Webhook-Timestamp": new Date().toISOString(),
        },
        body: JSON.stringify(options.payload),
      });

      return {
        success: response.ok,
        responseCode: response.status,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Webhook send failed",
      };
    }
  }
}

/**
 * Notification router schema
 */
export const SendNotificationSchema = z.object({
  certificateId: z.number(),
  templateId: z.string(),
  recipientIds: z.array(z.number()),
  channels: z.array(z.enum(["email", "sms", "in_app", "webhook"])),
  variables: z.record(z.any()),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional().default("medium"),
  scheduled?: z.date(),
});

export type SendNotificationInput = z.infer<typeof SendNotificationSchema>;

/**
 * Get priority level value
 */
export function getPriorityValue(priority: NotificationPriority): number {
  const priorityMap: Record<NotificationPriority, number> = {
    low: 1,
    medium: 2,
    high: 3,
    urgent: 4,
  };
  return priorityMap[priority];
}

/**
 * Should escalate notification
 */
export function shouldEscalate(
  originalPriority: NotificationPriority,
  hoursSinceSent: number
): NotificationPriority | null {
  // Escalate low priority to medium if not read in 24 hours
  if (originalPriority === "low" && hoursSinceSent >= 24) {
    return "medium";
  }
  // Escalate medium to high if not read in 48 hours
  if (originalPriority === "medium" && hoursSinceSent >= 48) {
    return "high";
  }
  // Escalate high to urgent if not read in 72 hours
  if (originalPriority === "high" && hoursSinceSent >= 72) {
    return "urgent";
  }
  return null;
}
