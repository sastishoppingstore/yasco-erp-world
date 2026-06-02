import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Ban, CheckCircle } from "lucide-react";

export default function TrialBalancePage() {
  const { data: trialBalance, refetch } = trpc.accounting.trialBalance.useQuery();
  const [asOfDate] = useState(new Date().toISOString().split("T")[0]);

  const totalDebit = trialBalance?.reduce((s, r) => s + Number(r.debit), 0) || 0;
  const totalCredit = trialBalance?.reduce((s, r) => s + Number(r.credit), 0) || 0;
  const isBalanced = totalDebit === totalCredit;

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
          <h2 className="text-2xl font-bold">Trial Balance</h2>
          <p className="text-slate-500">Verify debit-credit equality across all accounts</p>
        </div>
        <div className="flex items-center gap-3">
          <Input type="date" value={asOfDate} className="w-40" readOnly />
          <Button variant="outline" onClick={() => refetch()}><Download className="w-4 h-4 mr-2" />Refresh</Button>
        </div>
      </div>

      <Card className={`border-2 ${isBalanced ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50"}`}>
        <CardContent className="p-4 flex items-center gap-3">
          {isBalanced ? (
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          ) : (
            <Ban className="w-6 h-6 text-red-600" />
          )}
          <div>
            <p className={`font-semibold ${isBalanced ? "text-emerald-800" : "text-red-800"}`}>
              {isBalanced ? "Trial Balance is Balanced" : "Trial Balance is NOT Balanced"}
            </p>
            <p className="text-sm text-slate-600">
              Total Debits: {totalDebit.toLocaleString()} SAR | Total Credits: {totalCredit.toLocaleString()} SAR
              {!isBalanced && ` | Difference: ${Math.abs(totalDebit - totalCredit).toLocaleString()} SAR`}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Account Balances</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trialBalance?.map((row) => (
                <TableRow key={row.accountId}>
                  <TableCell className="font-mono text-sm">{row.code}</TableCell>
                  <TableCell>
                    <div className="font-medium">{row.name}</div>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full ${typeColors[row.accountType] || "bg-slate-100"}`}>
                      {row.accountType}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-emerald-600">
                    {Number(row.debit) > 0 ? Number(row.debit).toLocaleString() : "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-red-600">
                    {Number(row.credit) > 0 ? Number(row.credit).toLocaleString() : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Totals</span>
            <div className="flex gap-16">
              <span className="text-emerald-600 font-mono">{totalDebit.toLocaleString()} SAR</span>
              <span className="text-red-600 font-mono">{totalCredit.toLocaleString()} SAR</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
