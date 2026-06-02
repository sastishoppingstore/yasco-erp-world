import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Landmark } from "lucide-react";

export default function ChartOfAccountsPage() {
  const { data: accounts, refetch } = trpc.accounting.coaList.useQuery(undefined);
  const createAccount = trpc.accounting.coaCreate.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState({
    code: "", name: "", nameAr: "", accountType: "asset" as const,
    accountCategory: "current_asset" as const, openingBalance: "0",
    isBankAccount: false, isCashAccount: false,
  });

  const filtered = accounts?.filter(a =>
    a.name.toLowerCase().includes(filter.toLowerCase()) ||
    a.code.includes(filter)
  ) || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAccount.mutate({ ...form });
    setOpen(false);
    setForm({ code: "", name: "", nameAr: "", accountType: "asset", accountCategory: "current_asset", openingBalance: "0", isBankAccount: false, isCashAccount: false });
  };

  const typeColors: Record<string, string> = {
    asset: "bg-blue-100 text-blue-800",
    liability: "bg-red-100 text-red-800",
    equity: "bg-purple-100 text-purple-800",
    revenue: "bg-emerald-100 text-emerald-800",
    expense: "bg-orange-100 text-orange-800",
    cost_of_sales: "bg-amber-100 text-amber-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Chart of Accounts</h2>
          <p className="text-slate-500">Manage your chart of accounts with multi-level hierarchy</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Add Account</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>New Account</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Account Code</Label><Input value={form.code} onChange={e => setForm({...form, code: e.target.value})} required /></div>
                <div><Label>Opening Balance</Label><Input type="number" value={form.openingBalance} onChange={e => setForm({...form, openingBalance: e.target.value})} /></div>
              </div>
              <div><Label>Account Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div><Label>Arabic Name</Label><Input value={form.nameAr} onChange={e => setForm({...form, nameAr: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Account Type</Label>
                  <Select value={form.accountType} onValueChange={(v: any) => setForm({...form, accountType: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asset">Asset</SelectItem>
                      <SelectItem value="liability">Liability</SelectItem>
                      <SelectItem value="equity">Equity</SelectItem>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Category</Label>
                  <Select value={form.accountCategory} onValueChange={(v: any) => setForm({...form, accountCategory: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current_asset">Current Asset</SelectItem>
                      <SelectItem value="fixed_asset">Fixed Asset</SelectItem>
                      <SelectItem value="current_liability">Current Liability</SelectItem>
                      <SelectItem value="equity">Equity</SelectItem>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="cogs">COGS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full">Create Account</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-4">
            <Input placeholder="Search accounts..." value={filter} onChange={e => setFilter(e.target.value)} className="max-w-sm" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Balance (SAR)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((acc) => (
                <TableRow key={acc.id}>
                  <TableCell className="font-mono text-sm">{acc.code}</TableCell>
                  <TableCell>
                    <div className="font-medium">{acc.name}</div>
                    {acc.nameAr && <div className="text-xs text-slate-500">{acc.nameAr}</div>}
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full ${typeColors[acc.accountType] || "bg-slate-100"}`}>
                      {acc.accountType}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono">{Number(acc.currentBalance).toLocaleString()}</TableCell>
                  <TableCell>
                    {acc.isActive ? (
                      <span className="text-xs text-emerald-600 font-medium">Active</span>
                    ) : (
                      <span className="text-xs text-slate-400">Inactive</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
