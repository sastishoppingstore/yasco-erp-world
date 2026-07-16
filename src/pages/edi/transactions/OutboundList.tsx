import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import { Search, Send, ArrowUp, RefreshCw } from "lucide-react";

export default function OutboundList() {
  const [search, setSearch] = useState("");
  const { data, isLoading, refetch } = trpc.edi.listOutbound.useQuery();
  const sendEdi = trpc.edi.sendEdi.useMutation({ onSuccess: () => refetch() });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" /><Skeleton className="h-10 w-full max-w-sm" />
        <Card><CardContent className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card>
      </div>
    );
  }

  const filtered = (data?.items || []).filter((t: any) =>
    !search || t.sourceEntityType?.toLowerCase().includes(search.toLowerCase()) || String(t.id).includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <ArrowUp className="w-6 h-6 text-purple-500" />
          <h2 className="text-2xl font-bold">Outbound Transactions</h2>
        </div>
        <div className="flex gap-2">
          <Link to="/app/edi/transactions/inbound"><Button variant="outline">View Inbound</Button></Link>
          <Button variant="outline" size="icon" onClick={() => refetch()}><RefreshCw className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search outbound..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card><CardHeader className="pb-0"><CardTitle className="flex items-center gap-2 text-base"><Send className="w-4 h-4 text-purple-500" />Outgoing Documents</CardTitle></CardHeader><CardContent className="p-0">
        <table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-3">ID</th><th className="p-3">Type</th><th className="p-3">Recipient</th><th className="p-3">Status</th><th className="p-3">Created</th><th className="p-3">Actions</th></tr></thead><tbody>
          {filtered.map((t: any) => (
            <tr key={t.id} className="border-b hover:bg-slate-50"><td className="p-3 font-medium">#{t.id}</td><td className="p-3">{t.sourceEntityType}</td><td className="p-3">{t.recipientId || "—"}</td><td className="p-3"><Badge variant={t.status === "transmitted" ? "default" : t.status === "failed" ? "destructive" : "secondary"}>{t.status}</Badge></td><td className="p-3 text-xs text-slate-400">{new Date(t.createdAt).toLocaleString()}</td><td className="p-3">{t.status === "pending" && <Button size="sm" onClick={() => sendEdi.mutate({ outboundId: t.id })} disabled={sendEdi.isPending}><Send className="w-3 h-3 mr-1" />Send</Button>}</td></tr>
          ))}
          {!filtered.length && <tr><td colSpan={6} className="p-12 text-center text-muted-foreground"><Send className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No outbound transactions</p></td></tr>}
        </tbody></table>
      </CardContent></Card>
    </div>
  );
}
