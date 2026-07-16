import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";

export default function JobCreate() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [form, setForm] = useState({ jobName: "", jobCode: "", scheduleType: "manual", description: "" });
  const create = trpc.etl.createJob.useMutation({ onSuccess: () => { utils.etl.listJobs.refetch(); navigate("/app/etl/jobs"); } });

  return (
    <div className="max-w-xl space-y-4">
      <h2 className="text-2xl font-bold">Create ETL Job</h2>
      <Card><CardContent className="space-y-4 pt-6">
        <div><Label>Job Name</Label><Input value={form.jobName} onChange={e => setForm({...form, jobName: e.target.value})} /></div>
        <div><Label>Job Code</Label><Input value={form.jobCode} onChange={e => setForm({...form, jobCode: e.target.value})} /></div>
        <div><Label>Schedule Type</Label><Select value={form.scheduleType} onValueChange={v => setForm({...form, scheduleType: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="manual">Manual</SelectItem><SelectItem value="cron">Cron</SelectItem><SelectItem value="event">Event</SelectItem></SelectContent></Select></div>
        <Button onClick={() => create.mutate(form as any)} disabled={create.isPending}>Create Job</Button>
      </CardContent></Card>
    </div>
  );
}
