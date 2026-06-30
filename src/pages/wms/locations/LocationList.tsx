import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import { Search, Package, Plus, RefreshCw } from "lucide-react";

const statusColors: Record<string, string> = {
  available: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  occupied: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  blocked: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  reserved: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
};

export default function LocationList() {
  const [search, setSearch] = useState("");
  const { data: locations, isLoading, refetch } = trpc.wms.locationList.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full max-w-sm" />
        <Card><CardContent className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card>
      </div>
    );
  }

  const filtered = (locations || []).filter((l: any) =>
    !search || l.locationCode?.toLowerCase().includes(search.toLowerCase()) || l.locationType?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6 text-emerald-500" />
          <h2 className="text-2xl font-bold">Storage Locations</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}><RefreshCw className="w-4 h-4" /></Button>
          <Link to="/app/wms/locations/new"><Button><Plus className="w-4 h-4 mr-2" />New Location</Button></Link>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search locations..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card><CardHeader className="pb-0"><CardTitle className="text-base">All Locations</CardTitle></CardHeader><CardContent className="p-0">
        <table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-3">Code</th><th className="p-3">Type</th><th className="p-3">Aisle</th><th className="p-3">Rack</th><th className="p-3">Shelf</th><th className="p-3">Bin</th><th className="p-3">Capacity</th><th className="p-3">Status</th></tr></thead><tbody>
          {filtered.map((l: any) => (
            <tr key={l.id} className="border-b hover:bg-slate-50"><td className="p-3 font-mono text-xs font-medium">{l.locationCode}</td><td className="p-3"><Badge variant="outline">{l.locationType}</Badge></td><td className="p-3">{l.aisle || "—"}</td><td className="p-3">{l.rack || "—"}</td><td className="p-3">{l.shelf || "—"}</td><td className="p-3">{l.bin || "—"}</td><td className="p-3">{l.capacity || "—"}</td><td className="p-3"><Badge className={`${statusColors[l.status] || ""} capitalize`}>{l.status}</Badge></td></tr>
          ))}
          {!filtered.length && <tr><td colSpan={8} className="p-12 text-center text-muted-foreground"><Package className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No locations found</p></td></tr>}
        </tbody></table>
      </CardContent></Card>
    </div>
  );
}
