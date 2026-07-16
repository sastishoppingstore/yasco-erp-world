import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, UserPlus } from "lucide-react";

const statusColors: Record<string, string> = {
  inquiry: "bg-slate-100 text-slate-700", applied: "bg-blue-100 text-blue-700",
  interviewed: "bg-purple-100 text-purple-700", accepted: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700", enrolled: "bg-green-100 text-green-700", waitlisted: "bg-amber-100 text-amber-700",
};

export default function AdmissionsPage() {
  const { data: admissions, refetch } = trpc.education.admissionList.useQuery(undefined);
  const createAdmission = trpc.education.admissionCreate.useMutation({ onSuccess: () => { refetch(); setOpen(false); } });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ admissionNumber: "", firstName: "", lastName: "", applyingForGrade: "", previousSchool: "", academicYear: "", guardianName: "", guardianPhone: "", gender: "male" as const });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Admissions</h2><p className="text-slate-500">Process new student applications</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Application</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Admission</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createAdmission.mutate(form); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Admission #</Label><Input value={form.admissionNumber} onChange={e => setForm({...form, admissionNumber: e.target.value})} required /></div>
                <div><Label>Gender</Label><Select value={form.gender} onValueChange={(v: any) => setForm({...form, gender: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>First Name</Label><Input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} required /></div>
                <div><Label>Last Name</Label><Input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Applying For Grade</Label><Input value={form.applyingForGrade} onChange={e => setForm({...form, applyingForGrade: e.target.value})} /></div>
                <div><Label>Previous School</Label><Input value={form.previousSchool} onChange={e => setForm({...form, previousSchool: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Guardian Name</Label><Input value={form.guardianName} onChange={e => setForm({...form, guardianName: e.target.value})} /></div>
                <div><Label>Guardian Phone</Label><Input value={form.guardianPhone} onChange={e => setForm({...form, guardianPhone: e.target.value})} /></div>
              </div>
              <div><Label>Academic Year</Label><Input value={form.academicYear} onChange={e => setForm({...form, academicYear: e.target.value})} /></div>
              <Button type="submit" className="w-full">Submit Application</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Applications</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Name</TableHead><TableHead>Grade</TableHead><TableHead>Previous School</TableHead><TableHead>Guardian</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {admissions?.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-sm">{a.admissionNumber}</TableCell>
                  <TableCell><div className="flex items-center gap-2"><UserPlus className="w-4 h-4 text-slate-400" /><div className="font-medium">{a.firstName} {a.lastName}</div></div></TableCell>
                  <TableCell>{a.applyingForGrade || "—"}</TableCell>
                  <TableCell className="text-sm">{a.previousSchool || "—"}</TableCell>
                  <TableCell className="text-sm">{a.guardianName || "—"}</TableCell>
                  <TableCell><Badge className={statusColors[a.status]}>{a.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
