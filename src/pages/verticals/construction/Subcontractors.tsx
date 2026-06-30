import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Users } from "lucide-react";

export default function SubcontractorsPage() {
  const { data: subs, refetch } = trpc.construction.subcontractorList.useQuery(undefined);
  const createSub = trpc.construction.subcontractorCreate.useMutation({ onSuccess: () => { refetch(); setOpen(false); } });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", trade: "", contactPerson: "", email: "", phone: "", licenseNumber: "", contractAmount: "0" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Subcontractors</h2><p className="text-slate-500">Manage subcontractors and contracts</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Subcontractor</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Subcontractor</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createSub.mutate(form); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Company Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                <div><Label>Trade</Label><Input value={form.trade} onChange={e => setForm({...form, trade: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Contact Person</Label><Input value={form.contactPerson} onChange={e => setForm({...form, contactPerson: e.target.value})} /></div>
                <div><Label>License #</Label><Input value={form.licenseNumber} onChange={e => setForm({...form, licenseNumber: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              </div>
              <div><Label>Contract Amount</Label><Input type="number" value={form.contractAmount} onChange={e => setForm({...form, contractAmount: e.target.value})} /></div>
              <Button type="submit" className="w-full">Add Subcontractor</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle>All Subcontractors</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Trade</TableHead><TableHead>Contact</TableHead><TableHead>License</TableHead><TableHead className="text-right">Contract</TableHead><TableHead className="text-right">Paid</TableHead><TableHead>Retention</TableHead></TableRow></TableHeader>
            <TableBody>
              {subs?.map(s => (
                <TableRow key={s.id}>
                  <TableCell><div className="flex items-center gap-2"><Users className="w-4 h-4 text-slate-400" /><span className="font-medium">{s.name}</span></div></TableCell>
                  <TableCell>{s.trade || "—"}</TableCell>
                  <TableCell className="text-sm">{s.contactPerson || "—"}</TableCell>
                  <TableCell className="font-mono text-sm">{s.licenseNumber || "—"}</TableCell>
                  <TableCell className="text-right font-mono">{Number(s.contractAmount).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{Number(s.paidAmount).toLocaleString()}</TableCell>
                  <TableCell><Badge variant="outline">{s.retentionPercent}%</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
