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
import { Plus, PackageCheck } from "lucide-react";

export default function GRNPage() {
  const { data: grns, refetch } = trpc.purchase.grnList.useQuery();
  const { data: suppliers } = trpc.purchase.supplierList.useQuery();
  const { data: warehouses } = trpc.inventory.warehouseList.useQuery();
  const createGRN = trpc.purchase.grnCreate.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    grnNumber: "", supplierId: 0, poId: 0, warehouseId: 0, date: "", totalAmount: "0", notes: "",
    items: [{ productId: 1, quantity: 1, unitPrice: "0", totalAmount: "0", batchNumber: "", expiryDate: "" }],
  });

  const statusColors: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700",
    posted: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Goods Received Notes</h2><p className="text-slate-500">GRN management and verification</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New GRN</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create Goods Received Note</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createGRN.mutate(form); setOpen(false); }} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div><Label>GRN #</Label><Input value={form.grnNumber} onChange={e => setForm({...form, grnNumber: e.target.value})} required /></div>
                <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required /></div>
                <div><Label>PO ID</Label><Input type="number" value={form.poId || ""} onChange={e => setForm({...form, poId: Number(e.target.value)})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Supplier</Label>
                  <Select onValueChange={v => setForm({...form, supplierId: Number(v)})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{suppliers?.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Warehouse</Label>
                  <Select onValueChange={v => setForm({...form, warehouseId: Number(v)})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{warehouses?.map(w => <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
              <div className="space-y-2">
                <Label>Items</Label>
                {form.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-6 gap-2 text-xs">
                    <Input placeholder="Product" type="number" value={item.productId} onChange={e => {
                      const newItems = [...form.items]; newItems[i].productId = Number(e.target.value); setForm({...form, items: newItems});
                    }} />
                    <Input placeholder="Qty" type="number" value={item.quantity} onChange={e => {
                      const newItems = [...form.items]; newItems[i].quantity = Number(e.target.value); setForm({...form, items: newItems});
                    }} />
                    <Input placeholder="Price" value={item.unitPrice} onChange={e => {
                      const newItems = [...form.items]; newItems[i].unitPrice = e.target.value; setForm({...form, items: newItems});
                    }} />
                    <Input placeholder="Total" value={item.totalAmount} onChange={e => {
                      const newItems = [...form.items]; newItems[i].totalAmount = e.target.value; setForm({...form, items: newItems});
                    }} />
                    <Input placeholder="Batch" value={item.batchNumber} onChange={e => {
                      const newItems = [...form.items]; newItems[i].batchNumber = e.target.value; setForm({...form, items: newItems});
                    }} />
                    <Input type="date" value={item.expiryDate} onChange={e => {
                      const newItems = [...form.items]; newItems[i].expiryDate = e.target.value; setForm({...form, items: newItems});
                    }} />
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setForm({...form, items: [...form.items, { productId: 1, quantity: 1, unitPrice: "0", totalAmount: "0", batchNumber: "", expiryDate: "" }]})}>+ Add Item</Button>
              </div>
              <Button type="submit" className="w-full">Create GRN</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>GRN #</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>PO #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grns?.map(grn => (
                <TableRow key={grn.id}>
                  <TableCell className="font-mono text-sm font-medium">{grn.grnNumber}</TableCell>
                  <TableCell>{suppliers?.find(s => s.id === grn.supplierId)?.name || `Supplier #${grn.supplierId}`}</TableCell>
                  <TableCell>{warehouses?.find(w => w.id === grn.warehouseId)?.name || `WH #${grn.warehouseId}`}</TableCell>
                  <TableCell className="font-mono text-sm">{grn.poId ? `PO-${grn.poId}` : "—"}</TableCell>
                  <TableCell>{new Date(grn.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{Number(grn.totalAmount).toLocaleString()}</TableCell>
                  <TableCell><span className={`text-xs px-2 py-1 rounded-full ${statusColors[grn.status] || ""}`}>{grn.status}</span></TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-slate-500">{grn.notes || "—"}</TableCell>
                </TableRow>
              ))}
              {(!grns || grns.length === 0) && (
                <TableRow><TableCell colSpan={8} className="text-center text-slate-400 py-8">No goods received notes yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
