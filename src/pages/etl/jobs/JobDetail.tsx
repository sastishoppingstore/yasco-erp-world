import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Play, Workflow, Clock, CheckCircle2, XCircle, Timer } from "lucide-react";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const jobId = Number(id);
  const { data: job, isLoading: jobLoading, refetch } = trpc.etl.getJob.useQuery({ id: jobId });
  const { data: logs, isLoading: logsLoading } = trpc.etl.jobLogs.useQuery({ jobId });
  const execute = trpc.etl.executeJob.useMutation({ onSuccess: () => refetch() });

  if (jobLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
        <Card><CardContent className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
        <Card><CardContent className="p-12 text-center text-muted-foreground"><Workflow className="w-12 h-12 mx-auto mb-3 opacity-50" /><p className="font-medium">Job not found</p></CardContent></Card>
      </div>
    );
  }

  const completed = (logs || []).filter((l: any) => l.status === "completed").length;
  const failed = (logs || []).filter((l: any) => l.status === "failed").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-4 h-4" /></Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{job.jobName}</h2>
            <Badge variant={job.isActive ? "default" : "secondary"}>{job.isActive ? "Active" : "Inactive"}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{job.jobCode} · {job.scheduleType} schedule</p>
        </div>
        <Button onClick={() => execute.mutate({ jobId })} disabled={execute.isPending}><Play className="w-4 h-4 mr-2" />Run Job</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30"><Clock className="w-5 h-5 text-blue-500" /></div>
          <div><p className="text-xs text-muted-foreground">Total Runs</p><p className="text-xl font-bold">{(logs || []).length}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30"><CheckCircle2 className="w-5 h-5 text-green-500" /></div>
          <div><p className="text-xs text-muted-foreground">Completed</p><p className="text-xl font-bold text-green-600">{completed}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30"><XCircle className="w-5 h-5 text-red-500" /></div>
          <div><p className="text-xs text-muted-foreground">Failed</p><p className="text-xl font-bold text-red-600">{failed}</p></div>
        </CardContent></Card>
      </div>

      <Card><CardHeader><CardTitle>Execution History</CardTitle></CardHeader><CardContent className="p-0">
        {logsLoading ? (
          <div className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : (
          <table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-3">Execution ID</th><th className="p-3">Status</th><th className="p-3">Rows</th><th className="p-3">Duration</th><th className="p-3">Time</th></tr></thead><tbody>
            {(logs || []).length > 0 ? (logs || []).map((log: any) => (
              <tr key={log.id} className="border-b hover:bg-slate-50"><td className="p-3 font-mono text-xs">{log.executionId?.slice(0, 12) || "—"}</td><td className="p-3"><Badge variant={log.status === "completed" ? "default" : log.status === "failed" ? "destructive" : "secondary"}>{log.status}</Badge></td><td className="p-3">{log.rowsProcessed ?? "—"}</td><td className="p-3 flex items-center gap-1"><Timer className="w-3 h-3 text-muted-foreground" />{log.durationMs ? `${log.durationMs}ms` : "—"}</td><td className="p-3 text-xs text-slate-400">{log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}</td></tr>
            )) : <tr><td colSpan={5} className="p-12 text-center text-muted-foreground"><Workflow className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No execution history</p></td></tr>}
          </tbody></table>
        )}
      </CardContent></Card>

      {job.description && (
        <Card><CardHeader><CardTitle>Description</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{job.description}</p></CardContent></Card>
      )}
    </div>
  );
}
