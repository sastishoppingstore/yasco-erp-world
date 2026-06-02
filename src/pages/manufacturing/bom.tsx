import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Factory } from "lucide-react";

export default function BOMPage() {
  const { data: boms, refetch } = trpc.manufacturing.bomList.useQuery(undefined);
  const createBOM = trpc.manufacturing.bomCreate.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ productId: 0, version: "1.0", quantity: 1, laborCost: "0", overheadCost: "0" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Bill of Materials</h2><p className="text-slate-500">Define product recipes and component lists</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New BOM</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create BOM</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createBOM.mutate({ ...form, items: [] }); setOpen(false); }} className="space-y-3">
              <div><Label>Product ID</Label><Input type="number" value={form.productId} onChange={e => setForm({...form, productId: Number(e.target.value)})} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Version</Label><Input value={form.version} onChange={e => setForm({...form, version: e.target.value})} /></div>
                <div><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: Number(e.target.value)})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Labor Cost</Label><Input type="number" value={form.laborCost} onChange={e => setForm({...form, laborCost: e.target.value})} /></div>
                <div><Label>Overhead Cost</Label><Input type="number" value={form.overheadCost} onChange={e => setForm({...form, overheadCost: e.target.value})} /></div>
              </div>
              <Button type="submit" className="w-full">Create BOM</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {boms?.map(bom => (
          <Card key={bom.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Factory className="w-5 h-5 text-blue-600" />
                <span className="font-mono text-xs text-slate-500">BOM #{bom.id}</span>
              </div>
              <h3 className="font-semibold mb-1">Product #{bom.productId}</h3>
              <p className="text-xs text-slate-500 mb-3">Version {bom.version} | Qty: {bom.quantity}</p>
              <div className="flex items-center justify-between text-sm border-t pt-3">
                <div><span className="text-slate-500">Labor:</span> <span className="font-medium">{Number(bom.laborCost).toLocaleString()} SAR</span></div>
                <div><span className="text-slate-500">Overhead:</span> <span className="font-medium">{Number(bom.overheadCost).toLocaleString()} SAR</span></div>
              </div>
              <div className="mt-2 text-sm"><span className="text-slate-500">Total:</span> <span className="font-bold">{Number(bom.totalCost).toLocaleString()} SAR</span></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
