import { useState } from "react";
import { useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, DollarSign } from "lucide-react";

export default function GroupDetail() {
  const { id } = useParams();
  const groupId = Number(id);
  const { data, refetch } = trpc.consolidation.consolidationGroupGet.useQuery({ id: groupId });
  const createEntry = trpc.consolidation.consolidationEntryCreate.useMutation({ onSuccess: () => refetch() });
  const runConsolidation = trpc.consolidation.runConsolidation.useMutation({ onSuccess: () => refetch() });
  const { data: translationResult, refetch: _tr } = trpc.consolidation.currencyTranslation.useMutation();
  const [entryOpen, setEntryOpen] = useState(false);
  const [entryForm, setEntryForm] = useState({
    entryType: "elimination" as const, description: "", amount: "0",
    accountId: 0, companyId: 0, currency: "SAR", exchangeRate: "1.000000",
    periodStart: "", periodEnd: "",
  });
  const [runOpen, setRunOpen] = useState(false);
  const [runForm, setRunForm] = useState({ periodStart: "", periodEnd: "" });
  const [fxOpen, setFxOpen] = useState(false);
  const [fxForm, setFxForm] = useState({ fromCurrency: "SAR", toCurrency: "SAR", exchangeRate: "1" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEntry.mutate({ ...entryForm, groupId });
    setEntryOpen(false);
  };

  const runConsolidationHandler = (e: React.FormEvent) => {
    e.preventDefault();
    runConsolidation.mutate({ groupId, ...runForm });
    setRunOpen(false);
  };

  const handleFx = (e: React.FormEvent) => {
    e.preventDefault();
    translationResult?.mutate({ groupId, ...fxForm });
    setFxOpen(false);
  };

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800", in_progress: "bg-blue-100 text-blue-800", completed: "bg-green-100 text-green-800",
  };

  const entryTypeColors: Record<string, string> = {
    elimination: "bg-red-100 text-red-800", reclassification: "bg-blue-100 text-blue-800",
    adjustment: "bg-amber-100 text-amber-800", translation: "bg-purple-100 text-purple-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{data?.group?.name || "Group Detail"}</h2>
          <p className="text-slate-500">{data?.group?.baseCurrency} · {data?.group?.consolidationMethod} · <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[data?.group?.status || ""]}`}>{data?.group?.status}</span></p>
        </div>
        <div className="flex gap-2">
          <Dialog open={runOpen} onOpenChange={setRunOpen}>
            <DialogTrigger asChild><Button variant="default"><Play className="w-4 h-4 mr-2" />Run Consolidation</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Run Consolidation</DialogTitle></DialogHeader>
              <form onSubmit={runConsolidationHandler} className="space-y-4">
                <div><Label>Period Start</Label><Input type="date" value={runForm.periodStart} onChange={e => setRunForm({...runForm, periodStart: e.target.value})} required /></div>
                <div><Label>Period End</Label><Input type="date" value={runForm.periodEnd} onChange={e => setRunForm({...runForm, periodEnd: e.target.value})} required /></div>
                <Button type="submit" className="w-full">Execute Consolidation</Button>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={fxOpen} onOpenChange={setFxOpen}>
            <DialogTrigger asChild><Button variant="outline"><DollarSign className="w-4 h-4 mr-2" />Currency Translation</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Currency Translation</DialogTitle></DialogHeader>
              <form onSubmit={handleFx} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>From</Label><Input value={fxForm.fromCurrency} onChange={e => setFxForm({...fxForm, fromCurrency: e.target.value})} /></div>
                  <div><Label>To</Label><Input value={fxForm.toCurrency} onChange={e => setFxForm({...fxForm, toCurrency: e.target.value})} /></div>
                </div>
                <div><Label>Exchange Rate</Label><Input type="number" step="0.000001" value={fxForm.exchangeRate} onChange={e => setFxForm({...fxForm, exchangeRate: e.target.value})} /></div>
                <Button type="submit" className="w-full">Apply Translation</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Companies in Group</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left"><th className="pb-2 font-medium">Company</th><th className="pb-2 font-medium">Ownership %</th><th className="pb-2 font-medium">Excluded</th></tr></thead>
            <tbody>
              {data?.companies?.map(c => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="py-2">Company #{c.companyId}</td>
                  <td className="py-2">{c.ownershipPercent}%</td>
                  <td className="py-2">{c.isExcluded ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Consolidation Entries</CardTitle>
          <Dialog open={entryOpen} onOpenChange={setEntryOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-2" />Add Entry</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Consolidation Entry</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label>Entry Type</Label>
                  <Select value={entryForm.entryType} onValueChange={v => setEntryForm({...entryForm, entryType: v as any})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="elimination">Elimination</SelectItem>
                      <SelectItem value="reclassification">Reclassification</SelectItem>
                      <SelectItem value="adjustment">Adjustment</SelectItem>
                      <SelectItem value="translation">Translation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Description</Label><Input value={entryForm.description} onChange={e => setEntryForm({...entryForm, description: e.target.value})} required /></div>
                <div><Label>Amount</Label><Input type="number" value={entryForm.amount} onChange={e => setEntryForm({...entryForm, amount: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Period Start</Label><Input type="date" value={entryForm.periodStart} onChange={e => setEntryForm({...entryForm, periodStart: e.target.value})} /></div>
                  <div><Label>Period End</Label><Input type="date" value={entryForm.periodEnd} onChange={e => setEntryForm({...entryForm, periodEnd: e.target.value})} /></div>
                </div>
                <Button type="submit" className="w-full">Create Entry</Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left"><th className="pb-2 font-medium">Type</th><th className="pb-2 font-medium">Description</th><th className="pb-2 font-medium">Amount</th><th className="pb-2 font-medium">Status</th></tr></thead>
            <tbody>
              {data?.entries?.map(e => (
                <tr key={e.id} className="border-b last:border-0">
                  <td className="py-2"><Badge variant="outline" className={entryTypeColors[e.entryType]}>{e.entryType}</Badge></td>
                  <td className="py-2">{e.description}</td>
                  <td className="py-2">{e.amount} {e.currency}</td>
                  <td className="py-2 capitalize">{e.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Eliminations</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left"><th className="pb-2 font-medium">Type</th><th className="pb-2 font-medium">Source</th><th className="pb-2 font-medium">Target</th><th className="pb-2 font-medium">Amount</th></tr></thead>
            <tbody>
              {data?.eliminations?.map(e => (
                <tr key={e.id} className="border-b last:border-0">
                  <td className="py-2 capitalize">{e.entryType.replace(/_/g, " ")}</td>
                  <td className="py-2">Company #{e.sourceCompanyId}</td>
                  <td className="py-2">Company #{e.targetCompanyId}</td>
                  <td className="py-2">{e.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
