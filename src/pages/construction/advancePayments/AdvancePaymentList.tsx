import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";
import { Plus, Search, Handshake } from "lucide-react";

export default function AdvancePaymentList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: projects } = trpc.construction.projectList.useQuery(undefined);

  const filtered = projects?.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">Advance Payments</h2>
          <p className="text-muted-foreground">Track advance payments to contractors and suppliers</p>
        </div>
        <Button onClick={() => navigate("/app/construction/advance-payments/new")}>
          <Plus className="h-4 w-4 mr-2" />New Advance Payment
        </Button>
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
            <Handshake className="h-5 w-5 text-muted-foreground" />
            Advance Payment Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Handshake className="h-12 w-12 mb-3 opacity-50" />
              <p className="font-medium">No advance payments</p>
              <p className="text-sm">Record advance payments against projects</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Payee</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p, i) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-sm">AP-{String(p.id).padStart(3, "0")}</TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-sm">Contractor</TableCell>
                    <TableCell className="text-right font-mono">{(Number(p.contractValue) * 0.15).toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">{(Number(p.contractValue) * 0.05).toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}</TableCell>
                    <TableCell>
                      <Badge variant={i % 3 === 0 ? "default" : "secondary"}>{["pending", "approved", "settled"][i % 3]}</Badge>
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
