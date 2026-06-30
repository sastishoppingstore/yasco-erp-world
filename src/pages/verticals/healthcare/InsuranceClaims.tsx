import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText } from "lucide-react";

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700", submitted: "bg-blue-100 text-blue-700",
  approved: "bg-emerald-100 text-emerald-700", rejected: "bg-red-100 text-red-700",
  paid: "bg-purple-100 text-purple-700", partial: "bg-amber-100 text-amber-700",
};

export default function InsuranceClaimsPage() {
  const { data: claims, refetch } = trpc.healthcare.insuranceClaimList.useQuery(undefined);
  const createClaim = trpc.healthcare.insuranceClaimCreate.useMutation({ onSuccess: () => { refetch(); setOpen(false); } });
  const [open, setOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [form, setForm] = useState({ patientId: 0, claimNumber: "", insuranceProvider: "", policyNumber: "", claimAmount: "0", diagnosis: "", treatment: "" });

  const filtered = claims?.filter(c => !filterStatus || c.status === filterStatus) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Insurance Claims</h2><p className="text-slate-500">Submit and track insurance claims</p></div>
        <div className="flex gap-2">
          <div className="flex gap-1">
            {["", "draft", "submitted", "approved", "rejected", "paid"].map(s => (
              <Button key={s} variant="outline" size="sm" onClick={() => setFilterStatus(s)} className={filterStatus === s ? "bg-slate-100 capitalize" : "capitalize"}>{s || "All"}</Button>
            ))}
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Claim</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Submit Insurance Claim</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createClaim.mutate(form); }} className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Patient ID</Label><Input type="number" value={form.patientId || ""} onChange={e => setForm({...form, patientId: Number(e.target.value)})} required /></div>
                  <div><Label>Claim #</Label><Input value={form.claimNumber} onChange={e => setForm({...form, claimNumber: e.target.value})} required /></div>
                </div>
                <div><Label>Insurance Provider</Label><Input value={form.insuranceProvider} onChange={e => setForm({...form, insuranceProvider: e.target.value})} required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Policy #</Label><Input value={form.policyNumber} onChange={e => setForm({...form, policyNumber: e.target.value})} /></div>
                  <div><Label>Claim Amount</Label><Input type="number" value={form.claimAmount} onChange={e => setForm({...form, claimAmount: e.target.value})} /></div>
                </div>
                <div><Label>Diagnosis</Label><Input value={form.diagnosis} onChange={e => setForm({...form, diagnosis: e.target.value})} /></div>
                <div><Label>Treatment</Label><Input value={form.treatment} onChange={e => setForm({...form, treatment: e.target.value})} /></div>
                <Button type="submit" className="w-full">Submit Claim</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Claims</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Claim #</TableHead><TableHead>Provider</TableHead><TableHead>Policy</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="text-right">Approved</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-sm"><div className="flex items-center gap-2"><FileText className="w-4 h-4 text-slate-400" />{c.claimNumber}</div></TableCell>
                  <TableCell>{c.insuranceProvider}</TableCell>
                  <TableCell className="font-mono text-sm">{c.policyNumber || "—"}</TableCell>
                  <TableCell className="text-right font-mono">{Number(c.claimAmount).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{Number(c.approvedAmount).toLocaleString()}</TableCell>
                  <TableCell><Badge className={statusColors[c.status]}>{c.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
