import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Wrench, Fuel, Clock, MapPin, AlertTriangle } from "lucide-react";
import ActionButton3D from "@/components/ui/ActionButton3D";

const statusColors: Record<string, string> = {
  available: "bg-emerald-100 text-emerald-700 border-emerald-200",
  in_use: "bg-blue-100 text-blue-700 border-blue-200",
  maintenance: "bg-amber-100 text-amber-700 border-amber-200",
  retired: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function EquipmentPage() {
  const { data: equipment, refetch } = trpc.construction.equipmentList.useQuery(undefined);
  const createEquipment = trpc.construction.equipmentCreate?.useMutation?.({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    equipmentCode: "", name: "", type: "", hourlyRate: "0", location: "", status: "available",
  });

  const inUseCount = equipment?.filter(e => e.status === "in_use").length || 0;
  const maintCount = equipment?.filter(e => e.status === "maintenance").length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Equipment Tracking</h2>
          <p className="text-slate-500">Construction equipment management, fuel, and cost allocation</p>
        </div>
        <ActionButton3D icon={<Plus className="size-4" />} label="Add Equipment" color="blue" onClick={() => setOpen(true)} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2"><Wrench className="size-4 text-blue-600" /><p className="text-xs text-blue-700 font-medium">Total</p></div>
            <p className="text-2xl font-bold text-blue-800 mt-1">{equipment?.length || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2"><MapPin className="size-4 text-emerald-600" /><p className="text-xs text-emerald-700 font-medium">In Use</p></div>
            <p className="text-2xl font-bold text-emerald-800 mt-1">{inUseCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2"><AlertTriangle className="size-4 text-amber-600" /><p className="text-xs text-amber-700 font-medium">Maintenance</p></div>
            <p className="text-2xl font-bold text-amber-800 mt-1">{maintCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2"><Clock className="size-4 text-purple-600" /><p className="text-xs text-purple-700 font-medium">Total Hours</p></div>
            <p className="text-2xl font-bold text-purple-800 mt-1">{equipment?.reduce((s, e) => s + (e.hoursUsed || 0), 0) || 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Equipment</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Hourly Rate</TableHead>
                <TableHead className="text-right">Hours Used</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipment?.map(e => (
                <TableRow key={e.id}>
                  <TableCell className="font-mono text-sm">{e.equipmentCode}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">{e.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{e.type || "—"}</TableCell>
                  <TableCell className="text-right font-mono">{Number(e.hourlyRate).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{e.hoursUsed || 0}</TableCell>
                  <TableCell className="text-sm">{e.location || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs ${statusColors[e.status]}`}>
                      {e.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {(!equipment || equipment.length === 0) && (
                <TableRow><TableCell colSpan={7} className="text-center py-12 text-slate-500">No equipment registered</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Equipment</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            createEquipment?.mutate(form);
            setOpen(false);
          }} className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Code</Label><Input value={form.equipmentCode} onChange={e => setForm({...form, equipmentCode: e.target.value})} required placeholder="EQ-001" /></div>
              <div><Label>Type</Label><Input value={form.type} onChange={e => setForm({...form, type: e.target.value})} placeholder="Excavator / Crane" /></div>
            </div>
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Hourly Rate</Label><Input type="number" value={form.hourlyRate} onChange={e => setForm({...form, hourlyRate: e.target.value})} /></div>
              <div><Label>Status</Label><Select value={form.status} onValueChange={(v: any) => setForm({...form, status: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="available">Available</SelectItem><SelectItem value="in_use">In Use</SelectItem><SelectItem value="maintenance">Maintenance</SelectItem><SelectItem value="retired">Retired</SelectItem></SelectContent></Select></div>
            </div>
            <div><Label>Location</Label><Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></div>
            <Button type="submit" className="w-full">Add Equipment</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
