import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Package } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-slate-100 text-slate-700", picked_up: "bg-blue-100 text-blue-700",
  in_transit: "bg-amber-100 text-amber-700", delivered: "bg-emerald-100 text-emerald-700",
  exception: "bg-red-100 text-red-700", cancelled: "bg-gray-100 text-gray-700",
};

export default function ShipmentsPage() {
  const { data: shipments, refetch } = trpc.transport.shipmentList.useQuery(undefined);
  const createShipment = trpc.transport.shipmentCreate.useMutation({ onSuccess: () => { refetch(); setOpen(false); } });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ trackingNumber: "", origin: "", destination: "", weight: "", volume: "" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Shipments</h2><p className="text-slate-500">Shipment tracking and logistics</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Shipment</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Shipment</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createShipment.mutate(form); }} className="space-y-3">
              <div><Label>Tracking #</Label><Input value={form.trackingNumber} onChange={e => setForm({...form, trackingNumber: e.target.value})} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Origin</Label><Input value={form.origin} onChange={e => setForm({...form, origin: e.target.value})} required /></div>
                <div><Label>Destination</Label><Input value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Weight</Label><Input type="number" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} /></div>
                <div><Label>Volume</Label><Input type="number" value={form.volume} onChange={e => setForm({...form, volume: e.target.value})} /></div>
              </div>
              <Button type="submit" className="w-full">Create Shipment</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Tracking Board</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Tracking #</TableHead><TableHead>Origin → Destination</TableHead><TableHead>Vehicle</TableHead><TableHead>Driver</TableHead><TableHead>Est. Delivery</TableHead><TableHead>Last Location</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {shipments?.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-sm"><div className="flex items-center gap-2"><Package className="w-4 h-4 text-slate-400" />{s.trackingNumber}</div></TableCell>
                  <TableCell className="text-sm">{s.origin} → {s.destination}</TableCell>
                  <TableCell>{s.vehicleId || "—"}</TableCell>
                  <TableCell>{s.driverId || "—"}</TableCell>
                  <TableCell className="text-sm">{s.estimatedDelivery ? new Date(s.estimatedDelivery).toLocaleDateString() : "—"}</TableCell>
                  <TableCell className="text-sm">{s.lastLocation || "—"}</TableCell>
                  <TableCell><Badge className={statusColors[s.status]}>{s.status.replace("_", " ")}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
