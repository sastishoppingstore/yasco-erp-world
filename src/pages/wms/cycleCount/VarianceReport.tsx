import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { Search, BarChart3, AlertTriangle, CheckCircle2, TrendingDown } from "lucide-react";

export default function VarianceReport() {
  const [scheduleId, setScheduleId] = useState(0);
  const [search, setSearch] = useState("");
  const { data: entries, isLoading } = trpc.wms.cycleCountEntryList.useQuery({ scheduleId }, { enabled: scheduleId > 0 });
  const { data: schedules } = trpc.wms.cycleCountList.useQuery();

  const variances = (entries || []).filter((e: any) => Number(e.variance) !== 0);
  const matched = (entries || []).filter((e: any) => Number(e.variance) === 0);

  const filtered = (entries || []).filter((e: any) =>
    !search || String(e.locationId).includes(search) || String(e.productId).includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-6 h-6 text-red-500" />
        <h2 className="text-2xl font-bold">Variance Report</h2>
      </div>

      <Card><CardContent className="p-4">
        <div className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <Label>Select Schedule</Label>
            <select className="w-full border rounded-lg p-2 text-sm mt-1" value={scheduleId} onChange={e => setScheduleId(Number(e.target.value))}>
              <option value={0}>Choose a schedule...</option>
              {(schedules || []).map((s: any) => (
                <option key={s.id} value={s.id}>Warehouse #{s.warehouseId} — {s.frequency} ({s.countDate ? new Date(s.countDate).toLocaleDateString() : "—"})</option>
              ))}
            </select>
          </div>
          {entries && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search entries..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
          )}
        </div>
      </CardContent></Card>

      {entries && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Card><CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30"><BarChart3 className="w-5 h-5 text-blue-500" /></div>
              <div><p className="text-xs text-muted-foreground">Total Items</p><p className="text-xl font-bold">{entries.length}</p></div>
            </CardContent></Card>
            <Card><CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30"><CheckCircle2 className="w-5 h-5 text-green-500" /></div>
              <div><p className="text-xs text-muted-foreground">Matched</p><p className="text-xl font-bold text-green-600">{matched.length}</p></div>
            </CardContent></Card>
            <Card><CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
              <div><p className="text-xs text-muted-foreground">Variance</p><p className="text-xl font-bold text-red-600">{variances.length}</p></div>
            </CardContent></Card>
          </div>

          <Card><CardHeader><CardTitle>Count Entries</CardTitle></CardHeader><CardContent className="p-0">
            <table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-3">Location</th><th className="p-3">Product</th><th className="p-3">Expected</th><th className="p-3">Actual</th><th className="p-3">Variance</th><th className="p-3">Reason</th><th className="p-3">Status</th></tr></thead><tbody>
              {filtered.length > 0 ? filtered.map((e: any) => (
                <tr key={e.id} className="border-b hover:bg-slate-50">
                  <td className="p-3">{e.locationCode || e.locationId}</td>
                  <td className="p-3">Product #{e.productId}</td>
                  <td className="p-3">{e.expectedQuantity}</td>
                  <td className="p-3">{e.actualQuantity}</td>
                  <td className={`p-3 font-semibold ${Number(e.variance) !== 0 ? "text-red-600" : "text-green-600"}`}>
                    {Number(e.variance) > 0 ? "+" : ""}{e.variance}
                  </td>
                  <td className="p-3 max-w-[150px] truncate text-muted-foreground">{e.varianceReason || "—"}</td>
                  <td className="p-3"><Badge variant={e.status === "approved" ? "default" : e.status === "variance" ? "destructive" : "secondary"} className="capitalize">{e.status}</Badge></td>
                </tr>
              )) : <tr><td colSpan={7} className="p-12 text-center text-muted-foreground"><BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No entries found for this schedule</p></td></tr>}
            </tbody></table>
          </CardContent></Card>
        </>
      )}

      {!entries && scheduleId === 0 && (
        <Card><CardContent className="p-12 text-center text-muted-foreground">
          <TrendingDown className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Select a schedule to view variance</p>
          <p className="text-xs mt-1">Choose a cycle count schedule above to see the detailed variance report</p>
        </CardContent></Card>
      )}

      {isLoading && scheduleId > 0 && (
        <Card><CardContent className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card>
      )}
    </div>
  );
}
