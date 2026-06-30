import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Package } from "lucide-react";

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700", sent: "bg-blue-100 text-blue-700",
  confirmed: "bg-green-100 text-green-700", received: "bg-purple-100 text-purple-700",
  completed: "bg-emerald-100 text-emerald-700", cancelled: "bg-red-100 text-red-700",
};

export default function VendorPurchaseOrders() {
  const [pos, setPos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [viewPo, setViewPo] = useState<any>(null);
  const token = localStorage.getItem("portal_token_vendor");

  useEffect(() => {
    if (!token) return;
    fetch("/api/trpc/portalVendor.poList", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).then(r => r.json()).then(j => setPos(j.result?.data || [])).finally(() => setLoading(false));
  }, [token]);

  const filtered = pos.filter(po => !statusFilter || po.status === statusFilter);

  const handleView = async (id: number) => {
    const res = await fetch("/api/trpc/portalVendor.poGet", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, id }),
    });
    const json = await res.json();
    setViewPo(json.result?.data || null);
  };

  if (loading) return <div className="flex justify-center py-20 text-slate-400">Loading purchase orders...</div>;

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Purchase Orders</h2><p className="text-slate-500">View your purchase orders from YASCO</p></div>

      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setStatusFilter("")} className={!statusFilter ? "bg-slate-100" : ""}>All</Button>
        {["sent", "confirmed", "received", "completed"].map(s => (
          <Button key={s} variant="outline" size="sm" onClick={() => setStatusFilter(s)} className={statusFilter === s ? "bg-slate-100 capitalize" : "capitalize"}>{s}</Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>PO #</TableHead><TableHead>Date</TableHead><TableHead>Delivery</TableHead><TableHead className="text-right">Subtotal</TableHead><TableHead className="text-right">Tax</TableHead><TableHead className="text-right">Total</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map(po => (
                <TableRow key={po.id}>
                  <TableCell className="font-mono font-medium">{po.poNumber}</TableCell>
                  <TableCell className="text-sm">{new Date(po.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-sm">{po.expectedDelivery ? new Date(po.expectedDelivery).toLocaleDateString() : "—"}</TableCell>
                  <TableCell className="text-right font-mono">{Number(po.subTotal).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{Number(po.taxAmount).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{Number(po.totalAmount).toLocaleString()}</TableCell>
                  <TableCell><span className={`text-xs px-2 py-1 rounded-full ${statusColors[po.status] || ""}`}>{po.status}</span></TableCell>
                  <TableCell><Button variant="ghost" size="icon" onClick={() => handleView(po.id)}><Eye className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-slate-400 py-8">No purchase orders found</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!viewPo} onOpenChange={next => !next && setViewPo(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Purchase Order {viewPo?.po?.poNumber}</DialogTitle></DialogHeader>
          {viewPo?.po && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-500">Date:</span> <span className="font-medium">{new Date(viewPo.po.date).toLocaleDateString()}</span></div>
                <div><span className="text-slate-500">Delivery:</span> <span className="font-medium">{viewPo.po.expectedDelivery ? new Date(viewPo.po.expectedDelivery).toLocaleDateString() : "Not set"}</span></div>
                <div><span className="text-slate-500">Status:</span> <span className={`text-xs px-2 py-1 rounded-full ${statusColors[viewPo.po.status] || ""}`}>{viewPo.po.status}</span></div>
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>Description</TableHead><TableHead className="text-right">Qty</TableHead><TableHead className="text-right">Price</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
                <TableBody>
                  {viewPo.items?.map((item: any) => (
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
                  <div className="flex justify-between"><span>Subtotal</span><span className="font-mono">{Number(viewPo.po.subTotal).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Tax</span><span className="font-mono">{Number(viewPo.po.taxAmount).toLocaleString()}</span></div>
                  <div className="flex justify-between font-bold"><span>Total</span><span className="font-mono">{Number(viewPo.po.totalAmount).toLocaleString()}</span></div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
