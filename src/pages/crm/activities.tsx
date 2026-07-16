import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Phone, Mail, Video, CheckCircle, MessageSquare } from "lucide-react";

export default function ActivitiesPage() {
  const { data: activities, refetch } = trpc.crm.activityList.useQuery();
  const createActivity = trpc.crm.activityCreate.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [form, setForm] = useState({
    activityType: "call" as const, relatedType: "lead" as const,
    relatedId: 0, subject: "", description: "", dueDate: "", assignedTo: 0,
  });

  const filtered = activities?.filter(a => !typeFilter || a.activityType === typeFilter) || [];

  const typeIcons: Record<string, any> = { call: Phone, email: Mail, meeting: Video, task: CheckCircle, note: MessageSquare, whatsapp: MessageSquare, sms: MessageSquare };
  const typeColors: Record<string, string> = {
    call: "bg-blue-100 text-blue-700", email: "bg-purple-100 text-purple-700",
    meeting: "bg-amber-100 text-amber-700", task: "bg-emerald-100 text-emerald-700",
    note: "bg-slate-100 text-slate-700", whatsapp: "bg-green-100 text-green-700",
    sms: "bg-rose-100 text-rose-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Activities</h2><p className="text-slate-500">Track calls, meetings, emails, and tasks</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Log Activity</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Log Activity</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createActivity.mutate(form); setOpen(false); setForm({ activityType: "call", relatedType: "lead", relatedId: 0, subject: "", description: "", dueDate: "", assignedTo: 0 }); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Activity Type</Label>
                  <Select value={form.activityType} onValueChange={(v: any) => setForm({...form, activityType: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="task">Task</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Related To</Label>
                  <Select value={form.relatedType} onValueChange={(v: any) => setForm({...form, relatedType: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="opportunity">Opportunity</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="contact">Contact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Subject</Label><Input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Related ID</Label><Input type="number" value={form.relatedId || ""} onChange={e => setForm({...form, relatedId: Number(e.target.value)})} required /></div>
                <div><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} /></div>
              </div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <Button type="submit" className="w-full">Log Activity</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setTypeFilter("")} className={!typeFilter ? "bg-slate-100" : ""}>All</Button>
        {["call", "email", "meeting", "task", "note", "whatsapp", "sms"].map(t => (
          <Button key={t} variant="outline" size="sm" onClick={() => setTypeFilter(t)} className={typeFilter === t ? "bg-slate-100 capitalize" : "capitalize"}>{t}</Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Related</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(a => {
                const Icon = typeIcons[a.activityType] || CheckCircle;
                return (
                  <TableRow key={a.id}>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 ${typeColors[a.activityType] || ""}`}>
                        <Icon className="w-3 h-3" />{a.activityType}
                      </span>
                    </TableCell>
                    <TableCell><span className="font-medium">{a.subject}</span></TableCell>
                    <TableCell className="text-sm text-slate-500">{a.relatedType} #{a.relatedId}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm">{a.description || "—"}</TableCell>
                    <TableCell className="text-sm">{a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "—"}</TableCell>
                    <TableCell className="text-xs text-slate-500">{new Date(a.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-slate-400 py-8">No activities recorded</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
