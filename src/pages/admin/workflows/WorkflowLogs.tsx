import { useState } from "react";
import { useSearchParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { History, CheckCircle2, XCircle, Clock } from "lucide-react";

export default function WorkflowLogs() {
  const [searchParams] = useSearchParams();
  const workflowId = searchParams.get("workflowId");
  const { data: logs } = trpc.workflows.getLogs.useQuery({ workflowId: Number(workflowId), limit: 100 }, { enabled: !!workflowId });

  const statusBadge = (status: string) => {
    const map: Record<string, { color: string; icon: any }> = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      approved: { color: "bg-green-100 text-green-800", icon: CheckCircle2 },
      rejected: { color: "bg-red-100 text-red-800", icon: XCircle },
      cancelled: { color: "bg-gray-100 text-gray-800", icon: XCircle },
    };
    const s = map[status] || map.pending;
    const Icon = s.icon;
    return <Badge variant="outline" className={s.color}><Icon className="w-3 h-3 mr-1" />{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Workflow Execution Logs</h2><p className="text-sm text-slate-500">Workflow #{workflowId}</p></div>

      <Card>
        <CardHeader><CardTitle>Execution History</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {!logs?.length ? (
            <p className="text-sm text-slate-500 text-center py-8">No executions yet for this workflow.</p>
          ) : logs.map((log: any) => (
            <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <History className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{log.entityType} #{log.entityId}</span>
                    {statusBadge(log.status)}
                  </div>
                  <p className="text-xs text-slate-500">Step {log.currentStep ?? 0} · Requested by User #{log.requestedBy}</p>
                </div>
              </div>
              <span className="text-xs text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
