import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowUpDown } from "lucide-react";

export default function GeneralLedgerPage() {
  const { data: accounts } = trpc.accounting.coaList.useQuery();
  const { data: entries } = trpc.accounting.journalEntryList.useQuery();
  const [accountFilter, setAccountFilter] = useState("");
  const [search, setSearch] = useState("");

  const filteredAccounts = accounts?.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.code.includes(search)
  ) || [];

  const allTransactions = entries?.flatMap(je =>
    (je as any).lines?.map((line: any) => ({
      date: je.date,
      entryNumber: je.entryNumber,
      description: line.description || je.description,
      accountId: line.accountId,
      debit: line.debit,
      credit: line.credit,
      accountCode: accounts?.find(a => a.id === line.accountId)?.code || "",
      accountName: accounts?.find(a => a.id === line.accountId)?.name || "",
    })) || []
  ) || [];

  const filteredTransactions = allTransactions.filter(t =>
    (!accountFilter || t.accountId === Number(accountFilter)) &&
    (!search || t.accountName.toLowerCase().includes(search.toLowerCase()) || t.accountCode.includes(search))
  );

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
          <h2 className="text-2xl font-bold">General Ledger</h2>
          <p className="text-slate-500">View account balances and transaction history</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search accounts..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select onValueChange={v => setAccountFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All Accounts" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            {accounts?.map(a => <SelectItem key={a.id} value={a.id.toString()}>{a.code} - {a.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-lg">Account Summary</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Opening Balance</TableHead>
                <TableHead className="text-right">Current Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map(acc => (
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
                  <TableCell className="text-right font-mono">{Number(acc.openingBalance).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{Number(acc.currentBalance).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-lg">Transaction History</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Entry #</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((t, i) => (
                <TableRow key={i}>
                  <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-mono text-sm">{t.entryNumber}</TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{t.accountName}</div>
                    <div className="text-xs text-slate-500">{t.accountCode}</div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm">{t.description}</TableCell>
                  <TableCell className="text-right font-mono text-emerald-600">{Number(t.debit) > 0 ? Number(t.debit).toLocaleString() : "-"}</TableCell>
                  <TableCell className="text-right font-mono text-red-600">{Number(t.credit) > 0 ? Number(t.credit).toLocaleString() : "-"}</TableCell>
                </TableRow>
              ))}
              {filteredTransactions.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-slate-400 py-8">No transactions found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
