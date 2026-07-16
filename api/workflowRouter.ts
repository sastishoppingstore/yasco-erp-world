import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { workflowEngine, type WorkflowTrigger, type WorkflowStep } from "./lib/workflowEngine";

const WorkflowTriggerSchema: z.ZodType<WorkflowTrigger> = z.object({
  type: z.enum(["on_create", "on_update", "status_change", "scheduled", "manual"]),
  entityType: z.string().optional(),
  cronExpression: z.string().optional(),
  field: z.string().optional(),
  fromValue: z.string().optional(),
  toValue: z.string().optional(),
});

const WorkflowStepSchema: z.ZodType<WorkflowStep> = z.lazy(() => z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["condition", "action", "approval", "parallel"]),
  conditions: z.any().optional(),
  actions: z.array(z.object({
    type: z.enum(["email", "sms", "webhook", "create_record", "update_field", "approval", "notification"]),
    config: z.record(z.string(), z.any()),
    order: z.number(),
  })).optional(),
  parallelSteps: z.array(WorkflowStepSchema).optional(),
  approvers: z.array(z.number()).optional(),
  approvalCount: z.number().optional(),
}));

export const workflowRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    return workflowEngine.list(ctx.user.tenantId!);
  }),
  get: authedQuery.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
    const wf = await workflowEngine.get(input.id);
    if (!wf || wf.tenantId !== ctx.user.tenantId!) throw new Error("Workflow not found");
    return wf;
  }),
  create: adminQuery
    .input(z.object({
      name: z.string().min(1), description: z.string().optional(),
      entityType: z.string(), trigger: WorkflowTriggerSchema,
      steps: z.array(WorkflowStepSchema), isActive: z.boolean().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      const id = await workflowEngine.create({ ...input, tenantId: ctx.user.tenantId! });
      return { id, success: true };
    }),
  update: adminQuery
    .input(z.object({ id: z.number(), name: z.string().optional(), description: z.string().optional(), steps: z.array(WorkflowStepSchema).optional(), isActive: z.boolean().optional(), trigger: WorkflowTriggerSchema.optional() }))
    .mutation(async ({ input, ctx }) => {
      const wf = await workflowEngine.get(input.id);
      if (!wf || wf.tenantId !== ctx.user.tenantId!) throw new Error("Workflow not found");
      await workflowEngine.update(input.id, {
        name: input.name, description: input.description,
        steps: input.steps, isActive: input.isActive, trigger: input.trigger,
      });
      return { success: true };
    }),
  delete: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    const wf = await workflowEngine.get(input.id);
    if (!wf || wf.tenantId !== ctx.user.tenantId!) throw new Error("Workflow not found");
    await workflowEngine.delete(input.id);
    return { success: true };
  }),
  toggle: adminQuery.input(z.object({ id: z.number(), isActive: z.boolean() })).mutation(async ({ input, ctx }) => {
    const wf = await workflowEngine.get(input.id);
    if (!wf || wf.tenantId !== ctx.user.tenantId!) throw new Error("Workflow not found");
    await workflowEngine.toggle(input.id, input.isActive);
    return { success: true };
  }),
  testRun: adminQuery
    .input(z.object({ id: z.number(), context: z.record(z.string(), z.any()) }))
    .mutation(async ({ input, ctx }) => {
      const wf = await workflowEngine.get(input.id);
      if (!wf || wf.tenantId !== ctx.user.tenantId!) throw new Error("Workflow not found");
      return workflowEngine.executeWorkflow(wf, { ...input.context, _userId: ctx.user.id, _tenantId: ctx.user.tenantId! });
    }),
  getLogs: authedQuery.input(z.object({ workflowId: z.number(), limit: z.number().default(50) })).query(async ({ input }) => {
    return workflowEngine.getExecutionLogs(input.workflowId, input.limit);
  }),
});
