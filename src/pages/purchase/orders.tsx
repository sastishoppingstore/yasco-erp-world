import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ShoppingBag } from "lucide-react";

export default function PurchaseOrdersPage() {
  const { data: orders, refetch } = trpc.purchase.poList.useQuery();
  const { data: suppliers } = trpc.purchase.supplierList.useQuery();
  const createPO = trpc.purchase.poCreate.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState({
    poNumber: "", supplierId: 0, date: "", expectedDelivery: "",
    subTotal: "0", taxAmount: "0", totalAmount: "0",
    items: [{ description: "", quantity: 1, unitPrice: "0", totalAmount: "0" }],
  });

  const filtered = orders?.filter(o => !statusFilter || o.status === statusFilter) || [];

  const statusColors: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700",
    sent: "bg-blue-100 text-blue-700",
    partial: "bg-amber-100 text-amber-700",
    received: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
    invoiced: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Purchase Orders</h2><p className="text-slate-500">Create and track purchase orders</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New PO</Button></DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Create Purchase Order</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createPO.mutate(form); setOpen(false); }} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div><Label>PO Number</Label><Input value={form.poNumber} onChange={e => setForm({...form, poNumber: e.target.value})} required /></div>
                <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required /></div>
                <div><Label>Expected Delivery</Label><Input type="date" value={form.expectedDelivery} onChange={e => setForm({...form, expectedDelivery: e.target.value})} /></div>
              </div>
              <div><Label>Supplier</Label>
                <Select onValueChange={v => setForm({...form, supplierId: Number(v)})}>
                  <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                  <SelectContent>{suppliers?.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Subtotal</Label><Input type="number" value={form.subTotal} onChange={e => setForm({...form, subTotal: e.target.value})} /></div>
                <div><Label>Tax</Label><Input type="number" value={form.taxAmount} onChange={e => setForm({...form, taxAmount: e.target.value})} /></div>
                <div><Label>Total</Label><Input type="number" value={form.totalAmount} onChange={e => setForm({...form, totalAmount: e.target.value})} /></div>
              </div>
              <Button type="submit" className="w-full">Create PO</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setStatusFilter("")} className={!statusFilter ? "bg-slate-100" : ""}>All</Button>
        {["draft", "sent", "partial", "received", "cancelled"].map(s => (
          <Button key={s} variant="outline" size="sm" onClick={() => setStatusFilter(s)} className={statusFilter === s ? "bg-slate-100 capitalize" : "capitalize"}>{s}</Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO #</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-right">Tax</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(o => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-sm font-medium">{o.poNumber}</TableCell>
                  <TableCell>{suppliers?.find(s => s.id === o.supplierId)?.name || `Supplier #${o.supplierId}`}</TableCell>
                  <TableCell>{new Date(o.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-sm">{o.expectedDelivery ? new Date(o.expectedDelivery).toLocaleDateString() : "—"}</TableCell>
                  <TableCell className="text-right font-mono">{Number(o.subTotal).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{Number(o.taxAmount).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{Number(o.totalAmount).toLocaleString()}</TableCell>
                  <TableCell><span className={`text-xs px-2 py-1 rounded-full ${statusColors[o.status] || ""}`}>{o.status}</span></TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center text-slate-400 py-8">No purchase orders found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
