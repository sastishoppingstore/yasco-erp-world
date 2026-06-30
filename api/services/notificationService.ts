import { db } from "@/db";
import { eq } from "drizzle-orm";

/**
 * NOTIFICATION SERVICE - Real-time Notifications
 * Supports in-app, email, SMS, and push notifications
 */

export interface Notification {
  id?: number;
  userId: number;
  tenantId: number;
  type: "info" | "success" | "warning" | "error";
  category:
    | "payment"
    | "budget"
    | "compliance"
    | "safety"
    | "quality"
    | "schedule"
    | "system";
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  read: boolean;
  createdAt: Date;
  metadata?: Record<string, any>;
}

/**
 * CREATE NOTIFICATION
 */
export async function createNotification(
  notification: Omit<Notification, "id" | "read" | "createdAt">
): Promise<Notification> {
  const result = await db
    .insert(notifications)
    .values({
      ...notification,
      read: false,
      createdAt: new Date(),
    })
    .returning();

  // TODO: Send via WebSocket if user is online
  // TODO: Send email if critical
  // TODO: Send push notification if enabled

  return result[0];
}

/**
 * MARK AS READ
 */
export async function markNotificationAsRead(
  notificationId: number,
  userId: number
): Promise<void> {
  await db
    .update(notifications)
    .set({ read: true })
    .where(
      eq(notifications.id, notificationId) &&
        eq(notifications.userId, userId)
    );
}

/**
 * GET USER NOTIFICATIONS
 */
export async function getUserNotifications(
  userId: number,
  tenantId: number,
  limit = 50
): Promise<Notification[]> {
  return await db
    .select()
    .from(notifications)
    .where(
      eq(notifications.userId, userId) &&
        eq(notifications.tenantId, tenantId)
    )
    .orderBy(notifications.createdAt.desc())
    .limit(limit);
}

/**
 * NOTIFICATION TEMPLATES
 */

// Payment Certificate Approved
export async function notifyPaymentCertificateApproved(params: {
  userId: number;
  tenantId: number;
  certificateNumber: string;
  projectName: string;
  amount: number;
  approvedBy: string;
}): Promise<void> {
  await createNotification({
    userId: params.userId,
    tenantId: params.tenantId,
    type: "success",
    category: "payment",
    title: "Payment Certificate Approved",
    message: `Certificate ${params.certificateNumber} for ${params.projectName} (SAR ${params.amount.toLocaleString()}) has been approved by ${params.approvedBy}`,
    actionUrl: `/payments/certificates/${params.certificateNumber}`,
    actionText: "View Certificate",
    metadata: {
      certificateNumber: params.certificateNumber,
      projectName: params.projectName,
      amount: params.amount,
    },
  });
}

// Budget Variance Alert
export async function notifyBudgetVariance(params: {
  userId: number;
  tenantId: number;
  projectName: string;
  category: string;
  variance: number;
  variancePercent: number;
}): Promise<void> {
  const isOverBudget = params.variance > 0;

  await createNotification({
    userId: params.userId,
    tenantId: params.tenantId,
    type: isOverBudget ? "warning" : "info",
    category: "budget",
    title: `Budget ${isOverBudget ? "Overrun" : "Under"} Alert`,
    message: `${params.projectName} - ${params.category} is ${Math.abs(params.variancePercent).toFixed(1)}% ${isOverBudget ? "over" : "under"} budget (SAR ${Math.abs(params.variance).toLocaleString()})`,
    actionUrl: `/costing/${params.projectName}`,
    actionText: "View Details",
    metadata: {
      projectName: params.projectName,
      category: params.category,
      variance: params.variance,
    },
  });
}

// Visa Expiry Alert
export async function notifyVisaExpiry(params: {
  userId: number;
  tenantId: number;
  workerName: string;
  nationalId: string;
  expiryDate: Date;
  daysRemaining: number;
}): Promise<void> {
  const severity =
    params.daysRemaining <= 7
      ? "error"
      : params.daysRemaining <= 30
      ? "warning"
      : "info";

  await createNotification({
    userId: params.userId,
    tenantId: params.tenantId,
    type: severity,
    category: "compliance",
    title: "Visa Expiry Alert",
    message: `Worker ${params.workerName} (${params.nationalId}) visa expires in ${params.daysRemaining} days`,
    actionUrl: `/qiwa/visas`,
    actionText: "View Visa Dashboard",
    metadata: {
      workerName: params.workerName,
      nationalId: params.nationalId,
      expiryDate: params.expiryDate,
    },
  });
}

// HSE Incident Reported
export async function notifyHseIncident(params: {
  userIds: number[];
  tenantId: number;
  incidentId: string;
  type: string;
  severity: string;
  location: string;
}): Promise<void> {
  const notifications = params.userIds.map((userId) =>
    createNotification({
      userId,
      tenantId: params.tenantId,
      type: params.severity === "Critical" ? "error" : "warning",
      category: "safety",
      title: "HSE Incident Reported",
      message: `${params.severity} ${params.type} incident at ${params.location}`,
      actionUrl: `/hse/incidents/${params.incidentId}`,
      actionText: "View Incident",
      metadata: {
        incidentId: params.incidentId,
        type: params.type,
        severity: params.severity,
      },
    })
  );

  await Promise.all(notifications);
}

// Nitaqat Compliance Alert
export async function notifyNitaqatCompliance(params: {
  userId: number;
  tenantId: number;
  currentPercent: number;
  targetPercent: number;
  category: string;
  deficit: number;
}): Promise<void> {
  const isCompliant = params.currentPercent >= params.targetPercent;

  await createNotification({
    userId: params.userId,
    tenantId: params.tenantId,
    type: isCompliant ? "success" : "warning",
    category: "compliance",
    title: "Nitaqat Compliance Status",
    message: isCompliant
      ? `Nitaqat ${params.category} - Compliant (${params.currentPercent.toFixed(1)}%)`
      : `Nitaqat ${params.category} - Need ${params.deficit} more Saudi employees to reach ${params.targetPercent}%`,
    actionUrl: "/nitaqat",
    actionText: "View Dashboard",
    metadata: {
      currentPercent: params.currentPercent,
      targetPercent: params.targetPercent,
      category: params.category,
    },
  });
}

// Quality NCR Created
export async function notifyQualityNcr(params: {
  userIds: number[];
  tenantId: number;
  ncrId: string;
  title: string;
  severity: string;
  location: string;
}): Promise<void> {
  const notifications = params.userIds.map((userId) =>
    createNotification({
      userId,
      tenantId: params.tenantId,
      type: params.severity === "Critical" ? "error" : "warning",
      category: "quality",
      title: "Non-Conformance Report",
      message: `NCR ${params.ncrId}: ${params.title} at ${params.location}`,
      actionUrl: `/quality/ncr/${params.ncrId}`,
      actionText: "View NCR",
      metadata: {
        ncrId: params.ncrId,
        title: params.title,
        severity: params.severity,
      },
    })
  );

  await Promise.all(notifications);
}

// Schedule Delay Alert
export async function notifyScheduleDelay(params: {
  userId: number;
  tenantId: number;
  taskName: string;
  projectName: string;
  delayDays: number;
  criticalPath: boolean;
}): Promise<void> {
  await createNotification({
    userId: params.userId,
    tenantId: params.tenantId,
    type: params.criticalPath ? "error" : "warning",
    category: "schedule",
    title: params.criticalPath
      ? "Critical Path Delay"
      : "Schedule Delay",
    message: `${params.taskName} in ${params.projectName} is delayed by ${params.delayDays} days${params.criticalPath ? " (Critical Path)" : ""}`,
    actionUrl: `/schedule/${params.projectName}`,
    actionText: "View Schedule",
    metadata: {
      taskName: params.taskName,
      projectName: params.projectName,
      delayDays: params.delayDays,
      criticalPath: params.criticalPath,
    },
  });
}

/**
 * BULK NOTIFICATIONS
 */
export async function sendBulkNotifications(
  notifications: Array<Omit<Notification, "id" | "read" | "createdAt">>
): Promise<void> {
  const promises = notifications.map((notif) => createNotification(notif));
  await Promise.all(promises);
}

/**
 * CLEAR OLD NOTIFICATIONS
 */
export async function clearOldNotifications(daysOld = 30): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await db
    .delete(notifications)
    .where(notifications.createdAt < cutoffDate);

  return result.rowCount || 0;
}

// Placeholder for notifications table schema
// This should be defined in your actual schema file
const notifications = {
  id: null,
  userId: null,
  tenantId: null,
  type: null,
  category: null,
  title: null,
  message: null,
  actionUrl: null,
  actionText: null,
  read: null,
  createdAt: null,
  metadata: null,
};
