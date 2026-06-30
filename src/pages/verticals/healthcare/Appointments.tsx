import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar } from "lucide-react";

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700", checked_in: "bg-purple-100 text-purple-700",
  in_progress: "bg-amber-100 text-amber-700", completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700", no_show: "bg-slate-100 text-slate-700", rescheduled: "bg-orange-100 text-orange-700",
};

export default function AppointmentsPage() {
  const { data: appointments, refetch } = trpc.healthcare.appointmentList.useQuery(undefined);
  const createAppt = trpc.healthcare.appointmentCreate.useMutation({ onSuccess: () => { refetch(); setOpen(false); } });
  const [open, setOpen] = useState(false);
  const [filterDate, setFilterDate] = useState("");
  const [form, setForm] = useState({ patientId: 0, appointmentNumber: "", appointmentDate: "", startTime: "", endTime: "", appointmentType: "consultation" as const });

  const filtered = appointments?.filter(a => !filterDate || a.appointmentDate === filterDate) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Appointments</h2><p className="text-slate-500">Schedule and manage patient appointments</p></div>
        <div className="flex gap-2">
          <Input type="date" className="w-40" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Appointment</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Schedule Appointment</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createAppt.mutate(form); }} className="space-y-3">
                <div><Label>Patient ID</Label><Input type="number" value={form.patientId || ""} onChange={e => setForm({...form, patientId: Number(e.target.value)})} required /></div>
                <div><Label>Appointment #</Label><Input value={form.appointmentNumber} onChange={e => setForm({...form, appointmentNumber: e.target.value})} required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Date</Label><Input type="date" value={form.appointmentDate} onChange={e => setForm({...form, appointmentDate: e.target.value})} required /></div>
                  <div><Label>Type</Label><Select value={form.appointmentType} onValueChange={(v: any) => setForm({...form, appointmentType: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="consultation">Consultation</SelectItem><SelectItem value="follow_up">Follow Up</SelectItem><SelectItem value="emergency">Emergency</SelectItem><SelectItem value="checkup">Checkup</SelectItem><SelectItem value="procedure">Procedure</SelectItem><SelectItem value="vaccination">Vaccination</SelectItem></SelectContent></Select></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Start Time</Label><Input type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} required /></div>
                  <div><Label>End Time</Label><Input type="time" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} required /></div>
                </div>
                <Button type="submit" className="w-full">Schedule</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle>All Appointments</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Date</TableHead><TableHead>Time</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-sm">{a.appointmentNumber}</TableCell>
                  <TableCell><div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" />{a.appointmentDate}</div></TableCell>
                  <TableCell>{a.startTime} - {a.endTime}</TableCell>
                  <TableCell className="capitalize">{a.appointmentType.replace("_", " ")}</TableCell>
                  <TableCell><span className={`text-xs px-2 py-1 rounded-full capitalize ${statusColors[a.status] || "bg-slate-100"}`}>{a.status.replace("_", " ")}</span></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
