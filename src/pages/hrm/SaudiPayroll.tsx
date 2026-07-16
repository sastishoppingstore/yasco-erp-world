import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { trpc } from '@/providers/trpc';
import {
  Calculator, Download, Users, FileText, TrendingUp, Shield,
  CheckCircle2, AlertCircle,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── GOSI Rates 2024 ──────────────────────────────────────────────────────────
// Source: General Organization for Social Insurance (GOSI), Kingdom of Saudi Arabia
const GOSI_RATES = {
  saudi: {
    employee: { annuities: 0.09, total: 0.09 },
    employer: { annuities: 0.09, hazards: 0.01, unemployment: 0.02, total: 0.12 },
  },
  expat: {
    employee: { total: 0 },
    employer: { hazards: 0.02, total: 0.02 },
  },
};

function calcGosi(basicSalary: number, nationality: 'saudi' | 'expat') {
  const rates = GOSI_RATES[nationality];
  const employeeShare = basicSalary * rates.employee.total;
  const employerShare = basicSalary * rates.employer.total;
  return {
    employeeShare,
    employerShare,
    totalGosi: employeeShare + employerShare,
    gosiBase: basicSalary,
  };
}

function calcPayslip(
  basic: number, housing: number, transport: number,
  other: number, overtime: number,
  nationality: 'saudi' | 'expat',
  advance: number, loan: number,
) {
  const gross = basic + housing + transport + other + overtime;
  const gosi = calcGosi(basic, nationality);
  const totalDeductions = gosi.employeeShare + advance + loan;
  const net = gross - totalDeductions;
  return { gross, net, totalDeductions, gosi };
}

function formatSAR(val: number) {
  return val.toLocaleString('en-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' SAR';
}

export default function SaudiPayroll() {
  const { data: employees } = trpc.hrm.employeeList.useQuery();
  const { data: periods } = trpc.hrm.payrollPeriodList.useQuery();
  const { data: salarySlips, refetch } = trpc.hrm.salarySlipList.useQuery();
  const createSlip = trpc.hrm.salarySlipCreate.useMutation({ onSuccess: () => refetch() });

  // Calculator state
  const [nationality, setNationality] = useState<'saudi' | 'expat'>('saudi');
  const [basic, setBasic] = useState(5000);
  const [housing, setHousing] = useState(1250);
  const [transport, setTransport] = useState(500);
  const [other, setOther] = useState(0);
  const [overtime, setOvertime] = useState(0);
  const [advance, setAdvance] = useState(0);
  const [loan, setLoan] = useState(0);

  // Auto-calculate 25% housing allowance when basic changes
  useEffect(() => { setHousing(Math.round(basic * 0.25)); }, [basic]);

  const calc = calcPayslip(basic, housing, transport, other, overtime, nationality, advance, loan);
  const gosi = calc.gosi;

  // Build GOSI report from employee data
  const gosiReport = (employees || []).map(emp => {
    const slip = salarySlips?.find(s => s.employeeId === emp.id);
    const empBasic = Number(slip?.basicSalary ?? 0);
    const nat: 'saudi' | 'expat' = 'saudi'; // default; extend if employee table has nationality
    const g = calcGosi(empBasic, nat);
    return { ...emp, gosiBase: g.gosiBase, employeeShare: g.employeeShare, employerShare: g.employerShare, total: g.totalGosi, nationality: nat };
  });

  const totalEmployeeGosi = gosiReport.reduce((s, r) => s + r.employeeShare, 0);
  const totalEmployerGosi = gosiReport.reduce((s, r) => s + r.employerShare, 0);

  function exportGosiPDF() {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('GOSI Monthly Report', 14, 18);
    doc.setFontSize(11);
    doc.text('تقرير التأمينات الاجتماعية الشهري', 14, 26);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-SA')} | Kingdom of Saudi Arabia`, 14, 34);
    autoTable(doc, {
      startY: 44,
      head: [['Employee', 'Nationality', 'GOSI Base', 'Employee (9%)', 'Employer (12%)', 'Total']],
      body: gosiReport.map(r => [
        `${r.firstName} ${r.lastName}`,
        r.nationality === 'saudi' ? 'Saudi' : 'Expat',
        formatSAR(r.gosiBase),
        formatSAR(r.employeeShare),
        formatSAR(r.employerShare),
        formatSAR(r.total),
      ]),
      foot: [['TOTAL', '', '', formatSAR(totalEmployeeGosi), formatSAR(totalEmployerGosi), formatSAR(totalEmployeeGosi + totalEmployerGosi)]],
      headStyles: { fillColor: [6, 78, 59] },
      footStyles: { fillColor: [240, 253, 244], textColor: [6, 78, 59], fontStyle: 'bold' },
    });
    doc.save('GOSI-Monthly-Report.pdf');
  }

  // ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
            Saudi Payroll & GOSI
          </h1>
          <p className="text-muted-foreground mt-1">
            نظام الرواتب والتأمينات الاجتماعية — Kingdom of Saudi Arabia
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="border-green-500 text-green-600 px-3 py-1">
            <Shield className="w-3 h-3 mr-1" /> GOSI Compliant
          </Badge>
          <Badge variant="outline" className="border-blue-500 text-blue-600 px-3 py-1">
            Saudi Labor Law 2024
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="calculator">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator">
            <Calculator className="w-4 h-4 mr-2" />GOSI Calculator
          </TabsTrigger>
          <TabsTrigger value="slips">
            <FileText className="w-4 h-4 mr-2" />Salary Slips
          </TabsTrigger>
          <TabsTrigger value="report">
            <TrendingUp className="w-4 h-4 mr-2" />GOSI Report
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: Real-time Calculator ── */}
        <TabsContent value="calculator" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Input Panel */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-emerald-600" />
                  Salary Details — تفاصيل الراتب
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Nationality */}
                <div>
                  <Label>Nationality — الجنسية</Label>
                  <Select value={nationality} onValueChange={(v: 'saudi' | 'expat') => setNationality(v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saudi">🇸🇦 Saudi National — سعودي</SelectItem>
                      <SelectItem value="expat">🌍 Expatriate — وافد</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Basic Salary — الراتب الأساسي</Label>
                    <Input type="number" value={basic} onChange={e => setBasic(Number(e.target.value))} className="mt-1" />
                  </div>
                  <div>
                    <Label>Housing (25%) — بدل السكن</Label>
                    <Input type="number" value={housing} onChange={e => setHousing(Number(e.target.value))} className="mt-1" />
                  </div>
                  <div>
                    <Label>Transport — بدل النقل</Label>
                    <Input type="number" value={transport} onChange={e => setTransport(Number(e.target.value))} className="mt-1" />
                  </div>
                  <div>
                    <Label>Other Allowances — بدلات أخرى</Label>
                    <Input type="number" value={other} onChange={e => setOther(Number(e.target.value))} className="mt-1" />
                  </div>
                  <div>
                    <Label>Overtime — العمل الإضافي</Label>
                    <Input type="number" value={overtime} onChange={e => setOvertime(Number(e.target.value))} className="mt-1" />
                  </div>
                  <div>
                    <Label>Advance Deduction — سلفة</Label>
                    <Input type="number" value={advance} onChange={e => setAdvance(Number(e.target.value))} className="mt-1" />
                  </div>
                  <div>
                    <Label>Loan Deduction — قرض</Label>
                    <Input type="number" value={loan} onChange={e => setLoan(Number(e.target.value))} className="mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Panel */}
            <div className="space-y-4">
              {/* Gross Salary */}
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
                <CardContent className="p-5">
                  <p className="text-sm text-blue-600 font-medium">Gross Salary — الراتب الإجمالي</p>
                  <p className="text-3xl font-bold text-blue-700 mt-1">{formatSAR(calc.gross)}</p>
                  <div className="mt-2 text-xs text-blue-600 grid grid-cols-2 gap-1">
                    <span>Basic: {formatSAR(basic)}</span>
                    <span>Housing: {formatSAR(housing)}</span>
                    <span>Transport: {formatSAR(transport)}</span>
                    <span>Other: {formatSAR(other + overtime)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* GOSI Breakdown */}
              <Card className="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950 dark:to-green-900 border-emerald-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-emerald-700 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    GOSI Breakdown — التأمينات الاجتماعية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">GOSI Base (Basic Salary only)</span>
                    <span className="font-medium">{formatSAR(gosi.gosiBase)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Employee Share ({nationality === 'saudi' ? '9%' : '0%'})
                    </span>
                    <span className="font-medium text-red-600">– {formatSAR(gosi.employeeShare)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Employer Share ({nationality === 'saudi' ? '12%' : '2%'})
                    </span>
                    <span className="font-medium text-orange-600">{formatSAR(gosi.employerShare)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total GOSI</span>
                    <span>{formatSAR(gosi.totalGosi)}</span>
                  </div>
                  {nationality === 'saudi' && (
                    <div className="text-xs text-muted-foreground mt-2 bg-white/50 dark:bg-black/20 rounded p-2 space-y-0.5">
                      <p><strong>Employee:</strong> 9% Annuities (المعاشات)</p>
                      <p><strong>Employer:</strong> 9% Annuities + 1% Hazards (مخاطر مهنية) + 2% SANED (حماية أجور)</p>
                    </div>
                  )}
                  {nationality === 'expat' && (
                    <div className="text-xs text-muted-foreground mt-2 bg-white/50 dark:bg-black/20 rounded p-2">
                      <p><strong>Expat:</strong> Employee pays 0% | Employer pays 2% (Occupational Hazards only)</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Net Salary — highlighted */}
              <Card className="bg-gradient-to-br from-green-600 to-emerald-700 text-white border-0 shadow-lg shadow-green-200 dark:shadow-none">
                <CardContent className="p-6">
                  <p className="text-green-100 text-sm font-medium">Net Salary — صافي الراتب</p>
                  <p className="text-4xl font-bold mt-1">{formatSAR(calc.net)}</p>
                  <div className="mt-3 text-sm text-green-100 space-y-1 border-t border-green-500 pt-3">
                    <div className="flex justify-between">
                      <span>GOSI Deduction</span>
                      <span>– {formatSAR(gosi.employeeShare)}</span>
                    </div>
                    {advance > 0 && (
                      <div className="flex justify-between">
                        <span>Advance</span>
                        <span>– {formatSAR(advance)}</span>
                      </div>
                    )}
                    {loan > 0 && (
                      <div className="flex justify-between">
                        <span>Loan</span>
                        <span>– {formatSAR(loan)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold border-t border-green-500 pt-1">
                      <span>Total Deductions</span>
                      <span>– {formatSAR(calc.totalDeductions)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Employer Cost Card */}
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-orange-700">Total Employer Cost — التكلفة الإجمالية على صاحب العمل</p>
                  <p className="text-sm text-orange-600 mt-1">
                    Gross Salary + Employer GOSI ({nationality === 'saudi' ? '12%' : '2%'} of basic)
                  </p>
                </div>
                <p className="text-3xl font-bold text-orange-700">
                  {formatSAR(calc.gross + gosi.employerShare)}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 2: Salary Slips ── */}
        <TabsContent value="slips" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Salary Slips — كشوف الرواتب
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee — الموظف</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Basic</TableHead>
                    <TableHead>Gross</TableHead>
                    <TableHead>GOSI</TableHead>
                    <TableHead>Net</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(salarySlips || []).map(slip => (
                    <TableRow key={slip.id}>
                      <TableCell className="font-medium">
                        {employees?.find(e => e.id === slip.employeeId)?.firstName}{' '}
                        {employees?.find(e => e.id === slip.employeeId)?.lastName}
                      </TableCell>
                      <TableCell>
                        {periods?.find(p => p.id === slip.payrollPeriodId)?.name}
                      </TableCell>
                      <TableCell>{formatSAR(Number(slip.basicSalary))}</TableCell>
                      <TableCell>{formatSAR(Number(slip.grossSalary))}</TableCell>
                      <TableCell className="text-red-600">
                        {formatSAR(Number(slip.socialInsurance))}
                      </TableCell>
                      <TableCell className="font-bold text-green-600">
                        {formatSAR(Number(slip.netSalary))}
                      </TableCell>
                      <TableCell>
                        <Badge variant={slip.status === 'paid' ? 'default' : 'secondary'}>
                          {slip.status || 'draft'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!salarySlips || salarySlips.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                        No salary slips yet. Go to the original Payroll page to create payroll periods and slips.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 3: GOSI Report ── */}
        <TabsContent value="report" className="space-y-6 mt-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-950">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-emerald-600" />
                  <div>
                    <p className="text-sm text-emerald-600">Total Employees</p>
                    <p className="text-3xl font-bold">{employees?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950">
              <CardContent className="p-5">
                <p className="text-sm text-blue-600">Employee GOSI Contribution</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">{formatSAR(totalEmployeeGosi)}</p>
                <p className="text-xs text-muted-foreground">Total deducted from employees</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950">
              <CardContent className="p-5">
                <p className="text-sm text-orange-600">Employer GOSI Contribution</p>
                <p className="text-2xl font-bold text-orange-700 mt-1">{formatSAR(totalEmployerGosi)}</p>
                <p className="text-xs text-muted-foreground">Employer's liability to GOSI</p>
              </CardContent>
            </Card>
          </div>

          {/* GOSI Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  GOSI Monthly Report — تقرير التأمينات الاجتماعية الشهري
                </CardTitle>
                <Button onClick={exportGosiPDF} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" /> Export PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee — الموظف</TableHead>
                    <TableHead>Nationality</TableHead>
                    <TableHead>GOSI Base</TableHead>
                    <TableHead>Employee (9%)</TableHead>
                    <TableHead>Employer (12%)</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gosiReport.map(row => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">
                        {row.firstName} {row.lastName}
                      </TableCell>
                      <TableCell>
                        <Badge variant={row.nationality === 'saudi' ? 'default' : 'outline'}>
                          {row.nationality === 'saudi' ? '🇸🇦 Saudi' : '🌍 Expat'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatSAR(row.gosiBase)}</TableCell>
                      <TableCell className="text-red-600 font-medium">
                        {formatSAR(row.employeeShare)}
                      </TableCell>
                      <TableCell className="text-orange-600 font-medium">
                        {formatSAR(row.employerShare)}
                      </TableCell>
                      <TableCell className="font-bold">{formatSAR(row.total)}</TableCell>
                    </TableRow>
                  ))}
                  {gosiReport.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No employees with salary data found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                {gosiReport.length > 0 && (
                  <tfoot>
                    <tr className="bg-muted/60 font-bold text-sm">
                      <td className="px-4 py-3" colSpan={3}>TOTAL — الإجمالي</td>
                      <td className="px-4 py-3 text-red-600">{formatSAR(totalEmployeeGosi)}</td>
                      <td className="px-4 py-3 text-orange-600">{formatSAR(totalEmployerGosi)}</td>
                      <td className="px-4 py-3">{formatSAR(totalEmployeeGosi + totalEmployerGosi)}</td>
                    </tr>
                  </tfoot>
                )}
              </Table>
            </CardContent>
          </Card>

          {/* GOSI Rate Reference */}
          <Card className="bg-slate-50 dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-sm">GOSI Rate Reference — مرجع معدلات التأمينات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 text-sm">
                <div>
                  <p className="font-semibold text-emerald-700 mb-2">🇸🇦 Saudi National</p>
                  <table className="w-full text-xs">
                    <tbody>
                      <tr><td className="py-1 text-muted-foreground">Employee — Annuities</td><td className="font-medium text-right">9%</td></tr>
                      <tr><td className="py-1 text-muted-foreground">Employer — Annuities</td><td className="font-medium text-right">9%</td></tr>
                      <tr><td className="py-1 text-muted-foreground">Employer — Hazards</td><td className="font-medium text-right">1%</td></tr>
                      <tr><td className="py-1 text-muted-foreground">Employer — SANED</td><td className="font-medium text-right">2%</td></tr>
                      <tr className="border-t"><td className="py-1 font-bold">Total Employer Share</td><td className="font-bold text-right text-orange-600">12%</td></tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <p className="font-semibold text-blue-700 mb-2">🌍 Expatriate</p>
                  <table className="w-full text-xs">
                    <tbody>
                      <tr><td className="py-1 text-muted-foreground">Employee</td><td className="font-medium text-right">0%</td></tr>
                      <tr><td className="py-1 text-muted-foreground">Employer — Hazards</td><td className="font-medium text-right">2%</td></tr>
                      <tr className="border-t"><td className="py-1 font-bold">Total Employer Share</td><td className="font-bold text-right text-orange-600">2%</td></tr>
                    </tbody>
                  </table>
                  <p className="text-xs text-muted-foreground mt-2">
                    * GOSI base = Basic Salary only (excludes allowances)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
