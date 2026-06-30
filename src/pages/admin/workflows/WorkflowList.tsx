import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/providers/trpc";
import { Workflow, Play, Plus, History, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { Link } from "react-router";

export default function WorkflowList() {
  const { data: workflows, refetch } = trpc.workflows.list.useQuery();
  const toggleWf = trpc.workflows.toggle.useMutation({ onSuccess: () => refetch() });
  const deleteWf = trpc.workflows.delete.useMutation({ onSuccess: () => refetch() });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Workflows</h2><p className="text-sm text-slate-500">Automate business processes with no-code workflows</p></div>
        <Link to="/app/admin/workflows/editor"><Button><Plus className="w-4 h-4 mr-2" />Create Workflow</Button></Link>
      </div>

      <div className="space-y-3">
        {!workflows?.length ? (
          <Card><CardContent className="py-12 text-center text-slate-500">No workflows created yet. Create your first workflow to automate processes.</CardContent></Card>
        ) : workflows.map((wf: any) => (
          <Card key={wf.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Workflow className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{wf.name}</p>
                    <Badge variant="outline" className="text-xs">{wf.entityType}</Badge>
                    <Badge variant="outline" className={`text-xs ${wf.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                      {wf.isActive ? "Active" : "Disabled"}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    Trigger: {wf.trigger.type} · {wf.steps?.length ?? 0} steps
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link to={`/app/admin/workflows/editor?id=${wf.id}`}>
                  <Button variant="ghost" size="sm"><Play className="w-4 h-4" /></Button>
                </Link>
                <Link to={`/app/admin/workflows/logs?workflowId=${wf.id}`}>
                  <Button variant="ghost" size="sm"><History className="w-4 h-4" /></Button>
                </Link>
                <Switch checked={wf.isActive} onCheckedChange={(v) => toggleWf.mutate({ id: wf.id, isActive: v })} />
                <Button variant="ghost" size="sm" onClick={() => deleteWf.mutate({ id: wf.id })}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
