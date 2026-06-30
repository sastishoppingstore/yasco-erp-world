import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import { Search, Key, Plus, Ban, RefreshCw } from "lucide-react";

export default function ApiKeyList() {
  const [search, setSearch] = useState("");
  const { data, isLoading, refetch } = trpc.webhooks.listApiKeys.useQuery();
  const revoke = trpc.webhooks.revokeApiKey.useMutation({ onSuccess: () => refetch() });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full max-w-sm" />
        <Card><CardContent className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card>
      </div>
    );
  }

  const filtered = (data || []).filter((k: any) =>
    !search || k.keyName?.toLowerCase().includes(search.toLowerCase()) || k.keyPrefix?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Key className="w-6 h-6 text-amber-500" />
          <h2 className="text-2xl font-bold">API Keys</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}><RefreshCw className="w-4 h-4" /></Button>
          <Link to="/app/webhooks/keys/new"><Button><Plus className="w-4 h-4 mr-2" />Generate Key</Button></Link>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search API keys..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card><CardHeader className="pb-0"><CardTitle className="text-base">All API Keys</CardTitle></CardHeader><CardContent className="p-0">
        <table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-3">Name</th><th className="p-3">Prefix</th><th className="p-3">Rate Limit</th><th className="p-3">Created</th><th className="p-3">Last Used</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead><tbody>
          {filtered.map((k: any) => (
            <tr key={k.id} className="border-b hover:bg-slate-50"><td className="p-3 font-medium">{k.keyName}</td><td className="p-3 font-mono text-xs">{k.keyPrefix}...</td><td className="p-3">{k.rateLimitPerMinute}/min</td><td className="p-3 text-xs text-slate-400">{k.createdAt ? new Date(k.createdAt).toLocaleDateString() : "—"}</td><td className="p-3 text-xs text-slate-400">{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : "Never"}</td><td className="p-3"><Badge variant={k.isActive ? "default" : "secondary"}>{k.isActive ? "Active" : "Revoked"}</Badge></td><td className="p-3">{k.isActive && <Button variant="destructive" size="sm" onClick={() => revoke.mutate({ id: k.id })} disabled={revoke.isPending}><Ban className="w-3 h-3 mr-1" />Revoke</Button>}</td></tr>
          ))}
          {!filtered.length && <tr><td colSpan={7} className="p-12 text-center text-muted-foreground"><Key className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No API keys found</p></td></tr>}
        </tbody></table>
      </CardContent></Card>
    </div>
  );
}
