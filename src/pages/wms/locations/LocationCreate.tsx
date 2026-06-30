import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";

export default function LocationCreate() {
  const nav = useNavigate();
  const { data: warehouses } = trpc.inventory.warehouseList.useQuery();
  const [form, setForm] = useState({ warehouseId: 0, locationCode: "", locationType: "rack" as any, aisle: "", rack: "", shelf: "", bin: "", capacity: "100" });
  const create = trpc.wms.locationCreate.useMutation({ onSuccess: () => nav("/app/wms/locations") });
  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold">Create Location</h2>
      <Card><CardContent className="p-6 space-y-4">
        <div><Label>Warehouse</Label><Select onValueChange={(v) => setForm({...form, warehouseId: Number(v)})}><SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger><SelectContent>{warehouses?.map((w: any) => <SelectItem key={w.id} value={String(w.id)}>{w.name}</SelectItem>)}</SelectContent></Select></div>
        <div><Label>Location Code (e.g. A-01-02-03)</Label><Input value={form.locationCode} onChange={e => setForm({...form, locationCode: e.target.value})} /></div>
        <div><Label>Type</Label><Select defaultValue="rack" onValueChange={(v) => setForm({...form, locationType: v as any})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="rack">Rack</SelectItem><SelectItem value="floor">Floor</SelectItem><SelectItem value="bulk">Bulk</SelectItem><SelectItem value="shelf">Shelf</SelectItem><SelectItem value="bin">Bin</SelectItem><SelectItem value="drawer">Drawer</SelectItem></SelectContent></Select></div>
        <div><Label>Aisle</Label><Input value={form.aisle} onChange={e => setForm({...form, aisle: e.target.value})} /></div>
        <div><Label>Rack</Label><Input value={form.rack} onChange={e => setForm({...form, rack: e.target.value})} /></div>
        <div><Label>Shelf</Label><Input value={form.shelf} onChange={e => setForm({...form, shelf: e.target.value})} /></div>
        <div><Label>Bin</Label><Input value={form.bin} onChange={e => setForm({...form, bin: e.target.value})} /></div>
        <div><Label>Capacity</Label><Input type="number" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} /></div>
        <Button onClick={() => create.mutate(form)} disabled={create.isPending}>Create Location</Button>
      </CardContent></Card>
    </div>
  );
}
