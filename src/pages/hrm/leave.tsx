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
import { Plus, CalendarDays } from "lucide-react";

export default function LeavePage() {
  const { data: leaveRequests, refetch } = trpc.hrm.leaveRequestList.useQuery();
  const { data: employees } = trpc.hrm.employeeList.useQuery();
  const { data: leaveTypes } = trpc.hrm.leaveTypeList.useQuery();
  const createLeaveRequest = trpc.hrm.leaveRequestCreate.useMutation({ onSuccess: () => refetch() });
  const updateLeaveRequest = trpc.hrm.leaveRequestUpdate.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState({
    employeeId: 0, leaveTypeId: 0, startDate: "", endDate: "", days: 1, reason: "",
  });

  const filtered = leaveRequests?.filter(l => !statusFilter || l.status === statusFilter) || [];

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
    cancelled: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Leave Management</h2><p className="text-slate-500">Leave requests, approvals, and balances</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Leave Request</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Leave Request</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createLeaveRequest.mutate(form); setOpen(false); setForm({ employeeId: 0, leaveTypeId: 0, startDate: "", endDate: "", days: 1, reason: "" }); }} className="space-y-3">
              <div><Label>Employee</Label>
                <Select onValueChange={v => setForm({...form, employeeId: Number(v)})}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{employees?.map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Leave Type</Label>
                <Select onValueChange={v => setForm({...form, leaveTypeId: Number(v)})}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{leaveTypes?.map(lt => <SelectItem key={lt.id} value={lt.id.toString()}>{lt.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} required /></div>
                <div><Label>End Date</Label><Input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Days</Label><Input type="number" value={form.days} onChange={e => setForm({...form, days: Number(e.target.value)})} required /></div>
              </div>
              <div><Label>Reason</Label><Textarea value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} /></div>
              <Button type="submit" className="w-full">Submit Request</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setStatusFilter("")} className={!statusFilter ? "bg-slate-100" : ""}>All</Button>
        {["pending", "approved", "rejected", "cancelled"].map(s => (
          <Button key={s} variant="outline" size="sm" onClick={() => setStatusFilter(s)} className={statusFilter === s ? "bg-slate-100 capitalize" : "capitalize"}>{s}</Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead className="text-center">Days</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(lr => (
                <TableRow key={lr.id}>
                  <TableCell>
                    <div className="font-medium text-sm">{employees?.find(e => e.id === lr.employeeId)?.firstName} {employees?.find(e => e.id === lr.employeeId)?.lastName || `Emp #${lr.employeeId}`}</div>
                  </TableCell>
                  <TableCell className="text-sm">{leaveTypes?.find(lt => lt.id === lr.leaveTypeId)?.name || `Type #${lr.leaveTypeId}`}</TableCell>
                  <TableCell className="text-sm">{new Date(lr.startDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-sm">{new Date(lr.endDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-center font-mono font-medium">{lr.days}</TableCell>
                  <TableCell className="max-w-xs truncate text-sm">{lr.reason || "—"}</TableCell>
                  <TableCell>
                    {lr.status === "pending" ? (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="text-emerald-600 h-7 px-2" onClick={() => updateLeaveRequest.mutate({ id: lr.id, status: "approved" })}>Approve</Button>
                        <Button variant="ghost" size="sm" className="text-red-600 h-7 px-2" onClick={() => updateLeaveRequest.mutate({ id: lr.id, status: "rejected" })}>Reject</Button>
                      </div>
                    ) : (
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColors[lr.status] || ""}`}>{lr.status}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center text-slate-400 py-8">No leave requests found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
