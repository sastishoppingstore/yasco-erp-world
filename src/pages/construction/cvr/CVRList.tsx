import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";
import { Plus, Search, FileBarChart } from "lucide-react";

export default function CVRList() {
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
          <h2 className="text-2xl font-bold">Cost Value Reports (CVR)</h2>
          <p className="text-muted-foreground">Monitor project cost vs. value performance</p>
        </div>
        <Button onClick={() => navigate("/app/construction/cvr/new")}>
          <Plus className="h-4 w-4 mr-2" />New CVR Report
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search reports..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <FileBarChart className="h-5 w-5 text-muted-foreground" />
            CVR Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileBarChart className="h-12 w-12 mb-3 opacity-50" />
              <p className="font-medium">No CVR reports</p>
              <p className="text-sm">Generate cost value reports for projects</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report #</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">BCWP</TableHead>
                  <TableHead className="text-right">ACWP</TableHead>
                  <TableHead className="text-right">BCWS</TableHead>
                  <TableHead className="text-right">CPI</TableHead>
                  <TableHead className="text-right">SPI</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p, i) => {
                  const bcwp = Number(p.contractValue) * (p.progress || 0) / 100;
                  const acwp = Number(p.actualCost);
                  const bcws = Number(p.contractValue) * 0.5;
                  const cpi = acwp > 0 ? bcwp / acwp : 1;
                  const spi = bcws > 0 ? bcwp / bcws : 1;
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-sm">CVR-{String(p.id).padStart(3, "0")}</TableCell>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-sm">Q{Math.min(i + 1, 4)} 2025</TableCell>
                      <TableCell className="text-right font-mono">{bcwp.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{acwp.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{bcws.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={cpi >= 1 ? "default" : "destructive"}>{cpi.toFixed(2)}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={spi >= 1 ? "default" : "destructive"}>{spi.toFixed(2)}</Badge>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{["draft", "submitted", "approved"][i % 3]}</Badge></TableCell>
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
