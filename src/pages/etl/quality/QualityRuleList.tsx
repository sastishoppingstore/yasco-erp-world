import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { Search, ShieldCheck, Plus, X, Gavel } from "lucide-react";

export default function QualityRuleList() {
  const [search, setSearch] = useState("");
  const { data, isLoading, refetch } = trpc.etl.listQualityRules.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const create = trpc.etl.createQualityRule.useMutation({ onSuccess: () => { refetch(); setShowForm(false); setName(""); } });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Card><CardContent className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card>
      </div>
    );
  }

  const filtered = (data || []).filter((r: any) =>
    !search || r.ruleName?.toLowerCase().includes(search.toLowerCase()) || r.ruleType?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Gavel className="w-6 h-6 text-rose-500" />
          <h2 className="text-2xl font-bold">Data Quality Rules</h2>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}{showForm ? "Cancel" : "New Rule"}</Button>
      </div>

      {showForm && (
        <Card><CardContent className="flex gap-3 pt-6 items-end">
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Rule Name</label>
            <Input placeholder="Enter rule name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <Button onClick={() => create.mutate({ ruleName: name, ruleType: "not_null" })} disabled={!name || create.isPending}>Create</Button>
        </CardContent></Card>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search rules..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card><CardHeader className="pb-0"><CardTitle className="text-base">Quality Rules</CardTitle></CardHeader><CardContent className="p-0">
        <table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-3">Name</th><th className="p-3">Type</th><th className="p-3">Field</th><th className="p-3">Severity</th><th className="p-3">Status</th></tr></thead><tbody>
          {filtered.map((r: any) => (
            <tr key={r.id} className="border-b hover:bg-slate-50"><td className="p-3 font-medium">{r.ruleName}</td><td className="p-3"><Badge variant="outline">{r.ruleType}</Badge></td><td className="p-3 font-mono text-xs">{r.fieldName || "—"}</td><td className="p-3"><Badge variant={r.severity === "block" ? "destructive" : r.severity === "error" ? "default" : "secondary"} className="capitalize">{r.severity}</Badge></td><td className="p-3">{r.isActive ? <Badge className="bg-green-100 text-green-700">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}</td></tr>
          ))}
          {!filtered.length && <tr><td colSpan={5} className="p-12 text-center text-muted-foreground"><ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No quality rules found</p></td></tr>}
        </tbody></table>
      </CardContent></Card>
    </div>
  );
}
