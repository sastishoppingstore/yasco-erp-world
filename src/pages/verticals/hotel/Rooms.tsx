import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, DoorOpen } from "lucide-react";

const statusColors: Record<string, string> = {
  available: "bg-emerald-100 text-emerald-700", occupied: "bg-blue-100 text-blue-700",
  maintenance: "bg-amber-100 text-amber-700", reserved: "bg-purple-100 text-purple-700", cleaning: "bg-sky-100 text-sky-700",
};

export default function RoomsPage() {
  const { data: roomTypes, refetch: refetchTypes } = trpc.hotel.roomTypeList.useQuery(undefined);
  const { data: inventory } = trpc.hotel.roomInventoryList.useQuery(undefined);
  const createType = trpc.hotel.roomTypeCreate.useMutation({ onSuccess: () => { refetchTypes(); setOpen(false); } });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", basePrice: "0", maxOccupancy: 2, numberOfRooms: 1 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Rooms</h2><p className="text-slate-500">Room types, inventory, and status</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Room Type</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Room Type</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createType.mutate(form); }} className="space-y-3">
              <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Base Price</Label><Input type="number" value={form.basePrice} onChange={e => setForm({...form, basePrice: e.target.value})} /></div>
                <div><Label>Max Occupancy</Label><Input type="number" value={form.maxOccupancy} onChange={e => setForm({...form, maxOccupancy: Number(e.target.value)})} /></div>
                <div><Label># of Rooms</Label><Input type="number" value={form.numberOfRooms} onChange={e => setForm({...form, numberOfRooms: Number(e.target.value)})} /></div>
              </div>
              <Button type="submit" className="w-full">Create Room Type</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-slate-500">Total Rooms</p><p className="text-xl font-bold">{inventory?.length || 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-slate-500">Available</p><p className="text-xl font-bold text-emerald-600">{inventory?.filter(r => r.status === "available").length || 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-slate-500">Occupied</p><p className="text-xl font-bold text-blue-600">{inventory?.filter(r => r.status === "occupied").length || 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-slate-500">Maintenance</p><p className="text-xl font-bold text-amber-600">{inventory?.filter(r => r.status === "maintenance").length || 0}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Room Types</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead className="text-right">Base Price</TableHead><TableHead className="text-center">Capacity</TableHead><TableHead className="text-center">Rooms</TableHead></TableRow></TableHeader>
            <TableBody>
              {roomTypes?.map(rt => (
                <TableRow key={rt.id}>
                  <TableCell className="font-medium">{rt.name}</TableCell>
                  <TableCell className="text-right font-mono">{Number(rt.basePrice).toLocaleString()} SAR</TableCell>
                  <TableCell className="text-center">{rt.maxOccupancy}</TableCell>
                  <TableCell className="text-center">{rt.numberOfRooms}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Room Inventory</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Room</TableHead><TableHead>Floor</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {inventory?.map(r => (
                <TableRow key={r.id}>
                  <TableCell><div className="flex items-center gap-2"><DoorOpen className="w-4 h-4 text-slate-400" /><span className="font-mono">{r.roomNumber}</span></div></TableCell>
                  <TableCell>{r.floor || "—"}</TableCell>
                  <TableCell>{r.roomTypeId}</TableCell>
                  <TableCell><Badge className={statusColors[r.status]}>{r.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
