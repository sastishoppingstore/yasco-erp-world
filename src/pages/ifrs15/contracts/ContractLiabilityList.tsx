import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Building2 } from "lucide-react";

export default function ContractLiabilityList() {
  const { data: liabilities, refetch } = trpc.ifrs15.contractLiabilityList.useQuery(undefined);
  const createLiab = trpc.ifrs15.contractLiabilityCreate.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ liabilityType: "deferred_revenue" as const, amount: "0", date: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createLiab.mutate(form);
    setOpen(false);
  };

  const statusColors: Record<string, string> = {
    unearned: "bg-gray-100 text-gray-800", partially_recognized: "bg-blue-100 text-blue-800",
    fully_recognized: "bg-green-100 text-green-800",
  };

  const liabTypeLabels: Record<string, string> = {
    deferred_revenue: "Deferred Revenue", advance_billing: "Advance Billing", refund_liability: "Refund Liability",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Contract Liabilities</h2><p className="text-slate-500">Deferred revenue and other contract liabilities</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Liability</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Contract Liability</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Liability Type</Label>
                <Select value={form.liabilityType} onValueChange={v => setForm({...form, liabilityType: v as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deferred_revenue">Deferred Revenue</SelectItem>
                    <SelectItem value="advance_billing">Advance Billing</SelectItem>
                    <SelectItem value="refund_liability">Refund Liability</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Amount</Label><Input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required /></div>
              <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></div>
              <Button type="submit" className="w-full">Create Liability</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left"><th className="p-3 font-medium">Type</th><th className="p-3 font-medium">Amount</th><th className="p-3 font-medium">Recognized</th><th className="p-3 font-medium">Remaining</th><th className="p-3 font-medium">Status</th></tr></thead>
            <tbody>
              {liabilities?.map(l => (
                <tr key={l.id} className="border-b last:border-0">
                  <td className="p-3">{liabTypeLabels[l.liabilityType] || l.liabilityType}</td>
                  <td className="p-3">{l.amount}</td>
                  <td className="p-3">{l.recognizedAmount}</td>
                  <td className="p-3">{l.remainingAmount}</td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[l.status]}`}>{l.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
