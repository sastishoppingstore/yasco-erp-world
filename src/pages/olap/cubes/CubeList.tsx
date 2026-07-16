import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import { Search, Box, Plus, RefreshCw, Eye, Play } from "lucide-react";

export default function CubeList() {
  const [search, setSearch] = useState("");
  const { data, isLoading, refetch } = trpc.olap.listCubes.useQuery();
  const processCube = trpc.olap.runCubeProcess.useMutation({ onSuccess: () => refetch() });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full max-w-sm" />
        <Card><CardContent className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card>
      </div>
    );
  }

  const filtered = (data || []).filter((c: any) =>
    !search || c.cubeName?.toLowerCase().includes(search.toLowerCase()) || c.cubeCode?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Box className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold">Cubes</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}><RefreshCw className="w-4 h-4" /></Button>
          <Link to="/app/olap/cubes/new"><Button><Plus className="w-4 h-4 mr-2" />Create Cube</Button></Link>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search cubes..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card><CardHeader className="pb-0"><CardTitle className="text-base">OLAP Cubes</CardTitle></CardHeader><CardContent className="p-0">
        <table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-3">Name</th><th className="p-3">Code</th><th className="p-3">Status</th><th className="p-3">Dimensions</th><th className="p-3">Last Processed</th><th className="p-3">Actions</th></tr></thead><tbody>
          {filtered.map((c: any) => (
            <tr key={c.id} className="border-b hover:bg-slate-50"><td className="p-3 font-medium">{c.cubeName}</td><td className="p-3 font-mono text-xs">{c.cubeCode}</td><td className="p-3"><Badge variant={c.status === "active" ? "default" : "secondary"} className="capitalize">{c.status}</Badge></td><td className="p-3">{c.dimensionCount ?? "—"}</td><td className="p-3 text-xs text-slate-400">{c.lastProcessedAt ? new Date(c.lastProcessedAt).toLocaleString() : "—"}</td><td className="p-3"><div className="flex gap-1">
              <Link to={`/app/olap/cubes/${c.id}`}><Button size="sm" variant="outline"><Eye className="w-3 h-3 mr-1" />Design</Button></Link>
              <Button size="sm" variant="outline" onClick={() => processCube.mutate({ cubeId: c.id })} disabled={processCube.isPending}><Play className="w-3 h-3 mr-1" />Process</Button>
            </div></td></tr>
          ))}
          {!filtered.length && <tr><td colSpan={6} className="p-12 text-center text-muted-foreground"><Box className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No cubes found</p></td></tr>}
        </tbody></table>
      </CardContent></Card>
    </div>
  );
}
