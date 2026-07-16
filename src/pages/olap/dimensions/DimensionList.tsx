import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { Search, Layers, Plus, X } from "lucide-react";

export default function DimensionList() {
  const [search, setSearch] = useState("");
  const { data, isLoading, refetch } = trpc.olap.listDimensions.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const create = trpc.olap.createDimension.useMutation({ onSuccess: () => { refetch(); setShowForm(false); setName(""); } });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Card><CardContent className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card>
      </div>
    );
  }

  const filtered = (data || []).filter((d: any) =>
    !search || d.dimensionName?.toLowerCase().includes(search.toLowerCase()) || d.dimensionCode?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Layers className="w-6 h-6 text-purple-500" />
          <h2 className="text-2xl font-bold">Dimensions</h2>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}{showForm ? "Cancel" : "New Dimension"}</Button>
      </div>

      {showForm && (
        <Card><CardContent className="flex gap-3 pt-6 items-end">
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Dimension Name</label>
            <Input placeholder="Enter dimension name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <Button onClick={() => create.mutate({ dimensionName: name })} disabled={!name || create.isPending}>Create</Button>
        </CardContent></Card>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search dimensions..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card><CardHeader className="pb-0"><CardTitle className="text-base">All Dimensions</CardTitle></CardHeader><CardContent className="p-0">
        <table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-3">Name</th><th className="p-3">Code</th><th className="p-3">Type</th><th className="p-3">Hierarchy</th><th className="p-3">Attributes</th></tr></thead><tbody>
          {filtered.map((d: any) => (
            <tr key={d.id} className="border-b hover:bg-slate-50"><td className="p-3 font-medium">{d.dimensionName}</td><td className="p-3 font-mono text-xs">{d.dimensionCode}</td><td className="p-3"><Badge variant="outline">{d.type}</Badge></td><td className="p-3">{d.hierarchyLevels} levels</td><td className="p-3">{d.attributeCount ?? "—"}</td></tr>
          ))}
          {!filtered.length && <tr><td colSpan={5} className="p-12 text-center text-muted-foreground"><Layers className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No dimensions found</p></td></tr>}
        </tbody></table>
      </CardContent></Card>
    </div>
  );
}
