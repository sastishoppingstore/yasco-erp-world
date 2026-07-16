import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet, Banknote, CreditCard, Landmark, Plus, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const paymentMethodIcons: Record<string, any> = { cash: Banknote, bank_transfer: Landmark, card: CreditCard, online: CreditCard };

export default function CustomerPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ invoiceId: 0, amount: "", paymentMethod: "online" as const });
  const token = localStorage.getItem("portal_token_customer");

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch("/api/trpc/portalCustomer.paymentList", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) }).then(r => r.json()),
      fetch("/api/trpc/portalCustomer.invoiceList", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, status: "sent" }) }).then(r => r.json()),
    ]).then(([p, i]) => {
      setPayments(p.result?.data || []);
      setInvoices(i.result?.data || []);
    }).finally(() => setLoading(false));
  }, [token]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/trpc/portalCustomer.initiatePayment", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, ...form }),
    });
    const json = await res.json();
    if (json.result?.data) {
      toast.success("Payment initiated! Redirecting to payment gateway...");
      setOpen(false);
    } else {
      toast.error("Payment failed");
    }
  };

  if (loading) return <div className="flex justify-center py-20 text-slate-400">Loading payments...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Payments</h2><p className="text-slate-500">View payment history and make payments</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Make a Payment</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Make Online Payment</DialogTitle></DialogHeader>
            <form onSubmit={handlePay} className="space-y-4">
              <div><Label>Select Invoice</Label>
                <Select onValueChange={v => {
                  const inv = invoices.find(i => i.id === Number(v));
                  setForm({ ...form, invoiceId: Number(v), amount: inv ? String(inv.balanceDue || inv.totalAmount) : "" });
                }}>
                  <SelectTrigger><SelectValue placeholder="Choose invoice to pay" /></SelectTrigger>
                  <SelectContent>
                    {invoices.filter(i => Number(i.balanceDue) > 0).map(inv => (
                      <SelectItem key={inv.id} value={String(inv.id)}>
                        {inv.invoiceNumber} - Balance: {Number(inv.balanceDue).toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Amount</Label><Input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required /></div>
              <div><Label>Payment Method</Label>
                <Select value={form.paymentMethod} onValueChange={(v: any) => setForm({...form, paymentMethod: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="online">Online Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full"><ExternalLink className="w-4 h-4 mr-2" />Proceed to Payment</Button>
              <p className="text-xs text-slate-400 text-center">You will be redirected to our secure payment gateway to complete the transaction.</p>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Payment #</TableHead><TableHead>Date</TableHead><TableHead>Method</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Reference</TableHead></TableRow></TableHeader>
            <TableBody>
              {payments.map(p => {
                const Icon = paymentMethodIcons[p.paymentMethod] || Wallet;
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-sm font-medium">{p.paymentNumber}</TableCell>
                    <TableCell className="text-sm">{new Date(p.date).toLocaleDateString()}</TableCell>
                    <TableCell><span className="flex items-center gap-1 text-sm"><Icon className="w-3 h-3 text-slate-500" />{p.paymentMethod.replace("_", " ")}</span></TableCell>
                    <TableCell className="text-right font-mono font-semibold text-emerald-600">{Number(p.amount).toLocaleString()} SAR</TableCell>
                    <TableCell className="text-sm text-slate-500">{p.reference || "—"}</TableCell>
                  </TableRow>
                );
              })}
              {payments.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-slate-400 py-8">No payments yet</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
