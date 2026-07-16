import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, CheckCircle2 } from "lucide-react";

export default function TransactionList() {
  const { data: txns, refetch } = trpc.consolidation.intercompanyTransactionList.useQuery(undefined);
  const { data: companies } = trpc.consolidation.companyList.useQuery(undefined);
  const createTx = trpc.consolidation.intercompanyTransactionCreate.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    transactionNumber: "", transactionDate: "", sourceCompanyId: 0, targetCompanyId: 0,
    transactionType: "sale" as const, referenceNumber: "", totalAmount: "0",
    currency: "SAR", exchangeRate: "1.000000", description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTx.mutate(form);
    setOpen(false);
  };

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800", posted: "bg-blue-100 text-blue-800", reconciled: "bg-green-100 text-green-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Intercompany Transactions</h2><p className="text-slate-500">Manage transactions between group companies</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Transaction</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>New Intercompany Transaction</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Transaction #</Label><Input value={form.transactionNumber} onChange={e => setForm({...form, transactionNumber: e.target.value})} required /></div>
                <div><Label>Date</Label><Input type="date" value={form.transactionDate} onChange={e => setForm({...form, transactionDate: e.target.value})} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Source Company</Label>
                  <Select value={form.sourceCompanyId.toString()} onValueChange={v => setForm({...form, sourceCompanyId: Number(v)})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {companies?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.legalName || c.displayName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Target Company</Label>
                  <Select value={form.targetCompanyId.toString()} onValueChange={v => setForm({...form, targetCompanyId: Number(v)})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {companies?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.legalName || c.displayName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Type</Label>
                  <Select value={form.transactionType} onValueChange={v => setForm({...form, transactionType: v as any})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">Sale</SelectItem>
                      <SelectItem value="purchase">Purchase</SelectItem>
                      <SelectItem value="loan">Loan</SelectItem>
                      <SelectItem value="dividend">Dividend</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Total Amount</Label><Input type="number" value={form.totalAmount} onChange={e => setForm({...form, totalAmount: e.target.value})} required /></div>
              </div>
              <div><Label>Description</Label><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <Button type="submit" className="w-full">Create Transaction</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader><CardTitle>All Intercompany Transactions</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left"><th className="pb-2 font-medium">#</th><th className="pb-2 font-medium">Date</th><th className="pb-2 font-medium">Source</th><th className="pb-2 font-medium">Target</th><th className="pb-2 font-medium">Type</th><th className="pb-2 font-medium">Amount</th><th className="pb-2 font-medium">Status</th></tr></thead>
            <tbody>
              {txns?.map(t => (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="py-2 font-medium">{t.transactionNumber}</td>
                  <td className="py-2">{t.transactionDate}</td>
                  <td className="py-2">Company #{t.sourceCompanyId}</td>
                  <td className="py-2">Company #{t.targetCompanyId}</td>
                  <td className="py-2 capitalize">{t.transactionType}</td>
                  <td className="py-2">{t.totalAmount} {t.currency}</td>
                  <td className="py-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[t.status]}`}>{t.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
