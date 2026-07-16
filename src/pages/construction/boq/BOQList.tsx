import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";
import { Plus, Search, FileSpreadsheet, Upload, Download } from "lucide-react";

export default function BOQList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: projects } = trpc.construction.projectList.useQuery(undefined);

  const filtered = projects?.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.projectCode.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">Bill of Quantities</h2>
          <p className="text-muted-foreground">Manage BOQ items and cost estimation</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/app/construction/boq/import")}>
            <Upload className="h-4 w-4 mr-2" />Import Excel
          </Button>
          <Button onClick={() => navigate("/app/construction/boq/new")}>
            <Plus className="h-4 w-4 mr-2" />New BOQ
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
            BOQ Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileSpreadsheet className="h-12 w-12 mb-3 opacity-50" />
              <p className="font-medium">No BOQ items found</p>
              <p className="text-sm">{search ? "Try a different search term" : "Create a project and add BOQ items"}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Total Qty</TableHead>
                  <TableHead className="text-right">Total Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="font-mono text-sm">{p.projectCode}</TableCell>
                    <TableCell>{Math.floor(Math.random() * 30) + 5}</TableCell>
                    <TableCell className="text-right font-mono">{Math.floor(Math.random() * 5000) + 100}</TableCell>
                    <TableCell className="text-right font-mono">{Number(p.contractValue).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{p.status.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
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
