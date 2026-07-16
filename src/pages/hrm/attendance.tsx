import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default function AttendancePage() {
  const { data: attendance, refetch } = trpc.hrm.attendanceList.useQuery();
  const { data: employees } = trpc.hrm.employeeList.useQuery();
  const createAttendance = trpc.hrm.attendanceCreate.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState({
    employeeId: 0, date: "", checkIn: "", checkOut: "",
    status: "present" as const, workHours: "", overtimeHours: "", notes: "",
  });

  const filtered = attendance?.filter(a => !statusFilter || a.status === statusFilter) || [];

  const statusColors: Record<string, string> = {
    present: "bg-emerald-100 text-emerald-700",
    absent: "bg-red-100 text-red-700",
    late: "bg-amber-100 text-amber-700",
    half_day: "bg-orange-100 text-orange-700",
    on_leave: "bg-blue-100 text-blue-700",
    holiday: "bg-purple-100 text-purple-700",
  };

  const statusIcons: Record<string, any> = { present: CheckCircle, absent: XCircle, late: AlertTriangle, half_day: AlertTriangle, on_leave: Clock, holiday: Clock };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Attendance</h2><p className="text-slate-500">Time tracking and attendance management</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Mark Attendance</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Mark Attendance</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createAttendance.mutate(form); setOpen(false); setForm({ employeeId: 0, date: "", checkIn: "", checkOut: "", status: "present", workHours: "", overtimeHours: "", notes: "" }); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Employee</Label>
                  <Select onValueChange={v => setForm({...form, employeeId: Number(v)})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{employees?.map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Check In</Label><Input type="time" value={form.checkIn} onChange={e => setForm({...form, checkIn: e.target.value})} /></div>
                <div><Label>Check Out</Label><Input type="time" value={form.checkOut} onChange={e => setForm({...form, checkOut: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Status</Label>
                  <Select value={form.status} onValueChange={(v: any) => setForm({...form, status: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                      <SelectItem value="late">Late</SelectItem>
                      <SelectItem value="half_day">Half Day</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                      <SelectItem value="holiday">Holiday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Work Hours</Label><Input type="number" value={form.workHours} onChange={e => setForm({...form, workHours: e.target.value})} /></div>
              </div>
              <Button type="submit" className="w-full">Save Attendance</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setStatusFilter("")} className={!statusFilter ? "bg-slate-100" : ""}>All</Button>
        {["present", "absent", "late", "half_day", "on_leave", "holiday"].map(s => (
          <Button key={s} variant="outline" size="sm" onClick={() => setStatusFilter(s)} className={statusFilter === s ? "bg-slate-100 capitalize" : "capitalize"}>{s.replace("_", " ")}</Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Hours</TableHead>
                <TableHead className="text-right">Overtime</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(a => {
                const StatusIcon = statusIcons[a.status] || Clock;
                return (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="font-medium text-sm">{employees?.find(e => e.id === a.employeeId)?.firstName} {employees?.find(e => e.id === a.employeeId)?.lastName || `Emp #${a.employeeId}`}</div>
                    </TableCell>
                    <TableCell>{new Date(a.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-sm">{a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : "—"}</TableCell>
                    <TableCell className="text-sm">{a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : "—"}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 ${statusColors[a.status] || ""}`}>
                        <StatusIcon className="w-3 h-3" />{a.status.replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono">{a.workHours || "—"}</TableCell>
                    <TableCell className="text-right font-mono text-amber-600">{a.overtimeHours || "—"}</TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-slate-400 py-8">No attendance records found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
