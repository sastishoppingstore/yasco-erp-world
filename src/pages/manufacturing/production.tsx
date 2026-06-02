import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Factory } from "lucide-react";

export default function ProductionOrdersPage() {
  const { data: orders, refetch } = trpc.manufacturing.productionOrderList.useQuery();
  const { data: warehouses } = trpc.inventory.warehouseList.useQuery();
  const createPO = trpc.manufacturing.productionOrderCreate.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    poNumber: "", workOrderId: 0, warehouseId: 0, date: "", totalCost: "0", notes: "",
    items: [{ productId: 1, quantity: 1, unitCost: "0" }],
  });

  const statusColors: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700",
    in_progress: "bg-amber-100 text-amber-700",
    completed: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Production Orders</h2><p className="text-slate-500">Manage production runs</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Production Order</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create Production Order</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createPO.mutate(form); setOpen(false); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>PO Number</Label><Input value={form.poNumber} onChange={e => setForm({...form, poNumber: e.target.value})} required /></div>
                <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Warehouse</Label>
                  <Select onValueChange={v => setForm({...form, warehouseId: Number(v)})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{warehouses?.map(w => <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Work Order ID</Label><Input type="number" value={form.workOrderId || ""} onChange={e => setForm({...form, workOrderId: Number(e.target.value)})} /></div>
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
              <div className="space-y-2">
                <Label>Items</Label>
                {form.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-3 gap-2">
                    <Input placeholder="Product ID" type="number" value={item.productId} onChange={e => {
                      const newItems = [...form.items]; newItems[i].productId = Number(e.target.value); setForm({...form, items: newItems});
                    }} />
                    <Input placeholder="Qty" type="number" value={item.quantity} onChange={e => {
                      const newItems = [...form.items]; newItems[i].quantity = Number(e.target.value); setForm({...form, items: newItems});
                    }} />
                    <Input placeholder="Unit Cost" value={item.unitCost} onChange={e => {
                      const newItems = [...form.items]; newItems[i].unitCost = e.target.value; setForm({...form, items: newItems});
                    }} />
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setForm({...form, items: [...form.items, { productId: 1, quantity: 1, unitCost: "0" }]})}>+ Add Item</Button>
              </div>
              <Button type="submit" className="w-full">Create Production Order</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO #</TableHead>
                <TableHead>WO ID</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.map(po => (
                <TableRow key={po.id}>
                  <TableCell className="font-mono text-sm font-medium">{po.poNumber}</TableCell>
                  <TableCell className="font-mono text-sm">{po.workOrderId ? `WO-${po.workOrderId}` : "—"}</TableCell>
                  <TableCell>{warehouses?.find(w => w.id === po.warehouseId)?.name || `WH #${po.warehouseId}`}</TableCell>
                  <TableCell>{new Date(po.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{Number(po.totalCost).toLocaleString()}</TableCell>
                  <TableCell><span className={`text-xs px-2 py-1 rounded-full ${statusColors[po.status] || ""}`}>{po.status.replace("_", " ")}</span></TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-slate-500">{po.notes || "—"}</TableCell>
                </TableRow>
              ))}
              {(!orders || orders.length === 0) && (
                <TableRow><TableCell colSpan={7} className="text-center text-slate-400 py-8">No production orders yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
