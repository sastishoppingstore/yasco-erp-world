import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";

export default function MpsCreate() {
  const nav = useNavigate();
  const [form, setForm] = useState({ productId: 0, scheduleDate: "", plannedQuantity: "", demandSource: "manual" as any, notes: "" });
  const create = trpc.mrp.mpsCreate.useMutation({ onSuccess: () => nav("/app/mrp/mps") });
  const { data: products } = trpc.inventory.productList.useQuery();
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold">Create MPS Entry</h2>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div><Label>Product</Label><Select onValueChange={(v) => setForm({...form, productId: Number(v)})}><SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger><SelectContent>{products?.map((p: any) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Schedule Date</Label><Input type="date" value={form.scheduleDate} onChange={e => setForm({...form, scheduleDate: e.target.value})} /></div>
          <div><Label>Planned Quantity</Label><Input type="number" value={form.plannedQuantity} onChange={e => setForm({...form, plannedQuantity: e.target.value})} /></div>
          <div><Label>Demand Source</Label><Select defaultValue="manual" onValueChange={(v) => setForm({...form, demandSource: v as any})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="forecast">Forecast</SelectItem><SelectItem value="sales_order">Sales Order</SelectItem><SelectItem value="safety_stock">Safety Stock</SelectItem><SelectItem value="manual">Manual</SelectItem></SelectContent></Select></div>
          <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
          <Button onClick={() => create.mutate(form)} disabled={create.isPending}>Create MPS</Button>
        </CardContent>
      </Card>
    </div>
  );
}
