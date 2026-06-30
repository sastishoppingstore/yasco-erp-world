import { getDb } from "../queries/connection";
import {
  workflows, workflowSteps, workflowApprovals, workflowLogs,
} from "@db/schema";
import { and, eq, desc, sql } from "drizzle-orm";

export interface TriggerEvent {
  entityType: string;
  entityId: number;
  action: "create" | "update" | "status_change" | "delete";
  data: Record<string, any>;
  previousData?: Record<string, any>;
  tenantId: number;
  userId?: number;
}

export interface WorkflowResult {
  executed: boolean;
  workflowId: number;
  workflowName: string;
  stepsExecuted: number;
  approvalsCreated: number;
  errors: string[];
}

async function evaluateCondition(condition: any, data: Record<string, any>, previousData?: Record<string, any>): Promise<boolean> {
  if (!condition) return true;
  const { field, operator, value, type } = condition;
  const currentValue = data[field];
  const previousValue = previousData?.[field];

  switch (type) {
    case "field_value":
      switch (operator) {
        case "eq": return currentValue === value;
        case "neq": return currentValue !== value;
        case "gt": return Number(currentValue) > Number(value);
        case "gte": return Number(currentValue) >= Number(value);
        case "lt": return Number(currentValue) < Number(value);
        case "lte": return Number(currentValue) <= Number(value);
        case "contains": return String(currentValue).toLowerCase().includes(String(value).toLowerCase());
        case "in": return Array.isArray(value) && value.includes(currentValue);
        default: return true;
      }
    case "role":
      return data.role === value || data.userRole === value;
    case "amount_threshold":
      return Number(currentValue) >= Number(value);
    case "date_based":
      const now = new Date();
      const target = new Date(String(currentValue));
      switch (operator) {
        case "before": return target < now;
        case "after": return target > now;
        case "within_days": return Math.abs((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) <= Number(value);
        default: return true;
      }
    case "and":
      return condition.conditions?.every((c: any) => evaluateCondition(c, data, previousData)) ?? true;
    case "or":
      return condition.conditions?.some((c: any) => evaluateCondition(c, data, previousData)) ?? false;
    default:
      return true;
  }
}

async function executeAction(step: any, data: Record<string, any>, tenantId: number): Promise<{ success: boolean; output?: any; error?: string }> {
  const config = step.stepConfig as any;
  switch (step.stepType) {
    case "send_notification": {
      const db = getDb();
      const { notifications } = await import("@db/schema");
      await db.insert(notifications).values({
        tenantId,
        userId: config.userId || data.userId,
        type: config.notificationType || "info",
        title: config.title || "Workflow Notification",
        message: typeof config.message === "string"
          ? config.message.replace(/\{\{(\w+)\}\}/g, (_: string, key: string) => data[key] || "")
          : "Workflow triggered",
        link: config.link,
      } as any);
      return { success: true };
    }
    case "create_record": {
      const db = getDb();
      const entityTable = config.entityType;
      const entityData = config.fields || data;
      try {
        await db.execute(sql`INSERT INTO ${sql.identifier(entityTable)} SET ?`, entityData);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }
    case "update_field": {
      const db = getDb();
      const entityTable = config.entityType;
      try {
        await db.execute(
          sql`UPDATE ${sql.identifier(entityTable)} SET ${sql.identifier(config.field)} = ${config.value} WHERE id = ${config.entityId || data.id}`,
        );
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }
    case "approval_request": {
      const db = getDb();
      const approvalConfig = step.approvalConfig as any || {};
      const assignedTo = approvalConfig.approvers || [config.assigneeId].filter(Boolean);
      await db.insert(workflowApprovals).values({
        tenantId,
        workflowId: step.workflowId,
        workflowStepId: step.id,
        entityType: config.entityType || data.entityType,
        entityId: config.entityId || data.id,
        requestedBy: data.userId || config.requestedBy,
        assignedTo,
        status: "pending",
        priority: approvalConfig.priority || 0,
        dueAt: approvalConfig.timeoutMinutes
          ? new Date(Date.now() + approvalConfig.timeoutMinutes * 60000)
          : undefined,
      } as any);
      return { success: true, output: { approvalCreated: true } };
    }
    case "webhook_call": {
      try {
        const response = await fetch(config.url, {
          method: config.method || "POST",
          headers: { "Content-Type": "application/json", ...config.headers },
          body: JSON.stringify(config.body || data),
        });
        const resp = await response.text();
        return { success: response.ok, output: { status: response.status, body: resp } };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }
    default:
      return { success: false, error: `Unknown step type: ${step.stepType}` };
  }
}

export async function processWorkflow(workflowId: number, event: TriggerEvent): Promise<WorkflowResult> {
  const db = getDb();
  const startTime = Date.now();
  const result: WorkflowResult = {
    executed: false,
    workflowId,
    workflowName: "",
    stepsExecuted: 0,
    approvalsCreated: 0,
    errors: [],
  };

  try {
    const workflow = await db.query.workflows.findFirst({
      where: and(eq(workflows.id, workflowId), eq(workflows.isActive, true)),
    });
    if (!workflow) return { ...result, errors: ["Workflow not found or inactive"] };

    result.workflowName = workflow.name;

    if (workflow.entityType && workflow.entityType !== event.entityType) {
      return result;
    }

    const triggerCfg = workflow.triggerConfig as any;
    if (triggerCfg?.action && triggerCfg.action !== event.action) {
      return result;
    }

    const steps = await db.query.workflowSteps.findMany({
      where: and(eq(workflowSteps.workflowId, workflowId), eq(workflowSteps.isActive, true)),
      orderBy: sql`step_order ASC`,
    });

    result.executed = true;
    const parallelGroup: any[] = [];

    for (const step of steps) {
      const conditionsMet = await evaluateCondition(step.conditions, event.data, event.previousData);
      if (!conditionsMet) continue;

      if (step.isParallel) {
        parallelGroup.push(step);
        continue;
      }

      if (parallelGroup.length > 0) {
        const parallelResults = await Promise.all(
          parallelGroup.map(s => executeAction(s, event.data, event.tenantId))
        );
        for (const pr of parallelResults) {
          if (!pr.success) result.errors.push(pr.error || "Parallel step failed");
          if (pr.output?.approvalCreated) result.approvalsCreated++;
        }
        result.stepsExecuted += parallelGroup.length;
        parallelGroup.length = 0;
      }

      const actionResult = await executeAction(step, event.data, event.tenantId);
      if (!actionResult.success) result.errors.push(actionResult.error || `Step ${step.stepOrder} failed`);
      if (actionResult.output?.approvalCreated) result.approvalsCreated++;
      result.stepsExecuted++;
    }

    if (parallelGroup.length > 0) {
      const parallelResults = await Promise.all(
        parallelGroup.map(s => executeAction(s, event.data, event.tenantId))
      );
      for (const pr of parallelResults) {
        if (!pr.success) result.errors.push(pr.error || "Parallel step failed");
        if (pr.output?.approvalCreated) result.approvalsCreated++;
      }
      result.stepsExecuted += parallelGroup.length;
    }

    await db.insert(workflowLogs).values({
      tenantId: event.tenantId,
      workflowId,
      entityType: event.entityType,
      entityId: event.entityId,
      action: event.action,
      status: result.errors.length === 0 ? "completed" : "completed_with_errors",
      message: `Executed ${result.stepsExecuted} steps, ${result.approvalsCreated} approvals created. Errors: ${result.errors.length}`,
      inputData: { event },
      outputData: result,
      executionTimeMs: Date.now() - startTime,
      triggeredBy: event.userId,
    } as any);

    return result;
  } catch (err: any) {
    await db.insert(workflowLogs).values({
      tenantId: event.tenantId,
      workflowId,
      entityType: event.entityType,
      entityId: event.entityId,
      action: event.action,
      status: "error",
      message: err.message,
      executionTimeMs: Date.now() - startTime,
      errorMessage: err.message,
    } as any);
    return { ...result, errors: [err.message] };
  }
}

export async function findAndProcessMatchingWorkflows(event: TriggerEvent): Promise<WorkflowResult[]> {
  const db = getDb();
  const matching = await db.query.workflows.findMany({
    where: and(
      eq(workflows.tenantId, event.tenantId),
      eq(workflows.isActive, true),
    ),
  });
  const results: WorkflowResult[] = [];
  for (const wf of matching) {
    const result = await processWorkflow(wf.id, event);
    if (result.executed) results.push(result);
  }
  return results;
}

export async function processApproval(approvalId: number, action: "approved" | "rejected", userId: number, reason?: string): Promise<boolean> {
  const db = getDb();
  const approval = await db.query.workflowApprovals.findFirst({
    where: eq(workflowApprovals.id, approvalId),
  });
  if (!approval || approval.status !== "pending") return false;

  const step = await db.query.workflowSteps.findFirst({
    where: eq(workflowSteps.id, approval.workflowStepId!),
  });

  await db.update(workflowApprovals).set({
    status: action,
    approvedBy: userId,
    approvedAt: new Date(),
    rejectionReason: action === "rejected" ? reason : undefined,
  }).where(eq(workflowApprovals.id, approvalId));

  const approvalCfg = step?.approvalConfig as any;
  const allApprovals = await db.query.workflowApprovals.findMany({
    where: and(
      eq(workflowApprovals.workflowId, approval.workflowId),
      eq(workflowApprovals.entityType, approval.entityType),
      eq(workflowApprovals.entityId, approval.entityId),
    ),
  });

  if (action === "approved") {
    const requiredApprovals = approvalCfg?.requiredApprovals || 1;
    const approvedCount = allApprovals.filter(a => a.status === "approved").length;
    if (approvedCount >= requiredApprovals) {
      // Trigger next steps or completion
      await db.insert(workflowLogs).values({
        tenantId: approval.tenantId,
        workflowId: approval.workflowId,
        workflowStepId: approval.workflowStepId,
        entityType: approval.entityType,
        entityId: approval.entityId,
        action: "approval_completed",
        status: "completed",
        message: `Approval completed with ${approvedCount} approvals`,
        triggeredBy: userId,
      } as any);
    }
  }

  await db.insert(workflowLogs).values({
    tenantId: approval.tenantId,
    workflowId: approval.workflowId!,
    workflowStepId: approval.workflowStepId,
    entityType: approval.entityType,
    entityId: approval.entityId,
    action: `approval_${action}`,
    status: action === "approved" ? "completed" : "rejected",
    message: reason || `${action} by user ${userId}`,
    triggeredBy: userId,
  } as any);

  return true;
}

export async function getWorkflowLogs(tenantId: number, workflowId?: number, limit = 50) {
  const db = getDb();
  const conditions = [eq(workflowLogs.tenantId, tenantId)];
  if (workflowId) conditions.push(eq(workflowLogs.workflowId, workflowId));
  return db.query.workflowLogs.findMany({
    where: and(...conditions),
    orderBy: desc(workflowLogs.createdAt),
    limit,
  });
}

export async function getPendingApprovals(tenantId: number, userId: number): Promise<any[]> {
  const db = getDb();
  const all = await db.query.workflowApprovals.findMany({
    where: and(
      eq(workflowApprovals.tenantId, tenantId),
      eq(workflowApprovals.status, "pending"),
    ),
    orderBy: desc(workflowApprovals.createdAt),
  });
  return all.filter(a => {
    const assigned = a.assignedTo as any;
    return Array.isArray(assigned) && assigned.includes(userId);
  });
}

export type WorkflowTrigger = {
  type: "on_create" | "on_update" | "status_change" | "scheduled" | "manual";
  entityType?: string;
  cronExpression?: string;
  field?: string;
  fromValue?: string;
  toValue?: string;
};

export type WorkflowStep = {
  id: string;
  name: string;
  type: "condition" | "action" | "approval" | "parallel";
  conditions?: any;
  actions?: any[];
  parallelSteps?: WorkflowStep[];
  approvers?: number[];
  approvalCount?: number;
  order?: number;
};

async function list(tenantId: number) {
  const db = getDb();
  return db.query.workflows.findMany({
    where: eq(workflows.tenantId, tenantId),
    orderBy: desc(workflows.createdAt),
  });
}

async function get(id: number) {
  const db = getDb();
  return db.query.workflows.findFirst({
    where: eq(workflows.id, id),
    with: { steps: true },
  });
}

async function create(data: any) {
  const db = getDb();
  const [wf] = await db.insert(workflows).values({
    tenantId: data.tenantId,
    name: data.name,
    description: data.description,
    entityType: data.entityType,
    triggerConfig: data.trigger,
    isActive: data.isActive ?? true,
  }).$returningId();
  if (data.steps?.length) {
    await db.insert(workflowSteps).values(
      data.steps.map((s: any, i: number) => ({
        workflowId: wf.id,
        stepOrder: (s.order ?? i + 1),
        stepType: s.type,
        stepConfig: s,
        conditions: s.conditions,
        approvalConfig: s.type === "approval" ? { approvers: s.approvers, requiredApprovals: s.approvalCount } : null,
        isParallel: s.type === "parallel",
        isActive: true,
      }))
    );
  }
  return wf.id;
}

async function update(id: number, data: any) {
  const db = getDb();
  const updates: any = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.description !== undefined) updates.description = data.description;
  if (data.isActive !== undefined) updates.isActive = data.isActive;
  if (data.trigger !== undefined) updates.triggerConfig = data.trigger;
  if (Object.keys(updates).length > 0) {
    await db.update(workflows).set(updates).where(eq(workflows.id, id));
  }
  if (data.steps) {
    await db.delete(workflowSteps).where(eq(workflowSteps.workflowId, id));
    await db.insert(workflowSteps).values(
      data.steps.map((s: any, i: number) => ({
        workflowId: id,
        stepOrder: (s.order ?? i + 1),
        stepType: s.type,
        stepConfig: s,
        conditions: s.conditions,
        approvalConfig: s.type === "approval" ? { approvers: s.approvers, requiredApprovals: s.approvalCount } : null,
        isParallel: s.type === "parallel",
        isActive: true,
      }))
    );
  }
}

async function remove(id: number) {
  const db = getDb();
  await db.delete(workflowSteps).where(eq(workflowSteps.workflowId, id));
  await db.delete(workflows).where(eq(workflows.id, id));
}

async function toggle(id: number, isActive: boolean) {
  const db = getDb();
  await db.update(workflows).set({ isActive }).where(eq(workflows.id, id));
}

async function executeWorkflow(wf: any, context: any) {
  const tenantId = context._tenantId;
  if (!tenantId) throw new Error("Missing tenant context");
  return processWorkflow(wf.id, {
    entityType: wf.entityType || "custom",
    entityId: context._entityId || 0,
    action: "manual",
    data: context,
    tenantId,
    userId: context._userId,
  });
}

async function getExecutionLogs(workflowId: number, limit = 50) {
  const db = getDb();
  return db.query.workflowLogs.findMany({
    where: eq(workflowLogs.workflowId, workflowId),
    orderBy: desc(workflowLogs.createdAt),
    limit,
  });
}

export const workflowEngine = {
  list,
  get,
  create,
  update,
  delete: remove,
  toggle,
  executeWorkflow,
  getExecutionLogs,
  processWorkflow,
  findAndProcessMatchingWorkflows,
  processApproval,
  getWorkflowLogs,
  getPendingApprovals,
};
