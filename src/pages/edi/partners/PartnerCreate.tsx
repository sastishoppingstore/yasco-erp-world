import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";

export default function PartnerCreate() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [form, setForm] = useState({ partnerCode: "", partnerName: "", partnerType: "customer", ediStandard: "edifact" });
  const create = trpc.edi.createPartner.useMutation({ onSuccess: () => { utils.edi.listPartners.refetch(); navigate("/app/edi/partners"); } });

  return (
    <div className="max-w-xl space-y-4">
      <h2 className="text-2xl font-bold">Create EDI Partner</h2>
      <Card><CardContent className="space-y-4 pt-6">
        <div><Label>Partner Code</Label><Input value={form.partnerCode} onChange={e => setForm({...form, partnerCode: e.target.value})} /></div>
        <div><Label>Partner Name</Label><Input value={form.partnerName} onChange={e => setForm({...form, partnerName: e.target.value})} /></div>
        <div><Label>Partner Type</Label><Select value={form.partnerType} onValueChange={v => setForm({...form, partnerType: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="customer">Customer</SelectItem><SelectItem value="supplier">Supplier</SelectItem><SelectItem value="logistics">Logistics</SelectItem><SelectItem value="bank">Bank</SelectItem><SelectItem value="govt">Government</SelectItem></SelectContent></Select></div>
        <div><Label>EDI Standard</Label><Select value={form.ediStandard} onValueChange={v => setForm({...form, ediStandard: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="edifact">EDIFACT</SelectItem><SelectItem value="x12">X12</SelectItem><SelectItem value="tradacoms">TRADACOMS</SelectItem><SelectItem value="custom">Custom</SelectItem></SelectContent></Select></div>
        <Button onClick={() => create.mutate(form as any)} disabled={create.isPending}>Create Partner</Button>
      </CardContent></Card>
    </div>
  );
}
