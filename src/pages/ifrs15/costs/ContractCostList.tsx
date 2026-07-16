import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, DollarSign } from "lucide-react";

export default function ContractCostList() {
  const { data: costs, refetch } = trpc.ifrs15.contractCostList.useQuery(undefined);
  const createCost = trpc.ifrs15.contractCostCreate.useMutation({ onSuccess: () => refetch() });
  const expenseCost = trpc.ifrs15.expenseContractCosts.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    costType: "incremental_fulfillment" as const, description: "", amount: "0",
    capitalizedAmount: "", amortizationPeriod: 0, amortizationMethod: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCost.mutate(form);
    setOpen(false);
  };

  const statusColors: Record<string, string> = {
    pending: "bg-gray-100 text-gray-800", capitalized: "bg-blue-100 text-blue-800", amortized: "bg-green-100 text-green-800",
  };

  const costTypeLabels: Record<string, string> = {
    incremental_fulfillment: "Incremental Fulfillment", mobilization: "Mobilization",
    setup: "Setup", training: "Training", commission: "Commission",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Contract Costs</h2><p className="text-slate-500">Capitalized and amortized contract costs</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Cost</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>New Contract Cost</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Cost Type</Label>
                <Select value={form.costType} onValueChange={v => setForm({...form, costType: v as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="incremental_fulfillment">Incremental Fulfillment</SelectItem>
                    <SelectItem value="mobilization">Mobilization</SelectItem>
                    <SelectItem value="setup">Setup</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="commission">Commission</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Description</Label><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} required /></div>
              <div><Label>Amount</Label><Input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Capitalized Amount</Label><Input type="number" value={form.capitalizedAmount} onChange={e => setForm({...form, capitalizedAmount: e.target.value})} /></div>
                <div><Label>Amortization Period</Label><Input type="number" value={form.amortizationPeriod || ""} onChange={e => setForm({...form, amortizationPeriod: Number(e.target.value)})} /></div>
              </div>
              <Button type="submit" className="w-full">Create Cost</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left"><th className="p-3 font-medium">Type</th><th className="p-3 font-medium">Description</th><th className="p-3 font-medium">Amount</th><th className="p-3 font-medium">Capitalized</th><th className="p-3 font-medium">Status</th><th className="p-3 font-medium">Actions</th></tr></thead>
            <tbody>
              {costs?.map(c => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="p-3">{costTypeLabels[c.costType] || c.costType}</td>
                  <td className="p-3">{c.description}</td>
                  <td className="p-3">{c.amount}</td>
                  <td className="p-3">{c.capitalizedAmount}</td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[c.status]}`}>{c.status}</span></td>
                  <td className="p-3">
                    <Button size="sm" variant="outline" onClick={() => expenseCost.mutate({
                      costId: c.id, entryNumber: `AMORT-${c.id}`, date: new Date().toISOString().split("T")[0],
                    })} disabled={c.status === "amortized" || expenseCost.isPending}>
                      <DollarSign className="w-3 h-3 mr-1" />Amortize
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
