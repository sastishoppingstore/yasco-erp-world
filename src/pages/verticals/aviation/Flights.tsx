import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Plane } from "lucide-react";

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700", boarding: "bg-amber-100 text-amber-700",
  departed: "bg-purple-100 text-purple-700", in_air: "bg-emerald-100 text-emerald-700",
  landed: "bg-green-100 text-green-700", cancelled: "bg-red-100 text-red-700",
  delayed: "bg-orange-100 text-orange-700", diverted: "bg-pink-100 text-pink-700",
};

export default function FlightsPage() {
  const { data: flights, refetch } = trpc.aviation.flightList.useQuery(undefined);
  const createFlight = trpc.aviation.flightCreate.useMutation({ onSuccess: () => { refetch(); setOpen(false); } });
  const updateFlight = trpc.aviation.flightUpdate.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ flightNumber: "", origin: "", destination: "", departureTime: "", arrivalTime: "", aircraftRegistration: "", totalSeats: 0 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Flights</h2><p className="text-slate-500">Flight scheduling and tracking</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Flight</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Flight</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createFlight.mutate(form); }} className="space-y-3">
              <div><Label>Flight Number</Label><Input value={form.flightNumber} onChange={e => setForm({...form, flightNumber: e.target.value})} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Origin</Label><Input value={form.origin} onChange={e => setForm({...form, origin: e.target.value})} required /></div>
                <div><Label>Destination</Label><Input value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Departure</Label><Input type="datetime-local" value={form.departureTime} onChange={e => setForm({...form, departureTime: e.target.value})} required /></div>
                <div><Label>Arrival</Label><Input type="datetime-local" value={form.arrivalTime} onChange={e => setForm({...form, arrivalTime: e.target.value})} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Aircraft Reg</Label><Input value={form.aircraftRegistration} onChange={e => setForm({...form, aircraftRegistration: e.target.value})} /></div>
                <div><Label>Total Seats</Label><Input type="number" value={form.totalSeats || ""} onChange={e => setForm({...form, totalSeats: Number(e.target.value)})} /></div>
              </div>
              <Button type="submit" className="w-full">Add Flight</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Flight Schedule</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Flight</TableHead><TableHead>Aircraft</TableHead><TableHead>Route</TableHead><TableHead>Departure</TableHead><TableHead>Arrival</TableHead><TableHead className="text-center">Seats</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {flights?.map(f => (
                <TableRow key={f.id}>
                  <TableCell className="font-mono text-sm font-bold"><div className="flex items-center gap-2"><Plane className="w-4 h-4 text-slate-400" />{f.flightNumber}</div></TableCell>
                  <TableCell className="text-sm">{f.aircraftRegistration || "—"}</TableCell>
                  <TableCell className="text-sm">{f.origin} → {f.destination}</TableCell>
                  <TableCell className="text-sm">{new Date(f.departureTime).toLocaleString()}</TableCell>
                  <TableCell className="text-sm">{new Date(f.arrivalTime).toLocaleString()}</TableCell>
                  <TableCell className="text-center">{f.bookedSeats}/{f.totalSeats}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[f.status]}>{f.status.replace("_", " ")}</Badge>
                      {f.status === "scheduled" && <Button size="sm" variant="outline" onClick={() => updateFlight.mutate({ id: f.id, status: "boarding" })}>Board</Button>}
                      {f.status === "boarding" && <Button size="sm" variant="outline" onClick={() => updateFlight.mutate({ id: f.id, status: "departed" })}>Depart</Button>}
                      {f.status === "departed" && <Button size="sm" variant="outline" onClick={() => updateFlight.mutate({ id: f.id, status: "landed" })}>Land</Button>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
