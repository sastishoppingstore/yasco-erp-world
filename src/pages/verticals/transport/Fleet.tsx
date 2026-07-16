import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Truck } from "lucide-react";

export default function FleetPage() {
  const { data: vehicles, refetch } = trpc.assets.vehicleList.useQuery(undefined);
  const createVehicle = trpc.assets.vehicleCreate.useMutation({ onSuccess: () => { refetch(); setOpen(false); } });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ vehicleNumber: "", make: "", model: "", year: 2024, plateNumber: "", vehicleType: "car" as const, fuelType: "petrol" as const });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Fleet</h2><p className="text-slate-500">Vehicle fleet management</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Vehicle</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Vehicle</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createVehicle.mutate(form); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Vehicle #</Label><Input value={form.vehicleNumber} onChange={e => setForm({...form, vehicleNumber: e.target.value})} required /></div>
                <div><Label>Plate #</Label><Input value={form.plateNumber} onChange={e => setForm({...form, plateNumber: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Make</Label><Input value={form.make} onChange={e => setForm({...form, make: e.target.value})} required /></div>
                <div><Label>Model</Label><Input value={form.model} onChange={e => setForm({...form, model: e.target.value})} required /></div>
                <div><Label>Year</Label><Input type="number" value={form.year} onChange={e => setForm({...form, year: Number(e.target.value)})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Type</Label><Select value={form.vehicleType} onValueChange={(v: any) => setForm({...form, vehicleType: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="car">Car</SelectItem><SelectItem value="truck">Truck</SelectItem><SelectItem value="van">Van</SelectItem><SelectItem value="bus">Bus</SelectItem></SelectContent></Select></div>
                <div><Label>Fuel</Label><Select value={form.fuelType} onValueChange={(v: any) => setForm({...form, fuelType: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="petrol">Petrol</SelectItem><SelectItem value="diesel">Diesel</SelectItem><SelectItem value="electric">Electric</SelectItem><SelectItem value="hybrid">Hybrid</SelectItem></SelectContent></Select></div>
              </div>
              <Button type="submit" className="w-full">Add Vehicle</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Vehicles</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Vehicle</TableHead><TableHead>Plate</TableHead><TableHead>Type</TableHead><TableHead>Fuel</TableHead><TableHead className="text-right">Odometer</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {vehicles?.map(v => (
                <TableRow key={v.id}>
                  <TableCell><div className="flex items-center gap-2"><Truck className="w-4 h-4 text-slate-400" /><div><div className="font-medium">{v.vehicleNumber}</div><div className="text-xs text-slate-500">{v.make} {v.model} ({v.year})</div></div></div></TableCell>
                  <TableCell className="font-mono">{v.plateNumber || "—"}</TableCell>
                  <TableCell className="capitalize">{v.vehicleType}</TableCell>
                  <TableCell className="capitalize">{v.fuelType}</TableCell>
                  <TableCell className="text-right font-mono">{v.currentOdometer?.toLocaleString()} km</TableCell>
                  <TableCell><Badge variant={v.status === "active" ? "default" : "secondary"} className="capitalize">{v.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
