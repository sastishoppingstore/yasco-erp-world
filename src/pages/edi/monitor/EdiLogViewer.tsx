import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { Search, Clock, RefreshCw, Filter } from "lucide-react";

export default function EdiLogViewer() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const { data, isLoading, refetch } = trpc.edi.listLogs.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full max-w-sm" />
        <Card><CardContent className="p-6 space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card>
      </div>
    );
  }

  let filtered = (data?.items || []);
  if (filter !== "all") filtered = filtered.filter((l: any) => l.direction === filter);
  if (search) filtered = filtered.filter((l: any) =>
    l.documentType?.toLowerCase().includes(search.toLowerCase()) || l.message?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-amber-500" />
          <h2 className="text-2xl font-bold">EDI Monitor</h2>
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()}><RefreshCw className="w-4 h-4" /></Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1 border rounded-lg p-1">
          {["all", "inbound", "outbound"].map(d => (
            <Button key={d} variant={filter === d ? "default" : "ghost"} size="sm" className="text-xs capitalize" onClick={() => setFilter(d)}>{d}</Button>
          ))}
        </div>
      </div>

      <Card><CardHeader className="pb-0"><CardTitle className="flex items-center gap-2 text-base"><Filter className="w-4 h-4" />Activity Log</CardTitle></CardHeader><CardContent className="p-0">
        <table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-3">Direction</th><th className="p-3">Document</th><th className="p-3">Partner</th><th className="p-3">Status</th><th className="p-3">Message</th><th className="p-3">Time</th></tr></thead><tbody>
          {filtered.length > 0 ? filtered.map((log: any) => (
            <tr key={log.id} className="border-b hover:bg-slate-50"><td className="p-3"><Badge variant={log.direction === "outbound" ? "default" : "secondary"}>{log.direction}</Badge></td><td className="p-3">{log.documentType}</td><td className="p-3">{log.partnerId || "—"}</td><td className="p-3"><Badge variant={log.status === "success" || log.status === "delivered" ? "default" : log.status === "failed" ? "destructive" : "secondary"}>{log.status}</Badge></td><td className="p-3 max-w-xs truncate text-muted-foreground">{log.message || "—"}</td><td className="p-3 text-xs text-slate-400">{new Date(log.createdAt).toLocaleString()}</td></tr>
          )) : <tr><td colSpan={6} className="p-12 text-center text-muted-foreground"><Clock className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No log entries found</p></td></tr>}
        </tbody></table>
      </CardContent></Card>
    </div>
  );
}
