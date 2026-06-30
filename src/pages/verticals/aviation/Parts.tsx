import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

const conditionColors: Record<string, string> = {
  new: "bg-emerald-100 text-emerald-700", serviceable: "bg-blue-100 text-blue-700",
  overhauled: "bg-purple-100 text-purple-700", unserviceable: "bg-amber-100 text-amber-700", scrap: "bg-red-100 text-red-700",
};

export default function PartsPage() {
  const { data: parts } = trpc.aviation.partsList.useQuery(undefined);

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Parts Inventory</h2><p className="text-slate-500">Serialized parts inventory tracking</p></div>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Serialized Parts</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Part #</TableHead><TableHead>Name</TableHead><TableHead>Serial #</TableHead><TableHead>Manufacturer</TableHead><TableHead>Location</TableHead><TableHead>Installed On</TableHead><TableHead>TSN</TableHead><TableHead>Condition</TableHead></TableRow></TableHeader>
            <TableBody>
              {parts?.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-sm">{p.partNumber}</TableCell>
                  <TableCell><div className="flex items-center gap-2"><Package className="w-4 h-4 text-slate-400" /><span className="font-medium">{p.partName}</span></div></TableCell>
                  <TableCell className="font-mono text-sm">{p.serialNumber}</TableCell>
                  <TableCell className="text-sm">{p.manufacturer || "—"}</TableCell>
                  <TableCell className="text-sm">{p.location || "—"}</TableCell>
                  <TableCell className="font-mono text-sm">{p.installedOnAircraft || "—"}</TableCell>
                  <TableCell className="text-right font-mono">{p.tsn}</TableCell>
                  <TableCell><Badge className={conditionColors[p.condition]}>{p.condition}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
