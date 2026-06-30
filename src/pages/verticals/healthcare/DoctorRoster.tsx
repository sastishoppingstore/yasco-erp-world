import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Stethoscope } from "lucide-react";

export default function DoctorRosterPage() {
  const { data: roster, refetch } = trpc.healthcare.doctorRosterList.useQuery(undefined);
  const createDoctor = trpc.healthcare.doctorRosterCreate.useMutation({ onSuccess: () => { refetch(); setOpen(false); } });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ employeeId: 0, specialization: "", licenseNumber: "", consultationFee: "0", maxPatientsPerDay: 20 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Doctor Roster</h2><p className="text-slate-500">Manage doctors, specializations, and schedules</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Doctor</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Doctor</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createDoctor.mutate(form); }} className="space-y-3">
              <div><Label>Employee ID</Label><Input type="number" value={form.employeeId || ""} onChange={e => setForm({...form, employeeId: Number(e.target.value)})} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Specialization</Label><Input value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})} /></div>
                <div><Label>License #</Label><Input value={form.licenseNumber} onChange={e => setForm({...form, licenseNumber: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Consultation Fee</Label><Input type="number" value={form.consultationFee} onChange={e => setForm({...form, consultationFee: e.target.value})} /></div>
                <div><Label>Max Patients/Day</Label><Input type="number" value={form.maxPatientsPerDay} onChange={e => setForm({...form, maxPatientsPerDay: Number(e.target.value)})} /></div>
              </div>
              <Button type="submit" className="w-full">Add Doctor</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Doctors</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Specialization</TableHead><TableHead>License</TableHead><TableHead>Consultation Fee</TableHead><TableHead>Max/Day</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {roster?.map(d => (
                <TableRow key={d.id}>
                  <TableCell><div className="flex items-center gap-2"><Stethoscope className="w-4 h-4 text-slate-400" /><div className="font-medium">{d.specialization || "General"}</div></div></TableCell>
                  <TableCell className="font-mono text-sm">{d.licenseNumber || "—"}</TableCell>
                  <TableCell>{Number(d.consultationFee).toLocaleString()} SAR</TableCell>
                  <TableCell>{d.maxPatientsPerDay}</TableCell>
                  <TableCell><Badge variant={d.isActive ? "default" : "secondary"}>{d.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
