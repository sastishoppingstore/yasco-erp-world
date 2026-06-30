import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700", partial: "bg-blue-100 text-blue-700",
  paid: "bg-emerald-100 text-emerald-700", overdue: "bg-red-100 text-red-700", cancelled: "bg-slate-100 text-slate-700",
};

export default function FeeInvoicingPage() {
  const { data: invoices } = trpc.education.feeInvoiceList.useQuery(undefined);
  const { data: feeStructures } = trpc.education.feeStructureList.useQuery(undefined);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Fee Invoicing</h2><p className="text-slate-500">Student tuition and fee management</p></div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-slate-500">Total Invoices</p><p className="text-xl font-bold">{invoices?.length || 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-slate-500">Paid</p><p className="text-xl font-bold text-emerald-600">{invoices?.filter(i => i.status === "paid").length || 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-slate-500">Overdue</p><p className="text-xl font-bold text-red-600">{invoices?.filter(i => i.status === "overdue").length || 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-slate-500">Fee Structures</p><p className="text-xl font-bold">{feeStructures?.length || 0}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Fee Structures</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Grade</TableHead><TableHead className="text-right">Tuition</TableHead><TableHead className="text-right">Admission</TableHead><TableHead className="text-right">Transport</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
            <TableBody>
              {feeStructures?.map(f => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">{f.name}</TableCell>
                  <TableCell>{f.grade || "All"}</TableCell>
                  <TableCell className="text-right font-mono">{Number(f.tuitionFee).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{Number(f.admissionFee).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{Number(f.transportFee).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono font-bold">{Number(f.totalFee).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Invoices</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Invoice #</TableHead><TableHead>Student</TableHead><TableHead>Term</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Due Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {invoices?.map(i => (
                <TableRow key={i.id}>
                  <TableCell className="font-mono text-sm"><div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-slate-400" />{i.invoiceNumber}</div></TableCell>
                  <TableCell>{i.studentId}</TableCell>
                  <TableCell>{i.term || "—"}</TableCell>
                  <TableCell className="text-right font-mono">{Number(i.amount).toLocaleString()}</TableCell>
                  <TableCell>{i.dueDate || "—"}</TableCell>
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
