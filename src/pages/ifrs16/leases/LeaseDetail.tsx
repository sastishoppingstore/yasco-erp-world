import { useState } from "react";
import { useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, CalendarCheck, Plus, FileText } from "lucide-react";

export default function LeaseDetail() {
  const { id } = useParams();
  const contractId = Number(id);
  const { data, refetch } = trpc.ifrs16.leaseContractGet.useQuery({ id: contractId });
  const calcLiab = trpc.ifrs16.calculateLeaseLiability.useMutation({ onSuccess: () => refetch() });
  const genSchedule = trpc.ifrs16.generatePaymentSchedule.useMutation({ onSuccess: () => refetch() });
  const journalizeLease = trpc.ifrs16.journalizeLease.useMutation({ onSuccess: () => refetch() });
  const runDeprec = trpc.ifrs16.runDepreciation.useMutation({ onSuccess: () => refetch() });
  const updatePmt = trpc.ifrs16.paymentScheduleUpdate.useMutation({ onSuccess: () => refetch() });
  const [modOpen, setModOpen] = useState(false);
  const [jeOpen, setJeOpen] = useState(false);
  const [jeForm, setJeForm] = useState({ entryNumber: "", date: "" });
  const [depForm, setDepForm] = useState({ entryNumber: "", date: "" });

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800", expired: "bg-gray-100 text-gray-800",
    terminated: "bg-red-100 text-red-800", amended: "bg-blue-100 text-blue-800",
  };
  const paymentStatusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800", paid: "bg-green-100 text-green-800", overdue: "bg-red-100 text-red-800",
  };

  const handleJournalize = (e: React.FormEvent) => {
    e.preventDefault();
    journalizeLease.mutate({ contractId, ...jeForm });
    setJeOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{data?.contract?.leaseCode}</h2>
          <p className="text-slate-500">{data?.contract?.lessorName} · {data?.contract?.leaseType} · <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[data?.contract?.status || ""]}`}>{data?.contract?.status}</span></p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => calcLiab.mutate({ contractId })} disabled={calcLiab.isPending}>
            <Calculator className="w-4 h-4 mr-2" />{calcLiab.isPending ? "Calculating..." : "Calc PV"}
          </Button>
          <Button variant="outline" onClick={() => genSchedule.mutate({ contractId })} disabled={genSchedule.isPending}>
            <CalendarCheck className="w-4 h-4 mr-2" />{genSchedule.isPending ? "Generating..." : "Gen Schedule"}
          </Button>
          <Dialog open={jeOpen} onOpenChange={setJeOpen}>
            <DialogTrigger asChild><Button><FileText className="w-4 h-4 mr-2" />Journalize</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Journalize Lease Commencement</DialogTitle></DialogHeader>
              <form onSubmit={handleJournalize} className="space-y-4">
                <div><Label>Entry Number</Label><Input value={jeForm.entryNumber} onChange={e => setJeForm({...jeForm, entryNumber: e.target.value})} required /></div>
                <div><Label>Date</Label><Input type="date" value={jeForm.date} onChange={e => setJeForm({...jeForm, date: e.target.value})} required /></div>
                <Button type="submit" className="w-full">Post Journal Entry</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Lease Liability</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{Number(data?.contract?.leaseLiability || 0).toLocaleString()} SAR</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">ROU Asset</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{Number(data?.contract?.rightOfUseAsset || 0).toLocaleString()} SAR</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Accum. Depreciation</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{Number(data?.contract?.accumulatedDepreciation || 0).toLocaleString()} SAR</p></CardContent></Card>
      </div>

      <Tabs defaultValue="payments">
        <TabsList>
          <TabsTrigger value="payments">Payment Schedule</TabsTrigger>
          <TabsTrigger value="modifications">Modifications</TabsTrigger>
          <TabsTrigger value="assets">ROU Assets</TabsTrigger>
        </TabsList>
        <TabsContent value="payments" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Payment Schedule</h3>
            <div className="flex gap-2">
              <Dialog open={depForm.entryNumber ? true : false} onOpenChange={o => !o && setDepForm({ entryNumber: "", date: "" })}>
                <Button size="sm" variant="outline" onClick={() => {
                  const d = new Date(); const ds = d.toISOString().split("T")[0];
                  runDeprec.mutate({ contractId, entryNumber: `DEP-${contractId}-${ds}`, date: ds });
                }} disabled={runDeprec.isPending}>
                  <Calculator className="w-4 h-4 mr-2" />Run Depreciation
                </Button>
              </Dialog>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left"><th className="pb-2 font-medium">Date</th><th className="pb-2 font-medium">Payment</th><th className="pb-2 font-medium">Principal</th><th className="pb-2 font-medium">Interest</th><th className="pb-2 font-medium">Balance</th><th className="pb-2 font-medium">Status</th></tr></thead>
            <tbody>
              {data?.payments?.map(p => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </TabsContent>
        <TabsContent value="modifications">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Modifications</h3>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left"><th className="pb-2 font-medium">Date</th><th className="pb-2 font-medium">Type</th><th className="pb-2 font-medium">Description</th><th className="pb-2 font-medium">Old Amount</th><th className="pb-2 font-medium">New Amount</th></tr></thead>
            <tbody>
              {data?.modifications?.map(m => (
                <tr key={m.id} className="border-b last:border-0">
                  <td className="py-2">{m.modificationDate}</td>
                  <td className="py-2 capitalize">{m.modificationType.replace(/_/g, " ")}</td>
                  <td className="py-2">{m.description}</td>
                  <td className="py-2">{m.oldPaymentAmount}</td>
                  <td className="py-2">{m.newPaymentAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabsContent>
        <TabsContent value="assets">
          <h3 className="font-semibold mb-4">Right of Use Assets</h3>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left"><th className="pb-2 font-medium">Asset Name</th><th className="pb-2 font-medium">Cost</th><th className="pb-2 font-medium">Accum. Depr.</th><th className="pb-2 font-medium">Net Book Value</th><th className="pb-2 font-medium">Status</th></tr></thead>
            <tbody>
              {data?.rouAssets?.map(a => (
                <tr key={a.id} className="border-b last:border-0">
                  <td className="py-2">{a.assetName}</td>
                  <td className="py-2">{a.cost}</td>
                  <td className="py-2">{a.accumulatedDepreciation}</td>
                  <td className="py-2">{a.netBookValue}</td>
                  <td className="py-2 capitalize">{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
