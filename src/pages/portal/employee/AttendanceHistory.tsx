import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const statusColors: Record<string, string> = {
  present: "bg-emerald-100 text-emerald-700", absent: "bg-red-100 text-red-700",
  late: "bg-amber-100 text-amber-700", half_day: "bg-orange-100 text-orange-700",
  on_leave: "bg-blue-100 text-blue-700", holiday: "bg-purple-100 text-purple-700",
};

const statusIcons: Record<string, any> = {
  present: CheckCircle, absent: XCircle, late: AlertTriangle,
  half_day: AlertTriangle, on_leave: Clock, holiday: Clock,
};

export default function EmployeeAttendanceHistory() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("portal_token_employee");

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch("/api/trpc/portalEmployee.attendanceList", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, limit: 60 }) }).then(r => r.json()),
      fetch("/api/trpc/portalEmployee.attendanceStats", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) }).then(r => r.json()),
    ]).then(([att, st]) => {
      setAttendance(att.result?.data || []);
      setStats(st.result?.data || null);
    }).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="flex justify-center py-20 text-slate-400">Loading attendance...</div>;

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Attendance History</h2><p className="text-slate-500">View your attendance records</p></div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{stats.present}</p><p className="text-xs text-slate-500">Present</p></CardContent></Card>
          <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-amber-600">{stats.late}</p><p className="text-xs text-slate-500">Late</p></CardContent></Card>
          <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-red-600">{stats.absent}</p><p className="text-xs text-slate-500">Absent</p></CardContent></Card>
          <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-blue-600">{stats.onLeave}</p><p className="text-xs text-slate-500">On Leave</p></CardContent></Card>
          <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{stats.totalHours.toFixed(1)}</p><p className="text-xs text-slate-500">Total Hours</p></CardContent></Card>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Check In</TableHead><TableHead>Check Out</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Hours</TableHead><TableHead className="text-right">Overtime</TableHead></TableRow></TableHeader>
            <TableBody>
              {attendance.map(a => {
                const StatusIcon = statusIcons[a.status] || Clock;
                return (
                  <TableRow key={a.id}>
                    <TableCell className="text-sm">{new Date(a.date).toLocaleDateString()}</TableCell>
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
              {attendance.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-slate-400 py-8">No attendance records</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
