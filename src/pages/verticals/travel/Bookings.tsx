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
import { Plus, Plane } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700", confirmed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700", refunded: "bg-purple-100 text-purple-700", completed: "bg-blue-100 text-blue-700",
};

export default function TravelBookingsPage() {
  const { data: bookings, refetch } = trpc.travel.bookingList.useQuery(undefined);
  const createBooking = trpc.travel.bookingCreate.useMutation({ onSuccess: () => { refetch(); setOpen(false); } });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ bookingNumber: "", customerId: 0, bookingType: "flight" as const, bookingDate: "", grossAmount: "0", commissionAmount: "0", source: "direct" as const });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Travel Bookings</h2><p className="text-slate-500">Flights, hotels, packages, and more</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Booking</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Booking</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createBooking.mutate(form); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Booking #</Label><Input value={form.bookingNumber} onChange={e => setForm({...form, bookingNumber: e.target.value})} required /></div>
                <div><Label>Customer ID</Label><Input type="number" value={form.customerId || ""} onChange={e => setForm({...form, customerId: Number(e.target.value)})} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Type</Label><Select value={form.bookingType} onValueChange={(v: any) => setForm({...form, bookingType: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="flight">Flight</SelectItem><SelectItem value="hotel">Hotel</SelectItem><SelectItem value="package">Package</SelectItem><SelectItem value="car_rental">Car Rental</SelectItem><SelectItem value="insurance">Insurance</SelectItem><SelectItem value="visa">Visa</SelectItem></SelectContent></Select></div>
                <div><Label>Source</Label><Select value={form.source} onValueChange={(v: any) => setForm({...form, source: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="direct">Direct</SelectItem><SelectItem value="online">Online</SelectItem><SelectItem value="partner">Partner</SelectItem><SelectItem value="corporate">Corporate</SelectItem></SelectContent></Select></div>
              </div>
              <div><Label>Booking Date</Label><Input type="date" value={form.bookingDate} onChange={e => setForm({...form, bookingDate: e.target.value})} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Gross Amount</Label><Input type="number" value={form.grossAmount} onChange={e => setForm({...form, grossAmount: e.target.value})} /></div>
                <div><Label>Commission</Label><Input type="number" value={form.commissionAmount} onChange={e => setForm({...form, commissionAmount: e.target.value})} /></div>
              </div>
              <Button type="submit" className="w-full">Create Booking</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle>All Bookings</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Booking #</TableHead><TableHead>Customer</TableHead><TableHead>Type</TableHead><TableHead>Date</TableHead><TableHead>Source</TableHead><TableHead className="text-right">Gross</TableHead><TableHead className="text-right">Commission</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {bookings?.map(b => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-sm"><div className="flex items-center gap-2"><Plane className="w-4 h-4 text-slate-400" />{b.bookingNumber}</div></TableCell>
                  <TableCell>{b.customerId}</TableCell>
                  <TableCell className="capitalize">{b.bookingType.replace("_", " ")}</TableCell>
                  <TableCell>{b.bookingDate}</TableCell>
                  <TableCell className="capitalize">{b.source}</TableCell>
                  <TableCell className="text-right font-mono">{Number(b.grossAmount).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{Number(b.commissionAmount).toLocaleString()}</TableCell>
                  <TableCell><Badge className={statusColors[b.status]}>{b.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
