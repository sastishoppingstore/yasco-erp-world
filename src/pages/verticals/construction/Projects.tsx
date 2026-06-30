import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Building, HardHat } from "lucide-react";

const statusColors: Record<string, string> = {
  planning: "bg-blue-100 text-blue-700", tendering: "bg-purple-100 text-purple-700",
  active: "bg-emerald-100 text-emerald-700", on_hold: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700", cancelled: "bg-red-100 text-red-700",
};

export default function ConstructionProjectsPage() {
  const { data: projects, refetch } = trpc.construction.projectList.useQuery(undefined);
  const createProject = trpc.construction.projectCreate.useMutation({ onSuccess: () => { refetch(); setOpen(false); } });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ projectCode: "", name: "", projectType: "residential" as const, location: "", startDate: "", endDate: "", contractValue: "0", budget: "0" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Construction Projects</h2><p className="text-slate-500">Manage construction projects, budgets, and timelines</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Project</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Project</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createProject.mutate(form); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Project Code</Label><Input value={form.projectCode} onChange={e => setForm({...form, projectCode: e.target.value})} required /></div>
                <div><Label>Type</Label><Select value={form.projectType} onValueChange={(v: any) => setForm({...form, projectType: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="residential">Residential</SelectItem><SelectItem value="commercial">Commercial</SelectItem><SelectItem value="industrial">Industrial</SelectItem><SelectItem value="infrastructure">Infrastructure</SelectItem><SelectItem value="renovation">Renovation</SelectItem></SelectContent></Select></div>
              </div>
              <div><Label>Project Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div><Label>Location</Label><Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} /></div>
                <div><Label>End Date</Label><Input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Contract Value</Label><Input type="number" value={form.contractValue} onChange={e => setForm({...form, contractValue: e.target.value})} /></div>
                <div><Label>Budget</Label><Input type="number" value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} /></div>
              </div>
              <Button type="submit" className="w-full">Create Project</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects?.map(p => (
          <Card key={p.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <HardHat className="w-5 h-5 text-slate-500" />
                  <div><div className="font-semibold">{p.name}</div><div className="text-xs text-slate-500 font-mono">{p.projectCode}</div></div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusColors[p.status]}`}>{p.status.replace("_", " ")}</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Contract</span><span className="font-mono">{Number(p.contractValue).toLocaleString()} SAR</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Actual Cost</span><span className="font-mono">{Number(p.actualCost).toLocaleString()} SAR</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Location</span><span>{p.location || "—"}</span></div>
              </div>
              <div className="mt-3"><Progress value={p.progress || 0} className="h-2" /><p className="text-xs text-right mt-1 text-slate-500">{p.progress}%</p></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
