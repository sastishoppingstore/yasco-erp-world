import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  workflows, workflowSteps, workflowApprovals, workflowLogs,
} from "@db/schema";
import { and, eq, desc, asc } from "drizzle-orm";
import {
  processWorkflow, findAndProcessMatchingWorkflows,
  processApproval, getWorkflowLogs, getPendingApprovals,
  type TriggerEvent,
} from "./lib/workflowEngine";

export const workflowBuilderRouter = createRouter({
  list: authedQuery
    .input(z.object({
      entityType: z.string().optional(),
      isActive: z.boolean().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(workflows.tenantId, ctx.user.tenantId!)];
      if (input?.entityType) conditions.push(eq(workflows.entityType, input.entityType));
      if (input?.isActive !== undefined) conditions.push(eq(workflows.isActive, input.isActive));
      return db.query.workflows.findMany({
        where: and(...conditions),
        orderBy: desc(workflows.createdAt),
      });
    }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const wf = await db.query.workflows.findFirst({
        where: and(eq(workflows.id, input.id), eq(workflows.tenantId, ctx.user.tenantId!)),
      });
      if (!wf) return null;
      const steps = await db.query.workflowSteps.findMany({
        where: and(eq(workflowSteps.workflowId, input.id), eq(workflowSteps.tenantId, ctx.user.tenantId!)),
        orderBy: asc(workflowSteps.stepOrder),
      });
      return { ...wf, steps };
    }),

  create: authedQuery
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      entityType: z.string().optional(),
      triggerType: z.enum(["on_create", "on_update", "on_status_change", "schedule_based"]),
      triggerConfig: z.any().optional(),
      isActive: z.boolean().optional().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [wf] = await db.insert(workflows).values({
        tenantId: ctx.user.tenantId!,
        ...input,
        createdBy: ctx.user.id,
      } as any).$returningId();
      return { success: true, id: wf!.id };
    }),

  update: authedQuery
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      entityType: z.string().optional(),
      triggerType: z.string().optional(),
      triggerConfig: z.any().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.update(workflows).set({
        ...input,
        version: sql`version + 1`,
      }).where(and(eq(workflows.id, input.id), eq(workflows.tenantId, ctx.user.tenantId!)));
      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.delete(workflowSteps).where(and(
        eq(workflowSteps.workflowId, input.id),
        eq(workflowSteps.tenantId, ctx.user.tenantId!),
      ));
      await db.delete(workflowApprovals).where(and(
        eq(workflowApprovals.workflowId, input.id),
        eq(workflowApprovals.tenantId, ctx.user.tenantId!),
      ));
      await db.delete(workflowLogs).where(and(
        eq(workflowLogs.workflowId, input.id),
        eq(workflowLogs.tenantId, ctx.user.tenantId!),
      ));
      await db.delete(workflows).where(and(
        eq(workflows.id, input.id),
        eq(workflows.tenantId, ctx.user.tenantId!),
      ));
      return { success: true };
    }),

  // Steps management
  addStep: authedQuery
    .input(z.object({
      workflowId: z.number(),
      stepOrder: z.number(),
      stepType: z.enum([
        "send_notification", "create_record", "update_field",
        "approval_request", "webhook_call",
      ]),
      stepConfig: z.any(),
      conditions: z.any().optional(),
      approvalConfig: z.any().optional(),
      isParallel: z.boolean().optional().default(false),
      timeoutMinutes: z.number().optional(),
      escalationConfig: z.any().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [step] = await db.insert(workflowSteps).values({
        tenantId: ctx.user.tenantId!,
        ...input,
      } as any).$returningId();
      return { success: true, id: step!.id };
    }),

  updateStep: authedQuery
    .input(z.object({
      id: z.number(),
      stepOrder: z.number().optional(),
      stepType: z.string().optional(),
      stepConfig: z.any().optional(),
      conditions: z.any().optional(),
      approvalConfig: z.any().optional(),
      isParallel: z.boolean().optional(),
      timeoutMinutes: z.number().optional(),
      escalationConfig: z.any().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.update(workflowSteps).set(input).where(and(
        eq(workflowSteps.id, input.id),
        eq(workflowSteps.tenantId, ctx.user.tenantId!),
      ));
      return { success: true };
    }),

  deleteStep: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.delete(workflowSteps).where(and(
        eq(workflowSteps.id, input.id),
        eq(workflowSteps.tenantId, ctx.user.tenantId!),
      ));
      return { success: true };
    }),

  reorderSteps: authedQuery
    .input(z.object({
      workflowId: z.number(),
      stepIds: z.array(z.number()),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      for (let i = 0; i < input.stepIds.length; i++) {
        await db.update(workflowSteps).set({ stepOrder: i + 1 }).where(and(
          eq(workflowSteps.id, input.stepIds[i]),
          eq(workflowSteps.tenantId, ctx.user.tenantId!),
        ));
      }
      return { success: true };
    }),

  // Execution & testing
  trigger: authedQuery
    .input(z.object({
      workflowId: z.number(),
      entityType: z.string(),
      entityId: z.number(),
      action: z.enum(["create", "update", "status_change", "delete"]),
      data: z.any(),
      previousData: z.any().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const event: TriggerEvent = {
        entityType: input.entityType,
        entityId: input.entityId,
        action: input.action,
        data: input.data,
        previousData: input.previousData,
        tenantId: ctx.user.tenantId!,
        userId: ctx.user.id,
      };
      const result = await processWorkflow(input.workflowId, event);
      return result;
    }),

  // Approval management
  approvals: authedQuery
    .input(z.object({
      workflowId: z.number().optional(),
      status: z.string().optional(),
      limit: z.number().optional().default(50),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conditions = [eq(workflowApprovals.tenantId, ctx.user.tenantId!)];
      if (input?.workflowId) conditions.push(eq(workflowApprovals.workflowId, input.workflowId));
      if (input?.status) conditions.push(eq(workflowApprovals.status, input.status));
      return db.query.workflowApprovals.findMany({
        where: and(...conditions),
        orderBy: desc(workflowApprovals.createdAt),
        limit: input?.limit || 50,
      });
    }),

  approve: authedQuery
    .input(z.object({ approvalId: z.number(), reason: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const success = await processApproval(input.approvalId, "approved", ctx.user.id!, input.reason);
      return { success };
    }),

  reject: authedQuery
    .input(z.object({ approvalId: z.number(), reason: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const success = await processApproval(input.approvalId, "rejected", ctx.user.id!, input.reason);
      return { success };
    }),

  pendingApprovals: authedQuery.query(async ({ ctx }) => {
    return getPendingApprovals(ctx.user.tenantId!, ctx.user.id!);
  }),

  // Logs
  logs: authedQuery
    .input(z.object({
      workflowId: z.number().optional(),
      limit: z.number().optional().default(50),
    }).optional())
    .query(async ({ input, ctx }) => {
      return getWorkflowLogs(ctx.user.tenantId!, input?.workflowId, input?.limit || 50);
    }),
});
