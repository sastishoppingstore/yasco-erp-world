import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/providers/trpc";

export default function EvaluationList() {
  const { data: evals, refetch } = trpc.scm.evaluationList.useQuery();
  const { data: suppliers } = trpc.purchase.supplierList.useQuery();
  const [form, setForm] = useState({ supplierId: 0, evaluationDate: "", qualityScore: "0", deliveryScore: "0", priceScore: "0", serviceScore: "0", notes: "" });
  const create = trpc.scm.evaluationCreate.useMutation({ onSuccess: () => { refetch(); setForm({ supplierId: 0, evaluationDate: "", qualityScore: "0", deliveryScore: "0", priceScore: "0", serviceScore: "0", notes: "" }); } });
  return (
    <div className="space-y-4">
      <div><h2 className="text-2xl font-bold">Supplier Evaluations</h2></div>
      <Card><CardHeader><CardTitle>New Evaluation</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Supplier</Label><Select onValueChange={(v) => setForm({...form, supplierId: Number(v)})}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{suppliers?.map((s: any) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Date</Label><Input type="date" value={form.evaluationDate} onChange={e => setForm({...form, evaluationDate: e.target.value})} /></div>
          <div><Label>Quality (0-100)</Label><Input type="number" value={form.qualityScore} onChange={e => setForm({...form, qualityScore: e.target.value})} /></div>
          <div><Label>Delivery (0-100)</Label><Input type="number" value={form.deliveryScore} onChange={e => setForm({...form, deliveryScore: e.target.value})} /></div>
          <div><Label>Price (0-100)</Label><Input type="number" value={form.priceScore} onChange={e => setForm({...form, priceScore: e.target.value})} /></div>
          <div><Label>Service (0-100)</Label><Input type="number" value={form.serviceScore} onChange={e => setForm({...form, serviceScore: e.target.value})} /></div>
        </div>
        <Button onClick={() => create.mutate(form)} disabled={create.isPending}>Submit Evaluation</Button>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Past Evaluations</CardTitle></CardHeader><CardContent>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left"><th className="pb-2 font-medium">Supplier</th><th className="pb-2 font-medium">Date</th><th className="pb-2 font-medium">Quality</th><th className="pb-2 font-medium">Delivery</th><th className="pb-2 font-medium">Price</th><th className="pb-2 font-medium">Service</th><th className="pb-2 font-medium">Overall</th><th className="pb-2 font-medium">Category</th></tr></thead>
          <tbody>
            {evals?.map((e: any) => (
              <tr key={e.id} className="border-b last:border-0"><td className="py-2">{e.supplierId}</td><td className="py-2">{e.evaluationDate}</td><td className="py-2">{e.qualityScore}</td><td className="py-2">{e.deliveryScore}</td><td className="py-2">{e.priceScore}</td><td className="py-2">{e.serviceScore}</td><td className="py-2 font-semibold">{e.overallScore}</td><td className="py-2"><span className={`px-2 py-0.5 rounded text-xs ${e.category === 'excellent' ? 'bg-green-100 text-green-700' : e.category === 'good' ? 'bg-blue-100 text-blue-700' : e.category === 'average' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{e.category}</span></td></tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
    </div>
  );
}
