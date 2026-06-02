import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Wrench } from "lucide-react";

export default function WorkOrdersPage() {
  const { data: workOrders, refetch } = trpc.manufacturing.workOrderList.useQuery();
  const createWorkOrder = trpc.manufacturing.workOrderCreate.useMutation({ onSuccess: () => refetch() });
  const updateWorkOrder = trpc.manufacturing.workOrderUpdate.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState({
    woNumber: "", bomId: 0, productId: 0, quantity: 1,
    startDate: "", endDate: "", estimatedCost: "0", notes: "",
  });

  const filtered = workOrders?.filter(wo => !statusFilter || wo.status === statusFilter) || [];

  const statusColors: Record<string, string> = {
    planned: "bg-blue-100 text-blue-700",
    in_progress: "bg-amber-100 text-amber-700",
    completed: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Work Orders</h2><p className="text-slate-500">Production planning and execution</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Work Order</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Work Order</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createWorkOrder.mutate(form); setOpen(false); setForm({ woNumber: "", bomId: 0, productId: 0, quantity: 1, startDate: "", endDate: "", estimatedCost: "0", notes: "" }); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>WO Number</Label><Input value={form.woNumber} onChange={e => setForm({...form, woNumber: e.target.value})} required /></div>
                <div><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: Number(e.target.value)})} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Product ID</Label><Input type="number" value={form.productId} onChange={e => setForm({...form, productId: Number(e.target.value)})} required /></div>
                <div><Label>BOM ID</Label><Input type="number" value={form.bomId || ""} onChange={e => setForm({...form, bomId: Number(e.target.value)})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} /></div>
                <div><Label>End Date</Label><Input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} /></div>
              </div>
              <div><Label>Estimated Cost</Label><Input type="number" value={form.estimatedCost} onChange={e => setForm({...form, estimatedCost: e.target.value})} /></div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
              <Button type="submit" className="w-full">Create Work Order</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setStatusFilter("")} className={!statusFilter ? "bg-slate-100" : ""}>All</Button>
        {["planned", "in_progress", "completed", "cancelled"].map(s => (
          <Button key={s} variant="outline" size="sm" onClick={() => setStatusFilter(s)} className={statusFilter === s ? "bg-slate-100 capitalize" : "capitalize"}>{s.replace("_", " ")}</Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>WO #</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Produced</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead className="text-right">Est. Cost</TableHead>
                <TableHead className="text-right">Actual Cost</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(wo => (
                <TableRow key={wo.id}>
                  <TableCell className="font-mono text-sm font-medium">{wo.woNumber}</TableCell>
                  <TableCell>{`Product #${wo.productId}`}</TableCell>
                  <TableCell className="text-right font-mono">{wo.quantity}</TableCell>
                  <TableCell className="text-right font-mono text-amber-600">{wo.producedQty || 0}</TableCell>
                  <TableCell className="text-sm">{wo.startDate ? new Date(wo.startDate).toLocaleDateString() : "—"}</TableCell>
                  <TableCell className="text-sm">{wo.endDate ? new Date(wo.endDate).toLocaleDateString() : "—"}</TableCell>
                  <TableCell className="text-right font-mono">{Number(wo.estimatedCost).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{Number(wo.actualCost).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColors[wo.status] || ""}`}>{wo.status.replace("_", " ")}</span>
                      {wo.status === "planned" && (
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => updateWorkOrder.mutate({ id: wo.id, status: "in_progress" })}>Start</Button>
                      )}
                      {wo.status === "in_progress" && (
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-emerald-600" onClick={() => updateWorkOrder.mutate({ id: wo.id, status: "completed" })}>Complete</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={9} className="text-center text-slate-400 py-8">No work orders found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
