import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";

export default function ZoneCreate() {
  const nav = useNavigate();
  const { data: warehouses } = trpc.inventory.warehouseList.useQuery();
  const [form, setForm] = useState({ warehouseId: 0, zoneCode: "", zoneName: "", zoneType: "storage" as any, capacity: "1000", colorCode: "" });
  const create = trpc.wms.zoneCreate.useMutation({ onSuccess: () => nav("/app/wms/zones") });
  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold">Create Zone</h2>
      <Card><CardContent className="p-6 space-y-4">
        <div><Label>Warehouse</Label><Select onValueChange={(v) => setForm({...form, warehouseId: Number(v)})}><SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger><SelectContent>{warehouses?.map((w: any) => <SelectItem key={w.id} value={String(w.id)}>{w.name}</SelectItem>)}</SelectContent></Select></div>
        <div><Label>Zone Code</Label><Input value={form.zoneCode} onChange={e => setForm({...form, zoneCode: e.target.value})} /></div>
        <div><Label>Zone Name</Label><Input value={form.zoneName} onChange={e => setForm({...form, zoneName: e.target.value})} /></div>
        <div><Label>Type</Label><Select defaultValue="storage" onValueChange={(v) => setForm({...form, zoneType: v as any})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="storage">Storage</SelectItem><SelectItem value="picking">Picking</SelectItem><SelectItem value="putaway">Putaway</SelectItem><SelectItem value="shipping">Shipping</SelectItem><SelectItem value="receiving">Receiving</SelectItem><SelectItem value="quarantine">Quarantine</SelectItem></SelectContent></Select></div>
        <div><Label>Capacity</Label><Input type="number" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} /></div>
        <div><Label>Color Code</Label><Input value={form.colorCode} onChange={e => setForm({...form, colorCode: e.target.value})} /></div>
        <Button onClick={() => create.mutate(form)} disabled={create.isPending}>Create Zone</Button>
      </CardContent></Card>
    </div>
  );
}
