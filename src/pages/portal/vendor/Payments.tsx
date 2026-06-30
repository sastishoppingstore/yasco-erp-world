import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, Banknote, CreditCard, Landmark } from "lucide-react";

const paymentMethodIcons: Record<string, any> = { cash: Banknote, bank_transfer: Landmark, cheque: Wallet, card: CreditCard, online: CreditCard };

export default function VendorPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("portal_token_vendor");

  useEffect(() => {
    if (!token) return;
    fetch("/api/trpc/portalVendor.paymentList", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).then(r => r.json()).then(j => setPayments(j.result?.data || [])).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="flex justify-center py-20 text-slate-400">Loading payments...</div>;

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Payment History</h2><p className="text-slate-500">Track payment status from YASCO</p></div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Payment #</TableHead><TableHead>Date</TableHead><TableHead>Method</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Reference</TableHead><TableHead>Notes</TableHead></TableRow></TableHeader>
            <TableBody>
              {payments.map(p => {
                const Icon = paymentMethodIcons[p.paymentMethod] || Wallet;
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-sm font-medium">{p.paymentNumber}</TableCell>
                    <TableCell className="text-sm">{new Date(p.date).toLocaleDateString()}</TableCell>
                    <TableCell><span className="flex items-center gap-1 text-sm"><Icon className="w-3 h-3 text-slate-500" />{p.paymentMethod.replace("_", " ")}</span></TableCell>
                    <TableCell className="text-right font-mono font-semibold text-emerald-600">{Number(p.amount).toLocaleString()} SAR</TableCell>
                    <TableCell className="text-sm text-slate-500">{p.reference || "—"}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-slate-500">{p.notes || "—"}</TableCell>
                  </TableRow>
                );
              })}
              {payments.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-slate-400 py-8">No payments received yet</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
