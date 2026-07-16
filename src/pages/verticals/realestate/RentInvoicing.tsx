import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DollarSign } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700", paid: "bg-emerald-100 text-emerald-700",
  partial: "bg-blue-100 text-blue-700", overdue: "bg-red-100 text-red-700", cancelled: "bg-slate-100 text-slate-700",
};

export default function RentInvoicingPage() {
  const [leaseFilter, setLeaseFilter] = useState("");
  const { data: invoices } = trpc.realEstate.rentInvoiceList.useQuery(undefined);
  const filtered = invoices?.filter(i => !leaseFilter || String(i.leaseId) === leaseFilter) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Rent Invoicing</h2><p className="text-slate-500">Generate and track rent invoices</p></div>
        <Input type="number" placeholder="Lease ID" className="w-40" value={leaseFilter} onChange={e => setLeaseFilter(e.target.value)} />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-slate-500">Total Invoices</p><p className="text-xl font-bold">{invoices?.length || 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-slate-500">Paid</p><p className="text-xl font-bold text-emerald-600">{invoices?.filter(i => i.status === "paid").length || 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-slate-500">Pending</p><p className="text-xl font-bold text-amber-600">{invoices?.filter(i => i.status === "pending").length || 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-slate-500">Overdue</p><p className="text-xl font-bold text-red-600">{invoices?.filter(i => i.status === "overdue").length || 0}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Rent Invoices</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Invoice #</TableHead><TableHead>Lease</TableHead><TableHead>Period</TableHead><TableHead className="text-right">Rent</TableHead><TableHead className="text-right">Late Fee</TableHead><TableHead className="text-right">Total</TableHead><TableHead>Due Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map(i => (
                <TableRow key={i.id}>
                  <TableCell className="font-mono text-sm"><div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-slate-400" />{i.invoiceNumber}</div></TableCell>
                  <TableCell>{i.leaseId}</TableCell>
                  <TableCell className="text-sm">{i.periodStart} → {i.periodEnd}</TableCell>
                  <TableCell className="text-right font-mono">{Number(i.rentAmount).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{Number(i.lateFee).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono font-bold">{Number(i.totalAmount).toLocaleString()}</TableCell>
                  <TableCell>{i.dueDate}</TableCell>
                  <TableCell><Badge className={statusColors[i.status]}>{i.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
