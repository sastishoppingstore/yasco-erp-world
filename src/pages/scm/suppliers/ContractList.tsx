import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import { Search, FileText, Plus, RefreshCw } from "lucide-react";

const statusColors: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  expired: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  terminated: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
};

export default function ContractList() {
  const [search, setSearch] = useState("");
  const { data: contracts, isLoading, refetch } = trpc.scm.contractList.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full max-w-sm" />
        <Card><CardContent className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card>
      </div>
    );
  }

  const filtered = (contracts || []).filter((c: any) =>
    !search || c.contractNumber?.toLowerCase().includes(search.toLowerCase()) || c.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-emerald-500" />
          <h2 className="text-2xl font-bold">Supplier Contracts</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}><RefreshCw className="w-4 h-4" /></Button>
          <Link to="/app/scm/contracts/new"><Button><Plus className="w-4 h-4 mr-2" />New Contract</Button></Link>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search contracts..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card><CardHeader className="pb-0"><CardTitle className="text-base">All Contracts</CardTitle></CardHeader><CardContent className="p-0">
        <table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-3">Contract #</th><th className="p-3">Title</th><th className="p-3">Supplier</th><th className="p-3">Start</th><th className="p-3">End</th><th className="p-3">Value</th><th className="p-3">Status</th></tr></thead><tbody>
          {filtered.map((c: any) => (
            <tr key={c.id} className="border-b hover:bg-slate-50"><td className="p-3 font-mono text-xs font-semibold">{c.contractNumber}</td><td className="p-3 font-medium">{c.title}</td><td className="p-3">{c.supplierName || c.supplierId}</td><td className="p-3">{c.startDate ? new Date(c.startDate).toLocaleDateString() : "—"}</td><td className="p-3">{c.endDate ? new Date(c.endDate).toLocaleDateString() : "—"}</td><td className="p-3 font-mono">{c.value ? `${Number(c.value).toLocaleString()} ${c.currency || ""}` : "—"}</td>              <td className="p-3"><Badge className={statusColors[c.status] || ""}>{c.status}</Badge></td></tr>
          ))}
          {!filtered.length && <tr><td colSpan={7} className="p-12 text-center text-muted-foreground"><FileText className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No contracts found</p></td></tr>}
        </tbody></table>
      </CardContent></Card>
    </div>
  );
}
