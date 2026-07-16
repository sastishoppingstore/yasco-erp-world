import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus } from "lucide-react";
import { toast } from "sonner";

export default function VendorInvoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [pos, setPos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ poId: 0, invoiceNumber: "", amount: "", taxAmount: "0", totalAmount: "" });
  const token = localStorage.getItem("portal_token_vendor");

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch("/api/trpc/portalVendor.invoiceList", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) }).then(r => r.json()),
      fetch("/api/trpc/portalVendor.poList", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, status: "confirmed" }) }).then(r => r.json()),
    ]).then(([inv, po]) => {
      setInvoices(inv.result?.data || []);
      setPos(po.result?.data || []);
    }).finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = Number(form.amount) + Number(form.taxAmount);
    const res = await fetch("/api/trpc/portalVendor.invoiceCreate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, ...form, totalAmount: String(total) }),
    });
    const json = await res.json();
    if (json.result?.data?.success) {
      toast.success("Invoice submitted successfully");
      setOpen(false);
      setForm({ poId: 0, invoiceNumber: "", amount: "", taxAmount: "0", totalAmount: "" });
    } else {
      toast.error("Failed to submit invoice");
    }
  };

  if (loading) return <div className="flex justify-center py-20 text-slate-400">Loading invoices...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">My Invoices</h2><p className="text-slate-500">Submit invoices against purchase orders</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Submit Invoice</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Submit Invoice Against PO</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><Label>Purchase Order</Label>
                <Select onValueChange={v => setForm({...form, poId: Number(v)})}>
                  <SelectTrigger><SelectValue placeholder="Select PO" /></SelectTrigger>
                  <SelectContent>{pos.map(po => <SelectItem key={po.id} value={String(po.id)}>{po.poNumber} - {Number(po.totalAmount).toLocaleString()} SAR</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Invoice Number</Label><Input value={form.invoiceNumber} onChange={e => setForm({...form, invoiceNumber: e.target.value})} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Amount</Label><Input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value, totalAmount: String(Number(e.target.value) + Number(form.taxAmount))})} required /></div>
                <div><Label>Tax Amount</Label><Input type="number" value={form.taxAmount} onChange={e => setForm({...form, taxAmount: e.target.value, totalAmount: String(Number(form.amount) + Number(e.target.value))})} /></div>
              </div>
              <div><Label>Total Amount</Label><Input value={form.totalAmount} readOnly className="font-bold" /></div>
              <Button type="submit" className="w-full">Submit Invoice</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Invoice #</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="text-right">Tax</TableHead><TableHead className="text-right">Total</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {invoices.map(inv => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono font-medium">{inv.invoiceNumber}</TableCell>
                  <TableCell className="text-sm">{new Date(inv.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right font-mono">{Number(inv.subTotal).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{Number(inv.taxAmount).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{Number(inv.totalAmount).toLocaleString()}</TableCell>
                  <TableCell><span className="text-xs px-2 py-1 rounded-full bg-slate-100 capitalize">{inv.status}</span></TableCell>
                </TableRow>
              ))}
              {invoices.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-slate-400 py-8">No invoices submitted yet</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
