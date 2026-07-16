import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { Search, Package, ShoppingCart } from "lucide-react";

export default function MaterialRequirementList() {
  const [search, setSearch] = useState("");
  const { data: projects } = trpc.construction.projectList.useQuery(undefined);
  const filtered = projects?.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase())) || [];

  const materials = filtered.flatMap(p => [
    { project: p.name, code: p.projectCode, material: "Cement (OPC)", spec: "Type I 42.5N", unit: "Ton", required: 500, ordered: 350, received: 300, status: "in_progress" as const },
    { project: p.name, code: p.projectCode, material: "Steel Reinforcement", spec: "Grade 60 16mm", unit: "Ton", required: 200, ordered: 150, received: 100, status: "ordered" as const },
    { project: p.name, code: p.projectCode, material: "Concrete Block", spec: "200x200x400mm", unit: "Each", required: 10000, ordered: 8000, received: 5000, status: "partial" as const },
  ]);

  const searched = materials.filter(m =>
    !search || m.material.toLowerCase().includes(search.toLowerCase()) || m.project.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">Material Requirements</h2>
          <p className="text-muted-foreground">Plan and track material procurement</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search materials..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            Material Requirements Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {searched.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mb-3 opacity-50" />
              <p className="font-medium">No material requirements</p>
              <p className="text-sm">Material planning data will appear here</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Specification</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Required</TableHead>
                  <TableHead className="text-right">Ordered</TableHead>
                  <TableHead className="text-right">Received</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searched.map((m, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{m.project}</TableCell>
                    <TableCell>{m.material}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{m.spec}</TableCell>
                    <TableCell>{m.unit}</TableCell>
                    <TableCell className="text-right font-mono">{m.required.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">{m.ordered.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">{m.received.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={m.status === "in_progress" ? "default" : m.status === "ordered" ? "secondary" : "outline"}>
                        {m.status.replace("_", " ")}
                      </Badge>
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
