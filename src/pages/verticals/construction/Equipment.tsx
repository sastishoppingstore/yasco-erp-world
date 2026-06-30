import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Wrench } from "lucide-react";

const statusColors: Record<string, string> = {
  available: "bg-emerald-100 text-emerald-700", in_use: "bg-blue-100 text-blue-700",
  maintenance: "bg-amber-100 text-amber-700", retired: "bg-slate-100 text-slate-700",
};

export default function EquipmentPage() {
  const { data: equipment } = trpc.construction.equipmentList.useQuery(undefined);

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Equipment Tracking</h2><p className="text-slate-500">Track construction equipment, usage, and rates</p></div>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Equipment</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Project</TableHead><TableHead className="text-right">Hourly Rate</TableHead><TableHead className="text-right">Hours Used</TableHead><TableHead>Location</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {equipment?.map(e => (
                <TableRow key={e.id}>
                  <TableCell className="font-mono text-sm">{e.equipmentCode}</TableCell>
                  <TableCell><div className="flex items-center gap-2"><Wrench className="w-4 h-4 text-slate-400" /><span className="font-medium">{e.name}</span></div></TableCell>
                  <TableCell>{e.type || "—"}</TableCell>
                  <TableCell>{e.projectId || "—"}</TableCell>
                  <TableCell className="text-right font-mono">{Number(e.hourlyRate).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{e.hoursUsed}</TableCell>
                  <TableCell className="text-sm">{e.location || "—"}</TableCell>
                  <TableCell><Badge className={statusColors[e.status]}>{e.status.replace("_", " ")}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
