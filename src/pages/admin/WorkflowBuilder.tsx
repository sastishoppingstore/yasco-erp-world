import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/providers/trpc";
import {
  Workflow, Plus, Save, Play, Trash2, GripVertical,
  Bell, FilePlus, Edit3, CheckSquare, Globe, Loader2,
  ArrowRight, ArrowDown, Settings, History, Timer,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/providers/language";

const STEP_ICONS: Record<string, any> = {
  send_notification: Bell,
  create_record: FilePlus,
  update_field: Edit3,
  approval_request: CheckSquare,
  webhook_call: Globe,
};

const STEP_NAMES: Record<string, { en: string; ar: string }> = {
  send_notification: { en: "Send Notification", ar: "إرسال إشعار" },
  create_record: { en: "Create Record", ar: "إنشاء سجل" },
  update_field: { en: "Update Field", ar: "تحديث حقل" },
  approval_request: { en: "Approval Request", ar: "طلب موافقة" },
  webhook_call: { en: "Webhook Call", ar: "استدعاء Webhook" },
};

const TRIGGER_TYPES: Record<string, { en: string; ar: string }> = {
  on_create: { en: "On Record Create", ar: "عند إنشاء سجل" },
  on_update: { en: "On Record Update", ar: "عند تحديث سجل" },
  on_status_change: { en: "On Status Change", ar: "عند تغيير الحالة" },
  schedule_based: { en: "Schedule Based (Cron)", ar: "جدول زمني" },
};

export default function WorkflowBuilderPage() {
  const { language, dir } = useLanguage();
  const rtl = language === "ar";
  const [selectedWorkflow, setSelectedWorkflow] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEntityType, setNewEntityType] = useState("");
  const [newTriggerType, setNewTriggerType] = useState("on_create");
  const [showLogs, setShowLogs] = useState(false);

  const workflows = trpc.workflowBuilder.list.useQuery(undefined);
  const workflowDetail = trpc.workflowBuilder.getById.useQuery(
    { id: selectedWorkflow! },
    { enabled: !!selectedWorkflow },
  );
  const createWf = trpc.workflowBuilder.create.useMutation();
  const updateWf = trpc.workflowBuilder.update.useMutation();
  const deleteWf = trpc.workflowBuilder.delete.useMutation();
  const addStep = trpc.workflowBuilder.addStep.useMutation();
  const deleteStep = trpc.workflowBuilder.deleteStep.useMutation();
  const triggerWf = trpc.workflowBuilder.trigger.useMutation();
  const logsQ = trpc.workflowBuilder.logs.useQuery(
    { workflowId: selectedWorkflow! },
    { enabled: !!selectedWorkflow && showLogs },
  );
  const approvalsQ = trpc.workflowBuilder.approvals.useQuery(
    { workflowId: selectedWorkflow, status: "pending" },
    { enabled: !!selectedWorkflow },
  );

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return;
    const result = await createWf.mutateAsync({
      name: newName,
      entityType: newEntityType || undefined,
      triggerType: newTriggerType as any,
    });
    if (result.id) {
      setSelectedWorkflow(result.id);
      setShowNew(false);
      setNewName("");
      workflows.refetch();
    }
  }, [newName, newEntityType, newTriggerType]);

  const handleAddStep = useCallback(async (stepType: string) => {
    if (!selectedWorkflow) return;
    const steps = workflowDetail.data?.steps || [];
    await addStep.mutateAsync({
      workflowId: selectedWorkflow,
      stepOrder: steps.length + 1,
      stepType: stepType as any,
      stepConfig: {},
    });
    workflowDetail.refetch();
  }, [selectedWorkflow, workflowDetail.data]);

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case "on_create": return <FilePlus className="size-4 text-green-500" />;
      case "on_update": return <Edit3 className="size-4 text-blue-500" />;
      case "on_status_change": return <Bell className="size-4 text-amber-500" />;
      case "schedule_based": return <Timer className="size-4 text-purple-500" />;
      default: return <Workflow className="size-4" />;
    }
  };

  return (
    <div className="space-y-6" dir={dir}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Workflow className="size-6 text-blue-600" />
            {rtl ? "منشئ سير العمل" : "Workflow Builder"}
          </h2>
          <p className="text-slate-500">{rtl ? "تصميم أتمتة سير العمل بالرسوم البيانية" : "Visual workflow automation designer"}</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showNew} onOpenChange={setShowNew}>
            <DialogTrigger asChild>
              <Button><Plus className="size-4 mr-2" />{rtl ? "سير عمل جديد" : "New Workflow"}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{rtl ? "إنشاء سير عمل جديد" : "Create New Workflow"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>{rtl ? "الاسم" : "Name"}</Label>
                  <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder={rtl ? "اسم سير العمل" : "Workflow name"} />
                </div>
                <div>
                  <Label>{rtl ? "نوع الكيان" : "Entity Type"}</Label>
                  <Select value={newEntityType} onValueChange={setNewEntityType}>
                    <SelectTrigger><SelectValue placeholder={rtl ? "اختر الكيان" : "Select entity"} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="invoice">{rtl ? "فاتورة" : "Invoice"}</SelectItem>
                      <SelectItem value="purchase_order">{rtl ? "أمر شراء" : "Purchase Order"}</SelectItem>
                      <SelectItem value="lead">{rtl ? "عميل متوقع" : "Lead"}</SelectItem>
                      <SelectItem value="ticket">{rtl ? "تذكرة دعم" : "Support Ticket"}</SelectItem>
                      <SelectItem value="employee">{rtl ? "موظف" : "Employee"}</SelectItem>
                      <SelectItem value="project">{rtl ? "مشروع" : "Project"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{rtl ? "نوع المشغل" : "Trigger Type"}</Label>
                  <Select value={newTriggerType} onValueChange={setNewTriggerType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(TRIGGER_TYPES).map(([key, val]) => (
                        <SelectItem key={key} value={key}>{rtl ? val.ar : val.en}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreate} className="w-full" disabled={!newName.trim()}>
                  <Save className="size-4 mr-2" />{rtl ? "إنشاء" : "Create"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="w-64 shrink-0 space-y-2">
          <p className="text-sm font-medium text-slate-500 mb-2">{rtl ? "سير العمل" : "Workflows"}</p>
          <div className="space-y-1">
            {workflows.data?.map((wf: any) => (
              <div
                key={wf.id}
                className={`p-3 rounded-lg cursor-pointer border transition-colors ${selectedWorkflow === wf.id ? "bg-blue-50 border-blue-200" : "hover:bg-slate-50"}`}
                onClick={() => setSelectedWorkflow(wf.id)}
              >
                <div className="flex items-center gap-2">
                  {getTriggerIcon(wf.triggerType)}
                  <p className="text-sm font-medium truncate flex-1">{wf.name}</p>
                  <div className={`w-2 h-2 rounded-full ${wf.isActive ? "bg-green-500" : "bg-slate-300"}`} />
                </div>
                <div className="flex gap-1 mt-1">
                  <Badge variant="outline" className="text-[10px]">{TRIGGER_TYPES[wf.triggerType]?.[rtl ? "ar" : "en"] || wf.triggerType}</Badge>
                  {wf.entityType && <Badge variant="secondary" className="text-[10px]">{wf.entityType}</Badge>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1">
          {!selectedWorkflow ? (
            <Card>
              <CardContent className="p-12 text-center text-slate-400">
                <Workflow className="size-12 mx-auto mb-3 opacity-30" />
                <p className="text-lg font-medium">{rtl ? "اختر سير عمل أو أنشئ واحداً" : "Select or create a workflow"}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">{workflowDetail.data?.name}</h3>
                  <Badge variant={workflowDetail.data?.isActive ? "default" : "secondary"}>
                    {workflowDetail.data?.isActive ? (rtl ? "نشط" : "Active") : (rtl ? "غير نشط" : "Inactive")}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowLogs(!showLogs)}>
                    <History className="size-4 mr-1" />{rtl ? "السجلات" : "Logs"}
                  </Button>
                  <Button size="sm" onClick={() => updateWf.mutateAsync({ id: selectedWorkflow, isActive: !workflowDetail.data?.isActive }).then(() => workflowDetail.refetch())}>
                    {workflowDetail.data?.isActive ? (rtl ? "إيقاف" : "Deactivate") : (rtl ? "تفعيل" : "Activate")}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteWf.mutateAsync({ id: selectedWorkflow }).then(() => { setSelectedWorkflow(null); workflows.refetch(); })}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="grid lg:grid-cols-[1fr_300px] gap-4">
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        {getTriggerIcon(workflowDetail.data?.triggerType || "")}
                        <CardTitle className="text-sm">{rtl ? "المشغل" : "Trigger"}</CardTitle>
                        <Badge variant="outline" className="text-[10px]">
                          {workflowDetail.data?.entityType || rtl ? "جميع الكيانات" : "All entities"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-500">
                        {TRIGGER_TYPES[workflowDetail.data?.triggerType || ""]?.[rtl ? "ar" : "en"] || workflowDetail.data?.triggerType}
                        {workflowDetail.data?.entityType ? ` — ${workflowDetail.data.entityType}` : ""}
                      </p>
                    </CardContent>
                  </Card>

                  <div className="space-y-2">
                    {workflowDetail.data?.steps?.map((step: any, idx: number) => {
                      const StepIcon = STEP_ICONS[step.stepType] || Workflow;
                      return (
                        <div key={step.id} className="flex items-start gap-3">
                          {idx > 0 && (
                            <div className="flex flex-col items-center w-8">
                              <ArrowDown className="size-4 text-slate-300" />
                            </div>
                          )}
                          <Card className="flex-1">
                            <CardContent className="p-3 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-50">
                                  <StepIcon className="size-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">
                                    {STEP_NAMES[step.stepType]?.[rtl ? "ar" : "en"] || step.stepType}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    {rtl ? `الخطوة ${step.stepOrder}` : `Step ${step.stepOrder}`}
                                    {step.isParallel ? ` — ${rtl ? "متوازي" : "Parallel"}` : ""}
                                    {step.timeoutMinutes ? ` — ${step.timeoutMinutes}min` : ""}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                {step.conditions && (
                                  <Badge variant="outline" className="text-[10px]">{rtl ? "شروط" : "Conditions"}</Badge>
                                )}
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => deleteStep.mutateAsync({ id: step.id }).then(() => workflowDetail.refetch())}>
                                  <Trash2 className="size-3 text-red-500" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {Object.entries(STEP_NAMES).map(([key, name]) => {
                      const Icon = STEP_ICONS[key];
                      return (
                        <Button key={key} variant="outline" size="sm" onClick={() => handleAddStep(key)}>
                          <Icon className="size-4 mr-1" />
                          + {rtl ? name.ar : name.en}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={() => triggerWf.mutateAsync({
                      workflowId: selectedWorkflow,
                      entityType: workflowDetail.data?.entityType || "test",
                      entityId: 0,
                      action: "create",
                      data: { test: true },
                    })}
                  >
                    <Play className="size-4 mr-2" />{rtl ? "اختبار سير العمل" : "Test Workflow"}
                  </Button>
                </div>

                <div className="space-y-4">
                  {approvalsQ.data && approvalsQ.data.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <CheckSquare className="size-4 text-amber-500" />
                          {rtl ? "الموافقات المعلقة" : "Pending Approvals"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 max-h-48 overflow-y-auto">
                        {approvalsQ.data.map((a: any) => (
                          <div key={a.id} className="p-2 rounded border text-sm">
                            <p className="font-medium">{a.entityType} #{a.entityId}</p>
                            <p className="text-xs text-slate-400">{new Date(a.createdAt).toLocaleString()}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {showLogs && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <History className="size-4" />
                          {rtl ? "سجل التنفيذ" : "Execution Logs"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                        {logsQ.data?.map((log: any) => (
                          <div key={log.id} className="p-2 rounded border text-xs">
                            <div className="flex items-center gap-2">
                              <Badge variant={log.status === "completed" ? "default" : "destructive"} className="text-[10px]">
                                {log.status}
                              </Badge>
                              <span className="text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="mt-1">{log.message || log.action}</p>
                          </div>
                        ))}
                        {(!logsQ.data || logsQ.data.length === 0) && (
                          <p className="text-xs text-slate-400 text-center py-4">{rtl ? "لا توجد سجلات" : "No logs yet"}</p>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
