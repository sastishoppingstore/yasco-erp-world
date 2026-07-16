import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import { Search, ClipboardList, Plus, Eye, RefreshCw } from "lucide-react";

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
  sent: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  received: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  evaluated: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  closed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

export default function RfqList() {
  const [search, setSearch] = useState("");
  const { data: rfqs, isLoading, refetch } = trpc.scm.rfqList.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full max-w-sm" />
        <Card><CardContent className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card>
      </div>
    );
  }

  const filtered = (rfqs || []).filter((r: any) =>
    !search || r.rfqNumber?.toLowerCase().includes(search.toLowerCase()) || r.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-6 h-6 text-purple-500" />
          <h2 className="text-2xl font-bold">Request for Quotations</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}><RefreshCw className="w-4 h-4" /></Button>
          <Link to="/app/scm/rfq/new"><Button><Plus className="w-4 h-4 mr-2" />New RFQ</Button></Link>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search RFQs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card><CardHeader className="pb-0"><CardTitle className="text-base">All RFQs</CardTitle></CardHeader><CardContent className="p-0">
        <table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-3">RFQ #</th><th className="p-3">Title</th><th className="p-3">Deadline</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead><tbody>
          {filtered.map((r: any) => (
            <tr key={r.id} className="border-b hover:bg-slate-50"><td className="p-3 font-mono text-xs font-semibold">{r.rfqNumber}</td><td className="p-3 font-medium">{r.title}</td><td className="p-3">{r.deadlineDate ? new Date(r.deadlineDate).toLocaleDateString() : "—"}</td><td className="p-3"><Badge className={statusColors[r.status] || ""}>{r.status}</Badge></td><td className="p-3"><Link to={`/app/scm/rfq/${r.id}`}><Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button></Link></td></tr>
          ))}
          {!filtered.length && <tr><td colSpan={5} className="p-12 text-center text-muted-foreground"><ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No RFQs found</p></td></tr>}
        </tbody></table>
      </CardContent></Card>
    </div>
  );
}
