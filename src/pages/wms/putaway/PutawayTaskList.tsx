import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import { Search, ArrowRight, Plus, RefreshCw, ArrowUpDown } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function PutawayTaskList() {
  const [search, setSearch] = useState("");
  const { data: tasks, isLoading, refetch } = trpc.wms.putawayTaskList.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full max-w-sm" />
        <Card><CardContent className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card>
      </div>
    );
  }

  const filtered = (tasks || []).filter((t: any) =>
    !search || t.taskNumber?.toLowerCase().includes(search.toLowerCase()) || String(t.productId).includes(search)
  );

  const counts = {
    pending: (tasks || []).filter((t: any) => t.status === "pending").length,
    in_progress: (tasks || []).filter((t: any) => t.status === "in_progress").length,
    completed: (tasks || []).filter((t: any) => t.status === "completed").length,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <ArrowRight className="w-6 h-6 text-purple-500" />
          <h2 className="text-2xl font-bold">Putaway Tasks</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}><RefreshCw className="w-4 h-4" /></Button>
          <Link to="/app/wms/putaway/execute"><Button><Plus className="w-4 h-4 mr-2" />Execute Putaway</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30"><ArrowUpDown className="w-5 h-5 text-yellow-500" /></div><div><p className="text-xs text-muted-foreground">Pending</p><p className="text-xl font-bold">{counts.pending}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30"><ArrowRight className="w-5 h-5 text-blue-500" /></div><div><p className="text-xs text-muted-foreground">In Progress</p><p className="text-xl font-bold">{counts.in_progress}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30"><ArrowRight className="w-5 h-5 text-green-500" /></div><div><p className="text-xs text-muted-foreground">Completed</p><p className="text-xl font-bold">{counts.completed}</p></div></CardContent></Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card><CardHeader className="pb-0"><CardTitle className="text-base">All Tasks</CardTitle></CardHeader><CardContent className="p-0">
        <table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-3">Task #</th><th className="p-3">Product</th><th className="p-3">Quantity</th><th className="p-3">Source</th><th className="p-3">Status</th><th className="p-3">Priority</th></tr></thead><tbody>
          {filtered.map((t: any) => (
            <tr key={t.id} className="border-b hover:bg-slate-50"><td className="p-3 font-medium">{t.taskNumber}</td><td className="p-3">Product #{t.productId}</td><td className="p-3">{t.quantity}</td><td className="p-3">{t.sourceType || "—"}</td><td className="p-3"><Badge className={`${statusColors[t.status] || ""} capitalize`}>{t.status?.replace("_", " ")}</Badge></td><td className="p-3"><Badge variant={t.priority === "high" ? "destructive" : t.priority === "medium" ? "default" : "secondary"} className="capitalize">{t.priority}</Badge></td></tr>
          ))}
          {!filtered.length && <tr><td colSpan={6} className="p-12 text-center text-muted-foreground"><ArrowRight className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No putaway tasks</p></td></tr>}
        </tbody></table>
      </CardContent></Card>
    </div>
  );
}
