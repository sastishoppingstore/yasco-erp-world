import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, CalendarDays, XCircle } from "lucide-react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700", approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700", cancelled: "bg-slate-100 text-slate-700",
};

export default function EmployeeLeaveRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState({ leaveTypeId: 0, startDate: "", endDate: "", days: 1, reason: "" });
  const token = localStorage.getItem("portal_token_employee");

  const loadData = () => {
    if (!token) return;
    fetch("/api/trpc/portalEmployee.leaveRequestList", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).then(r => r.json()).then(j => {
      const items = j.result?.data || [];
      setRequests(items);
      if (items.length > 0 && items[0].leaveType && !leaveTypes.length) {
        setLeaveTypes(items.map((r: any) => r.leaveType).filter(Boolean));
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/trpc/portalEmployee.leaveRequestCreate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, ...form }),
    });
    const json = await res.json();
    if (json.result?.data?.success) {
      toast.success("Leave request submitted");
      setOpen(false);
      setForm({ leaveTypeId: 0, startDate: "", endDate: "", days: 1, reason: "" });
      loadData();
    } else {
      toast.error("Failed to submit leave request");
    }
  };

  const handleCancel = async (id: number) => {
    const res = await fetch("/api/trpc/portalEmployee.leaveRequestCancel", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, id }),
    });
    const json = await res.json();
    if (json.result?.data?.success) {
      toast.success("Leave request cancelled");
      loadData();
    }
  };

  const filtered = requests.filter(r => !statusFilter || r.status === statusFilter);

  if (loading) return <div className="flex justify-center py-20 text-slate-400">Loading leave requests...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Leave Requests</h2><p className="text-slate-500">Apply for leave and track your requests</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Leave Request</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Leave Request</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3">
              <div><Label>Leave Type</Label>
                <Select onValueChange={v => setForm({...form, leaveTypeId: Number(v)})}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {requests.map(r => r.leaveType).filter(Boolean).filter((v, i, a) => a.findIndex(t => t.id === v.id) === i).map((lt: any) => (
                      <SelectItem key={lt.id} value={String(lt.id)}>{lt.name}</SelectItem>
                    ))}
                    {leaveTypes.length === 0 && <SelectItem value="1">Annual Leave</SelectItem>}
                    {leaveTypes.length === 0 && <SelectItem value="2">Sick Leave</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} required /></div>
                <div><Label>End Date</Label><Input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} required /></div>
              </div>
              <div><Label>Days</Label><Input type="number" value={form.days} onChange={e => setForm({...form, days: Number(e.target.value)})} required /></div>
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
            <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Start</TableHead><TableHead>End</TableHead><TableHead className="text-center">Days</TableHead><TableHead>Reason</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="text-sm font-medium">{r.leaveType?.name || `Type #${r.leaveTypeId}`}</TableCell>
                  <TableCell className="text-sm">{new Date(r.startDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-sm">{new Date(r.endDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-center font-mono font-medium">{r.days}</TableCell>
                  <TableCell className="max-w-xs truncate text-sm">{r.reason || "—"}</TableCell>
                  <TableCell><span className={`text-xs px-2 py-1 rounded-full ${statusColors[r.status] || ""}`}>{r.status}</span></TableCell>
                  <TableCell>
                    {r.status === "pending" && (
                      <Button variant="ghost" size="sm" className="text-red-500 h-7 px-2" onClick={() => handleCancel(r.id)}>
                        <XCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-slate-400 py-8">No leave requests found</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
