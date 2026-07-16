import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Car, Search, ArrowLeft, AlertTriangle, Calendar, Timer } from "lucide-react";
import ActionButton3D from "@/components/ui/ActionButton3D";

export default function VehiclesPage() {
  const navigate = useNavigate();
  const { data: vehicles, refetch } = trpc.workshop.vehicleList.useQuery(undefined);
  const createVehicle = trpc.workshop.vehicleCreate.useMutation({ onSuccess: () => { refetch(); setOpen(false); } });
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    customerId: "1", make: "", model: "", year: new Date().getFullYear(),
    plateNumber: "", vin: "", color: "", mileage: "",
    nextServiceMileage: "", nextServiceDate: "",
    insuranceCompany: "", policyNumber: "", insuranceExpiry: "", registrationExpiry: "", notes: "",
  });

  const filteredVehicles = vehicles?.filter(v =>
    v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.plateNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.vin || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Vehicles</h2>
          <p className="text-slate-500">Customer vehicle registry with service history</p>
        </div>
        <div className="flex gap-2">
          <ActionButton3D icon={<ArrowLeft className="size-4" />} label="Dashboard" color="slate" onClick={() => navigate("/app/verticals/workshop")} />
          <ActionButton3D icon={<Plus className="size-4" />} label="Add Vehicle" color="blue" onClick={() => setOpen(true)} />
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        <Input
          placeholder="Search by make, model, plate, VIN..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Plate</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Mileage</TableHead>
                <TableHead>Insurance</TableHead>
                <TableHead>Next Service</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles?.map(v => (
                <TableRow key={v.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Car className="size-4 text-slate-400" />
                      <div>
                        <span className="font-medium">{v.make} {v.model}</span>
                        {v.color && <span className="text-xs text-slate-500 ml-2">({v.color})</span>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{v.plateNumber || "—"}</TableCell>
                  <TableCell>{v.year}</TableCell>
                  <TableCell>{v.mileage ? `${v.mileage} km` : "—"}</TableCell>
                  <TableCell>
                    {v.insuranceCompany ? (
                      <Badge variant="outline" className="text-xs">{v.insuranceCompany}</Badge>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {v.nextServiceMileage && (
                        <span className="text-xs text-slate-500">{v.nextServiceMileage} km</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <ActionButton3D icon={<Search className="size-3" />} label="History" color="blue" size="xs" onClick={() => navigate(`/app/verticals/workshop/job-cards?vehicle=${v.id}`)} />
                  </TableCell>
                </TableRow>
              ))}
              {(!filteredVehicles || filteredVehicles.length === 0) && (
                <TableRow><TableCell colSpan={7} className="text-center text-slate-500 py-12">
                  {searchTerm ? "No vehicles match your search" : "No vehicles registered yet"}
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Register Vehicle</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            createVehicle.mutate({
              customerId: parseInt(form.customerId), make: form.make, model: form.model,
              year: form.year, plateNumber: form.plateNumber, vin: form.vin,
              color: form.color, mileage: form.mileage,
              nextServiceMileage: form.nextServiceMileage, nextServiceDate: form.nextServiceDate,
              insuranceCompany: form.insuranceCompany, policyNumber: form.policyNumber,
              insuranceExpiry: form.insuranceExpiry, registrationExpiry: form.registrationExpiry,
              notes: form.notes,
            });
          }} className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Make *</Label><Input value={form.make} onChange={e => setForm({...form, make: e.target.value})} required placeholder="Toyota" /></div>
              <div><Label>Model *</Label><Input value={form.model} onChange={e => setForm({...form, model: e.target.value})} required placeholder="Camry" /></div>
              <div><Label>Year *</Label><Input type="number" value={form.year} onChange={e => setForm({...form, year: parseInt(e.target.value) || new Date().getFullYear()})} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Plate Number</Label><Input value={form.plateNumber} onChange={e => setForm({...form, plateNumber: e.target.value})} placeholder="ABC 1234" /></div>
              <div><Label>VIN</Label><Input value={form.vin} onChange={e => setForm({...form, vin: e.target.value})} placeholder="VIN number" /></div>
              <div><Label>Color</Label><Input value={form.color} onChange={e => setForm({...form, color: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Mileage</Label><Input value={form.mileage} onChange={e => setForm({...form, mileage: e.target.value})} placeholder="50000" /></div>
              <div><Label>Next Service At</Label><Input value={form.nextServiceMileage} onChange={e => setForm({...form, nextServiceMileage: e.target.value})} placeholder="60000 km" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Insurance Company</Label><Input value={form.insuranceCompany} onChange={e => setForm({...form, insuranceCompany: e.target.value})} /></div>
              <div><Label>Policy #</Label><Input value={form.policyNumber} onChange={e => setForm({...form, policyNumber: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Insurance Expiry</Label><Input type="date" value={form.insuranceExpiry} onChange={e => setForm({...form, insuranceExpiry: e.target.value})} /></div>
              <div><Label>Registration Expiry</Label><Input type="date" value={form.registrationExpiry} onChange={e => setForm({...form, registrationExpiry: e.target.value})} /></div>
            </div>
            <Button type="submit" className="w-full">Register Vehicle</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
