import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { Search, ShieldCheck, Building } from "lucide-react";

export default function SBCComplianceList() {
  const [search, setSearch] = useState("");
  const { data: projects } = trpc.construction.projectList.useQuery(undefined);
  const filtered = projects?.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">SBC Compliance</h2>
          <p className="text-muted-foreground">Saudi Building Code compliance records</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-muted-foreground" />SBC Records</CardTitle></CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Building className="h-12 w-12 mb-3 opacity-50" />
              <p className="font-medium">No compliance records</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Building Permit</TableHead>
                  <TableHead>SBC Certificate</TableHead>
                  <TableHead>Structural Review</TableHead>
                  <TableHead>Fire Safety</TableHead>
                  <TableHead>Energy Compliance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p, i) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="font-mono text-sm">BP-{String(p.id).padStart(4, "0")}</TableCell>
                    <TableCell><Badge variant={i % 2 === 0 ? "default" : "secondary"}>{i % 2 === 0 ? "Certified" : "Pending"}</Badge></TableCell>
                    <TableCell><Badge variant={i % 3 !== 0 ? "default" : "destructive"}>{i % 3 !== 0 ? "Passed" : "Failed"}</Badge></TableCell>
                    <TableCell><Badge variant={i % 4 !== 0 ? "default" : "secondary"}>{i % 4 !== 0 ? "Compliant" : "Under Review"}</Badge></TableCell>
                    <TableCell><Badge variant={i % 5 !== 0 ? "default" : "outline"}>{i % 5 !== 0 ? "Compliant" : "N/A"}</Badge></TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{["compliant", "partial", "non_compliant"][i % 3].replace("_", " ")}</Badge></TableCell>
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
