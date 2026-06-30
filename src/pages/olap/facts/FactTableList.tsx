import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { Search, Database, Plus, X, RefreshCw } from "lucide-react";

export default function FactTableList() {
  const [search, setSearch] = useState("");
  const { data, isLoading, refetch } = trpc.olap.listFactTables.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const create = trpc.olap.createFactTable.useMutation({ onSuccess: () => { refetch(); setShowForm(false); setName(""); } });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Card><CardContent className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card>
      </div>
    );
  }

  const filtered = (data || []).filter((f: any) =>
    !search || f.factName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 text-rose-500" />
          <h2 className="text-2xl font-bold">Fact Tables</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}><RefreshCw className="w-4 h-4" /></Button>
          <Button onClick={() => setShowForm(!showForm)}>{showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}{showForm ? "Cancel" : "New Fact Table"}</Button>
        </div>
      </div>

      {showForm && (
        <Card><CardContent className="flex gap-3 pt-6 items-end">
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Fact Table Name</label>
            <Input placeholder="Enter fact table name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <Button onClick={() => create.mutate({ factName: name })} disabled={!name || create.isPending}>Create</Button>
        </CardContent></Card>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search fact tables..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card><CardHeader className="pb-0"><CardTitle className="text-base">All Fact Tables</CardTitle></CardHeader><CardContent className="p-0">
        <table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-3">Name</th><th className="p-3">Source Table</th><th className="p-3">Refresh</th><th className="p-3">Row Count</th><th className="p-3">Status</th></tr></thead><tbody>
          {filtered.map((f: any) => (
            <tr key={f.id} className="border-b hover:bg-slate-50"><td className="p-3 font-medium">{f.factName}</td><td className="p-3 font-mono text-xs text-muted-foreground">{f.sourceTable || "—"}</td><td className="p-3"><Badge variant="outline">{f.refreshFrequency || "—"}</Badge></td><td className="p-3">{f.rowCount?.toLocaleString() ?? "—"}</td><td className="p-3"><Badge variant={f.status === "active" ? "default" : "secondary"} className="capitalize">{f.status}</Badge></td></tr>
          ))}
          {!filtered.length && <tr><td colSpan={5} className="p-12 text-center text-muted-foreground"><Database className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No fact tables found</p></td></tr>}
        </tbody></table>
      </CardContent></Card>
    </div>
  );
}
