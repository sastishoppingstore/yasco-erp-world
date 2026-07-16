import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Cable, Workflow, Repeat, ShieldCheck, Database, Activity } from "lucide-react";

export default function EtlDashboardPage() {
  const { data: dashboard, isLoading } = trpc.etl.etlDashboard.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Database className="w-6 h-6 text-purple-500" />
        <div><h2 className="text-2xl font-bold">ETL Pipeline</h2><p className="text-sm text-muted-foreground">Extract, Transform, Load management</p></div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30"><Workflow className="w-6 h-6 text-purple-500" /></div>
          <div><p className="text-sm text-muted-foreground">Total Jobs</p><p className="text-3xl font-bold">{dashboard?.totalJobs ?? 0}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30"><Activity className="w-6 h-6 text-green-500" /></div>
          <div><p className="text-sm text-muted-foreground">Active Jobs</p><p className="text-3xl font-bold text-green-600">{dashboard?.activeJobs ?? 0}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30"><Database className="w-6 h-6 text-blue-500" /></div>
          <div><p className="text-sm text-muted-foreground">Total Runs</p><p className="text-3xl font-bold">{dashboard?.totalRuns ?? 0}</p></div>
        </CardContent></Card>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Link to="/app/etl/connectors"><Button><Cable className="w-4 h-4 mr-2" />Connectors</Button></Link>
        <Link to="/app/etl/jobs"><Button variant="outline"><Workflow className="w-4 h-4 mr-2" />Jobs</Button></Link>
        <Link to="/app/etl/transformations"><Button variant="outline"><Repeat className="w-4 h-4 mr-2" />Transformations</Button></Link>
        <Link to="/app/etl/quality"><Button variant="outline"><ShieldCheck className="w-4 h-4 mr-2" />Data Quality</Button></Link>
      </div>
      <Card><CardHeader><CardTitle>Recent Runs</CardTitle></CardHeader><CardContent className="space-y-2">
        {dashboard?.recentLogs?.length ? dashboard.recentLogs.map((log: any) => (
          <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border text-sm hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
            <span className="font-mono text-xs font-medium text-muted-foreground">#{log.executionId?.slice(0, 8)}</span>
            <span className={log.status === "completed" ? "text-green-600 font-medium" : log.status === "failed" ? "text-red-600 font-medium" : "text-amber-600 font-medium"}>{log.status}</span>
            <span>{log.rowsProcessed} rows</span>
            <span className="text-xs text-slate-400">{log.durationMs ? `${log.durationMs}ms` : "—"}</span>
          </div>
        )) : <p className="text-sm text-center text-muted-foreground py-8">No recent ETL runs</p>}
      </CardContent></Card>
    </div>
  );
}
