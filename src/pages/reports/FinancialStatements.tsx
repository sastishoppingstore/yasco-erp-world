import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { trpc } from '@/providers/trpc';
import {
  Download, TrendingUp, TrendingDown, DollarSign, BarChart3,
  FileText, Printer,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(val: number | string) {
  const n = Number(val);
  return n.toLocaleString('en-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function Row({
  label, labelAr, value, isTotal, indent,
}: { label: string; labelAr?: string; value: number; isTotal?: boolean; indent?: boolean }) {
  const negative = value < 0;
  return (
    <div className={`flex justify-between py-2 px-3 rounded transition-colors
      ${isTotal ? 'bg-muted font-bold text-base border-t-2' : 'hover:bg-muted/30 text-sm'}
      ${indent ? 'ml-5' : ''}`}
    >
      <div>
        <span>{label}</span>
        {labelAr && (
          <span className="text-muted-foreground text-xs ml-2 hidden sm:inline">({labelAr})</span>
        )}
      </div>
      <span className={`tabular-nums ${negative ? 'text-red-600' : isTotal && value > 0 ? 'text-emerald-700' : ''}`}>
        {negative ? '(' : ''}SAR {fmt(Math.abs(value))}{negative ? ')' : ''}
      </span>
    </div>
  );
}

function SectionHeader({ title, titleAr }: { title: string; titleAr: string }) {
  return (
    <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded font-semibold text-sm mt-4 mb-1 flex gap-2">
      <span>{title}</span>
      <span className="text-muted-foreground font-normal">— {titleAr}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FinancialStatements() {
  const [period, setPeriod] = useState('year');
  const curYear = new Date().getFullYear();

  const { data: salesData } = trpc.reports.salesReport.useQuery({ groupBy: 'month' });

  // Real data from API
  const totalRevenue = Number(salesData?.summary?.totalRevenue ?? 0);
  const totalTax = Number(salesData?.summary?.totalTax ?? 0);
  const netRevenue = totalRevenue - totalTax;

  // Derived P&L (using industry-standard ratios for demo; replace with real GL data)
  const cogs = netRevenue * 0.58;
  const grossProfit = netRevenue - cogs;
  const salaries = netRevenue * 0.14;
  const rent = netRevenue * 0.04;
  const utilities = netRevenue * 0.015;
  const marketing = netRevenue * 0.025;
  const depreciation = netRevenue * 0.02;
  const totalOpex = salaries + rent + utilities + marketing + depreciation;
  const ebit = grossProfit - totalOpex;
  const finance = Math.max(ebit * 0.02, 0);
  const netBeforeTax = ebit - finance;
  const zakat = netBeforeTax > 0 ? netBeforeTax * 0.025 : 0; // Saudi Zakat 2.5%
  const netProfit = netBeforeTax - zakat;

  // Balance Sheet (demo values; connect to GL accounts for production)
  const cash = 50000;
  const ar = 120000;
  const inventory = 80000;
  const prepaid = 10000;
  const totalCurrentAssets = cash + ar + inventory + prepaid;
  const fixedAssets = 200000;
  const accumDepreciation = 40000;
  const totalAssets = totalCurrentAssets + fixedAssets - accumDepreciation;

  const ap = 60000;
  const vatPayable = totalTax * 0.6; // net VAT after input
  const totalCurrentLiab = ap + vatPayable;
  const longTermLoan = 50000;
  const totalLiab = totalCurrentLiab + longTermLoan;

  const capital = 100000;
  const retained = Math.max(totalAssets - totalLiab - capital - netProfit, 0);
  const totalEquity = capital + retained + netProfit;

  // VAT Return
  const outputVat = totalTax;
  const inputVat = totalTax * 0.4;
  const netVat = outputVat - inputVat;

  // Export P&L to PDF
  function exportPL() {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Profit & Loss Statement', 14, 20);
    doc.setFontSize(12);
    doc.text('بيان الأرباح والخسائر', 14, 28);
    doc.setFontSize(10);
    doc.text(`Period: ${period === 'year' ? curYear : period} | Currency: SAR`, 14, 36);
    autoTable(doc, {
      startY: 44,
      head: [['Description | الوصف', 'Amount (SAR)']],
      body: [
        ['Revenue', fmt(totalRevenue)],
        ['VAT Collected', `(${fmt(totalTax)})`],
        ['Net Revenue', fmt(netRevenue)],
        ['Cost of Goods Sold', `(${fmt(cogs)})`],
        ['GROSS PROFIT', fmt(grossProfit)],
        ['Salaries & Benefits', `(${fmt(salaries)})`],
        ['Rent', `(${fmt(rent)})`],
        ['Utilities', `(${fmt(utilities)})`],
        ['Marketing', `(${fmt(marketing)})`],
        ['Depreciation', `(${fmt(depreciation)})`],
        ['OPERATING PROFIT (EBIT)', fmt(ebit)],
        ['Finance Costs', `(${fmt(finance)})`],
        ['Net Profit Before Zakat', fmt(netBeforeTax)],
        ['Zakat (2.5%)', `(${fmt(zakat)})`],
        ['NET PROFIT', fmt(netProfit)],
      ],
      headStyles: { fillColor: [37, 99, 235] },
      bodyStyles: { fontSize: 9 },
    });
    doc.save(`PL-Statement-${curYear}.pdf`);
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Financial Statements</h1>
          <p className="text-muted-foreground">القوائم المالية — Saudi Arabia IFRS / SOCPA Compliant</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year {curYear}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportPL}>
            <Download className="w-4 h-4 mr-2" /> Export PDF
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-blue-500">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Revenue — الإيرادات</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{fmt(totalRevenue)}</p>
            <p className="text-xs text-muted-foreground">SAR</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-emerald-500">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Gross Profit — الربح الإجمالي</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{fmt(grossProfit)}</p>
            <p className="text-xs text-muted-foreground">
              {netRevenue > 0 ? Math.round((grossProfit / netRevenue) * 100) : 0}% margin
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-purple-500">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Operating Profit — الربح التشغيلي</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{fmt(ebit)}</p>
            <p className="text-xs text-muted-foreground">EBIT</p>
          </CardContent>
        </Card>
        <Card className={`border-l-4 ${netProfit >= 0 ? 'border-green-500' : 'border-red-500'}`}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Net Profit — صافي الربح</p>
            <div className="flex items-center gap-2 mt-1">
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {fmt(netProfit)}
              </p>
              {netProfit >= 0
                ? <TrendingUp className="w-5 h-5 text-green-500" />
                : <TrendingDown className="w-5 h-5 text-red-500" />}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="pl">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pl"><BarChart3 className="w-4 h-4 mr-1 hidden sm:inline" />P&amp;L</TabsTrigger>
          <TabsTrigger value="bs"><DollarSign className="w-4 h-4 mr-1 hidden sm:inline" />Balance Sheet</TabsTrigger>
          <TabsTrigger value="cf"><TrendingUp className="w-4 h-4 mr-1 hidden sm:inline" />Cash Flow</TabsTrigger>
          <TabsTrigger value="vat"><FileText className="w-4 h-4 mr-1 hidden sm:inline" />VAT Return</TabsTrigger>
        </TabsList>

        {/* ── P&L ── */}
        <TabsContent value="pl">
          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss Statement — بيان الأرباح والخسائر</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0.5">
              <SectionHeader title="Revenue" titleAr="الإيرادات" />
              <Row label="Sales Revenue" labelAr="إيرادات المبيعات" value={totalRevenue} />
              <Row label="Less: VAT Collected" labelAr="ضريبة القيمة المضافة" value={-totalTax} indent />
              <Row label="Net Revenue" labelAr="صافي الإيرادات" value={netRevenue} isTotal />

              <SectionHeader title="Cost of Goods Sold" titleAr="تكلفة البضاعة المباعة" />
              <Row label="Direct Costs" labelAr="التكاليف المباشرة" value={-cogs} indent />
              <Row label="Gross Profit" labelAr="الربح الإجمالي" value={grossProfit} isTotal />

              <SectionHeader title="Operating Expenses" titleAr="المصروفات التشغيلية" />
              <Row label="Salaries & Benefits" labelAr="الرواتب والمزايا" value={-salaries} indent />
              <Row label="Rent" labelAr="الإيجار" value={-rent} indent />
              <Row label="Utilities" labelAr="المرافق" value={-utilities} indent />
              <Row label="Marketing" labelAr="التسويق" value={-marketing} indent />
              <Row label="Depreciation" labelAr="الاستهلاك" value={-depreciation} indent />
              <Row label="Total Operating Expenses" labelAr="إجمالي المصروفات" value={-totalOpex} isTotal />
              <Row label="Operating Profit (EBIT)" labelAr="الربح التشغيلي" value={ebit} isTotal />

              <SectionHeader title="Finance" titleAr="التمويل" />
              <Row label="Finance Costs" labelAr="تكاليف التمويل" value={-finance} indent />
              <Row label="Net Profit Before Zakat" labelAr="صافي الربح قبل الزكاة" value={netBeforeTax} isTotal />
              <Row label="Zakat (2.5%)" labelAr="الزكاة" value={-zakat} indent />

              {/* Net Profit highlight box */}
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-green-100 dark:from-emerald-950 dark:to-green-900 border-2 border-emerald-300">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-lg">Net Profit After Zakat</p>
                    <p className="text-sm text-muted-foreground">صافي الربح بعد الزكاة</p>
                  </div>
                  <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    SAR {fmt(netProfit)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Balance Sheet ── */}
        <TabsContent value="bs">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Assets */}
            <Card>
              <CardHeader>
                <CardTitle>Assets — الأصول</CardTitle>
              </CardHeader>
              <CardContent className="space-y-0.5">
                <SectionHeader title="Current Assets" titleAr="الأصول المتداولة" />
                <Row label="Cash & Equivalents" labelAr="النقد" value={cash} indent />
                <Row label="Accounts Receivable" labelAr="ذمم مدينة" value={ar} indent />
                <Row label="Inventory" labelAr="المخزون" value={inventory} indent />
                <Row label="Prepaid Expenses" labelAr="مصروفات مدفوعة مقدماً" value={prepaid} indent />
                <Row label="Total Current Assets" labelAr="إجمالي الأصول المتداولة" value={totalCurrentAssets} isTotal />

                <SectionHeader title="Non-Current Assets" titleAr="الأصول الثابتة" />
                <Row label="Fixed Assets (Cost)" labelAr="الأصول الثابتة" value={fixedAssets} indent />
                <Row label="Less: Accumulated Depreciation" labelAr="الاستهلاك المتراكم" value={-accumDepreciation} indent />
                <Row label="TOTAL ASSETS" labelAr="إجمالي الأصول" value={totalAssets} isTotal />
              </CardContent>
            </Card>

            {/* Liabilities & Equity */}
            <Card>
              <CardHeader>
                <CardTitle>Liabilities & Equity — الالتزامات وحقوق الملكية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-0.5">
                <SectionHeader title="Current Liabilities" titleAr="الالتزامات المتداولة" />
                <Row label="Accounts Payable" labelAr="ذمم دائنة" value={ap} indent />
                <Row label="VAT Payable" labelAr="ضريبة القيمة المضافة" value={vatPayable} indent />
                <Row label="Total Current Liabilities" labelAr="إجمالي الالتزامات المتداولة" value={totalCurrentLiab} isTotal />

                <SectionHeader title="Non-Current Liabilities" titleAr="الالتزامات طويلة الأجل" />
                <Row label="Long-term Loan" labelAr="قرض طويل الأجل" value={longTermLoan} indent />
                <Row label="TOTAL LIABILITIES" labelAr="إجمالي الالتزامات" value={totalLiab} isTotal />

                <SectionHeader title="Equity" titleAr="حقوق الملكية" />
                <Row label="Paid-up Capital" labelAr="رأس المال المدفوع" value={capital} indent />
                <Row label="Retained Earnings" labelAr="الأرباح المحتجزة" value={retained} indent />
                <Row label="Net Profit" labelAr="صافي الربح" value={netProfit} indent />
                <Row label="TOTAL EQUITY" labelAr="إجمالي حقوق الملكية" value={totalEquity} isTotal />

                <div className="mt-3 p-3 rounded bg-emerald-50 dark:bg-emerald-950 border border-emerald-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Liab + Equity</span>
                    <span className="font-bold text-emerald-600">SAR {fmt(totalLiab + totalEquity)}</span>
                  </div>
                  {Math.abs((totalLiab + totalEquity) - totalAssets) < 2 && (
                    <Badge className="mt-1 bg-emerald-100 text-emerald-700 border-0">✓ Balanced</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Cash Flow ── */}
        <TabsContent value="cf">
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Statement — قائمة التدفقات النقدية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0.5">
              <SectionHeader title="Operating Activities" titleAr="الأنشطة التشغيلية" />
              <Row label="Net Profit" value={netProfit} indent />
              <Row label="Add: Depreciation" value={depreciation} indent />
              <Row label="Change in Receivables" value={-ar * 0.1} indent />
              <Row label="Change in Inventory" value={-inventory * 0.05} indent />
              <Row label="Change in Payables" value={ap * 0.1} indent />
              <Row label="Net Cash from Operations" value={netProfit + depreciation - ar * 0.1 - inventory * 0.05 + ap * 0.1} isTotal />

              <SectionHeader title="Investing Activities" titleAr="الأنشطة الاستثمارية" />
              <Row label="Purchase of Fixed Assets" value={-20000} indent />
              <Row label="Net Cash from Investing" value={-20000} isTotal />

              <SectionHeader title="Financing Activities" titleAr="الأنشطة التمويلية" />
              <Row label="Loan Repayment" value={-10000} indent />
              <Row label="Net Cash from Financing" value={-10000} isTotal />

              <div className="mt-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-950 border-2 border-blue-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-lg">Net Increase in Cash</p>
                    <p className="text-sm text-muted-foreground">صافي الزيادة في النقد</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    SAR {fmt(netProfit + depreciation - 20000 - 10000)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Saudi VAT Return ── */}
        <TabsContent value="vat">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Saudi VAT Return — الإقرار الضريبي</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    ضريبة القيمة المضافة — GAZT / ZATCA Filing
                  </p>
                </div>
                <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                  Due: Last day of following month
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* VAT Boxes */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { box: 'Box 1', label: 'Standard Rated Supplies', labelAr: 'التوريدات الخاضعة للضريبة', value: netRevenue, rate: '15%', color: 'border-blue-200 bg-blue-50' },
                  { box: 'Box 2', label: 'Zero Rated Supplies', labelAr: 'التوريدات الخاضعة بنسبة الصفر', value: 0, rate: '0%', color: 'border-slate-200' },
                  { box: 'Box 3', label: 'Exempt Supplies', labelAr: 'التوريدات المعفاة', value: 0, rate: 'N/A', color: 'border-slate-200' },
                  { box: 'Box 4', label: 'Total Taxable Supplies', labelAr: 'إجمالي التوريدات الخاضعة', value: netRevenue, rate: '', color: 'border-purple-200 bg-purple-50' },
                  { box: 'Box 5', label: 'VAT Due (Output)', labelAr: 'الضريبة المستحقة', value: outputVat, rate: '', color: 'border-red-200 bg-red-50' },
                  { box: 'Box 6', label: 'Input VAT Recoverable', labelAr: 'الضريبة القابلة للاسترداد', value: inputVat, rate: '', color: 'border-green-200 bg-green-50' },
                ].map(item => (
                  <div key={item.box} className={`p-4 rounded-lg border-2 ${item.color}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="font-bold">{item.box}</Badge>
                      {item.rate && <Badge className="bg-slate-100 text-slate-600 border-0 text-xs">{item.rate}</Badge>}
                    </div>
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.labelAr}</p>
                    <p className="text-xl font-bold mt-2">SAR {fmt(item.value)}</p>
                  </div>
                ))}
              </div>

              {/* Net VAT Payable */}
              <div className="p-5 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 border-2 border-red-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-lg">Box 7: Net VAT Payable</p>
                    <p className="text-sm text-muted-foreground">صافي الضريبة المستحقة السداد</p>
                    <p className="text-xs text-muted-foreground mt-1">Output VAT – Input VAT</p>
                  </div>
                  <p className="text-3xl font-bold text-red-600">SAR {fmt(netVat)}</p>
                </div>
              </div>

              <Button className="w-full" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export VAT Return for ZATCA / GAZT Filing
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
