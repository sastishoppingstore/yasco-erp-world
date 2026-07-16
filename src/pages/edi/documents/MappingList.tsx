import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import { Search, Route, Plus } from "lucide-react";

export default function MappingList() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = trpc.edi.listMappings.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Card><CardContent className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card>
      </div>
    );
  }

  const filtered = (data?.items || []).filter((m: any) =>
    !search || m.mappingName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Route className="w-6 h-6 text-amber-500" />
          <h2 className="text-2xl font-bold">EDI Mappings</h2>
        </div>
        <Link to="/app/edi/documents/mappings/new"><Button><Plus className="w-4 h-4 mr-2" />New Mapping</Button></Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search mappings..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card><CardHeader className="pb-0"><CardTitle className="text-base">Field Mappings</CardTitle></CardHeader><CardContent className="p-0">
        <table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-3">Name</th><th className="p-3">Direction</th><th className="p-3">Delimiter</th><th className="p-3">Document Type</th><th className="p-3">Default</th></tr></thead><tbody>
          {filtered.map((m: any) => (
            <tr key={m.id} className="border-b hover:bg-slate-50"><td className="p-3 font-medium">{m.mappingName}</td><td className="p-3"><Badge variant={m.direction === "outbound" ? "default" : "secondary"}>{m.direction}</Badge></td><td className="p-3 font-mono text-xs">{m.delimiter}</td><td className="p-3">{m.documentTypeId || "—"}</td><td className="p-3">{m.isDefault ? <Badge>Default</Badge> : "—"}</td></tr>
          ))}
          {!filtered.length && <tr><td colSpan={5} className="p-12 text-center text-muted-foreground"><Route className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No mappings found</p></td></tr>}
        </tbody></table>
      </CardContent></Card>
    </div>
  );
}
