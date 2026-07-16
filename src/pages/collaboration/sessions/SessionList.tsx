import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import { Search, MessageSquare, Plus, Eye, XCircle } from "lucide-react";

export default function SessionList() {
  const [search, setSearch] = useState("");
  const { data, isLoading, refetch } = trpc.ws.listSessions.useQuery();
  const endSession = trpc.ws.endSession.useMutation({ onSuccess: () => refetch() });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full max-w-sm" />
        <Card><CardContent className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card>
      </div>
    );
  }

  const filtered = (data || []).filter((s: any) =>
    !search || s.sessionName?.toLowerCase().includes(search.toLowerCase()) || s.sessionType?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-indigo-500" />
          <h2 className="text-2xl font-bold">Collaboration Sessions</h2>
        </div>
        <Link to="/app/collaboration/sessions/new"><Button><Plus className="w-4 h-4 mr-2" />New Session</Button></Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search sessions..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card><CardHeader className="pb-0"><CardTitle className="text-base">All Sessions</CardTitle></CardHeader><CardContent className="p-0">
        <table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-3">Name</th><th className="p-3">Type</th><th className="p-3">Status</th><th className="p-3">Created</th><th className="p-3">Actions</th></tr></thead><tbody>
          {filtered.map((s: any) => (
            <tr key={s.id} className="border-b hover:bg-slate-50"><td className="p-3 font-medium">{s.sessionName}</td><td className="p-3"><Badge variant="outline">{s.sessionType}</Badge></td><td className="p-3">{s.isActive ? <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</Badge> : <Badge variant="secondary">Ended</Badge>}</td><td className="p-3 text-xs text-slate-400">{new Date(s.createdAt).toLocaleString()}</td><td className="p-3"><div className="flex gap-1">
              <Link to={`/app/collaboration/sessions/${s.id}`}><Button size="sm" variant="outline"><Eye className="w-3 h-3 mr-1" />View</Button></Link>
              {s.isActive && <Button size="sm" variant="destructive" onClick={() => endSession.mutate({ sessionId: s.id })} disabled={endSession.isPending}><XCircle className="w-3 h-3 mr-1" />End</Button>}
            </div></td></tr>
          ))}
          {!filtered.length && <tr><td colSpan={5} className="p-12 text-center text-muted-foreground"><MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No collaboration sessions</p></td></tr>}
        </tbody></table>
      </CardContent></Card>
    </div>
  );
}
