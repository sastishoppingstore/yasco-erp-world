import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ArrowLeftRight } from "lucide-react";

export default function StockTransfersPage() {
  const { data: transfers, refetch } = trpc.inventory.transferList.useQuery();
  const { data: warehouses } = trpc.inventory.warehouseList.useQuery();
  const createTransfer = trpc.inventory.transferCreate.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    transferNumber: "", fromWarehouseId: 0, toWarehouseId: 0, date: "", notes: "",
    items: [{ productId: 1, quantity: 1, unitCost: "0" }],
  });

  const statusColors: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700",
    pending: "bg-amber-100 text-amber-700",
    shipped: "bg-blue-100 text-blue-700",
    received: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Stock Transfers</h2><p className="text-slate-500">Transfer stock between warehouses</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Transfer</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create Stock Transfer</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createTransfer.mutate(form); setOpen(false); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Transfer #</Label><Input value={form.transferNumber} onChange={e => setForm({...form, transferNumber: e.target.value})} required /></div>
                <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>From Warehouse</Label>
                  <Select onValueChange={v => setForm({...form, fromWarehouseId: Number(v)})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{warehouses?.map(w => <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>To Warehouse</Label>
                  <Select onValueChange={v => setForm({...form, toWarehouseId: Number(v)})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{warehouses?.map(w => <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
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
              <Button type="submit" className="w-full">Create Transfer</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transfer #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers?.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-sm font-medium">{t.transferNumber}</TableCell>
                  <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                  <TableCell>{warehouses?.find(w => w.id === t.fromWarehouseId)?.name || `WH #${t.fromWarehouseId}`}</TableCell>
                  <TableCell>{warehouses?.find(w => w.id === t.toWarehouseId)?.name || `WH #${t.toWarehouseId}`}</TableCell>
                  <TableCell className="text-right font-mono">{(t as any).itemCount || "—"}</TableCell>
                  <TableCell><span className={`text-xs px-2 py-1 rounded-full ${statusColors[t.status] || ""}`}>{t.status}</span></TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-slate-500">{t.notes || "—"}</TableCell>
                </TableRow>
              ))}
              {(!transfers || transfers.length === 0) && (
                <TableRow><TableCell colSpan={7} className="text-center text-slate-400 py-8">No transfers yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
