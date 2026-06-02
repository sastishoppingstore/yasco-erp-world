import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Receipt, Eye } from "lucide-react";

export default function InvoicesPage() {
  const { data: invoices, refetch } = trpc.sales.invoiceList.useQuery(undefined);
  const { data: customers } = trpc.sales.customerList.useQuery(undefined);
  const createInvoice = trpc.sales.invoiceCreate.useMutation({ onSuccess: () => refetch() });
  const updateStatus = trpc.sales.invoiceUpdateStatus.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState({
    invoiceNumber: "", customerId: 0, date: "", dueDate: "",
    subTotal: "0", taxAmount: "0", totalAmount: "0",
    items: [{ description: "", quantity: 1, unitPrice: "0", totalAmount: "0" }],
  });

  const filtered = invoices?.filter(i => !statusFilter || i.status === statusFilter) || [];

  const statusColors: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700",
    sent: "bg-blue-100 text-blue-700",
    paid: "bg-emerald-100 text-emerald-700",
    partial: "bg-amber-100 text-amber-700",
    overdue: "bg-red-100 text-red-700",
    cancelled: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Invoices</h2><p className="text-slate-500">Manage sales invoices with ZATCA compliance</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Invoice</Button></DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Create Invoice</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createInvoice.mutate({ ...form }); setOpen(false); }} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Invoice #</Label><Input value={form.invoiceNumber} onChange={e => setForm({...form, invoiceNumber: e.target.value})} required /></div>
                <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required /></div>
                <div><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} /></div>
              </div>
              <div><Label>Customer</Label>
                <Select onValueChange={v => setForm({...form, customerId: Number(v)})}>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>{customers?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Description</Label><Input value={form.items[0].description} onChange={e => {
                const newItems = [...form.items]; newItems[0].description = e.target.value; setForm({...form, items: newItems});
              }} /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Qty</Label><Input type="number" value={form.items[0].quantity} onChange={e => {
                  const newItems = [...form.items]; newItems[0].quantity = Number(e.target.value); setForm({...form, items: newItems});
                }} /></div>
                <div><Label>Unit Price</Label><Input type="number" value={form.items[0].unitPrice} onChange={e => {
                  const newItems = [...form.items]; newItems[0].unitPrice = e.target.value; setForm({...form, items: newItems});
                }} /></div>
                <div><Label>Total</Label><Input value={form.totalAmount} onChange={e => setForm({...form, totalAmount: e.target.value})} /></div>
              </div>
              <Button type="submit" className="w-full">Create Invoice</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setStatusFilter("")} className={!statusFilter ? "bg-slate-100" : ""}>All</Button>
        {["draft", "sent", "paid", "partial", "overdue"].map(s => (
          <Button key={s} variant="outline" size="sm" onClick={() => setStatusFilter(s)} className={statusFilter === s ? "bg-slate-100 capitalize" : "capitalize"}>{s}</Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Invoice #</TableHead><TableHead>Type</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Subtotal</TableHead><TableHead className="text-right">Tax</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="text-right">Paid</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map(inv => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono font-medium">{inv.invoiceNumber}</TableCell>
                  <TableCell><span className="text-xs">{inv.invoiceType === "zatca" ? "ZATCA" : inv.invoiceType}</span></TableCell>
                  <TableCell>{new Date(inv.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right font-mono">{Number(inv.subTotal).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{Number(inv.taxAmount).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{Number(inv.totalAmount).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{Number(inv.paidAmount).toLocaleString()}</TableCell>
                  <TableCell><span className={`text-xs px-2 py-1 rounded-full ${statusColors[inv.status] || ""}`}>{inv.status}</span></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
