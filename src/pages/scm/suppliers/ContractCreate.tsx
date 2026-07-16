import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";

export default function ContractCreate() {
  const nav = useNavigate();
  const { data: suppliers } = trpc.purchase.supplierList.useQuery();
  const [form, setForm] = useState({ supplierId: 0, contractNumber: "", title: "", startDate: "", endDate: "", terms: "", value: "0", renewalReminderDays: 30 });
  const create = trpc.scm.contractCreate.useMutation({ onSuccess: () => nav("/app/scm/contracts") });
  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold">Create Contract</h2>
      <Card><CardContent className="p-6 space-y-4">
        <div><Label>Supplier</Label><Select onValueChange={(v) => setForm({...form, supplierId: Number(v)})}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{suppliers?.map((s: any) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent></Select></div>
        <div><Label>Contract Number</Label><Input value={form.contractNumber} onChange={e => setForm({...form, contractNumber: e.target.value})} /></div>
        <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
        <div className="grid grid-cols-2 gap-4"><div><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} /></div><div><Label>End Date</Label><Input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} /></div></div>
        <div><Label>Terms</Label><textarea className="w-full border rounded p-2" rows={3} value={form.terms} onChange={e => setForm({...form, terms: e.target.value})} /></div>
        <div><Label>Value</Label><Input type="number" value={form.value} onChange={e => setForm({...form, value: e.target.value})} /></div>
        <div><Label>Renewal Reminder (days)</Label><Input type="number" value={form.renewalReminderDays} onChange={e => setForm({...form, renewalReminderDays: Number(e.target.value)})} /></div>
        <Button onClick={() => create.mutate(form)} disabled={create.isPending}>Create Contract</Button>
      </CardContent></Card>
    </div>
  );
}
