import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import { Search, ClipboardList, Plus, RefreshCw, BarChart3 } from "lucide-react";

const statusColors: Record<string, string> = {
  scheduled: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function ScheduleList() {
  const [search, setSearch] = useState("");
  const { data: schedules, isLoading, refetch } = trpc.wms.cycleCountList.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Card><CardContent className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card>
      </div>
    );
  }

  const filtered = (schedules || []).filter((s: any) =>
    !search || s.warehouseId?.toString().includes(search) || s.frequency?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-6 h-6 text-rose-500" />
          <h2 className="text-2xl font-bold">Cycle Count Schedules</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}><RefreshCw className="w-4 h-4" /></Button>
          <Link to="/app/wms/cycle-count/variance"><Button variant="outline"><BarChart3 className="w-4 h-4 mr-2" />Variance Report</Button></Link>
          <Link to="/app/wms/cycle-count/execute"><Button><Plus className="w-4 h-4 mr-2" />Execute Count</Button></Link>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search schedules..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card><CardHeader className="pb-0"><CardTitle className="text-base">Schedules</CardTitle></CardHeader><CardContent className="p-0">
        <table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-3">Warehouse</th><th className="p-3">Zone</th><th className="p-3">Date</th><th className="p-3">Frequency</th><th className="p-3">Items Counted</th><th className="p-3">Status</th></tr></thead><tbody>
          {filtered.map((s: any) => (
            <tr key={s.id} className="border-b hover:bg-slate-50"><td className="p-3 font-medium">Warehouse #{s.warehouseId}</td><td className="p-3">{s.zoneName || s.zoneId || "All"}</td><td className="p-3">{s.countDate ? new Date(s.countDate).toLocaleDateString() : "—"}</td><td className="p-3"><Badge variant="outline">{s.frequency}</Badge></td><td className="p-3">{s.itemsCounted ?? "—"}</td><td className="p-3"><Badge className={`${statusColors[s.status] || ""} capitalize`}>{s.status?.replace("_", " ")}</Badge></td></tr>
          ))}
          {!filtered.length && <tr><td colSpan={6} className="p-12 text-center text-muted-foreground"><ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No cycle count schedules</p></td></tr>}
        </tbody></table>
      </CardContent></Card>
    </div>
  );
}
