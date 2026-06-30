/**
 * Payment Workflow State Machine
 * 
 * Handles payment transitions through state machine:
 * draft -> pending_approval -> approved -> signed -> paid
 * 
 * Each state has allowed transitions and business logic.
 */

import { z } from "zod";

export type PaymentState = "draft" | "pending_approval" | "approved" | "signed" | "paid" | "disputed";

export interface PaymentWorkflowEvent {
  type: string;
  payload?: Record<string, any>;
  userId: number;
  timestamp: Date;
}

export interface PaymentWorkflowContext {
  certificateId: number;
  tenantId: number;
  currentState: PaymentState;
  approvalChain: ApprovalStep[];
  history: PaymentWorkflowEvent[];
}

export interface ApprovalStep {
  role: "pm" | "finance" | "principal" | "client";
  userId: number;
  order: number;
  status: "pending" | "approved" | "rejected";
  approvedAt?: Date;
  comments?: string;
}

/**
 * State machine definition - allowed transitions
 */
const STATE_TRANSITIONS: Record<PaymentState, PaymentState[]> = {
  draft: ["pending_approval", "disputed"],
  pending_approval: ["approved", "rejected", "disputed"],
  approved: ["signed", "disputed"],
  signed: ["paid", "disputed"],
  paid: ["disputed"],
  disputed: ["draft", "pending_approval"],
};

/**
 * Validate state transition
 */
export function canTransition(from: PaymentState, to: PaymentState): boolean {
  return STATE_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Get allowed next states for current state
 */
export function getAllowedTransitions(state: PaymentState): PaymentState[] {
  return STATE_TRANSITIONS[state] || [];
}

/**
 * Transition payment to new state with validation
 */
export function transitionState(
  current: PaymentState,
  target: PaymentState,
  event: PaymentWorkflowEvent
): {
  success: boolean;
  newState?: PaymentState;
  error?: string;
} {
  if (!canTransition(current, target)) {
    return {
      success: false,
      error: `Cannot transition from ${current} to ${target}. Allowed: ${STATE_TRANSITIONS[current].join(", ")}`,
    };
  }

  return {
    success: true,
    newState: target,
  };
}

/**
 * Calculate approval completion percentage
 */
export function getApprovalProgress(approvals: ApprovalStep[]): {
  completed: number;
  total: number;
  percentage: number;
  isComplete: boolean;
  nextPending?: ApprovalStep;
} {
  const completed = approvals.filter((a) => a.status === "approved").length;
  const total = approvals.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const nextPending = approvals.find((a) => a.status === "pending");

  return {
    completed,
    total,
    percentage,
    isComplete: completed === total,
    nextPending,
  };
}

/**
 * Check if all approvals are complete
 */
export function areAllApprovalsComplete(approvals: ApprovalStep[]): boolean {
  return approvals.every((a) => a.status === "approved");
}

/**
 * Get approval by role in order
 */
export function getApprovalByRole(approvals: ApprovalStep[], role: string): ApprovalStep | undefined {
  return approvals.find((a) => a.role === role);
}

/**
 * Schema for payment workflow events
 */
export const PaymentWorkflowEventSchema = z.object({
  type: z.enum([
    "DRAFT_CREATED",
    "SUBMITTED_FOR_APPROVAL",
    "APPROVED",
    "REJECTED",
    "SIGNED",
    "PAID",
    "DISPUTED",
    "APPROVAL_COMMENT_ADDED",
    "SIGNATURE_CAPTURED",
  ]),
  payload: z.record(z.any()).optional(),
  userId: z.number(),
  timestamp: z.date(),
});

/**
 * Schema for approval step
 */
export const ApprovalStepSchema = z.object({
  role: z.enum(["pm", "finance", "principal", "client"]),
  userId: z.number(),
  order: z.number(),
  status: z.enum(["pending", "approved", "rejected"]),
  approvedAt: z.date().optional(),
  comments: z.string().optional(),
});

/**
 * Schema for payment workflow context
 */
export const PaymentWorkflowContextSchema = z.object({
  certificateId: z.number(),
  tenantId: z.number(),
  currentState: z.enum(["draft", "pending_approval", "approved", "signed", "paid", "disputed"]),
  approvalChain: z.array(ApprovalStepSchema),
  history: z.array(PaymentWorkflowEventSchema),
});

/**
 * Generate readable state display
 */
export function getStateDisplay(state: PaymentState): string {
  const displayMap: Record<PaymentState, string> = {
    draft: "Draft",
    pending_approval: "Pending Approval",
    approved: "Approved",
    signed: "Signed",
    paid: "Paid",
    disputed: "Disputed",
  };
  return displayMap[state] || state;
}

/**
 * Get state color for UI
 */
export function getStateColor(state: PaymentState): string {
  const colorMap: Record<PaymentState, string> = {
    draft: "bg-gray-100 text-gray-800",
    pending_approval: "bg-yellow-100 text-yellow-800",
    approved: "bg-blue-100 text-blue-800",
    signed: "bg-purple-100 text-purple-800",
    paid: "bg-green-100 text-green-800",
    disputed: "bg-red-100 text-red-800",
  };
  return colorMap[state] || "bg-gray-100 text-gray-800";
}

/**
 * Get state icon
 */
export function getStateIcon(state: PaymentState): string {
  const iconMap: Record<PaymentState, string> = {
    draft: "FileText",
    pending_approval: "Clock",
    approved: "CheckCircle",
    signed: "Signature",
    paid: "DollarSign",
    disputed: "AlertCircle",
  };
  return iconMap[state] || "HelpCircle";
}
