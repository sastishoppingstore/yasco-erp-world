import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FolderKanban, Calendar, DollarSign } from "lucide-react";

export default function ProjectsPage() {
  const { data: projects, refetch } = trpc.projects.projectList.useQuery(undefined);
  const createProject = trpc.projects.projectCreate.useMutation({ onSuccess: () => refetch() });
  const updateProject = trpc.projects.projectUpdate.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState({ projectCode: "", name: "", description: "", budget: "0", priority: "medium" as const, startDate: "", endDate: "" });

  const filtered = projects?.filter(p => !statusFilter || p.status === statusFilter) || [];

  const statusColors: Record<string, string> = {
    planning: "bg-blue-100 text-blue-700",
    active: "bg-emerald-100 text-emerald-700",
    on_hold: "bg-amber-100 text-amber-700",
    completed: "bg-purple-100 text-purple-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const priorityColors: Record<string, string> = {
    low: "text-slate-500",
    medium: "text-blue-500",
    high: "text-orange-500",
    urgent: "text-red-500",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Projects</h2><p className="text-slate-500">Manage projects, tasks, and milestones</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Project</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Project</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createProject.mutate({ ...form }); setOpen(false); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Project Code</Label><Input value={form.projectCode} onChange={e => setForm({...form, projectCode: e.target.value})} required /></div>
                <div><Label>Priority</Label>
                  <Select value={form.priority} onValueChange={(v: any) => setForm({...form, priority: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Project Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div><Label>Description</Label><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} /></div>
                <div><Label>End Date</Label><Input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} /></div>
              </div>
              <div><Label>Budget (SAR)</Label><Input type="number" value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} /></div>
              <Button type="submit" className="w-full">Create Project</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setStatusFilter("")} className={!statusFilter ? "bg-slate-100" : ""}>All</Button>
        {["planning", "active", "on_hold", "completed"].map(s => (
          <Button key={s} variant="outline" size="sm" onClick={() => setStatusFilter(s)} className={statusFilter === s ? "bg-slate-100 capitalize" : "capitalize"}>{s.replace("_", " ")}</Button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(project => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-blue-600" />
                  <span className="font-mono text-xs text-slate-500">{project.projectCode}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${statusColors[project.status || ""] || ""}`}>{project.status?.replace("_", " ")}</span>
              </div>
              <h3 className="font-semibold text-lg mb-1">{project.name}</h3>
              <p className="text-sm text-slate-500 mb-3 line-clamp-2">{project.description}</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Progress</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <Progress value={project.progress || 0} className="h-2" />
                <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                  <div className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{Number(project.budget).toLocaleString()} SAR</div>
                  <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{project.startDate ? new Date(project.startDate).toLocaleDateString() : "N/A"}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
