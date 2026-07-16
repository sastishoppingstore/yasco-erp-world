import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import { Search, Cable, Plus, Play, RefreshCw } from "lucide-react";

const typeColors: Record<string, string> = {
  mysql: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  postgres: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  s3: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  ftp: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  http: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  csv: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
  excel: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  api: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

export default function ConnectorList() {
  const [search, setSearch] = useState("");
  const { data, isLoading, refetch } = trpc.etl.listConnectors.useQuery();
  const testConn = trpc.etl.testConnector.useMutation();

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
    !search || c.connectorName?.toLowerCase().includes(search.toLowerCase()) || c.connectorType?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Cable className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold">Connectors</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}><RefreshCw className="w-4 h-4" /></Button>
          <Link to="/app/etl/connectors/new"><Button><Plus className="w-4 h-4 mr-2" />Add Connector</Button></Link>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search connectors..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c: any) => (
          <Card key={c.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Badge className={typeColors[c.connectorType] || "bg-slate-100 text-slate-700"}>{c.connectorType}</Badge>
                  <h3 className="font-semibold mt-2">{c.connectorName}</h3>
                </div>
                <Badge variant={c.isActive ? "default" : "secondary"}>{c.isActive ? "Active" : "Inactive"}</Badge>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                {c.host && <p>Host: {c.host}</p>}
                {c.database && <p>Database: {c.database}</p>}
                {c.port && <p>Port: {c.port}</p>}
              </div>
              <div className="mt-3 pt-3 border-t flex gap-2">
                <Button size="sm" variant="outline" onClick={() => testConn.mutate({ id: c.id })} disabled={testConn.isPending}><Play className="w-3 h-3 mr-1" />Test</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!filtered.length && (
          <div className="col-span-full">
            <Card><CardContent className="p-12 text-center text-muted-foreground"><Cable className="w-10 h-10 mx-auto mb-3 opacity-50" /><p className="font-medium">No connectors found</p></CardContent></Card>
          </div>
        )}
      </div>
    </div>
  );
}
