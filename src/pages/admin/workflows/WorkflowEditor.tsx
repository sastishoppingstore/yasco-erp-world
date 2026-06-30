import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { Save, Plus, Trash2, GripVertical, ArrowDown, Split } from "lucide-react";

export default function WorkflowEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get("id");
  const { data: existing } = trpc.workflows.get.useQuery({ id: Number(editId) }, { enabled: !!editId });
  const createWf = trpc.workflows.create.useMutation({ onSuccess: () => navigate("/app/admin/workflows") });
  const updateWf = trpc.workflows.update.useMutation({ onSuccess: () => navigate("/app/admin/workflows") });

  const [form, setForm] = useState({ name: "", description: "", entityType: "", isActive: true });
  const [trigger, setTrigger] = useState({ type: "manual", entityType: "", field: "", fromValue: "", toValue: "" });
  const [steps, setSteps] = useState<any[]>([]);

  useEffect(() => {
    if (existing) {
      setForm({ name: existing.name, description: existing.description ?? "", entityType: existing.entityType, isActive: existing.isActive });
      setTrigger(existing.trigger);
      setSteps(existing.steps);
    }
  }, [existing]);

  const addStep = (type: string) => {
    const step = {
      id: `step_${Date.now()}`, name: `Step ${steps.length + 1}`, type,
      conditions: type === "condition" ? { operator: "AND", rules: [{ field: "", operator: "eq", value: "" }] } : undefined,
      actions: type === "action" ? [{ type: "notification", config: { title: "", message: "" }, order: 0 }] : undefined,
    };
    setSteps(s => [...s, step]);
  };

  const removeStep = (id: string) => setSteps(s => s.filter(st => st.id !== id));

  const handleSave = () => {
    const data = {
      name: form.name, description: form.description || undefined, entityType: form.entityType,
      trigger, steps, isActive: form.isActive,
    };
    if (editId) updateWf.mutate({ id: Number(editId), ...data });
    else createWf.mutate(data);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">{editId ? "Edit Workflow" : "Create Workflow"}</h2></div>

      <Card>
        <CardHeader><CardTitle>Workflow Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Invoice Approval Workflow" /></div>
            <div><Label>Entity Type</Label>
              <select value={form.entityType} onChange={e => setForm(f => ({ ...f, entityType: e.target.value }))} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                <option value="">Select entity...</option>
                <option value="invoice">Invoice</option>
                <option value="purchase_order">Purchase Order</option>
                <option value="lead">Lead</option>
                <option value="employee">Employee</option>
                <option value="leave_request">Leave Request</option>
              </select>
            </div>
          </div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div className="flex items-center gap-3"><Label>Active</Label><Switch checked={form.isActive} onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Trigger</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Type</Label>
            <select value={trigger.type} onChange={e => setTrigger(t => ({ ...t, type: e.target.value }))} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
              <option value="manual">Manual</option>
              <option value="on_create">On Create</option>
              <option value="on_update">On Update</option>
              <option value="status_change">On Status Change</option>
              <option value="scheduled">Scheduled (Cron)</option>
            </select>
          </div>
          {trigger.type === "scheduled" && <div><Label>Cron Expression</Label><Input value={trigger.cronExpression ?? ""} onChange={e => setTrigger(t => ({ ...t, cronExpression: e.target.value }))} placeholder="0 9 * * 1" /></div>}
          {trigger.type === "status_change" && (
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Field</Label><Input value={trigger.field} onChange={e => setTrigger(t => ({ ...t, field: e.target.value }))} placeholder="status" /></div>
              <div><Label>From</Label><Input value={trigger.fromValue} onChange={e => setTrigger(t => ({ ...t, fromValue: e.target.value }))} placeholder="draft" /></div>
              <div><Label>To</Label><Input value={trigger.toValue} onChange={e => setTrigger(t => ({ ...t, toValue: e.target.value }))} placeholder="sent" /></div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Steps</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => addStep("condition")}><Split className="w-4 h-4 mr-2" />Condition</Button>
            <Button variant="outline" size="sm" onClick={() => addStep("action")}><Plus className="w-4 h-4 mr-2" />Action</Button>
            <Button variant="outline" size="sm" onClick={() => addStep("approval")}><ArrowDown className="w-4 h-4 mr-2" />Approval</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {steps.length === 0 && <p className="text-sm text-slate-500 text-center py-6">No steps defined. Add conditions, actions, or approval steps.</p>}
          {steps.map((step, i) => (
            <div key={step.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">{step.type}</Badge>
                  <Input value={step.name} onChange={e => {
                    const newSteps = [...steps]; newSteps[i].name = e.target.value; setSteps(newSteps);
                  }} className="w-48 h-8 text-sm" />
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeStep(step.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
              </div>
              {step.type === "condition" && step.conditions && (
                <div className="space-y-2 ml-4">
                  <select value={step.conditions.operator} onChange={e => {
                    const newSteps = [...steps]; newSteps[i].conditions.operator = e.target.value; setSteps(newSteps);
                  }} className="rounded border bg-background px-2 py-1 text-xs">
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                    <option value="NOT">NOT</option>
                  </select>
                  {step.conditions.rules?.map((rule: any, ri: number) => (
                    <div key={ri} className="flex items-center gap-2">
                      <Input value={rule.field} onChange={e => { const ns = [...steps]; ns[i].conditions.rules[ri].field = e.target.value; setSteps(ns); }} placeholder="field" className="w-32 h-8 text-xs" />
                      <select value={rule.operator} onChange={e => { const ns = [...steps]; ns[i].conditions.rules[ri].operator = e.target.value; setSteps(ns); }} className="rounded border bg-background px-2 py-1 text-xs">
                        <option value="eq">=</option>
                        <option value="neq">!=</option>
                        <option value="gt">&gt;</option>
                        <option value="gte">&gt;=</option>
                        <option value="lt">&lt;</option>
                        <option value="lte">&lt;=</option>
                        <option value="contains">contains</option>
                      </select>
                      <Input value={rule.value} onChange={e => { const ns = [...steps]; ns[i].conditions.rules[ri].value = e.target.value; setSteps(ns); }} placeholder="value" className="w-32 h-8 text-xs" />
                    </div>
                  ))}
                </div>
              )}
              {step.type === "action" && step.actions?.map((action: any, ai: number) => (
                <div key={ai} className="ml-4 space-y-2">
                  <select value={action.type} onChange={e => { const ns = [...steps]; ns[i].actions[ai].type = e.target.value; setSteps(ns); }} className="rounded border bg-background px-2 py-1 text-xs">
                    <option value="email">Send Email</option>
                    <option value="sms">Send SMS</option>
                    <option value="webhook">Webhook</option>
                    <option value="notification">In-App Notification</option>
                    <option value="approval">Request Approval</option>
                  </select>
                  {action.type === "notification" && (
                    <div className="grid grid-cols-2 gap-2">
                      <Input value={action.config.title ?? ""} onChange={e => { const ns = [...steps]; ns[i].actions[ai].config.title = e.target.value; setSteps(ns); }} placeholder="Title" className="h-8 text-xs" />
                      <Input value={action.config.message ?? ""} onChange={e => { const ns = [...steps]; ns[i].actions[ai].config.message = e.target.value; setSteps(ns); }} placeholder="Message" className="h-8 text-xs" />
                    </div>
                  )}
                  {action.type === "webhook" && (
                    <Input value={action.config.url ?? ""} onChange={e => { const ns = [...steps]; ns[i].actions[ai].config.url = e.target.value; setSteps(ns); }} placeholder="https://hook.example.com/..." className="h-8 text-xs" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate("/app/admin/workflows")}>Cancel</Button>
        <Button onClick={handleSave} disabled={!form.name}>
          <Save className="w-4 h-4 mr-2" />Save Workflow
        </Button>
      </div>
    </div>
  );
}
