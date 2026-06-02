import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Wallet, Banknote, CreditCard, Landmark } from "lucide-react";

export default function CustomerPaymentsPage() {
  const { data: payments, refetch } = trpc.sales.paymentList.useQuery();
  const { data: customers } = trpc.sales.customerList.useQuery();
  const createPayment = trpc.sales.paymentCreate.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    paymentNumber: "", customerId: 0, invoiceId: 0, date: "",
    amount: "0", paymentMethod: "cash" as const, reference: "", notes: "",
  });

  const paymentMethodIcons: Record<string, any> = { cash: Banknote, bank_transfer: Landmark, cheque: Wallet, card: CreditCard, online: CreditCard };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Customer Payments</h2><p className="text-slate-500">Track customer payments</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Record Payment</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Record Customer Payment</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createPayment.mutate(form); setOpen(false); setForm({ paymentNumber: "", customerId: 0, invoiceId: 0, date: "", amount: "0", paymentMethod: "cash", reference: "", notes: "" }); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Payment #</Label><Input value={form.paymentNumber} onChange={e => setForm({...form, paymentNumber: e.target.value})} required /></div>
                <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required /></div>
              </div>
              <div><Label>Customer</Label>
                <Select onValueChange={v => setForm({...form, customerId: Number(v)})}>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>{customers?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Amount</Label><Input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required /></div>
                <div><Label>Invoice ID</Label><Input type="number" value={form.invoiceId || ""} onChange={e => setForm({...form, invoiceId: Number(e.target.value)})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Payment Method</Label>
                  <Select value={form.paymentMethod} onValueChange={(v: any) => setForm({...form, paymentMethod: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Reference</Label><Input value={form.reference} onChange={e => setForm({...form, reference: e.target.value})} /></div>
              </div>
              <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
              <Button type="submit" className="w-full">Record Payment</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments?.map(p => {
                const Icon = paymentMethodIcons[p.paymentMethod] || Wallet;
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-sm font-medium">{p.paymentNumber}</TableCell>
                    <TableCell>{customers?.find(c => c.id === p.customerId)?.name || `Customer #${p.customerId}`}</TableCell>
                    <TableCell>{new Date(p.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm"><Icon className="w-3 h-3 text-slate-500" />{p.paymentMethod.replace("_", " ")}</span>
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-emerald-600">{Number(p.amount).toLocaleString()} SAR</TableCell>
                    <TableCell className="text-sm text-slate-500">{p.reference || "—"}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-slate-500">{p.notes || "—"}</TableCell>
                  </TableRow>
                );
              })}
              {(!payments || payments.length === 0) && (
                <TableRow><TableCell colSpan={7} className="text-center text-slate-400 py-8">No payments recorded</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
