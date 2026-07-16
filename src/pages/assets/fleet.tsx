import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Truck, Fuel, Wrench } from "lucide-react";

export default function FleetPage() {
  const { data: vehicles, refetch } = trpc.assets.vehicleList.useQuery();
  const { data: stats } = trpc.assets.assetStats.useQuery();
  const createVehicle = trpc.assets.vehicleCreate.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState({
    vehicleNumber: "", make: "", model: "", year: new Date().getFullYear(),
    plateNumber: "", vin: "", vehicleType: "car" as const, fuelType: "petrol" as const,
    purchaseDate: "", purchaseCost: "0", assignedDriverId: 0,
  });

  const filtered = vehicles?.filter(v => !statusFilter || v.status === statusFilter) || [];

  const statusColors: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700",
    maintenance: "bg-amber-100 text-amber-700",
    retired: "bg-red-100 text-red-700",
    sold: "bg-slate-100 text-slate-700",
  };

  const vehicleTypeIcons: Record<string, any> = { car: Truck, truck: Truck, van: Truck, bus: Truck, bike: Truck, other: Truck };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Fleet Management</h2><p className="text-slate-500">Vehicle tracking, fuel, and maintenance</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Vehicle</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Add Vehicle</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createVehicle.mutate(form); setOpen(false); setForm({ vehicleNumber: "", make: "", model: "", year: new Date().getFullYear(), plateNumber: "", vin: "", vehicleType: "car", fuelType: "petrol", purchaseDate: "", purchaseCost: "0", assignedDriverId: 0 }); }} className="space-y-3">
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
                <div><Label>Type</Label>
                  <Select value={form.vehicleType} onValueChange={(v: any) => setForm({...form, vehicleType: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="car">Car</SelectItem>
                      <SelectItem value="truck">Truck</SelectItem>
                      <SelectItem value="van">Van</SelectItem>
                      <SelectItem value="bus">Bus</SelectItem>
                      <SelectItem value="bike">Bike</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Fuel Type</Label>
                  <Select value={form.fuelType} onValueChange={(v: any) => setForm({...form, fuelType: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="petrol">Petrol</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Purchase Date</Label><Input type="date" value={form.purchaseDate} onChange={e => setForm({...form, purchaseDate: e.target.value})} /></div>
                <div><Label>Purchase Cost</Label><Input type="number" value={form.purchaseCost} onChange={e => setForm({...form, purchaseCost: e.target.value})} /></div>
              </div>
              <div><Label>VIN</Label><Input value={form.vin} onChange={e => setForm({...form, vin: e.target.value})} /></div>
              <Button type="submit" className="w-full">Add Vehicle</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><Truck className="w-5 h-5 text-blue-600" /></div><div><p className="text-sm text-slate-500">Total Vehicles</p><p className="text-xl font-bold">{vehicles?.length || 0}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-emerald-100 rounded-lg"><Truck className="w-5 h-5 text-emerald-600" /></div><div><p className="text-sm text-slate-500">Active</p><p className="text-xl font-bold">{vehicles?.filter(v => v.status === "active").length || 0}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-amber-100 rounded-lg"><Wrench className="w-5 h-5 text-amber-600" /></div><div><p className="text-sm text-slate-500">Maintenance</p><p className="text-xl font-bold">{vehicles?.filter(v => v.status === "maintenance").length || 0}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-purple-100 rounded-lg"><Fuel className="w-5 h-5 text-purple-600" /></div><div><p className="text-sm text-slate-500">Total Assets</p><p className="text-xl font-bold">{stats?.totalAssets || 0}</p></div></CardContent></Card>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setStatusFilter("")} className={!statusFilter ? "bg-slate-100" : ""}>All</Button>
        {["active", "maintenance", "retired", "sold"].map(s => (
          <Button key={s} variant="outline" size="sm" onClick={() => setStatusFilter(s)} className={statusFilter === s ? "bg-slate-100 capitalize" : "capitalize"}>{s.replace("_", " ")}</Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle #</TableHead>
                <TableHead>Make / Model</TableHead>
                <TableHead>Plate</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Fuel</TableHead>
                <TableHead>Year</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(v => (
                <TableRow key={v.id}>
                  <TableCell className="font-mono text-sm font-medium">{v.vehicleNumber}</TableCell>
                  <TableCell><div className="font-medium">{v.make} {v.model}</div></TableCell>
                  <TableCell className="font-mono text-sm">{v.plateNumber || "—"}</TableCell>
                  <TableCell><span className="text-xs capitalize">{v.vehicleType}</span></TableCell>
                  <TableCell><span className="text-xs capitalize">{v.fuelType}</span></TableCell>
                  <TableCell>{v.year || "—"}</TableCell>
                  <TableCell className="text-right font-mono">{Number(v.purchaseCost).toLocaleString()}</TableCell>
                  <TableCell><span className={`text-xs px-2 py-1 rounded-full ${statusColors[v.status] || ""}`}>{v.status?.replace("_", " ") || "active"}</span></TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center text-slate-400 py-8">No vehicles found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
