import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";

const EVENT_OPTIONS = ["invoice.created", "invoice.updated", "order.created", "order.updated", "payment.received", "customer.created", "product.updated"];

export default function SubscriptionCreate() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [form, setForm] = useState({ name: "", url: "", eventTypes: [] as string[] });
  const create = trpc.webhooks.createSubscription.useMutation({ onSuccess: () => { utils.webhooks.listSubscriptions.refetch(); navigate("/app/webhooks/subscriptions"); } });

  const toggleEvent = (evt: string) => {
    setForm(f => ({ ...f, eventTypes: f.eventTypes.includes(evt) ? f.eventTypes.filter(e => e !== evt) : [...f.eventTypes, evt] }));
  };

  return (
    <div className="max-w-xl space-y-4">
      <h2 className="text-2xl font-bold">Create Webhook Subscription</h2>
      <Card><CardContent className="space-y-4 pt-6">
        <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
        <div><Label>Endpoint URL</Label><Input value={form.url} onChange={e => setForm({...form, url: e.target.value})} placeholder="https://example.com/webhook" /></div>
        <div><Label>Event Types</Label><div className="flex flex-wrap gap-2 mt-1">{
          EVENT_OPTIONS.map(evt => (
            <button key={evt} onClick={() => toggleEvent(evt)} className={`px-3 py-1 rounded-full text-xs border ${form.eventTypes.includes(evt) ? "bg-blue-100 border-blue-300 text-blue-700" : "bg-white border-slate-200 text-slate-600"}`}>{evt}</button>
          ))
        }</div></div>
        <Button onClick={() => create.mutate(form as any)} disabled={create.isPending}>Create Subscription</Button>
      </CardContent></Card>
    </div>
  );
}
