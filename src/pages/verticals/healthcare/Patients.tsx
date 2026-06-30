import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, User } from "lucide-react";

export default function PatientsPage() {
  const { data: patients, refetch } = trpc.healthcare.patientList.useQuery(undefined);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ patientNumber: "", firstName: "", lastName: "", phone: "", email: "", gender: "male" as const, bloodGroup: "", allergies: "", notes: "" });
  const createPatient = trpc.healthcare.patientCreate.useMutation({ onSuccess: () => { refetch(); setOpen(false); } });

  const filtered = patients?.filter(p => !search || p.firstName.toLowerCase().includes(search.toLowerCase()) || p.lastName.toLowerCase().includes(search.toLowerCase()) || p.phone?.includes(search)) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Patients</h2><p className="text-slate-500">Manage patient records and medical history</p></div>
        <div className="flex gap-2">
          <div className="relative"><Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" /><Input className="pl-9 w-64" placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Patient</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>New Patient</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createPatient.mutate(form); }} className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Patient Number</Label><Input value={form.patientNumber} onChange={e => setForm({...form, patientNumber: e.target.value})} required /></div>
                  <div><Label>Gender</Label><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.gender} onChange={e => setForm({...form, gender: e.target.value as any})}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>First Name</Label><Input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} required /></div>
                  <div><Label>Last Name</Label><Input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} required /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                  <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Blood Group</Label><Input value={form.bloodGroup} onChange={e => setForm({...form, bloodGroup: e.target.value})} placeholder="A+" /></div>
                  <div><Label>Allergies</Label><Input value={form.allergies} onChange={e => setForm({...form, allergies: e.target.value})} /></div>
                </div>
                <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
                <Button type="submit" className="w-full">Register Patient</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Patient Records</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Blood</TableHead><TableHead>Allergies</TableHead><TableHead>Insurance</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-sm">{p.patientNumber}</TableCell>
                  <TableCell><div className="flex items-center gap-2"><User className="w-4 h-4 text-slate-400" /><div><div className="font-medium">{p.firstName} {p.lastName}</div><div className="text-xs text-slate-500">{p.email}</div></div></div></TableCell>
                  <TableCell>{p.phone || "—"}</TableCell>
                  <TableCell><Badge variant="outline">{p.bloodGroup || "—"}</Badge></TableCell>
                  <TableCell className="text-sm">{p.allergies || "—"}</TableCell>
                  <TableCell className="text-sm">{p.insuranceProvider || "—"}</TableCell>
                  <TableCell><span className={`text-xs px-2 py-1 rounded-full ${p.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>{p.isActive ? "Active" : "Inactive"}</span></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
