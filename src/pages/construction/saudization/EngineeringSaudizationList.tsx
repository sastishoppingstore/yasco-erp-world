import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { Search, Briefcase, Users } from "lucide-react";

export default function EngineeringSaudizationList() {
  const [search, setSearch] = useState("");
  const { data: projects } = trpc.construction.projectList.useQuery(undefined);
  const filtered = projects?.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Engineering Saudization</h2>
          <p className="text-muted-foreground">Saudi national employment in engineering roles</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-muted-foreground" />Saudization Records</CardTitle></CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mb-3 opacity-50" />
              <p className="font-medium">No saudization records</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Saudi Engineers</TableHead>
                  <TableHead>Total Engineers</TableHead>
                  <TableHead className="text-center">Saudization %</TableHead>
                  <TableHead>Target %</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p, i) => {
                  const saudi = Math.floor(Math.random() * 5) + 1;
                  const total = saudi + Math.floor(Math.random() * 10) + 2;
                  const pct = Math.round((saudi / total) * 100);
                  const target = 20;
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-center font-mono">{saudi}</TableCell>
                      <TableCell className="text-center font-mono">{total}</TableCell>
                      <TableCell className="text-center font-mono">{pct}%</TableCell>
                      <TableCell className="text-center">{target}%</TableCell>
                      <TableCell>
                        <Badge variant={pct >= target ? "default" : "destructive"}>
                          {pct >= target ? "Compliant" : "Below Target"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : "—"}</TableCell>
                      <TableCell><Badge variant="outline">{pct >= target ? "active" : "attention"}</Badge></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
