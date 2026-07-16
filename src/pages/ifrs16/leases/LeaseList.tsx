import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router";
import { Plus, Building2 } from "lucide-react";

export default function LeaseList() {
  const { data: leases, refetch } = trpc.ifrs16.leaseContractList.useQuery(undefined);
  const createLease = trpc.ifrs16.leaseContractCreate.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    leaseCode: "", description: "", lessorName: "", leaseType: "operating" as const,
    startDate: "", endDate: "", leaseTermMonths: 0, rentalPaymentAmount: "0",
    paymentFrequency: "monthly" as const, paymentDay: 1,
    discountRate: "0", notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createLease.mutate(form as any);
    setOpen(false);
  };

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800", expired: "bg-gray-100 text-gray-800",
    terminated: "bg-red-100 text-red-800", amended: "bg-blue-100 text-blue-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Lease Contracts</h2><p className="text-slate-500">IFRS 16 lease portfolio</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Lease</Button></DialogTrigger>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>New Lease Contract</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Lease Code</Label><Input value={form.leaseCode} onChange={e => setForm({...form, leaseCode: e.target.value})} required /></div>
                <div><Label>Lessor Name</Label><Input value={form.lessorName} onChange={e => setForm({...form, lessorName: e.target.value})} required /></div>
              </div>
              <div><Label>Description</Label><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Lease Type</Label>
                  <Select value={form.leaseType} onValueChange={v => setForm({...form, leaseType: v as any})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="operating">Operating</SelectItem><SelectItem value="finance">Finance</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Payment Frequency</Label>
                  <Select value={form.paymentFrequency} onValueChange={v => setForm({...form, paymentFrequency: v as any})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="semi_annual">Semi-Annual</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} required /></div>
                <div><Label>End Date</Label><Input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} required /></div>
                <div><Label>Term (months)</Label><Input type="number" value={form.leaseTermMonths || ""} onChange={e => setForm({...form, leaseTermMonths: Number(e.target.value)})} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Rental Amount</Label><Input type="number" value={form.rentalPaymentAmount} onChange={e => setForm({...form, rentalPaymentAmount: e.target.value})} required /></div>
                <div><Label>Discount Rate (%)</Label><Input type="number" step="0.0001" value={form.discountRate} onChange={e => setForm({...form, discountRate: e.target.value})} required /></div>
              </div>
              <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
              <Button type="submit" className="w-full">Create Lease Contract</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4">
        {leases?.map(l => (
          <Link key={l.id} to={`/app/ifrs16/leases/${l.id}`} className="block">
            <Card className="hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{l.leaseCode}</p>
                    <p className="text-xs text-slate-500">{l.lessorName} · {l.leaseType} · {l.rentalPaymentAmount} SAR/mo</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">{l.startDate} → {l.endDate}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[l.status || ""] || ""}`}>{l.status}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
