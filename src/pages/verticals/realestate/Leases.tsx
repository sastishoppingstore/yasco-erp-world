import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText } from "lucide-react";

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700", active: "bg-emerald-100 text-emerald-700",
  expired: "bg-amber-100 text-amber-700", terminated: "bg-red-100 text-red-700", renewed: "bg-blue-100 text-blue-700",
};

export default function LeasesPage() {
  const { data: leases, refetch } = trpc.realEstate.leaseList.useQuery(undefined);
  const createLease = trpc.realEstate.leaseCreate.useMutation({ onSuccess: () => { refetch(); setOpen(false); } });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ leaseNumber: "", unitId: 0, startDate: "", endDate: "", monthlyRent: "0", leaseType: "residential" as const, rentDueDay: 1 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Leases</h2><p className="text-slate-500">Manage lease agreements</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Lease</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Lease</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createLease.mutate(form); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Lease #</Label><Input value={form.leaseNumber} onChange={e => setForm({...form, leaseNumber: e.target.value})} required /></div>
                <div><Label>Unit ID</Label><Input type="number" value={form.unitId || ""} onChange={e => setForm({...form, unitId: Number(e.target.value)})} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} required /></div>
                <div><Label>End Date</Label><Input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} required /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Monthly Rent</Label><Input type="number" value={form.monthlyRent} onChange={e => setForm({...form, monthlyRent: e.target.value})} /></div>
                <div><Label>Rent Due Day</Label><Input type="number" value={form.rentDueDay} onChange={e => setForm({...form, rentDueDay: Number(e.target.value)})} /></div>
                <div><Label>Type</Label><Select value={form.leaseType} onValueChange={(v: any) => setForm({...form, leaseType: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="residential">Residential</SelectItem><SelectItem value="commercial">Commercial</SelectItem><SelectItem value="short_term">Short Term</SelectItem><SelectItem value="long_term">Long Term</SelectItem></SelectContent></Select></div>
              </div>
              <Button type="submit" className="w-full">Create Lease</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Active Leases</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Lease #</TableHead><TableHead>Unit</TableHead><TableHead>Tenant</TableHead><TableHead>Period</TableHead><TableHead className="text-right">Rent</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {leases?.map(l => (
                <TableRow key={l.id}>
                  <TableCell className="font-mono text-sm"><div className="flex items-center gap-2"><FileText className="w-4 h-4 text-slate-400" />{l.leaseNumber}</div></TableCell>
                  <TableCell>{l.unitId}</TableCell>
                  <TableCell>{l.customerId || "—"}</TableCell>
                  <TableCell className="text-sm">{l.startDate} → {l.endDate}</TableCell>
                  <TableCell className="text-right font-mono">{Number(l.monthlyRent).toLocaleString()} SAR</TableCell>
                  <TableCell className="capitalize">{l.leaseType.replace("_", " ")}</TableCell>
                  <TableCell><Badge className={statusColors[l.status]}>{l.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
