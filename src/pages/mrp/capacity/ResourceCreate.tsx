import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";

export default function ResourceCreate() {
  const nav = useNavigate();
  const [form, setForm] = useState({ resourceCode: "", resourceName: "", resourceType: "machine" as any, availableHours: "8", costPerHour: "0" });
  const create = trpc.mrp.resourceCreate.useMutation({ onSuccess: () => nav("/app/mrp/capacity") });
  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold">Create Resource</h2>
      <Card><CardContent className="p-6 space-y-4">
        <div><Label>Code</Label><Input value={form.resourceCode} onChange={e => setForm({...form, resourceCode: e.target.value})} /></div>
        <div><Label>Name</Label><Input value={form.resourceName} onChange={e => setForm({...form, resourceName: e.target.value})} /></div>
        <div><Label>Type</Label><Select defaultValue="machine" onValueChange={(v) => setForm({...form, resourceType: v as any})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="machine">Machine</SelectItem><SelectItem value="labor">Labor</SelectItem><SelectItem value="workstation">Workstation</SelectItem><SelectItem value="work_center">Work Center</SelectItem></SelectContent></Select></div>
        <div><Label>Available Hours</Label><Input type="number" value={form.availableHours} onChange={e => setForm({...form, availableHours: e.target.value})} /></div>
        <div><Label>Cost per Hour</Label><Input type="number" value={form.costPerHour} onChange={e => setForm({...form, costPerHour: e.target.value})} /></div>
        <Button onClick={() => create.mutate(form)} disabled={create.isPending}>Create Resource</Button>
      </CardContent></Card>
    </div>
  );
}
