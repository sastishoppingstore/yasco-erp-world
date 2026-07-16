import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, DollarSign, FileText, Percent, Calendar, CheckCircle, Clock } from "lucide-react";
import ActionButton3D from "@/components/ui/ActionButton3D";

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  submitted: "bg-blue-100 text-blue-700 border-blue-200",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  paid: "bg-purple-100 text-purple-700 border-purple-200",
  partial: "bg-amber-100 text-amber-700 border-amber-200",
  disputed: "bg-red-100 text-red-700 border-red-200",
};

export default function ProgressBillingPage() {
  const [projectFilter, setProjectFilter] = useState("");
  const { data: billing, refetch } = trpc.construction.progressBillingList.useQuery(undefined);
  const { data: retentions } = trpc.construction.retentionList.useQuery(undefined);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    projectId: "", invoiceNumber: "", milestoneName: "", billingPeriod: "",
    percentageComplete: "0", billedAmount: "0", paidAmount: "0", status: "draft",
  });

  const filtered = billing?.filter(b => !projectFilter || String(b.projectId) === projectFilter) || [];
  const totalBilled = filtered.reduce((s, b) => s + Number(b.billedAmount || 0), 0);
  const totalPaid = filtered.reduce((s, b) => s + Number(b.paidAmount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Progress Billing</h2>
          <p className="text-slate-500">Milestone-based billing and retention tracking</p>
        </div>
        <div className="flex gap-2">
          <Input type="number" placeholder="Filter by Project ID" className="w-44" value={projectFilter} onChange={e => setProjectFilter(e.target.value)} />
          <ActionButton3D icon={<Plus className="size-4" />} label="New Invoice" color="blue" onClick={() => setOpen(true)} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2"><FileText className="size-4 text-blue-600" /><p className="text-xs text-blue-700 font-medium">Invoices</p></div>
            <p className="text-2xl font-bold text-blue-800 mt-1">{filtered.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2"><DollarSign className="size-4 text-emerald-600" /><p className="text-xs text-emerald-700 font-medium">Total Billed</p></div>
            <p className="text-2xl font-bold text-emerald-800 mt-1">{totalBilled.toLocaleString()} SAR</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2"><CheckCircle className="size-4 text-amber-600" /><p className="text-xs text-amber-700 font-medium">Total Paid</p></div>
            <p className="text-2xl font-bold text-amber-800 mt-1">{totalPaid.toLocaleString()} SAR</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2"><Percent className="size-4 text-purple-600" /><p className="text-xs text-purple-700 font-medium">Collection Rate</p></div>
            <p className="text-2xl font-bold text-purple-800 mt-1">{totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Billing Invoices</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Milestone</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-center">% Complete</TableHead>
                <TableHead className="text-right">Billed</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(b => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-slate-400" />
                      {b.invoiceNumber}
                    </div>
                  </TableCell>
                  <TableCell>{b.milestoneName || "—"}</TableCell>
                  <TableCell className="text-sm">{b.billingPeriod || "—"}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="font-mono">{b.percentageComplete}%</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">{Number(b.billedAmount).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{Number(b.paidAmount).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs ${statusColors[b.status]}`}>{b.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-12 text-slate-500">No billing records found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Retention Accounts</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Subcontractor</TableHead>
                <TableHead className="text-right">Total Retention</TableHead>
                <TableHead className="text-right">Released</TableHead>
                <TableHead className="text-right">Remaining</TableHead>
                <TableHead>Release Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {retentions?.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{r.projectId}</TableCell>
                  <TableCell>{r.subcontractorId || "—"}</TableCell>
                  <TableCell className="text-right font-mono">{Number(r.totalRetention).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{Number(r.releasedAmount).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{Number(r.remainingAmount).toLocaleString()}</TableCell>
                  <TableCell className="text-sm">{r.expectedReleaseDate || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs ${r.status === "released" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {r.status?.replace("_", " ") || "held"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {(!retentions || retentions.length === 0) && (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-500">No retention records</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Progress Invoice</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); setOpen(false); }} className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Invoice #</Label><Input value={form.invoiceNumber} onChange={e => setForm({...form, invoiceNumber: e.target.value})} required /></div>
              <div><Label>Project</Label><Input type="number" value={form.projectId} onChange={e => setForm({...form, projectId: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Milestone</Label><Input value={form.milestoneName} onChange={e => setForm({...form, milestoneName: e.target.value})} /></div>
              <div><Label>Period</Label><Input value={form.billingPeriod} onChange={e => setForm({...form, billingPeriod: e.target.value})} placeholder="Jan 2026" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>% Complete</Label><Input type="number" value={form.percentageComplete} onChange={e => setForm({...form, percentageComplete: e.target.value})} /></div>
              <div><Label>Billed Amount</Label><Input type="number" value={form.billedAmount} onChange={e => setForm({...form, billedAmount: e.target.value})} /></div>
              <div><Label>Paid Amount</Label><Input type="number" value={form.paidAmount} onChange={e => setForm({...form, paidAmount: e.target.value})} /></div>
            </div>
            <Button type="submit" className="w-full">Create Invoice</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
