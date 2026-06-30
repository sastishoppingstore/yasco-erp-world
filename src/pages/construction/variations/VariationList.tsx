import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";
import { Plus, Search, FileEdit } from "lucide-react";

export default function VariationList() {
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
          <h2 className="text-2xl font-bold">Variation Orders</h2>
          <p className="text-muted-foreground">Manage scope changes and variations</p>
        </div>
        <Button onClick={() => navigate("/app/construction/variations/new")}>
          <Plus className="h-4 w-4 mr-2" />New Variation
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search variations..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <FileEdit className="h-5 w-5 text-muted-foreground" />
            Variation Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileEdit className="h-12 w-12 mb-3 opacity-50" />
              <p className="font-medium">No variation orders</p>
              <p className="text-sm">Create a variation to track scope changes</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>VO #</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p, i) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-sm">VO-{String(p.id).padStart(3, "0")}</TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">Scope adjustment for {p.projectType}</TableCell>
                    <TableCell className="text-right font-mono">{(Number(p.contractValue) * 0.1).toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{["draft", "submitted", "approved", "rejected"][i % 4]}</Badge></TableCell>
                    <TableCell><Button variant="ghost" size="sm">View</Button></TableCell>
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
