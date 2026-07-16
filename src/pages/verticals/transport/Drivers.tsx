import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserCircle } from "lucide-react";

export default function DriversPage() {
  const { data: drivers } = trpc.assets.driverList.useQuery(undefined);
  const { data: schedules } = trpc.transport.driverScheduleList.useQuery({ date: new Date().toISOString().split("T")[0] });

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Drivers</h2><p className="text-slate-500">Driver management and schedules</p></div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-slate-500">Total Drivers</p><p className="text-xl font-bold">{drivers?.length || 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-slate-500">Active</p><p className="text-xl font-bold text-emerald-600">{drivers?.filter(d => d.isActive).length || 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-slate-500">Scheduled Today</p><p className="text-xl font-bold text-blue-600">{schedules?.length || 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-slate-500">On Duty</p><p className="text-xl font-bold text-amber-600">{schedules?.filter(s => s.status === "on_duty").length || 0}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Driver Directory</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Driver</TableHead><TableHead>License #</TableHead><TableHead>License Type</TableHead><TableHead>License Expiry</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {drivers?.map(d => (
                <TableRow key={d.id}>
                  <TableCell><div className="flex items-center gap-2"><UserCircle className="w-4 h-4 text-slate-400" /><span className="font-medium">{d.employeeId ? `EMP-${d.employeeId}` : `DRV-${d.id}`}</span></div></TableCell>
                  <TableCell className="font-mono text-sm">{d.licenseNumber || "—"}</TableCell>
                  <TableCell>{d.licenseType || "—"}</TableCell>
                  <TableCell>{d.licenseExpiry || "—"}</TableCell>
                  <TableCell><Badge variant={d.isActive ? "default" : "secondary"}>{d.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Today's Schedule</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Driver</TableHead><TableHead>Date</TableHead><TableHead>Start</TableHead><TableHead>End</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {schedules?.map(s => (
                <TableRow key={s.id}>
                  <TableCell>{s.driverId}</TableCell>
                  <TableCell>{s.date}</TableCell>
                  <TableCell>{s.startTime || "—"}</TableCell>
                  <TableCell>{s.endTime || "—"}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{s.status.replace("_", " ")}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
