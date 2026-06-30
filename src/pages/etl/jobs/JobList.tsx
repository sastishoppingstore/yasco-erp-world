import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import { Search, Workflow, Plus, Play, Eye, FileJson, RefreshCw } from "lucide-react";

export default function JobList() {
  const [search, setSearch] = useState("");
  const { data, isLoading, refetch } = trpc.etl.listJobs.useQuery();
  const executeJob = trpc.etl.executeJob.useMutation({ onSuccess: () => refetch() });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full max-w-sm" />
        <Card><CardContent className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card>
      </div>
    );
  }

  const filtered = (data?.items || []).filter((j: any) =>
    !search || j.jobName?.toLowerCase().includes(search.toLowerCase()) || j.jobCode?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Workflow className="w-6 h-6 text-purple-500" />
          <h2 className="text-2xl font-bold">ETL Jobs</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}><RefreshCw className="w-4 h-4" /></Button>
          <Link to="/app/etl/jobs/new"><Button><Plus className="w-4 h-4 mr-2" />Create Job</Button></Link>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search jobs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card><CardHeader className="pb-0"><CardTitle className="text-base">All Jobs</CardTitle></CardHeader><CardContent className="p-0">
        <table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-3">Name</th><th className="p-3">Code</th><th className="p-3">Schedule</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead><tbody>
          {filtered.map((j: any) => (
            <tr key={j.id} className="border-b hover:bg-slate-50"><td className="p-3 font-medium">{j.jobName}</td><td className="p-3 font-mono text-xs">{j.jobCode}</td><td className="p-3"><Badge variant="outline">{j.scheduleType}</Badge></td><td className="p-3"><Badge variant={j.isActive ? "default" : "secondary"}>{j.isActive ? "Active" : "Inactive"}</Badge></td><td className="p-3"><div className="flex gap-1">
              <Link to={`/app/etl/jobs/${j.id}`}><Button size="sm" variant="outline"><Eye className="w-3 h-3 mr-1" />View</Button></Link>
              <Link to={`/app/etl/jobs/${j.id}/design`}><Button size="sm" variant="outline"><FileJson className="w-3 h-3 mr-1" />Design</Button></Link>
              <Button size="sm" onClick={() => executeJob.mutate({ jobId: j.id })} disabled={executeJob.isPending}><Play className="w-3 h-3 mr-1" />Run</Button>
            </div></td></tr>
          ))}
          {!filtered.length && <tr><td colSpan={5} className="p-12 text-center text-muted-foreground"><Workflow className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No ETL jobs found</p></td></tr>}
        </tbody></table>
      </CardContent></Card>
    </div>
  );
}
