import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLanguage } from "@/providers/language";
import { Receipt, Download, FileText } from "lucide-react";

interface RentInvoice {
  id: string;
  tenant: string;
  room: string;
  period: string;
  amount: number;
  paid: number;
  dueDate: string;
  status: "Paid" | "Partial" | "Unpaid" | "Overdue";
}

const invoices: RentInvoice[] = [
  { id: "RINV-001", tenant: "Ahmed Al-Otaibi", room: "203", period: "July 2026", amount: 1500, paid: 1500, dueDate: "2026-07-01", status: "Paid" },
  { id: "RINV-002", tenant: "Mohammed Ali", room: "103", period: "July 2026", amount: 2500, paid: 1500, dueDate: "2026-07-01", status: "Partial" },
  { id: "RINV-003", tenant: "Khalid Al-Harbi", room: "202", period: "July 2026", amount: 1800, paid: 0, dueDate: "2026-07-01", status: "Overdue" },
  { id: "RINV-004", tenant: "Fahad Al-Dosari", room: "203", period: "June 2026", amount: 1500, paid: 1500, dueDate: "2026-06-01", status: "Paid" },
  { id: "RINV-005", tenant: "Saud Al-Shammari", room: "302", period: "July 2026", amount: 3000, paid: 3000, dueDate: "2026-07-01", status: "Paid" },
];

const statusColor: Record<string, string> = {
  Paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Partial: "bg-amber-100 text-amber-700 border-amber-200",
  Unpaid: "bg-slate-100 text-slate-600 border-slate-200",
  Overdue: "bg-rose-100 text-rose-700 border-rose-200",
};

export default function HostelRentInvoicing() {
  const { language } = useLanguage();
  const rtl = language === "ar";

  const totalReceivables = invoices.reduce((s, i) => s + i.amount, 0);
  const totalCollected = invoices.reduce((s, i) => s + i.paid, 0);
  const totalDue = totalReceivables - totalCollected;

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{rtl ? "فواتير الإيجار" : "Rent Invoicing"}</h1>
        <Button>
          <FileText className="size-4 ml-2" />
          {rtl ? "فاتورة جديدة" : "New Invoice"}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-blue-700">{rtl ? "إجمالي المستحق" : "Total Receivables"}</p>
            <p className="text-2xl font-bold text-blue-800">{totalReceivables.toLocaleString()} SAR</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-emerald-700">{rtl ? "المحصّل" : "Collected"}</p>
            <p className="text-2xl font-bold text-emerald-800">{totalCollected.toLocaleString()} SAR</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-rose-700">{rtl ? "المتأخر" : "Outstanding"}</p>
            <p className="text-2xl font-bold text-rose-800">{totalDue.toLocaleString()} SAR</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{rtl ? "الفاتورة" : "Invoice"}</TableHead>
                <TableHead>{rtl ? "النزيل" : "Tenant"}</TableHead>
                <TableHead>{rtl ? "الغرفة" : "Room"}</TableHead>
                <TableHead>{rtl ? "الفترة" : "Period"}</TableHead>
                <TableHead>{rtl ? "المبلغ" : "Amount"}</TableHead>
                <TableHead>{rtl ? "المدفوع" : "Paid"}</TableHead>
                <TableHead>{rtl ? "المتبقي" : "Balance"}</TableHead>
                <TableHead>{rtl ? "الحالة" : "Status"}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.id}</TableCell>
                  <TableCell>{inv.tenant}</TableCell>
                  <TableCell>{inv.room}</TableCell>
                  <TableCell>{inv.period}</TableCell>
                  <TableCell>{inv.amount} SAR</TableCell>
                  <TableCell>{inv.paid} SAR</TableCell>
                  <TableCell className={inv.amount - inv.paid > 0 ? "text-rose-600 font-medium" : ""}>
                    {inv.amount - inv.paid} SAR
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColor[inv.status]}>{inv.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Download className="size-4" />
                    </Button>
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
