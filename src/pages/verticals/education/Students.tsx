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
import { Plus, GraduationCap, Search } from "lucide-react";

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700", transferred: "bg-blue-100 text-blue-700",
  graduated: "bg-purple-100 text-purple-700", expelled: "bg-red-100 text-red-700", withdrawn: "bg-slate-100 text-slate-700",
};

export default function StudentsPage() {
  const { data: students, refetch } = trpc.education.studentList.useQuery(undefined);
  const createStudent = trpc.education.studentCreate.useMutation({ onSuccess: () => { refetch(); setOpen(false); } });
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ studentNumber: "", firstName: "", lastName: "", grade: "", section: "", guardianName: "", guardianPhone: "", academicYear: "", gender: "male" as const });

  const filtered = students?.filter(s => !search || s.firstName.toLowerCase().includes(search.toLowerCase()) || s.lastName.toLowerCase().includes(search.toLowerCase()) || s.studentNumber.includes(search)) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Students</h2><p className="text-slate-500">Manage student records</p></div>
        <div className="flex gap-2">
          <div className="relative"><Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" /><Input className="pl-9 w-64" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Student</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Student</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createStudent.mutate(form); }} className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Student #</Label><Input value={form.studentNumber} onChange={e => setForm({...form, studentNumber: e.target.value})} required /></div>
                  <div><Label>Gender</Label><Select value={form.gender} onValueChange={(v: any) => setForm({...form, gender: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>First Name</Label><Input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} required /></div>
                  <div><Label>Last Name</Label><Input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} required /></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div><Label>Grade</Label><Input value={form.grade} onChange={e => setForm({...form, grade: e.target.value})} /></div>
                  <div><Label>Section</Label><Input value={form.section} onChange={e => setForm({...form, section: e.target.value})} /></div>
                  <div><Label>Academic Year</Label><Input value={form.academicYear} onChange={e => setForm({...form, academicYear: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Guardian</Label><Input value={form.guardianName} onChange={e => setForm({...form, guardianName: e.target.value})} /></div>
                  <div><Label>Guardian Phone</Label><Input value={form.guardianPhone} onChange={e => setForm({...form, guardianPhone: e.target.value})} /></div>
                </div>
                <Button type="submit" className="w-full">Enroll Student</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Student Records</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Name</TableHead><TableHead>Grade</TableHead><TableHead>Section</TableHead><TableHead>Guardian</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-sm">{s.studentNumber}</TableCell>
                  <TableCell><div className="flex items-center gap-2"><GraduationCap className="w-4 h-4 text-slate-400" /><div className="font-medium">{s.firstName} {s.lastName}</div></div></TableCell>
                  <TableCell>{s.grade || "—"}</TableCell>
                  <TableCell>{s.section || "—"}</TableCell>
                  <TableCell className="text-sm">{s.guardianName || "—"}</TableCell>
                  <TableCell><span className={`text-xs px-2 py-1 rounded-full capitalize ${statusColors[s.status]}`}>{s.status}</span></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
