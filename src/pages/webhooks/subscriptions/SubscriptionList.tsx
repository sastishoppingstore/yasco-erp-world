import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import { Search, Webhook, Plus, Trash2, RefreshCw } from "lucide-react";

export default function SubscriptionList() {
  const [search, setSearch] = useState("");
  const { data, isLoading, refetch } = trpc.webhooks.listSubscriptions.useQuery();
  const del = trpc.webhooks.deleteSubscription.useMutation({ onSuccess: () => refetch() });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full max-w-sm" />
        <Card><CardContent className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card>
      </div>
    );
  }

  const filtered = (data?.items || []).filter((s: any) =>
    !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.url?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Webhook className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold">Webhook Subscriptions</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}><RefreshCw className="w-4 h-4" /></Button>
          <Link to="/app/webhooks/subscriptions/new"><Button><Plus className="w-4 h-4 mr-2" />New Subscription</Button></Link>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search subscriptions..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card><CardHeader className="pb-0"><CardTitle className="text-base">All Subscriptions</CardTitle></CardHeader><CardContent className="p-0">
        <table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-3">Name</th><th className="p-3">URL</th><th className="p-3">Events</th><th className="p-3">Delivery Count</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead><tbody>
          {filtered.map((s: any) => (
            <tr key={s.id} className="border-b hover:bg-slate-50"><td className="p-3 font-medium">{s.name}</td><td className="p-3 max-w-[200px] truncate font-mono text-xs text-muted-foreground">{s.url}</td><td className="p-3">{(s.eventTypes as string[])?.join(", ") || "—"}</td><td className="p-3">{s.deliveryCount ?? 0}</td><td className="p-3"><Badge variant={s.isActive ? "default" : "secondary"}>{s.isActive ? "Active" : "Inactive"}</Badge></td><td className="p-3"><Button variant="destructive" size="sm" onClick={() => del.mutate({ id: s.id })} disabled={del.isPending}><Trash2 className="w-3 h-3 mr-1" />Delete</Button></td></tr>
          ))}
          {!filtered.length && <tr><td colSpan={6} className="p-12 text-center text-muted-foreground"><Webhook className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No subscriptions found</p></td></tr>}
        </tbody></table>
      </CardContent></Card>
    </div>
  );
}
