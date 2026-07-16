import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/providers/trpc";
import { Calculator, FileText, Users, TrendingUp, Calendar, AlertCircle } from "lucide-react";

function formatSAR(val: number) {
  return val.toLocaleString("en-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " SAR";
}

export default function EOSBPage() {
  const { data: employees } = trpc.hrm.employeeList.useQuery();
  const { data: summary, refetch: refetchSummary } = trpc.eosb.summary.useQuery();
  const { data: accruals, refetch: refetchAccruals } = trpc.eosb.accrualList.useQuery();
  const calculateTermination = trpc.eosb.calculate.useQuery;
  const runAccrual = trpc.eosb.monthlyAccrual.useMutation({ onSuccess: () => { refetchSummary(); refetchAccruals(); } });
  const runBatch = trpc.eosb.runBatchAccrual.useMutation({ onSuccess: () => { refetchSummary(); refetchAccruals(); } });

  const [calcForm, setCalcForm] = useState({ hireDate: "", terminationDate: "", basicSalary: 5000, isResignation: false });
  const [calcEnabled, setCalcEnabled] = useState(false);
  const calcResult = calculateTermination(calcForm, { enabled: calcEnabled });

  const [accrualEmp, setAccrualEmp] = useState(0);
  const [periodStart, setPeriodStart] = useState(() => {
    const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10);
  });
  const [periodEnd, setPeriodEnd] = useState(() => new Date().toISOString().slice(0, 10));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="w-6 h-6 text-amber-600" /> End of Service Benefits (EOSB)
          </h2>
          <p className="text-slate-500">مكافأة نهاية الخدمة – Article 84 Saudi Labor Law – Hijri calendar</p>
        </div>
        {summary && (
          <Badge variant="outline" className="text-sm px-4 py-2">
            <Users className="w-4 h-4 mr-2" /> Total Accrued: {formatSAR(summary.totalAccrued)}
          </Badge>
        )}
      </div>

      <Tabs defaultValue="calculator">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator"><Calculator className="w-4 h-4 mr-2" />Calculator</TabsTrigger>
          <TabsTrigger value="accruals"><TrendingUp className="w-4 h-4 mr-2" />Monthly Accruals</TabsTrigger>
          <TabsTrigger value="statement"><FileText className="w-4 h-4 mr-2" />Employee Statement</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-4 mt-6">
          <Card>
            <CardHeader><CardTitle>EOSB Calculator (Hijri-based)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Hire Date</Label><Input type="date" value={calcForm.hireDate} onChange={e => setCalcForm({...calcForm, hireDate: e.target.value})} /></div>
                <div><Label>Termination Date</Label><Input type="date" value={calcForm.terminationDate} onChange={e => setCalcForm({...calcForm, terminationDate: e.target.value})} /></div>
                <div><Label>Last Basic Salary (SAR)</Label><Input type="number" value={calcForm.basicSalary} onChange={e => setCalcForm({...calcForm, basicSalary: Number(e.target.value)})} /></div>
                <div className="flex items-end gap-4">
                  <Label className="flex items-center gap-2"><input type="checkbox" checked={calcForm.isResignation} onChange={e => setCalcForm({...calcForm, isResignation: e.target.checked})} /> Resignation (reduced vesting)</Label>
                </div>
              </div>
              <Button onClick={() => setCalcEnabled(true)}>Calculate</Button>

              {calcResult.data && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-blue-50"><CardContent className="p-4"><p className="text-sm text-blue-600">Service Years</p><p className="text-xl font-bold">{calcResult.data.yearsOfService.toFixed(2)}</p></CardContent></Card>
                  <Card className="bg-amber-50"><CardContent className="p-4"><p className="text-sm text-amber-600">First 5 Years (50%)</p><p className="text-xl font-bold">{formatSAR(calcResult.data.firstFiveYearEntitlement)}</p></CardContent></Card>
                  <Card className="bg-orange-50"><CardContent className="p-4"><p className="text-sm text-orange-600">After 5 Years (100%)</p><p className="text-xl font-bold">{formatSAR(calcResult.data.afterFiveYearEntitlement)}</p></CardContent></Card>
                  <Card className="bg-emerald-50"><CardContent className="p-4"><p className="text-sm text-emerald-600">Total Entitlement</p><p className="text-xl font-bold">{formatSAR(calcResult.data.totalEntitlement)}</p></CardContent></Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accruals" className="space-y-4 mt-6">
          <Card>
            <CardHeader><CardTitle>Run Monthly Accrual</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Employee</Label>
                  <Select onValueChange={v => setAccrualEmp(Number(v))}>
                    <SelectTrigger><SelectValue placeholder="All or select" /></SelectTrigger>
                    <SelectContent>{employees?.map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Period Start</Label><Input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} /></div>
                <div><Label>Period End</Label><Input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} /></div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => runAccrual.mutate({ employeeId: accrualEmp, periodStart, periodEnd })} disabled={!accrualEmp}>
                  Run Single Accrual
                </Button>
                <Button variant="outline" onClick={() => runBatch.mutate({ periodStart, periodEnd })}>
                  Run Batch (All Active)
                </Button>
              </div>
              {summary && (
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-slate-50"><CardContent className="p-3"><p className="text-xs text-slate-500">Active Employees</p><p className="text-lg font-bold">{summary.totalEmployees}</p></CardContent></Card>
                  <Card className="bg-slate-50"><CardContent className="p-3"><p className="text-xs text-slate-500">Total Accrued</p><p className="text-lg font-bold">{formatSAR(summary.totalAccrued)}</p></CardContent></Card>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Accrual History</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead><TableHead>Period</TableHead>
                    <TableHead className="text-right">Service Years</TableHead>
                    <TableHead className="text-right">Accrual Amount</TableHead>
                    <TableHead className="text-right">Running Total</TableHead>
                    <TableHead>Hijri</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accruals?.map(a => (
                    <TableRow key={a.id}>
                      <TableCell>{employees?.find(e => e.id === a.employeeId)?.firstName} {employees?.find(e => e.id === a.employeeId)?.lastName}</TableCell>
                      <TableCell className="text-xs">{a.periodStart} to {a.periodEnd}</TableCell>
                      <TableCell className="text-right">{Number(a.serviceYears).toFixed(2)}</TableCell>
                      <TableCell className="text-right text-amber-600">{formatSAR(Number(a.accrualAmount))}</TableCell>
                      <TableCell className="text-right font-bold">{formatSAR(Number(a.runningTotal))}</TableCell>
                      <TableCell>{a.isHijri ? <Calendar className="w-4 h-4 text-emerald-500" /> : "-"}</TableCell>
                    </TableRow>
                  ))}
                  {(!accruals || accruals.length === 0) && (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-400"><AlertCircle className="w-6 h-6 mx-auto mb-2" />No accruals recorded</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statement" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Employee EOSB Statement</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">Select an employee above in the Accruals tab and view their detailed EOSB statement with full accrual history, total entitlement, and projection.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
