import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { Search, Wrench, CalendarDays } from "lucide-react";

const statusColors: Record<string, string> = {
  available: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  in_use: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  maintenance: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  retired: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
};

export default function EquipmentScheduleList() {
  const [search, setSearch] = useState("");
  const { data: equipment, isLoading } = trpc.construction.equipmentList.useQuery(undefined);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div><Skeleton className="h-8 w-56" /><Skeleton className="h-4 w-72 mt-1" /></div>
        <Card><CardContent className="p-6"><div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div></CardContent></Card>
      </div>
    );
  }

  const filtered = equipment?.filter(e =>
    !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.equipmentCode.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">Equipment Schedule</h2>
          <p className="text-muted-foreground">Schedule and track construction equipment</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search equipment..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
            Equipment Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Wrench className="h-12 w-12 mb-3 opacity-50" />
              <p className="font-medium">No equipment found</p>
              <p className="text-sm">Add equipment to create schedules</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Equipment Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Hourly Rate</TableHead>
                  <TableHead className="text-right">Hours Used</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Scheduled Dates</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="font-mono text-sm">{e.equipmentCode}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{e.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{e.type || "—"}</TableCell>
                    <TableCell className="text-right font-mono">{Number(e.hourlyRate).toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">{e.hoursUsed}</TableCell>
                    <TableCell className="text-sm">{e.location || "—"}</TableCell>
                    <TableCell className="text-sm">{new Date().toLocaleDateString()} — {new Date(Date.now() + 7 * 86400000).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[e.status]}>{e.status.replace("_", " ")}</Badge>
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
