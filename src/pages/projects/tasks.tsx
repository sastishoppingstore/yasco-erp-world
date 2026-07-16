import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, CheckSquare, Clock, AlertCircle } from "lucide-react";

export default function TasksPage() {
  const { data: tasks, refetch } = trpc.projects.taskList.useQuery();
  const { data: projects } = trpc.projects.projectList.useQuery();
  const createTask = trpc.projects.taskCreate.useMutation({ onSuccess: () => refetch() });
  const updateTask = trpc.projects.taskUpdate.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState({
    projectId: 0, name: "", description: "", assignedTo: 0,
    startDate: "", dueDate: "", estimatedHours: "0", priority: "medium" as const,
  });

  const filtered = tasks?.filter(t => !statusFilter || t.status === statusFilter) || [];

  const statusColors: Record<string, string> = {
    todo: "bg-slate-100 text-slate-700",
    in_progress: "bg-blue-100 text-blue-700",
    review: "bg-amber-100 text-amber-700",
    done: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const priorityColors: Record<string, string> = {
    low: "text-slate-500", medium: "text-blue-500", high: "text-orange-500", urgent: "text-red-500",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Tasks</h2><p className="text-slate-500">Task management with Kanban board</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Task</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Task</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createTask.mutate(form); setOpen(false); setForm({ projectId: 0, name: "", description: "", assignedTo: 0, startDate: "", dueDate: "", estimatedHours: "0", priority: "medium" }); }} className="space-y-3">
              <div><Label>Task Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Project</Label>
                  <Select onValueChange={v => setForm({...form, projectId: Number(v)})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{projects?.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Priority</Label>
                  <Select value={form.priority} onValueChange={(v: any) => setForm({...form, priority: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} /></div>
                <div><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Est. Hours</Label><Input type="number" value={form.estimatedHours} onChange={e => setForm({...form, estimatedHours: e.target.value})} /></div>
              </div>
              <div><Label>Description</Label><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <Button type="submit" className="w-full">Create Task</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setStatusFilter("")} className={!statusFilter ? "bg-slate-100" : ""}>All</Button>
        {["todo", "in_progress", "review", "done", "cancelled"].map(s => (
          <Button key={s} variant="outline" size="sm" onClick={() => setStatusFilter(s)} className={statusFilter === s ? "bg-slate-100 capitalize" : "capitalize"}>{s.replace("_", " ")}</Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>Due</TableHead>
                <TableHead className="text-right">Est. Hours</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(t => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div className="font-medium">{t.name}</div>
                    {t.description && <div className="text-xs text-slate-500 truncate max-w-[200px]">{t.description}</div>}
                  </TableCell>
                  <TableCell className="text-sm">{projects?.find(p => p.id === t.projectId)?.name || `Project #${t.projectId}`}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 text-sm font-medium ${priorityColors[t.priority] || ""}`}>
                      <AlertCircle className="w-3 h-3" />{t.priority}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColors[t.status] || ""}`}>{t.status.replace("_", " ")}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{t.startDate ? new Date(t.startDate).toLocaleDateString() : "—"}</TableCell>
                  <TableCell className="text-sm">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}</TableCell>
                  <TableCell className="text-right font-mono">{t.estimatedHours || "—"}</TableCell>
                  <TableCell>
                    {t.status !== "done" && t.status !== "cancelled" && (
                      <Select onValueChange={(v: any) => updateTask.mutate({ id: t.id, status: v })}>
                        <SelectTrigger className="h-7 w-24 text-xs"><SelectValue placeholder="Move to" /></SelectTrigger>
                        <SelectContent>
                          {t.status !== "in_progress" && <SelectItem value="in_progress">In Progress</SelectItem>}
                          {t.status !== "review" && <SelectItem value="review">Review</SelectItem>}
                          <SelectItem value="done">Done</SelectItem>
                          <SelectItem value="cancelled">Cancel</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center text-slate-400 py-8">No tasks found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
