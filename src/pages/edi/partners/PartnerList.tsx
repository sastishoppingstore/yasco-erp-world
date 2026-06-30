import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import { Search, Users, Plus, RefreshCw } from "lucide-react";

export default function PartnerList() {
  const [search, setSearch] = useState("");
  const { data, isLoading, refetch } = trpc.edi.listPartners.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full max-w-sm" />
        <Card><CardContent className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card>
      </div>
    );
  }

  const filtered = (data?.items || []).filter((p: any) =>
    !search || p.partnerName?.toLowerCase().includes(search.toLowerCase()) || p.partnerCode?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold">EDI Partners</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}><RefreshCw className="w-4 h-4" /></Button>
          <Link to="/app/edi/partners/new"><Button><Plus className="w-4 h-4 mr-2" />Add Partner</Button></Link>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search partners..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card><CardHeader className="pb-0"><CardTitle className="text-base">All Partners</CardTitle></CardHeader><CardContent className="p-0">
        <table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-3">Code</th><th className="p-3">Name</th><th className="p-3">Type</th><th className="p-3">Standard</th><th className="p-3">Status</th></tr></thead><tbody>
          {filtered.map((p: any) => (
            <tr key={p.id} className="border-b hover:bg-slate-50"><td className="p-3 font-mono text-xs font-medium">{p.partnerCode}</td><td className="p-3 font-medium">{p.partnerName}</td><td className="p-3"><Badge variant="outline">{p.partnerType}</Badge></td><td className="p-3">{p.ediStandard}</td><td className="p-3">{p.isActive ? <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}</td></tr>
          ))}
          {!filtered.length && <tr><td colSpan={5} className="p-12 text-center text-muted-foreground"><Users className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No partners found</p><p className="text-xs">{search ? "Try a different search" : "Add your first EDI partner"}</p></td></tr>}
        </tbody></table>
      </CardContent></Card>
    </div>
  );
}
