import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { trpc } from "@/providers/trpc";
import {
  Download, BarChart3, TrendingUp, PieChartIcon,
  FileText, FileSpreadsheet, Printer, Search,
  ChevronDown, Calendar,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#f97316"];

const REPORT_TYPES = [
  { value: "sales", label: "Sales Report", icon: BarChart3, color: "bg-blue-100 text-blue-600" },
  { value: "purchase", label: "Purchase Report", icon: TrendingUp, color: "bg-emerald-100 text-emerald-600" },
  { value: "inventory", label: "Inventory Report", icon: BarChart3, color: "bg-amber-100 text-amber-600" },
  { value: "financial", label: "Profit & Loss", icon: PieChartIcon, color: "bg-purple-100 text-purple-600" },
  { value: "balanceSheet", label: "Balance Sheet", icon: FileText, color: "bg-indigo-100 text-indigo-600" },
  { value: "cashFlow", label: "Cash Flow Statement", icon: TrendingUp, color: "bg-cyan-100 text-cyan-600" },
  { value: "tax", label: "Tax / VAT Report", icon: FileText, color: "bg-red-100 text-red-600" },
  { value: "aging", label: "Aging Report", icon: FileSpreadsheet, color: "bg-cyan-100 text-cyan-600" },
];

function formatCurrency(v: string | number) {
  return Number(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " SAR";
}

function formatNumber(v: string | number) {
  return Number(v).toLocaleString("en-US");
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700",
    sent: "bg-blue-100 text-blue-700",
    paid: "bg-green-100 text-green-700",
    partial: "bg-yellow-100 text-yellow-700",
    overdue: "bg-red-100 text-red-700",
    cancelled: "bg-gray-100 text-gray-500",
  };
  return map[status] || "bg-slate-100 text-slate-700";
}

function ExportMenu({ onPDF, onCSV, onExcel, onPrint }: {
  onPDF: () => void; onCSV: () => void; onExcel: () => void; onPrint: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button><Download className="w-4 h-4 mr-2" />Export</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onPDF}><FileText className="w-4 h-4 mr-2" />Export PDF</DropdownMenuItem>
        <DropdownMenuItem onClick={onCSV}><FileSpreadsheet className="w-4 h-4 mr-2" />Export CSV</DropdownMenuItem>
        <DropdownMenuItem onClick={onExcel}><FileSpreadsheet className="w-4 h-4 mr-2" />Export Excel</DropdownMenuItem>
        <DropdownMenuItem onClick={onPrint}><Printer className="w-4 h-4 mr-2" />Print</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState("sales");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { data: revenueData } = trpc.dashboard.revenueByMonth.useQuery({ year: 2025 });
  const { data: stats } = trpc.dashboard.stats.useQuery(undefined);

  const salesQuery = trpc.reports.salesReport.useQuery(
    { from: fromDate || undefined, to: toDate || undefined },
    { enabled: reportType === "sales" },
  );
  const purchaseQuery = trpc.reports.purchaseReport.useQuery(
    { from: fromDate || undefined, to: toDate || undefined },
    { enabled: reportType === "purchase" },
  );
  const inventoryQuery = trpc.reports.inventoryReport.useQuery(undefined, { enabled: reportType === "inventory" });
  const financialQuery = trpc.reports.financialReport.useQuery(
    { from: fromDate || undefined, to: toDate || undefined },
    { enabled: reportType === "financial" },
  );
  const taxQuery = trpc.reports.taxReport.useQuery(
    { from: fromDate || undefined, to: toDate || undefined },
    { enabled: reportType === "tax" },
  );
  const agingQuery = trpc.reports.agingReport.useQuery(undefined, { enabled: reportType === "aging" });
  const balanceSheetQuery = trpc.reports.balanceSheet.useQuery(
    { asOf: toDate || undefined },
    { enabled: reportType === "balanceSheet" },
  );
  const cashFlowQuery = trpc.reports.cashFlowReport.useQuery(
    { from: fromDate || undefined, to: toDate || undefined },
    { enabled: reportType === "cashFlow" },
  );

  const monthlyData = useMemo(() =>
    (revenueData || []).map((r) => ({
      month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(r.month) - 1] || `M${r.month}`,
      revenue: Number(r.total),
    })), [revenueData]);

  const pieData = useMemo(() => [
    { name: "Revenue", value: stats?.totalRevenue || 1 },
    { name: "Payables", value: stats?.totalPayable || 1 },
    { name: "Customers", value: (stats?.totalCustomers || 1) * 10000 },
    { name: "Products", value: (stats?.totalProducts || 1) * 5000 },
  ], [stats]);

  const getTableData = useCallback(() => {
    const data: { headers: string[]; rows: string[][]; summary: string } = { headers: [], rows: [], summary: "" };

    switch (reportType) {
      case "sales": {
        const q = salesQuery.data;
        data.headers = ["Period", "Invoices", "Subtotal", "Tax", "Total", "Paid", "Balance"];
        data.rows = (q?.rows || []).map(r => [
          String(r.period), String(r.count), formatCurrency(r.subtotal), formatCurrency(r.tax),
          formatCurrency(r.total), formatCurrency(r.paid), formatCurrency(r.balance),
        ]);
        data.summary = q?.summary ? `Total: ${formatCurrency(q.summary.totalRevenue)} | Tax: ${formatCurrency(q.summary.totalTax)} | Paid: ${formatCurrency(q.summary.totalPaid)} | Invoices: ${q.summary.invoiceCount}` : "";
        break;
      }
      case "purchase": {
        const q = purchaseQuery.data;
        data.headers = ["Period", "POs", "Subtotal", "Tax", "Total"];
        data.rows = (q?.rows || []).map(r => [
          String(r.period), String(r.count), formatCurrency(r.subtotal), formatCurrency(r.tax), formatCurrency(r.total),
        ]);
        data.summary = q?.summary ? `Total: ${formatCurrency(q.summary.totalAmount)} | POs: ${q.summary.poCount}` : "";
        break;
      }
      case "inventory": {
        const q = inventoryQuery.data;
        data.headers = ["SKU", "Name", "Qty", "Sale Price", "Cost", "Total Value"];
        data.rows = (q?.rows || []).map(r => [
          r.sku, r.name, formatNumber(r.quantity), formatCurrency(r.salePrice),
          formatCurrency(r.purchasePrice), formatCurrency(r.totalValue),
        ]);
        data.summary = q?.summary ? `Products: ${q.summary.totalProducts} | Total Qty: ${formatNumber(q.summary.totalQty)} | Value: ${formatCurrency(q.summary.totalValue)}` : "";
        break;
      }
      case "financial": {
        const q = financialQuery.data;
        data.headers = ["Code", "Account", "Type", "Category", "Debit", "Credit", "Net"];
        data.rows = (q?.rows || []).map(r => [
          r.code, r.name, r.accountType, r.accountCategory,
          formatCurrency(r.debit), formatCurrency(r.credit), formatCurrency(r.net),
        ]);
        const s = q?.summary;
        data.summary = s ? `Revenue: ${formatCurrency(s.revenue)} | COGS: ${formatCurrency(s.cogs)} | Gross: ${formatCurrency(s.grossProfit)} | Net: ${formatCurrency(s.netProfit)} | Assets: ${formatCurrency(s.totalAssets)} | Liab: ${formatCurrency(s.totalLiabilities)}` : "";
        break;
      }
      case "tax": {
        const q = taxQuery.data;
        data.headers = ["Invoice #", "Date", "Subtotal", "Tax %", "Tax Amount", "Total", "Status"];
        data.rows = (q?.rows || []).map(r => [
          r.invoiceNumber, String(r.date), formatCurrency(r.subtotal),
          `${r.taxPercent}%`, formatCurrency(r.taxAmount), formatCurrency(r.totalAmount), r.status,
        ]);
        data.summary = q?.summary ? `Subtotal: ${formatCurrency(q.summary.totalSubtotal)} | Tax: ${formatCurrency(q.summary.totalTax)} | Total: ${formatCurrency(q.summary.totalAmount)} | Invoices: ${q.summary.count}` : "";
        break;
      }
      case "aging": {
        const q = agingQuery.data;
        data.headers = ["Customer", "Current", "1-30 Days", "31-60 Days", "61-90 Days", "90+ Days", "Total"];
        data.rows = (q?.rows || []).map(r => [
          r.customerName, formatCurrency(r.current), formatCurrency(r.days1to30),
          formatCurrency(r.days31to60), formatCurrency(r.days61to90),
          formatCurrency(r.days91plus), formatCurrency(r.total),
        ]);
        data.summary = q?.summary ? `Outstanding: ${formatCurrency(q.summary.totalOutstanding)} | Customers: ${q.summary.customerCount}` : "";
        break;
      }
      case "balanceSheet": {
        const q = balanceSheetQuery.data;
        data.headers = ["Code", "Account", "Type", "Debit", "Credit", "Balance"];
        data.rows = (q?.rows || []).map(r => [
          r.code, r.name, r.accountType, formatCurrency(r.debit), formatCurrency(r.credit), formatCurrency(r.balance),
        ]);
        const s = q?.summary;
        data.summary = s ? `Total Assets: ${formatCurrency(s.totalAssets)} | Total Liabilities: ${formatCurrency(s.totalLiabilities)} | Total Equity: ${formatCurrency(s.totalEquity)}` : "";
        break;
      }
      case "cashFlow": {
        const q = cashFlowQuery.data;
        data.headers = ["Category", "Amount", "Subcategory"];
        data.rows = (q?.rows || []).map(r => [
          r.category, formatCurrency(r.amount), r.subcategory || "",
        ]);
        const s = q?.summary;
        data.summary = s ? `Operating: ${formatCurrency(s.operatingCash)} | Investing: ${formatCurrency(s.investingCash)} | Financing: ${formatCurrency(s.financingCash)} | Net Change: ${formatCurrency(s.netChange)}` : "";
        break;
      }
    }
    return data;
  }, [reportType, salesQuery.data, purchaseQuery.data, inventoryQuery.data, financialQuery.data, taxQuery.data, agingQuery.data, balanceSheetQuery.data, cashFlowQuery.data]);

  const exportPDF = useCallback(() => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(16);
    doc.text(`Report: ${REPORT_TYPES.find(t => t.value === reportType)?.label || reportType}`, 14, 20);
    if (fromDate || toDate) {
      doc.setFontSize(10);
      doc.text(`Period: ${fromDate || "Start"} - ${toDate || "Today"}`, 14, 28);
    }
    const data = getTableData();
    autoTable(doc, {
      head: [data.headers],
      body: data.rows,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [18, 60, 46] },
    });
    if (data.summary) {
      const finalY = (doc as any).lastAutoTable.finalY || 50;
      doc.setFontSize(9);
      doc.text(data.summary, 14, finalY + 10);
    }
    doc.save(`${reportType}-report.pdf`);
  }, [reportType, fromDate, toDate, getTableData]);

  const exportCSV = useCallback(() => {
    const data = getTableData();
    const csvContent = [
      data.headers.join(","),
      ...data.rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(",")),
      "",
      data.summary,
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `${reportType}-report.csv`);
  }, [reportType, getTableData]);

  const exportExcel = useCallback(() => {
    const data = getTableData();
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([data.headers, ...data.rows, [], [data.summary]]);
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    saveAs(new Blob([buf]), `${reportType}-report.xlsx`);
  }, [reportType, getTableData]);

  const printReport = useCallback(() => {
    const data = getTableData();
    const tableHtml = `
      <html><head><title>${reportType} Report</title>
      <style>body{font-family:Arial;padding:20px}
      table{width:100%;border-collapse:collapse;margin-top:20px}
      th,td{border:1px solid #ccc;padding:8px;text-align:left;font-size:12px}
      th{background:#123c2e;color:#fff}
      .summary{margin-top:16px;font-size:14px;font-weight:bold}
      h1{font-size:20px;color:#123c2e}
      </style></head><body>
      <h1>${REPORT_TYPES.find(t => t.value === reportType)?.label || reportType}</h1>
      ${fromDate || toDate ? `<p>Period: ${fromDate || "Start"} - ${toDate || "Today"}</p>` : ""}
      <table><thead><tr>${data.headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
      <tbody>${data.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
      </table>${data.summary ? `<p class="summary">${data.summary}</p>` : ""}
      </body></html>`;
    const w = window.open("", "_blank");
    w?.document.write(tableHtml);
    w?.document.close();
    w?.setTimeout(() => { w?.print(); }, 500);
  }, [reportType, fromDate, toDate, getTableData]);

  const isLoading = salesQuery.isLoading || purchaseQuery.isLoading || inventoryQuery.isLoading
    || financialQuery.isLoading || taxQuery.isLoading || agingQuery.isLoading || balanceSheetQuery.isLoading || cashFlowQuery.isLoading;
  const tableData = getTableData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Reports</h2>
          <p className="text-slate-500">Financial and operational analytics</p>
        </div>
        <ExportMenu onPDF={exportPDF} onCSV={exportCSV} onExcel={exportExcel} onPrint={printReport} />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="w-full sm:w-64">
          <Label className="mb-1 block text-sm font-medium">Report Type</Label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REPORT_TYPES.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-48">
          <Label className="mb-1 block text-sm font-medium">From Date</Label>
          <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
        </div>
        <div className="w-full sm:w-48">
          <Label className="mb-1 block text-sm font-medium">To Date</Label>
          <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
        </div>
      </div>

      {reportType === "financial" && financialQuery.data?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-emerald-200">
            <CardContent className="p-4"><p className="text-xs text-slate-500">Revenue</p><p className="text-xl font-bold text-emerald-700">{formatCurrency(financialQuery.data.summary.revenue)}</p></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-rose-200">
            <CardContent className="p-4"><p className="text-xs text-slate-500">Expenses</p><p className="text-xl font-bold text-rose-700">{formatCurrency(financialQuery.data.summary.expenses)}</p></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-indigo-200">
            <CardContent className="p-4"><p className="text-xs text-slate-500">Gross Profit</p><p className="text-xl font-bold text-blue-700">{formatCurrency(financialQuery.data.summary.grossProfit)}</p></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-violet-200">
            <CardContent className="p-4"><p className="text-xs text-slate-500">Net Profit</p><p className="text-xl font-bold text-purple-700">{formatCurrency(financialQuery.data.summary.netProfit)}</p></CardContent>
          </Card>
        </div>
      )}

      {reportType === "aging" && agingQuery.data?.summary && (
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-amber-200">
            <CardContent className="p-4"><p className="text-xs text-slate-500">Total Outstanding</p><p className="text-xl font-bold text-amber-700">{formatCurrency(agingQuery.data.summary.totalOutstanding)}</p></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-cyan-50 to-sky-50 border-sky-200">
            <CardContent className="p-4"><p className="text-xs text-slate-500">Customers with Balance</p><p className="text-xl font-bold text-sky-700">{agingQuery.data.summary.customerCount}</p></CardContent>
          </Card>
        </div>
      )}

      {reportType === "sales" && salesQuery.data?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-indigo-200">
            <CardContent className="p-4"><p className="text-xs text-slate-500">Total Revenue</p><p className="text-xl font-bold text-blue-700">{formatCurrency(salesQuery.data.summary.totalRevenue)}</p></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-yellow-200">
            <CardContent className="p-4"><p className="text-xs text-slate-500">Total Tax</p><p className="text-xl font-bold text-amber-700">{formatCurrency(salesQuery.data.summary.totalTax)}</p></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-emerald-200">
            <CardContent className="p-4"><p className="text-xs text-slate-500">Total Paid</p><p className="text-xl font-bold text-emerald-700">{formatCurrency(salesQuery.data.summary.totalPaid)}</p></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-violet-200">
            <CardContent className="p-4"><p className="text-xs text-slate-500">Invoices</p><p className="text-xl font-bold text-purple-700">{salesQuery.data.summary.invoiceCount}</p></CardContent>
          </Card>
        </div>
      )}

      {reportType === "inventory" && inventoryQuery.data?.summary && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-yellow-200">
            <CardContent className="p-4"><p className="text-xs text-slate-500">Products</p><p className="text-xl font-bold text-amber-700">{inventoryQuery.data.summary.totalProducts}</p></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-indigo-200">
            <CardContent className="p-4"><p className="text-xs text-slate-500">Total Qty</p><p className="text-xl font-bold text-blue-700">{formatNumber(inventoryQuery.data.summary.totalQty)}</p></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-emerald-200">
            <CardContent className="p-4"><p className="text-xs text-slate-500">Total Value</p><p className="text-xl font-bold text-emerald-700">{formatCurrency(inventoryQuery.data.summary.totalValue)}</p></CardContent>
          </Card>
        </div>
      )}

      {reportType === "tax" && taxQuery.data?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-slate-50 to-gray-50 border-gray-200">
            <CardContent className="p-4"><p className="text-xs text-slate-500">Total Subtotal</p><p className="text-xl font-bold text-slate-700">{formatCurrency(taxQuery.data.summary.totalSubtotal)}</p></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-rose-200">
            <CardContent className="p-4"><p className="text-xs text-slate-500">Total Tax</p><p className="text-xl font-bold text-rose-700">{formatCurrency(taxQuery.data.summary.totalTax)}</p></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-indigo-200">
            <CardContent className="p-4"><p className="text-xs text-slate-500">Total Amount</p><p className="text-xl font-bold text-blue-700">{formatCurrency(taxQuery.data.summary.totalAmount)}</p></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-violet-200">
            <CardContent className="p-4"><p className="text-xs text-slate-500">Invoices</p><p className="text-xl font-bold text-purple-700">{taxQuery.data.summary.count}</p></CardContent>
          </Card>
        </div>
      )}

      {reportType === "purchase" && purchaseQuery.data?.summary && (
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-green-200">
            <CardContent className="p-4"><p className="text-xs text-slate-500">Total Purchase Amount</p><p className="text-xl font-bold text-green-700">{formatCurrency(purchaseQuery.data.summary.totalAmount)}</p></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-cyan-50 to-sky-50 border-sky-200">
            <CardContent className="p-4"><p className="text-xs text-slate-500">Purchase Orders</p><p className="text-xl font-bold text-sky-700">{purchaseQuery.data.summary.poCount}</p></CardContent>
          </Card>
        </div>
      )}

      {reportType === "balanceSheet" && balanceSheetQuery.data?.summary && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-indigo-200">
            <CardContent className="p-4"><p className="text-xs text-slate-500">Total Assets</p><p className="text-xl font-bold text-blue-700">{formatCurrency(balanceSheetQuery.data.summary.totalAssets)}</p></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-rose-200">
            <CardContent className="p-4"><p className="text-xs text-slate-500">Total Liabilities</p><p className="text-xl font-bold text-rose-700">{formatCurrency(balanceSheetQuery.data.summary.totalLiabilities)}</p></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-green-200">
            <CardContent className="p-4"><p className="text-xs text-slate-500">Total Equity</p><p className="text-xl font-bold text-emerald-700">{formatCurrency(balanceSheetQuery.data.summary.totalEquity)}</p></CardContent>
          </Card>
        </div>
      )}

      {reportType === "cashFlow" && cashFlowQuery.data?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-emerald-200">
            <CardContent className="p-4"><p className="text-xs text-slate-500">Operating Cash</p><p className="text-xl font-bold text-emerald-700">{formatCurrency(cashFlowQuery.data.summary.operatingCash)}</p></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-indigo-200">
            <CardContent className="p-4"><p className="text-xs text-slate-500">Investing Cash</p><p className="text-xl font-bold text-blue-700">{formatCurrency(cashFlowQuery.data.summary.investingCash)}</p></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-violet-200">
            <CardContent className="p-4"><p className="text-xs text-slate-500">Financing Cash</p><p className="text-xl font-bold text-purple-700">{formatCurrency(cashFlowQuery.data.summary.financingCash)}</p></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-yellow-200">
            <CardContent className="p-4"><p className="text-xs text-slate-500">Net Change</p><p className="text-xl font-bold text-amber-700">{formatCurrency(cashFlowQuery.data.summary.netChange)}</p></CardContent>
          </Card>
        </div>
      )}

      {!isLoading && tableData.rows.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{REPORT_TYPES.find(t => t.value === reportType)?.label} - Details</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    {tableData.headers.map((h, i) => (
                      <TableHead key={i} className="font-semibold whitespace-nowrap">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.rows.map((row, ri) => (
                    <TableRow key={ri}>
                      {row.map((cell, ci) => (
                        <TableCell key={ci} className="whitespace-nowrap">
                          {reportType === "tax" && ci === 6 ? (
                            <Badge className={statusBadge(cell)}>{cell}</Badge>
                          ) : cell}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && tableData.rows.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center text-slate-400">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No data found</p>
            <p className="text-sm">Try adjusting your date range or selecting a different report type.</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="charts">
        <TabsList>
          <TabsTrigger value="charts">Charts Overview</TabsTrigger>
          <TabsTrigger value="exports">Quick Export</TabsTrigger>
        </TabsList>
        <TabsContent value="charts">
          <div className="grid lg:grid-cols-2 gap-6 mt-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Monthly Revenue</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v: number) => [`${v.toLocaleString()} SAR`, "Revenue"]} />
                    <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Business Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                      {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Legend /><Tooltip formatter={(v: number) => v.toLocaleString()} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="exports">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Quick Export Options</CardTitle></CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-3">
                {REPORT_TYPES.map(t => (
                  <Button key={t.value} variant="outline" className="justify-start" onClick={() => { setReportType(t.value); }}>
                    <t.icon className="w-4 h-4 mr-2" />{t.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
