import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, DollarSign } from "lucide-react";

export default function ContractAssetList() {
  const { data: assets, refetch } = trpc.ifrs15.contractAssetList.useQuery(undefined);
  const createAsset = trpc.ifrs15.contractAssetCreate.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ assetType: "contract_asset" as const, amount: "0", date: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAsset.mutate(form);
    setOpen(false);
  };

  const statusColors: Record<string, string> = {
    pending: "bg-gray-100 text-gray-800", recognized: "bg-blue-100 text-blue-800",
    billed: "bg-amber-100 text-amber-800", collected: "bg-green-100 text-green-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Contract Assets</h2><p className="text-slate-500">IFRS 15 Step 4 - Allocate and recognize</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Asset</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Contract Asset</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Asset Type</Label>
                <Select value={form.assetType} onValueChange={v => setForm({...form, assetType: v as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contract_asset">Contract Asset</SelectItem>
                    <SelectItem value="receivable">Receivable</SelectItem>
                    <SelectItem value="unbilled_receivable">Unbilled Receivable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Amount</Label><Input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required /></div>
              <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></div>
              <Button type="submit" className="w-full">Create Asset</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left"><th className="p-3 font-medium">Type</th><th className="p-3 font-medium">Amount</th><th className="p-3 font-medium">Recognized</th><th className="p-3 font-medium">Billed</th><th className="p-3 font-medium">Received</th><th className="p-3 font-medium">Status</th></tr></thead>
            <tbody>
              {assets?.map(a => (
                <tr key={a.id} className="border-b last:border-0">
                  <td className="p-3 capitalize">{a.assetType.replace(/_/g, " ")}</td>
                  <td className="p-3">{a.amount}</td>
                  <td className="p-3">{a.recognizedRevenue}</td>
                  <td className="p-3">{a.billingAmount}</td>
                  <td className="p-3">{a.receivedAmount}</td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[a.status]}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
