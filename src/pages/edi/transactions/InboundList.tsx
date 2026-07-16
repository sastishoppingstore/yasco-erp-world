import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { Search, Inbox, ArrowDown } from "lucide-react";

export default function InboundList() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = trpc.edi.listInbound.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full max-w-sm" />
        <Card><CardContent className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card>
      </div>
    );
  }

  const filtered = (data?.items || []).filter((t: any) =>
    !search || t.documentReference?.toLowerCase().includes(search.toLowerCase()) || String(t.id).includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Inbox className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold">Inbound Transactions</h2>
        </div>
        <Badge variant="secondary" className="text-sm">{filtered.length} total</Badge>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card><CardHeader className="pb-0"><CardTitle className="flex items-center gap-2 text-base"><ArrowDown className="w-4 h-4 text-green-500" />Received Documents</CardTitle></CardHeader><CardContent className="p-0">
        <table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-3">ID</th><th className="p-3">Document Ref</th><th className="p-3">Sender</th><th className="p-3">Status</th><th className="p-3">Received</th></tr></thead><tbody>
          {filtered.map((t: any) => (
            <tr key={t.id} className="border-b hover:bg-slate-50"><td className="p-3 font-medium">#{t.id}</td><td className="p-3">{t.documentReference || "—"}</td><td className="p-3">{t.senderId || "—"}</td><td className="p-3"><Badge variant={t.status === "processed" ? "default" : t.status === "failed" ? "destructive" : "secondary"}>{t.status}</Badge></td><td className="p-3 text-xs text-slate-400">{new Date(t.createdAt).toLocaleString()}</td></tr>
          ))}
          {!filtered.length && <tr><td colSpan={5} className="p-12 text-center text-muted-foreground"><Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No inbound transactions</p><p className="text-xs">{search ? "Try a different search" : "Waiting for incoming EDI documents"}</p></td></tr>}
        </tbody></table>
      </CardContent></Card>
    </div>
  );
}
