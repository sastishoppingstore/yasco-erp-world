import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { useParams } from "react-router";

const STEP_TYPES = ["extract", "transform", "load", "validate", "dedupe", "aggregate", "join", "filter", "map"] as const;

export default function JobDesigner() {
  const { id } = useParams();
  const jobId = Number(id);
  const { data: job, refetch } = trpc.etl.getJob.useQuery({ id: jobId });
  const addStep = trpc.etl.addJobStep.useMutation({ onSuccess: () => refetch() });
  const removeStep = trpc.etl.removeJobStep.useMutation({ onSuccess: () => refetch() });

  if (!job) return <div className="p-6 text-slate-500">Loading job...</div>;

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">{job.jobName}</h2><p className="text-sm text-slate-500">Step Designer</p></div>
      <Card><CardHeader><CardTitle>Pipeline Steps ({job.steps?.length || 0})</CardTitle></CardHeader><CardContent className="space-y-3">
        {job.steps?.map((step: any) => (
          <div key={step.id} className="flex items-center justify-between p-3 rounded border"><div className="flex items-center gap-3"><span className="text-xs text-slate-400">#{step.stepOrder}</span><Badge>{step.stepType}</Badge></div><Button size="sm" variant="destructive" onClick={() => removeStep.mutate({ id: step.id })}>Remove</Button></div>
        ))}
        <div className="pt-4 border-t"><p className="text-sm font-medium mb-2">Add Step</p><div className="flex flex-wrap gap-2">{
          STEP_TYPES.map(t => <Button key={t} size="sm" variant="outline" onClick={() => addStep.mutate({ jobId, stepOrder: (job.steps?.length || 0) + 1, stepType: t })}>{t}</Button>)
        }</div></div>
      </CardContent></Card>
    </div>
  );
}
