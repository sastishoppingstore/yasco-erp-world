import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { Search, ShieldCheck, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function QualityLogViewer() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data, isLoading, refetch } = trpc.etl.listQualityLogs.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full max-w-sm" />
        <Card><CardContent className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card>
      </div>
    );
  }

  let filtered = (data || []);
  if (statusFilter !== "all") filtered = filtered.filter((l: any) => l.status === statusFilter);
  if (search) filtered = filtered.filter((l: any) =>
    l.fieldName?.toLowerCase().includes(search.toLowerCase()) || String(l.expectedValue)?.toLowerCase().includes(search.toLowerCase())
  );

  const passed = (data || []).filter((l: any) => l.status === "passed").length;
  const failed = (data || []).filter((l: any) => l.status === "failed").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-500" />
          <h2 className="text-2xl font-bold">Quality Logs</h2>
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()}><RefreshCw className="w-4 h-4" /></Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30"><ShieldCheck className="w-5 h-5 text-blue-500" /></div>
          <div><p className="text-xs text-muted-foreground">Total Checks</p><p className="text-xl font-bold">{(data || []).length}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30"><CheckCircle2 className="w-5 h-5 text-green-500" /></div>
          <div><p className="text-xs text-muted-foreground">Passed</p><p className="text-xl font-bold text-green-600">{passed}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
          <div><p className="text-xs text-muted-foreground">Failed</p><p className="text-xl font-bold text-red-600">{failed}</p></div>
        </CardContent></Card>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1 border rounded-lg p-1">
          {["all", "passed", "failed"].map(s => (
            <Button key={s} variant={statusFilter === s ? "default" : "ghost"} size="sm" className="text-xs capitalize" onClick={() => setStatusFilter(s)}>{s}</Button>
          ))}
        </div>
      </div>

      <Card><CardHeader className="pb-0"><CardTitle className="text-base">Quality Checks</CardTitle></CardHeader><CardContent className="p-0">
        <table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-3">Field</th><th className="p-3">Expected</th><th className="p-3">Actual</th><th className="p-3">Status</th><th className="p-3">Time</th></tr></thead><tbody>
          {filtered.map((log: any) => (
            <tr key={log.id} className="border-b hover:bg-slate-50"><td className="p-3 font-mono text-xs">{log.fieldName}</td><td className="p-3 max-w-xs truncate text-muted-foreground">{log.expectedValue}</td><td className="p-3 max-w-xs truncate text-muted-foreground">{log.actualValue}</td><td className="p-3"><Badge variant={log.status === "passed" ? "default" : "destructive"}>{log.status}</Badge></td><td className="p-3 text-xs text-slate-400">{new Date(log.createdAt).toLocaleString()}</td></tr>
          ))}
          {!filtered.length && <tr><td colSpan={5} className="p-12 text-center text-muted-foreground"><ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No quality logs found</p></td></tr>}
        </tbody></table>
      </CardContent></Card>
    </div>
  );
}
