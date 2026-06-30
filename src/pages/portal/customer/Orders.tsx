import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShoppingCart, Eye, Package } from "lucide-react";

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700", confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-amber-100 text-amber-700", shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-emerald-100 text-emerald-700", cancelled: "bg-red-100 text-red-700",
  invoiced: "bg-green-100 text-green-700",
};

export default function CustomerOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [viewOrder, setViewOrder] = useState<any>(null);
  const token = localStorage.getItem("portal_token_customer");

  useEffect(() => {
    if (!token) return;
    fetch("/api/trpc/portalCustomer.orderList", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).then(r => r.json()).then(j => setOrders(j.result?.data || [])).finally(() => setLoading(false));
  }, [token]);

  const filtered = orders.filter(o => !statusFilter || o.status === statusFilter);

  const handleView = async (id: number) => {
    const res = await fetch("/api/trpc/portalCustomer.orderGet", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, id }),
    });
    const json = await res.json();
    setViewOrder(json.result?.data || null);
  };

  if (loading) return <div className="flex justify-center py-20 text-slate-400">Loading orders...</div>;

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">My Orders</h2><p className="text-slate-500">Track your order status</p></div>

      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setStatusFilter("")} className={!statusFilter ? "bg-slate-100" : ""}>All</Button>
        {["confirmed", "processing", "shipped", "delivered", "cancelled"].map(s => (
          <Button key={s} variant="outline" size="sm" onClick={() => setStatusFilter(s)} className={statusFilter === s ? "bg-slate-100 capitalize" : "capitalize"}>{s.replace("_", " ")}</Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Order #</TableHead><TableHead>Date</TableHead><TableHead>Delivery Date</TableHead><TableHead className="text-right">Subtotal</TableHead><TableHead className="text-right">Tax</TableHead><TableHead className="text-right">Total</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map(o => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono font-medium">{o.orderNumber}</TableCell>
                  <TableCell className="text-sm">{new Date(o.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-sm">{o.deliveryDate ? new Date(o.deliveryDate).toLocaleDateString() : "—"}</TableCell>
                  <TableCell className="text-right font-mono">{Number(o.subTotal).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{Number(o.taxAmount).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{Number(o.totalAmount).toLocaleString()}</TableCell>
                  <TableCell><span className={`text-xs px-2 py-1 rounded-full ${statusColors[o.status] || ""}`}>{o.status.replace("_", " ")}</span></TableCell>
                  <TableCell><Button variant="ghost" size="icon" onClick={() => handleView(o.id)}><Eye className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-slate-400 py-8">No orders found</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!viewOrder} onOpenChange={next => !next && setViewOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Order {viewOrder?.order?.orderNumber}</DialogTitle></DialogHeader>
          {viewOrder?.order && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-500">Order Date:</span> <span className="font-medium">{new Date(viewOrder.order.date).toLocaleDateString()}</span></div>
                <div><span className="text-slate-500">Delivery Date:</span> <span className="font-medium">{viewOrder.order.deliveryDate ? new Date(viewOrder.order.deliveryDate).toLocaleDateString() : "Not set"}</span></div>
                <div><span className="text-slate-500">Status:</span> <span className={`text-xs px-2 py-1 rounded-full ${statusColors[viewOrder.order.status] || ""}`}>{viewOrder.order.status}</span></div>
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>Description</TableHead><TableHead className="text-right">Qty</TableHead><TableHead className="text-right">Price</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
                <TableBody>
                  {viewOrder.items?.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right font-mono">{Number(item.unitPrice).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{Number(item.totalAmount).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end border-t pt-2">
                <div className="w-48 space-y-1 text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span className="font-mono">{Number(viewOrder.order.subTotal).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Tax</span><span className="font-mono">{Number(viewOrder.order.taxAmount).toLocaleString()}</span></div>
                  <div className="flex justify-between font-bold"><span>Total</span><span className="font-mono">{Number(viewOrder.order.totalAmount).toLocaleString()}</span></div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
