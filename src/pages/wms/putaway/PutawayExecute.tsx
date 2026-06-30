import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";
import { ArrowRight, ArrowLeft, CheckCircle2, MapPin } from "lucide-react";

export default function PutawayExecute() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ taskId: 0, toLocationId: 0, confirmedQuantity: 0 });
  const { data: tasks, isLoading } = trpc.wms.putawayTaskList.useQuery();
  const complete = trpc.wms.putawayTaskComplete.useMutation({ onSuccess: () => navigate("/app/wms/putaway") });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full max-w-xl" />
      </div>
    );
  }

  const pending = (tasks || []).filter((t: any) => t.status === "pending");
  const selected = tasks?.find((t: any) => t.id === form.taskId);

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-4 h-4" /></Button>
        <div className="flex items-center gap-3">
          <ArrowRight className="w-6 h-6 text-purple-500" />
          <h2 className="text-2xl font-bold">Execute Putaway</h2>
        </div>
      </div>

      <Card><CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="w-4 h-4" />Putaway Task Details</CardTitle></CardHeader><CardContent className="space-y-4">
        <div>
          <Label>Task</Label>
          <Select onValueChange={(v) => setForm({...form, taskId: Number(v)})} value={form.taskId ? String(form.taskId) : ""}>
            <SelectTrigger><SelectValue placeholder="Select a pending task" /></SelectTrigger>
            <SelectContent>
              {pending.map((t: any) => (
                <SelectItem key={t.id} value={String(t.id)}>
                  {t.taskNumber} — Product #{t.productId} ({t.quantity} units)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selected && (
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Product</span><span className="font-medium">Product #{selected.productId}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Quantity</span><span className="font-medium">{selected.quantity}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Source</span><span className="font-medium">{selected.sourceType || "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Priority</span><span><Badge variant={selected.priority === "high" ? "destructive" : selected.priority === "medium" ? "default" : "secondary"}>{selected.priority}</Badge></span></div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div><Label>Destination Location ID</Label><Input type="number" value={form.toLocationId || ""} onChange={e => setForm({...form, toLocationId: Number(e.target.value)})} placeholder="Target location" /></div>
          <div><Label>Confirmed Quantity</Label><Input type="number" value={form.confirmedQuantity || ""} onChange={e => setForm({...form, confirmedQuantity: Number(e.target.value)})} placeholder={String(selected?.quantity || 0)} /></div>
        </div>

        <Button
          className="w-full"
          onClick={() => complete.mutate(form)}
          disabled={!form.taskId || !form.toLocationId || complete.isPending}
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          {complete.isPending ? "Completing..." : "Complete Putaway"}
        </Button>
      </CardContent></Card>
    </div>
  );
}
