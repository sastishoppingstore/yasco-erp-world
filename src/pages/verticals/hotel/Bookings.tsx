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
import { Plus, CalendarCheck } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700", confirmed: "bg-blue-100 text-blue-700",
  checked_in: "bg-emerald-100 text-emerald-700", checked_out: "bg-purple-100 text-purple-700",
  cancelled: "bg-red-100 text-red-700", no_show: "bg-slate-100 text-slate-700",
};

export default function BookingsPage() {
  const { data: bookings, refetch } = trpc.hotel.bookingList.useQuery(undefined);
  const createBooking = trpc.hotel.bookingCreate.useMutation({ onSuccess: () => { refetch(); setOpen(false); } });
  const updateBooking = trpc.hotel.bookingUpdate.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ bookingNumber: "", roomTypeId: 0, checkIn: "", checkOut: "", adults: 1, children: 0, nightlyRate: "0", totalNights: 1, source: "direct" as const });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Bookings</h2><p className="text-slate-500">Manage hotel reservations</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Booking</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Booking</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createBooking.mutate(form); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Booking #</Label><Input value={form.bookingNumber} onChange={e => setForm({...form, bookingNumber: e.target.value})} required /></div>
                <div><Label>Room Type ID</Label><Input type="number" value={form.roomTypeId || ""} onChange={e => setForm({...form, roomTypeId: Number(e.target.value)})} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Check In</Label><Input type="date" value={form.checkIn} onChange={e => setForm({...form, checkIn: e.target.value})} required /></div>
                <div><Label>Check Out</Label><Input type="date" value={form.checkOut} onChange={e => setForm({...form, checkOut: e.target.value})} required /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Adults</Label><Input type="number" value={form.adults} onChange={e => setForm({...form, adults: Number(e.target.value)})} /></div>
                <div><Label>Children</Label><Input type="number" value={form.children} onChange={e => setForm({...form, children: Number(e.target.value)})} /></div>
                <div><Label>Nights</Label><Input type="number" value={form.totalNights} onChange={e => setForm({...form, totalNights: Number(e.target.value)})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Nightly Rate</Label><Input type="number" value={form.nightlyRate} onChange={e => setForm({...form, nightlyRate: e.target.value})} /></div>
                <div><Label>Source</Label><Select value={form.source} onValueChange={(v: any) => setForm({...form, source: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="direct">Direct</SelectItem><SelectItem value="booking.com">Booking.com</SelectItem><SelectItem value="expedia">Expedia</SelectItem><SelectItem value="agoda">Agoda</SelectItem><SelectItem value="travel_agency">Travel Agency</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
              </div>
              <Button type="submit" className="w-full">Create Booking</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Reservations</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Booking #</TableHead><TableHead>Check In</TableHead><TableHead>Check Out</TableHead><TableHead>Guests</TableHead><TableHead>Source</TableHead><TableHead className="text-right">Total</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {bookings?.map(b => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-sm"><div className="flex items-center gap-2"><CalendarCheck className="w-4 h-4 text-slate-400" />{b.bookingNumber}</div></TableCell>
                  <TableCell>{b.checkIn}</TableCell>
                  <TableCell>{b.checkOut}</TableCell>
                  <TableCell>{b.adults}A / {b.children}C</TableCell>
                  <TableCell className="capitalize">{b.source.replace("_", " ")}</TableCell>
                  <TableCell className="text-right font-mono">{Number(b.totalAmount).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[b.status]}>{b.status.replace("_", " ")}</Badge>
                      {b.status === "confirmed" && <Button size="sm" variant="outline" onClick={() => updateBooking.mutate({ id: b.id, status: "checked_in" })}>Check In</Button>}
                      {b.status === "checked_in" && <Button size="sm" variant="outline" onClick={() => updateBooking.mutate({ id: b.id, status: "checked_out" })}>Check Out</Button>}
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
