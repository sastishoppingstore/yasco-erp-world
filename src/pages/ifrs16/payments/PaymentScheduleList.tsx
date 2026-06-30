import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PaymentScheduleList() {
  const { data: payments, refetch } = trpc.ifrs16.paymentScheduleList.useQuery(undefined);
  const updatePmt = trpc.ifrs16.paymentScheduleUpdate.useMutation({ onSuccess: () => refetch() });
  const journalizePmt = trpc.ifrs16.journalizePayment.useMutation({ onSuccess: () => refetch() });
  const [jeOpen, setJeOpen] = useState(false);
  const [jeForm, setJeForm] = useState({ scheduleId: 0, entryNumber: "", date: "" });

  const paymentStatusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800", paid: "bg-green-100 text-green-800", overdue: "bg-red-100 text-red-800",
  };

  const handleJournalize = (e: React.FormEvent) => {
    e.preventDefault();
    journalizePmt.mutate(jeForm);
    setJeOpen(false);
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Payment Schedules</h2><p className="text-slate-500">All lease payment schedules</p></div>
      <Card>
        <CardHeader><CardTitle>Scheduled Payments</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left"><th className="pb-2 font-medium">Date</th><th className="pb-2 font-medium">Amount</th><th className="pb-2 font-medium">Principal</th><th className="pb-2 font-medium">Interest</th><th className="pb-2 font-medium">Balance</th><th className="pb-2 font-medium">Status</th><th className="pb-2 font-medium">Actions</th></tr></thead>
            <tbody>
              {payments?.map(p => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-2">{p.paymentDate}</td>
                  <td className="py-2">{p.paymentAmount}</td>
                  <td className="py-2">{p.principalPortion}</td>
                  <td className="py-2">{p.interestPortion}</td>
                  <td className="py-2">{p.outstandingBalance}</td>
                  <td className="py-2">
                    <Select value={p.paymentStatus} onValueChange={v => updatePmt.mutate({ id: p.id, paymentStatus: v as any })}>
                      <SelectTrigger className={`h-7 text-xs w-24 ${paymentStatusColors[p.paymentStatus]}`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-2">
                    <Button size="sm" variant="outline" onClick={() => {
                      setJeForm({ scheduleId: p.id, entryNumber: `PMT-${p.id}`, date: new Date().toISOString().split("T")[0] });
                      setJeOpen(true);
                    }} disabled={p.paymentStatus === "paid"}>Journalize</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={jeOpen} onOpenChange={setJeOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Journalize Payment</DialogTitle></DialogHeader>
          <form onSubmit={handleJournalize} className="space-y-4">
            <div><Label>Entry Number</Label><Input value={jeForm.entryNumber} onChange={e => setJeForm({...jeForm, entryNumber: e.target.value})} required /></div>
            <div><Label>Date</Label><Input type="date" value={jeForm.date} onChange={e => setJeForm({...jeForm, date: e.target.value})} required /></div>
            <Button type="submit" className="w-full">Post Payment Entry</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
