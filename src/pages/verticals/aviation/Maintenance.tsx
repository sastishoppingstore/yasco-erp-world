import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Wrench } from "lucide-react";

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700", in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700", deferred: "bg-orange-100 text-orange-700", aog: "bg-red-100 text-red-700",
};

export default function AviationMaintenancePage() {
  const { data: inspections } = trpc.aviation.maintenanceAirworthinessList.useQuery(undefined);

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Airworthiness</h2><p className="text-slate-500">Aircraft maintenance and airworthiness tracking</p></div>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Inspections</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Aircraft</TableHead><TableHead>Inspection Type</TableHead><TableHead>Date</TableHead><TableHead>Next Due</TableHead><TableHead className="text-right">Airframe Hrs</TableHead><TableHead className="text-right">Engine Hrs</TableHead><TableHead>Airworthy</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {inspections?.map(i => (
                <TableRow key={i.id}>
                  <TableCell className="font-mono">{i.aircraftRegistration || i.vehicleId || "—"}</TableCell>
                  <TableCell>{i.inspectionType}</TableCell>
                  <TableCell>{i.inspectionDate}</TableCell>
                  <TableCell>{i.nextDueDate || "—"}</TableCell>
                  <TableCell className="text-right font-mono">{i.airframeHours || "—"}</TableCell>
                  <TableCell className="text-right font-mono">{i.engineHours || "—"}</TableCell>
                  <TableCell><Badge variant={i.isAirworthy ? "default" : "destructive"}>{i.isAirworthy ? "Yes" : "No"}</Badge></TableCell>
                  <TableCell><Badge className={statusColors[i.status]}>{i.status.replace("_", " ")}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
