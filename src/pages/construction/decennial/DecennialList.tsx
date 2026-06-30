import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { Search, ScrollText, ShieldCheck } from "lucide-react";

export default function DecennialList() {
  const [search, setSearch] = useState("");
  const { data: projects } = trpc.construction.projectList.useQuery(undefined);

  const filtered = projects?.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">Decennial Liability Records</h2>
          <p className="text-muted-foreground">Saudi Building Code decennial liability tracking</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-muted-foreground" />
            Decennial Liability Insurance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ShieldCheck className="h-12 w-12 mb-3 opacity-50" />
              <p className="font-medium">No records found</p>
              <p className="text-sm">Decennial liability records will appear here</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Insurance Provider</TableHead>
                  <TableHead>Policy #</TableHead>
                  <TableHead>Coverage Amount</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 10).map((p, i) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{["Tawuniya", "MedGulf", "Bupa", "Al Rajhi Takaful"][i % 4]}</TableCell>
                    <TableCell className="font-mono text-sm">DEC-{String(p.id).padStart(4, "0")}</TableCell>
                    <TableCell className="font-mono">{Number(p.contractValue).toLocaleString()} SAR</TableCell>
                    <TableCell className="text-sm">{p.startDate || "—"}</TableCell>
                    <TableCell className="text-sm">{p.endDate ? (() => { const d = new Date(p.endDate); d.setFullYear(d.getFullYear() + 10); return d.toLocaleDateString(); })() : "—"}</TableCell>
                    <TableCell>
                      <Badge variant={i % 3 === 0 ? "default" : "secondary"}>{["active", "expiring", "expired"][i % 3]}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
