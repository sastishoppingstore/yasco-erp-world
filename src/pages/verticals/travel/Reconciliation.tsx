import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700", confirmed: "bg-blue-100 text-blue-700",
  paid: "bg-emerald-100 text-emerald-700", disputed: "bg-red-100 text-red-700",
};

export default function ReconciliationPage() {
  const { data: reconciliations } = trpc.travel.reconciliationList.useQuery(undefined);

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Supplier Reconciliation</h2><p className="text-slate-500">Reconcile bookings and payments with suppliers</p></div>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Reconciliation Records</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Supplier</TableHead><TableHead>Period</TableHead><TableHead className="text-right">Bookings</TableHead><TableHead className="text-right">Gross</TableHead><TableHead className="text-right">Commission</TableHead><TableHead className="text-right">Net Payable</TableHead><TableHead className="text-right">Paid</TableHead><TableHead className="text-right">Balance</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {reconciliations?.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-sm">{r.reconciliationNumber}</TableCell>
                  <TableCell>{r.supplierId}</TableCell>
                  <TableCell className="text-sm">{r.periodStart} → {r.periodEnd}</TableCell>
                  <TableCell className="text-right">{r.totalBookings}</TableCell>
                  <TableCell className="text-right font-mono">{Number(r.grossAmount).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{Number(r.commissionAmount).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{Number(r.netPayable).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{Number(r.paidAmount).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono font-bold">{Number(r.balanceDue).toLocaleString()}</TableCell>
                  <TableCell><Badge className={statusColors[r.status]}>{r.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
