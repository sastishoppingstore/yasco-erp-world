import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Users, Mail, Phone } from "lucide-react";

export default function EmployeesPage() {
  const { data: employees, refetch } = trpc.hrm.employeeList.useQuery(undefined);
  const { data: departments } = trpc.hrm.departmentList.useQuery(undefined);
  const { data: designations } = trpc.hrm.designationList.useQuery(undefined);
  const createEmployee = trpc.hrm.employeeCreate.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [deptFilter, setDeptFilter] = useState<number | undefined>();
  const [form, setForm] = useState({ employeeCode: "", firstName: "", lastName: "", email: "", phone: "", hireDate: "", departmentId: undefined as number | undefined, designationId: undefined as number | undefined, basicSalary: "0" });

  const filtered = employees?.filter(e => !deptFilter || e.departmentId === deptFilter) || [];

  const statusColors: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700",
    on_leave: "bg-amber-100 text-amber-700",
    terminated: "bg-red-100 text-red-700",
    resigned: "bg-gray-100 text-gray-700",
    suspended: "bg-orange-100 text-orange-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Employees</h2><p className="text-slate-500">Manage workforce, departments, and designations</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Employee</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>New Employee</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createEmployee.mutate({ ...form }); setOpen(false); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Employee Code</Label><Input value={form.employeeCode} onChange={e => setForm({...form, employeeCode: e.target.value})} required /></div>
                <div><Label>Hire Date</Label><Input type="date" value={form.hireDate} onChange={e => setForm({...form, hireDate: e.target.value})} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>First Name</Label><Input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} required /></div>
                <div><Label>Last Name</Label><Input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Department</Label>
                  <Select onValueChange={v => setForm({...form, departmentId: Number(v)})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{departments?.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Designation</Label>
                  <Select onValueChange={v => setForm({...form, designationId: Number(v)})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{designations?.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Basic Salary</Label><Input type="number" value={form.basicSalary} onChange={e => setForm({...form, basicSalary: e.target.value})} /></div>
              <Button type="submit" className="w-full">Create Employee</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setDeptFilter(undefined)} className={!deptFilter ? "bg-slate-100" : ""}>All</Button>
        {departments?.map(d => (
          <Button key={d.id} variant="outline" size="sm" onClick={() => setDeptFilter(d.id)} className={deptFilter === d.id ? "bg-slate-100" : ""}>{d.name}</Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Department</TableHead><TableHead>Designation</TableHead><TableHead>Contact</TableHead><TableHead className="text-right">Salary</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map(emp => (
                <TableRow key={emp.id}>
                  <TableCell className="font-mono text-sm">{emp.employeeCode}</TableCell>
                  <TableCell><div className="font-medium">{emp.firstName} {emp.lastName}</div></TableCell>
                  <TableCell>{departments?.find(d => d.id === emp.departmentId)?.name || "N/A"}</TableCell>
                  <TableCell>{designations?.find(d => d.id === emp.designationId)?.name || "N/A"}</TableCell>
                  <TableCell><div className="text-xs flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" />{emp.email || "N/A"}</div></TableCell>
                  <TableCell className="text-right font-mono">{Number(emp.basicSalary).toLocaleString()} SAR</TableCell>
                  <TableCell><span className={`text-xs px-2 py-1 rounded-full ${statusColors[emp.status || "active"] || ""}`}>{emp.status}</span></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
