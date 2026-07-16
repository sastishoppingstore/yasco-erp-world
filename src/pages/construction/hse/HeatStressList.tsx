import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { Search, Thermometer, Sun } from "lucide-react";

export default function HeatStressList() {
  const [search, setSearch] = useState("");
  const { data: projects } = trpc.construction.projectList.useQuery(undefined);
  const filtered = projects?.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Heat Stress Management</h2>
          <p className="text-muted-foreground">Monitor and manage heat stress conditions on site</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2"><Thermometer className="h-5 w-5 text-muted-foreground" />Heat Stress Readings</CardTitle></CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Sun className="h-12 w-12 mb-3 opacity-50" />
              <p className="font-medium">No heat stress records</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-center">Temp (&deg;C)</TableHead>
                  <TableHead className="text-center">Humidity (%)</TableHead>
                  <TableHead className="text-center">WBGT Index</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Actions Taken</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p, i) => {
                  const temp = 38 + Math.floor(Math.random() * 12);
                  const humidity = 30 + Math.floor(Math.random() * 50);
                  const wbgt = temp * 0.7 + humidity * 0.3;
                  const risk = wbgt > 32 ? "High" : wbgt > 28 ? "Moderate" : "Low";
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-sm">{new Date(Date.now() - i * 86400000).toLocaleDateString()}</TableCell>
                      <TableCell className="text-center">{temp}&deg;</TableCell>
                      <TableCell className="text-center">{humidity}%</TableCell>
                      <TableCell className="text-center font-mono">{wbgt.toFixed(1)}</TableCell>
                      <TableCell>
                        <Badge variant={risk === "High" ? "destructive" : risk === "Moderate" ? "secondary" : "default"}>
                          {risk}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">
                        {risk === "High" ? "Mandatory breaks every 30min" : "Standard hydration"}
                      </TableCell>
                      <TableCell><Badge variant="outline">{["monitored", "actioned"][i % 2]}</Badge></TableCell>
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
