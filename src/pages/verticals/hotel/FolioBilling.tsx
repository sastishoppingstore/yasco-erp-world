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
import { Plus, Receipt } from "lucide-react";

export default function FolioBillingPage() {
  const [bookingId, setBookingId] = useState<number>(0);
  const { data: charges, refetch } = trpc.hotel.folioList.useQuery({ bookingId }, { enabled: bookingId > 0 });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ bookingId: 0, description: "", amount: "0", quantity: 1, totalAmount: "0", chargeDate: "", chargeType: "other" as const });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Folio & Billing</h2><p className="text-slate-500">Manage folio charges and billing</p></div>
        <div className="flex gap-2">
          <Input type="number" placeholder="Booking ID" className="w-40" value={bookingId || ""} onChange={e => setBookingId(Number(e.target.value))} />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Charge</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Folio Charge</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); refetch(); setOpen(false); }} className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Booking ID</Label><Input type="number" value={form.bookingId || ""} onChange={e => setForm({...form, bookingId: Number(e.target.value)})} required /></div>
                  <div><Label>Charge Type</Label><Select value={form.chargeType} onValueChange={(v: any) => setForm({...form, chargeType: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="room">Room</SelectItem><SelectItem value="restaurant">Restaurant</SelectItem><SelectItem value="minibar">Minibar</SelectItem><SelectItem value="laundry">Laundry</SelectItem><SelectItem value="spa">Spa</SelectItem><SelectItem value="transport">Transport</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
                </div>
                <div><Label>Description</Label><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} required /></div>
                <div className="grid grid-cols-3 gap-4">
                  <div><Label>Amount</Label><Input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} /></div>
                  <div><Label>Qty</Label><Input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: Number(e.target.value)})} /></div>
                  <div><Label>Total</Label><Input type="number" value={form.totalAmount} onChange={e => setForm({...form, totalAmount: e.target.value})} /></div>
                </div>
                <div><Label>Charge Date</Label><Input type="date" value={form.chargeDate} onChange={e => setForm({...form, chargeDate: e.target.value})} /></div>
                <Button type="submit" className="w-full">Add Charge</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Folio Charges {bookingId > 0 && `- Booking #${bookingId}`}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Charge</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="text-center">Qty</TableHead><TableHead className="text-right">Total</TableHead><TableHead>Date</TableHead><TableHead>Invoiced</TableHead></TableRow></TableHeader>
            <TableBody>
              {charges?.map(c => (
                <TableRow key={c.id}>
                  <TableCell><div className="flex items-center gap-2"><Receipt className="w-4 h-4 text-slate-400" /><span className="font-medium">{c.description}</span></div></TableCell>
                  <TableCell className="capitalize">{c.chargeType}</TableCell>
                  <TableCell className="text-right font-mono">{Number(c.amount).toLocaleString()}</TableCell>
                  <TableCell className="text-center">{c.quantity}</TableCell>
                  <TableCell className="text-right font-mono">{Number(c.totalAmount).toLocaleString()}</TableCell>
                  <TableCell>{c.chargeDate}</TableCell>
                  <TableCell><Badge variant={c.postedToInvoice ? "default" : "secondary"}>{c.postedToInvoice ? "Posted" : "Pending"}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
