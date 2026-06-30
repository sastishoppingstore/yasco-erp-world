import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import { Search, FileText, Plus } from "lucide-react";

export default function DocumentTypeList() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = trpc.edi.listDocumentTypes.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Card><CardContent className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card>
      </div>
    );
  }

  const filtered = (data?.items || []).filter((d: any) =>
    !search || d.documentName?.toLowerCase().includes(search.toLowerCase()) || d.documentCode?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-green-500" />
          <h2 className="text-2xl font-bold">Document Types</h2>
        </div>
        <div className="flex gap-2">
          <Link to="/app/edi/documents/mappings"><Button variant="outline">Mappings</Button></Link>
          <Button><Plus className="w-4 h-4 mr-2" />New Document Type</Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search document types..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card><CardHeader className="pb-0"><CardTitle className="text-base">All Document Types</CardTitle></CardHeader><CardContent className="p-0">
        <table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-3">Code</th><th className="p-3">Name</th><th className="p-3">Direction</th><th className="p-3">Standard</th><th className="p-3">Status</th></tr></thead><tbody>
          {filtered.map((d: any) => (
            <tr key={d.id} className="border-b hover:bg-slate-50"><td className="p-3 font-mono text-xs font-medium">{d.documentCode}</td><td className="p-3">{d.documentName}</td><td className="p-3"><Badge variant={d.direction === "inbound" ? "secondary" : "default"}>{d.direction}</Badge></td><td className="p-3">{d.ediStandard || "—"}</td><td className="p-3"><Badge variant={d.status === "active" ? "default" : "secondary"}>{d.status}</Badge></td></tr>
          ))}
          {!filtered.length && <tr><td colSpan={5} className="p-12 text-center text-muted-foreground"><FileText className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No document types found</p></td></tr>}
        </tbody></table>
      </CardContent></Card>
    </div>
  );
}
