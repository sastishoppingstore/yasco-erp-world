import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, CalendarDays, Clock, Users, Briefcase, TrendingUp, DollarSign } from "lucide-react";

export default function EmployeePortalDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("portal_token_employee");

  useEffect(() => {
    if (!token) return;
    fetch("/api/trpc/portalEmployee.dashboard", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).then(r => r.json()).then(j => setData(j.result?.data || null)).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="flex justify-center py-20 text-slate-400">Loading dashboard...</div>;
  if (!data) return <div className="flex justify-center py-20 text-slate-400">Please log in</div>;

  const { employee, latestSlip, pendingLeaves, todayAttendance, leaveBalances } = data;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Welcome, {employee?.firstName} {employee?.lastName}</h2>
        <p className="text-slate-500">Employee Self-Service Portal</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><Briefcase className="w-5 h-5 text-blue-600" /></div><div><p className="text-sm text-slate-500">Status</p><p className="text-xl font-bold capitalize">{employee?.status || "active"}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-emerald-100 rounded-lg"><DollarSign className="w-5 h-5 text-emerald-600" /></div><div><p className="text-sm text-slate-500">Latest Payslip</p><p className="text-xl font-bold">{latestSlip ? `${Number(latestSlip.netSalary).toLocaleString()} SAR` : "N/A"}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-amber-100 rounded-lg"><CalendarDays className="w-5 h-5 text-amber-600" /></div><div><p className="text-sm text-slate-500">Pending Leaves</p><p className="text-xl font-bold">{pendingLeaves}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className={`p-2 rounded-lg ${todayAttendance ? "bg-emerald-100" : "bg-slate-100"}`}><Clock className={`w-5 h-5 ${todayAttendance ? "text-emerald-600" : "text-slate-400"}`} /></div><div><p className="text-sm text-slate-500">Today</p><p className="text-xl font-bold capitalize">{todayAttendance?.status || "Not marked"}</p></div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><CalendarDays className="w-4 h-4" />Leave Balances</CardTitle></CardHeader>
          <CardContent>
            {leaveBalances?.map((lb: any) => (
              <div key={lb.typeId} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-sm">{lb.typeName}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{lb.used} used</span>
                  <span className="text-sm font-semibold">{lb.remaining} remaining</span>
                  <div className="w-20 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${lb.daysAllowed > 0 ? (lb.used / lb.daysAllowed) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            ))}
            {(!leaveBalances || leaveBalances.length === 0) && <p className="text-sm text-slate-400 py-4">No leave types configured</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4" />Latest Payslip</CardTitle></CardHeader>
          <CardContent>
            {latestSlip ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-slate-500">Basic Salary:</span> <span className="font-mono font-medium">{Number(latestSlip.basicSalary).toLocaleString()} SAR</span></div>
                  <div><span className="text-slate-500">Housing:</span> <span className="font-mono">{Number(latestSlip.housingAllowance).toLocaleString()} SAR</span></div>
                  {latestSlip.transportAllowance && Number(latestSlip.transportAllowance) > 0 && (
                    <div><span className="text-slate-500">Transport:</span> <span className="font-mono">{Number(latestSlip.transportAllowance).toLocaleString()} SAR</span></div>
                  )}
                  <div className="col-span-2 border-t pt-1 mt-1"><span className="font-semibold">Net Salary:</span> <span className="font-mono font-bold text-emerald-600 float-right">{Number(latestSlip.netSalary).toLocaleString()} SAR</span></div>
                </div>
                <Link to="/portal/employee/payslips"><Button variant="link" size="sm" className="p-0">View All Payslips</Button></Link>
              </div>
            ) : (
              <p className="text-sm text-slate-400 py-4">No payslips available yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
