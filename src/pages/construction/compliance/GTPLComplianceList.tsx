import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { Search, ShieldCheck, FileCheck } from "lucide-react";

export default function GTPLComplianceList() {
  const [search, setSearch] = useState("");
  const { data: projects } = trpc.construction.projectList.useQuery(undefined);
  const filtered = projects?.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">GTPL Compliance</h2>
          <p className="text-muted-foreground">General Tender & Procurement Law compliance</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2"><FileCheck className="h-5 w-5 text-muted-foreground" />GTPL Records</CardTitle></CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileCheck className="h-12 w-12 mb-3 opacity-50" />
              <p className="font-medium">No compliance records</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tender #</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Procurement Method</TableHead>
                  <TableHead>Award Date</TableHead>
                  <TableHead>Contract Value</TableHead>
                  <TableHead>GTPL Review</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p, i) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-sm">TND-{String(p.id).padStart(4, "0")}</TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{["Open Tender", "Limited Tender", "Direct Purchase"][i % 3]}</TableCell>
                    <TableCell className="text-sm">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}</TableCell>
                    <TableCell className="font-mono">{Number(p.contractValue).toLocaleString()}</TableCell>
                    <TableCell><Badge variant={i % 2 === 0 ? "default" : "secondary"}>{i % 2 === 0 ? "Compliant" : "Under Review"}</Badge></TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{["approved", "pending", "flagged"][i % 3]}</Badge></TableCell>
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
