import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText, Send, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import ActionButton3D from "@/components/ui/ActionButton3D";

export default function EstimatesPage() {
  const navigate = useNavigate();
  const { data: estimates, refetch } = trpc.workshop.estimateList.useQuery(undefined);
  const approveEstimate = trpc.workshop.estimateApprove.useMutation({ onSuccess: () => refetch() });
  const convertToJob = trpc.workshop.estimateConvertToJob.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ vehicleId: "", customerId: "1", estimateNumber: "", partsTotal: "0", laborTotal: "0", subletTotal: "0", taxAmount: "0", totalAmount: "0", notes: "" });
  const { data: vehicles } = trpc.workshop.vehicleList.useQuery(undefined);
  const createEstimate = trpc.workshop.estimateCreate.useMutation({ onSuccess: () => { refetch(); setOpen(false); } });

  const statusColors: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700", pending: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700", rejected: "bg-red-100 text-red-700",
    converted: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Estimates</h2>
          <p className="text-slate-500">Customer estimates and quotations</p>
        </div>
        <div className="flex gap-2">
          <ActionButton3D icon={<ArrowLeft className="size-4" />} label="Dashboard" color="slate" onClick={() => navigate("/app/verticals/workshop")} />
          <ActionButton3D icon={<Plus className="size-4" />} label="New Estimate" color="blue" onClick={() => setOpen(true)} />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estimate #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Parts</TableHead>
                <TableHead>Labor</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estimates?.map(est => (
                <TableRow key={est.id}>
                  <TableCell className="font-mono font-medium">{est.estimateNumber}</TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${statusColors[est.status] || ""}`} variant="outline">{est.status}</Badge>
                  </TableCell>
                  <TableCell className="font-mono">{Number(est.partsTotal || 0).toLocaleString()} SAR</TableCell>
                  <TableCell className="font-mono">{Number(est.laborTotal || 0).toLocaleString()} SAR</TableCell>
                  <TableCell className="font-mono font-semibold">{Number(est.totalAmount).toLocaleString()} SAR</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      {est.status === "draft" && (
                        <ActionButton3D icon={<Send className="size-3" />} label="Send" color="blue" size="xs" onClick={() => approveEstimate.mutate({ id: est.id })} />
                      )}
                      {est.status === "approved" && (
                        <ActionButton3D icon={<ArrowRight className="size-3" />} label="Convert to Job" color="emerald" size="xs" onClick={() => convertToJob.mutate({ estimateId: est.id })} />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!estimates || estimates.length === 0) && (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-slate-500">No estimates yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Estimate</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createEstimate.mutate(form as any); }} className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Estimate #</Label><Input value={form.estimateNumber} onChange={e => setForm({...form, estimateNumber: e.target.value})} required /></div>
              <div><Label>Vehicle</Label><Select value={form.vehicleId} onValueChange={v => setForm({...form, vehicleId: v})}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{vehicles?.map(v => <SelectItem key={v.id} value={v.id.toString()}>{v.make} {v.model}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Parts</Label><Input type="number" value={form.partsTotal} onChange={e => setForm({...form, partsTotal: e.target.value})} /></div>
              <div><Label>Labor</Label><Input type="number" value={form.laborTotal} onChange={e => setForm({...form, laborTotal: e.target.value})} /></div>
              <div><Label>Sublet</Label><Input type="number" value={form.subletTotal} onChange={e => setForm({...form, subletTotal: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Tax (VAT 15%)</Label><Input type="number" value={form.taxAmount} onChange={e => setForm({...form, taxAmount: e.target.value})} /></div>
              <div><Label>Total *</Label><Input type="number" value={form.totalAmount} onChange={e => setForm({...form, totalAmount: e.target.value})} required /></div>
            </div>
            <Button type="submit" className="w-full">Create Estimate</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
