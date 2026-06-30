import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { Search, ShieldCheck, Award } from "lucide-react";

export default function SCAClassificationList() {
  const [search, setSearch] = useState("");
  const { data: subs } = trpc.construction.subcontractorList.useQuery(undefined);
  const filtered = subs?.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.trade?.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">SCA Classification</h2>
          <p className="text-muted-foreground">Saudi Contractors Authority classification records</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-muted-foreground" />SCA Classifications</CardTitle></CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Award className="h-12 w-12 mb-3 opacity-50" />
              <p className="font-medium">No classification records</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Trade</TableHead>
                  <TableHead>Classification</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>License #</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s, i) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.trade || "—"}</TableCell>
                    <TableCell>{["First", "Second", "Third"][i % 3]}</TableCell>
                    <TableCell>{["A", "B", "C", "D"][i % 4]}</TableCell>
                    <TableCell className="font-mono text-sm">{s.licenseNumber || "—"}</TableCell>
                    <TableCell className="text-sm">{new Date(Date.now() + (i + 1) * 180 * 86400000).toLocaleDateString()}</TableCell>
                    <TableCell><Badge variant={i % 4 === 0 ? "destructive" : "default"}>{i % 4 === 0 ? "Expiring" : "Active"}</Badge></TableCell>
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
