import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

export default function QuotationsPage() {
  const { data: quotations, refetch } = trpc.sales.quotationList.useQuery();
  const { data: customers } = trpc.sales.customerList.useQuery();
  const createQuotation = trpc.sales.quotationCreate.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState({
    quotationNumber: "", customerId: 0, date: "", expiryDate: "",
    subTotal: "0", taxAmount: "0", totalAmount: "0",
    items: [{ description: "", quantity: 1, unitPrice: "0", totalAmount: "0" }],
  });

  const filtered = quotations?.filter(q => !statusFilter || q.status === statusFilter) || [];

  const statusColors: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700",
    sent: "bg-blue-100 text-blue-700",
    accepted: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
    expired: "bg-amber-100 text-amber-700",
    converted: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Quotations</h2><p className="text-slate-500">Create and manage sales quotations</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Quotation</Button></DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Create Quotation</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createQuotation.mutate(form); setOpen(false); }} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Quotation #</Label><Input value={form.quotationNumber} onChange={e => setForm({...form, quotationNumber: e.target.value})} required /></div>
                <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required /></div>
                <div><Label>Expiry Date</Label><Input type="date" value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})} /></div>
              </div>
              <div><Label>Customer</Label>
                <Select onValueChange={v => setForm({...form, customerId: Number(v)})}>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>{customers?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Subtotal</Label><Input type="number" value={form.subTotal} onChange={e => setForm({...form, subTotal: e.target.value})} /></div>
                <div><Label>Tax</Label><Input type="number" value={form.taxAmount} onChange={e => setForm({...form, taxAmount: e.target.value})} /></div>
                <div><Label>Total</Label><Input type="number" value={form.totalAmount} onChange={e => setForm({...form, totalAmount: e.target.value})} /></div>
              </div>
              <Button type="submit" className="w-full">Create Quotation</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setStatusFilter("")} className={!statusFilter ? "bg-slate-100" : ""}>All</Button>
        {["draft", "sent", "accepted", "rejected", "expired", "converted"].map(s => (
          <Button key={s} variant="outline" size="sm" onClick={() => setStatusFilter(s)} className={statusFilter === s ? "bg-slate-100 capitalize" : "capitalize"}>{s}</Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-right">Tax</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(q => (
                <TableRow key={q.id}>
                  <TableCell className="font-mono text-sm font-medium">{q.quotationNumber}</TableCell>
                  <TableCell>{customers?.find(c => c.id === q.customerId)?.name || `Customer #${q.customerId}`}</TableCell>
                  <TableCell>{new Date(q.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-sm">{q.expiryDate ? new Date(q.expiryDate).toLocaleDateString() : "—"}</TableCell>
                  <TableCell className="text-right font-mono">{Number(q.subTotal).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{Number(q.taxAmount).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{Number(q.totalAmount).toLocaleString()}</TableCell>
                  <TableCell><span className={`text-xs px-2 py-1 rounded-full ${statusColors[q.status] || ""}`}>{q.status}</span></TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center text-slate-400 py-8">No quotations found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
