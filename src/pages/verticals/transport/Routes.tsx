import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin } from "lucide-react";

export default function RoutesPage() {
  const { data: routes, refetch } = trpc.transport.routeList.useQuery(undefined);
  const { data: routePlanning } = trpc.transport.routePlanningList.useQuery(undefined);
  const createRoute = trpc.transport.routeCreate.useMutation({ onSuccess: () => { refetch(); setOpen(false); } });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ routeCode: "", name: "", origin: "", destination: "", distanceKm: "", estimatedDuration: "" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Routes</h2><p className="text-slate-500">Route planning and management</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Route</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Route</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createRoute.mutate(form); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Route Code</Label><Input value={form.routeCode} onChange={e => setForm({...form, routeCode: e.target.value})} required /></div>
                <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Origin</Label><Input value={form.origin} onChange={e => setForm({...form, origin: e.target.value})} required /></div>
                <div><Label>Destination</Label><Input value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Distance (km)</Label><Input type="number" value={form.distanceKm} onChange={e => setForm({...form, distanceKm: e.target.value})} /></div>
                <div><Label>Duration</Label><Input value={form.estimatedDuration} onChange={e => setForm({...form, estimatedDuration: e.target.value})} placeholder="e.g. 2h 30m" /></div>
              </div>
              <Button type="submit" className="w-full">Create Route</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Route Directory</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Origin → Destination</TableHead><TableHead className="text-right">Distance</TableHead><TableHead>Duration</TableHead></TableRow></TableHeader>
            <TableBody>
              {routes?.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-sm">{r.routeCode}</TableCell>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell><div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /><span>{r.origin} → {r.destination}</span></div></TableCell>
                  <TableCell className="text-right">{r.distanceKm ? `${r.distanceKm} km` : "—"}</TableCell>
                  <TableCell>{r.estimatedDuration || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Route Planning</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Route</TableHead><TableHead>Vehicle</TableHead><TableHead>Driver</TableHead><TableHead>Date</TableHead><TableHead>Departure</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {routePlanning?.map(rp => (
                <TableRow key={rp.id}>
                  <TableCell>{rp.routeId}</TableCell>
                  <TableCell>{rp.vehicleId}</TableCell>
                  <TableCell>{rp.driverId || "—"}</TableCell>
                  <TableCell>{rp.plannedDate}</TableCell>
                  <TableCell>{rp.departureTime || "—"}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{rp.status.replace("_", " ")}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
