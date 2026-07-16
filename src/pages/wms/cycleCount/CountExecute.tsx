import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";

export default function CountExecute() {
  const nav = useNavigate();
  const [form, setForm] = useState({ scheduleId: 0, locationId: 0, productId: 0, expectedQuantity: "0", actualQuantity: "0", varianceReason: "" as any });
  const create = trpc.wms.cycleCountEntryCreate.useMutation({ onSuccess: () => nav("/app/wms/cycle-count") });
  const { data: schedules } = trpc.wms.cycleCountList.useQuery();
  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold">Execute Cycle Count</h2>
      <Card><CardContent className="p-6 space-y-4">
        <div><Label>Schedule</Label><Select onValueChange={(v) => setForm({...form, scheduleId: Number(v)})}><SelectTrigger><SelectValue placeholder="Select schedule" /></SelectTrigger><SelectContent>{(schedules || []).filter((s: any) => s.status !== 'completed').map((s: any) => <SelectItem key={s.id} value={String(s.id)}>Schedule #{s.id} - {s.countDate}</SelectItem>)}</SelectContent></Select></div>
        <div><Label>Location ID</Label><Input type="number" value={form.locationId || ''} onChange={e => setForm({...form, locationId: Number(e.target.value)})} /></div>
        <div><Label>Product ID</Label><Input type="number" value={form.productId || ''} onChange={e => setForm({...form, productId: Number(e.target.value)})} /></div>
        <div><Label>Expected Quantity</Label><Input type="number" value={form.expectedQuantity} onChange={e => setForm({...form, expectedQuantity: e.target.value})} /></div>
        <div><Label>Actual Quantity</Label><Input type="number" value={form.actualQuantity} onChange={e => setForm({...form, actualQuantity: e.target.value})} /></div>
        <div><Label>Variance Reason</Label><Select onValueChange={(v) => setForm({...form, varianceReason: v as any})}><SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger><SelectContent><SelectItem value="mispick">Mispick</SelectItem><SelectItem value="putaway_error">Putaway Error</SelectItem><SelectItem value="damage">Damage</SelectItem><SelectItem value="theft">Theft</SelectItem><SelectItem value="system_error">System Error</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
        <Button onClick={() => create.mutate(form)} disabled={create.isPending}>Record Count</Button>
      </CardContent></Card>
    </div>
  );
}
