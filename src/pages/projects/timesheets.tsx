import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Clock, Timer } from "lucide-react";

export default function TimesheetsPage() {
  const { data: timesheets, refetch } = trpc.projects.timesheetList.useQuery();
  const { data: projects } = trpc.projects.projectList.useQuery();
  const createTimesheet = trpc.projects.timesheetCreate.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [projectFilter, setProjectFilter] = useState("");
  const [form, setForm] = useState({
    employeeId: 0, projectId: 0, taskId: 0, date: "", hours: "0", description: "", billable: false,
  });

  const filtered = timesheets?.filter(t => !projectFilter || t.projectId === Number(projectFilter)) || [];
  const totalHours = filtered.reduce((s, t) => s + Number(t.hours), 0);
  const billableHours = filtered.filter(t => t.billable).reduce((s, t) => s + Number(t.hours), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Timesheets</h2><p className="text-slate-500">Time tracking and billing</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Log Time</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Log Time Entry</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createTimesheet.mutate(form); setOpen(false); setForm({ employeeId: 0, projectId: 0, taskId: 0, date: "", hours: "0", description: "", billable: false }); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Project</Label>
                  <Select onValueChange={v => setForm({...form, projectId: Number(v)})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{projects?.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Employee ID</Label><Input type="number" value={form.employeeId || ""} onChange={e => setForm({...form, employeeId: Number(e.target.value)})} required /></div>
                <div><Label>Hours</Label><Input type="number" value={form.hours} onChange={e => setForm({...form, hours: e.target.value})} required /></div>
              </div>
              <div><Label>Description</Label><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.billable} onChange={e => setForm({...form, billable: e.target.checked})} />
                Billable
              </label>
              <Button type="submit" className="w-full">Log Time</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><Clock className="w-5 h-5 text-blue-600" /></div><div><p className="text-sm text-slate-500">Total Hours</p><p className="text-xl font-bold">{totalHours.toFixed(1)}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-emerald-100 rounded-lg"><Timer className="w-5 h-5 text-emerald-600" /></div><div><p className="text-sm text-slate-500">Billable Hours</p><p className="text-xl font-bold">{billableHours.toFixed(1)}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-amber-100 rounded-lg"><Clock className="w-5 h-5 text-amber-600" /></div><div><p className="text-sm text-slate-500">Entries</p><p className="text-xl font-bold">{filtered.length}</p></div></CardContent></Card>
      </div>

      <div className="flex items-center gap-4">
        <Select value={projectFilter || "all"} onValueChange={v => setProjectFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-56"><SelectValue placeholder="All Projects" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects?.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Hours</TableHead>
                <TableHead>Billable</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(t => (
                <TableRow key={t.id}>
                  <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium text-sm">Emp #{t.employeeId}</TableCell>
                  <TableCell className="text-sm">{projects?.find(p => p.id === t.projectId)?.name || `Project #${t.projectId}`}</TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-slate-500">{t.description || "—"}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{t.hours}</TableCell>
                  <TableCell>
                    {t.billable ? (
                      <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">Billable</span>
                    ) : (
                      <span className="text-xs text-slate-400">Non-billable</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-slate-400 py-8">No timesheet entries found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
