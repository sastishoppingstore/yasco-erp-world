import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ShoppingCart } from "lucide-react";

export default function SalesOrdersPage() {
  const { data: orders, refetch } = trpc.sales.orderList.useQuery();
  const { data: customers } = trpc.sales.customerList.useQuery();
  const createOrder = trpc.sales.orderCreate.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState({
    orderNumber: "", customerId: 0, date: "", deliveryDate: "",
    subTotal: "0", taxAmount: "0", totalAmount: "0",
    items: [{ description: "", quantity: 1, unitPrice: "0", totalAmount: "0" }],
  });

  const filtered = orders?.filter(o => !statusFilter || o.status === statusFilter) || [];

  const statusColors: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700",
    confirmed: "bg-blue-100 text-blue-700",
    processing: "bg-amber-100 text-amber-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
    invoiced: "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Sales Orders</h2><p className="text-slate-500">Sales order management</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Order</Button></DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Create Sales Order</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createOrder.mutate(form); setOpen(false); }} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Order #</Label><Input value={form.orderNumber} onChange={e => setForm({...form, orderNumber: e.target.value})} required /></div>
                <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required /></div>
                <div><Label>Delivery Date</Label><Input type="date" value={form.deliveryDate} onChange={e => setForm({...form, deliveryDate: e.target.value})} /></div>
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
              <Button type="submit" className="w-full">Create Order</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setStatusFilter("")} className={!statusFilter ? "bg-slate-100" : ""}>All</Button>
        {["draft", "confirmed", "processing", "shipped", "delivered", "cancelled", "invoiced"].map(s => (
          <Button key={s} variant="outline" size="sm" onClick={() => setStatusFilter(s)} className={statusFilter === s ? "bg-slate-100 capitalize" : "capitalize"}>{s.replace("_", " ")}</Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-right">Tax</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(o => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-sm font-medium">{o.orderNumber}</TableCell>
                  <TableCell>{customers?.find(c => c.id === o.customerId)?.name || `Customer #${o.customerId}`}</TableCell>
                  <TableCell>{new Date(o.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right font-mono">{Number(o.subTotal).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{Number(o.taxAmount).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{Number(o.totalAmount).toLocaleString()}</TableCell>
                  <TableCell><span className={`text-xs px-2 py-1 rounded-full ${statusColors[o.status] || ""}`}>{o.status.replace("_", " ")}</span></TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-slate-400 py-8">No orders found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
