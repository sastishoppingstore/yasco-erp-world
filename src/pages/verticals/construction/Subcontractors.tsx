import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Phone, Mail, FileText, Star, Building2, User } from "lucide-react";
import ActionButton3D from "@/components/ui/ActionButton3D";

export default function SubcontractorsPage() {
  const { data: subs, refetch } = trpc.construction.subcontractorList.useQuery(undefined);
  const createSub = trpc.construction.subcontractorCreate.useMutation({ onSuccess: () => { refetch(); setOpen(false); } });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", trade: "", contactPerson: "", email: "", phone: "",
    licenseNumber: "", contractAmount: "0", classification: "", rating: "0",
  });

  const activeSubs = subs?.filter(s => s.status === "active" || !s.status).length || 0;
  const totalContracts = subs?.reduce((s, sub) => s + Number(sub.contractAmount || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Subcontractors</h2>
          <p className="text-slate-500">Manage subcontractors, contracts, and SCA classification</p>
        </div>
        <ActionButton3D icon={<Plus className="size-4" />} label="Add Subcontractor" color="blue" onClick={() => setOpen(true)} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2"><Building2 className="size-4 text-blue-600" /><p className="text-xs text-blue-700 font-medium">Total</p></div>
            <p className="text-2xl font-bold text-blue-800 mt-1">{subs?.length || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2"><User className="size-4 text-emerald-600" /><p className="text-xs text-emerald-700 font-medium">Active</p></div>
            <p className="text-2xl font-bold text-emerald-800 mt-1">{activeSubs}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2"><FileText className="size-4 text-amber-600" /><p className="text-xs text-amber-700 font-medium">Total Contracts</p></div>
            <p className="text-2xl font-bold text-amber-800 mt-1">{totalContracts.toLocaleString()} SAR</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2"><Star className="size-4 text-purple-600" /><p className="text-xs text-purple-700 font-medium">Avg Rating</p></div>
            <p className="text-2xl font-bold text-purple-800 mt-1">{subs?.length ? "—" : "0"}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle>All Subcontractors</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Trade</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Classification</TableHead>
                <TableHead className="text-right">Contract</TableHead>
                <TableHead>Retention</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subs?.map(s => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">{s.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{s.trade || "—"}</TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-1">
                      <Phone className="size-3 text-slate-400" />
                      {s.contactPerson || "—"}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{s.licenseNumber || "—"}</TableCell>
                  <TableCell>
                    {s.classification ? (
                      <Badge variant="outline" className="text-xs">{s.classification}</Badge>
                    ) : "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono">{Number(s.contractAmount).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{s.retentionPercent || 5}%</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {(!subs || subs.length === 0) && (
                <TableRow><TableCell colSpan={7} className="text-center py-12 text-slate-500">No subcontractors yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Subcontractor</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createSub.mutate(form); }} className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Company Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div><Label>Trade</Label><Input value={form.trade} onChange={e => setForm({...form, trade: e.target.value})} placeholder="Electrical / Plumbing" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Contact Person</Label><Input value={form.contactPerson} onChange={e => setForm({...form, contactPerson: e.target.value})} /></div>
              <div><Label>SCA Classification</Label><Input value={form.classification} onChange={e => setForm({...form, classification: e.target.value})} placeholder="Grade 1/2/3" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>License #</Label><Input value={form.licenseNumber} onChange={e => setForm({...form, licenseNumber: e.target.value})} /></div>
              <div><Label>Contract Amount</Label><Input type="number" value={form.contractAmount} onChange={e => setForm({...form, contractAmount: e.target.value})} /></div>
            </div>
            <Button type="submit" className="w-full">Add Subcontractor</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
