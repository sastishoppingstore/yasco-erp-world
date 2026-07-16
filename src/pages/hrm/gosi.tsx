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
import { Shield, Calculator, FileText, TrendingUp, Download, Users, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

function formatSAR(val: number) {
  return val.toLocaleString("en-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " SAR";
}

export default function GOSIPage() {
  const { data: employees } = trpc.hrm.employeeList.useQuery();
  const { data: rates, refetch: refetchRates } = trpc.gosi.rateTableList.useQuery();
  const createRate = trpc.gosi.rateTableCreate.useMutation({ onSuccess: () => refetchRates() });
  const { data: reportData, refetch: refetchReport } = trpc.gosi.report.useQuery({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const { data: submissions, refetch: refetchSubs } = trpc.gosi.submissionList.useQuery();
  const createSubmission = trpc.gosi.submissionCreate.useMutation({ onSuccess: () => refetchSubs() });

  const [calcEmpId, setCalcEmpId] = useState<number>(0);
  const [calcBasic, setCalcBasic] = useState(0);
  const [calcHousing, setCalcHousing] = useState(0);
  const { data: calcResult } = trpc.gosi.calculate.useQuery(
    { employeeId: calcEmpId || 1, basicSalary: calcBasic, housingAllowance: calcHousing },
    { enabled: calcEmpId > 0 && calcBasic > 0 },
  );

  const [openRate, setOpenRate] = useState(false);
  const [rateForm, setRateForm] = useState({
    name: "", effectiveFrom: "", systemType: "new" as const,
    employeeAnnuitiesRate: 0.095, employerAnnuitiesRate: 0.095, employerHazardsRate: 0.02,
    employeeUnemploymentRate: 0.0075, employerUnemploymentRate: 0.0075, contributionCap: 45000,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-600" /> GOSI Management
          </h2>
          <p className="text-slate-500">General Organization for Social Insurance – المؤسسة العامة للتأمينات الاجتماعية</p>
        </div>
        <Dialog open={openRate} onOpenChange={setOpenRate}>
          <DialogTrigger asChild><Button variant="outline"><FileText className="w-4 h-4 mr-2" />New Rate Table</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create GOSI Rate Table</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createRate.mutate(rateForm as any); setOpenRate(false); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Name</Label><Input value={rateForm.name} onChange={e => setRateForm({...rateForm, name: e.target.value})} required /></div>
                <div><Label>Effective From</Label><Input type="date" value={rateForm.effectiveFrom} onChange={e => setRateForm({...rateForm, effectiveFrom: e.target.value})} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>System Type</Label>
                  <Select value={rateForm.systemType} onValueChange={v => setRateForm({...rateForm, systemType: v as "new" | "old"})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="new">New System</SelectItem><SelectItem value="old">Old System</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Contribution Cap (SAR)</Label><Input type="number" value={rateForm.contributionCap} onChange={e => setRateForm({...rateForm, contributionCap: Number(e.target.value)})} /></div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div><Label>Emp. Annuities</Label><Input type="number" step="0.0001" value={rateForm.employeeAnnuitiesRate} onChange={e => setRateForm({...rateForm, employeeAnnuitiesRate: Number(e.target.value)})} /></div>
                <div><Label>Emp. Unemp.</Label><Input type="number" step="0.0001" value={rateForm.employeeUnemploymentRate} onChange={e => setRateForm({...rateForm, employeeUnemploymentRate: Number(e.target.value)})} /></div>
                <div><Label>Empr. Annuities</Label><Input type="number" step="0.0001" value={rateForm.employerAnnuitiesRate} onChange={e => setRateForm({...rateForm, employerAnnuitiesRate: Number(e.target.value)})} /></div>
                <div><Label>Empr. Hazards</Label><Input type="number" step="0.0001" value={rateForm.employerHazardsRate} onChange={e => setRateForm({...rateForm, employerHazardsRate: Number(e.target.value)})} /></div>
                <div><Label>Empr. Unemp.</Label><Input type="number" step="0.0001" value={rateForm.employerUnemploymentRate} onChange={e => setRateForm({...rateForm, employerUnemploymentRate: Number(e.target.value)})} /></div>
              </div>
              <Button type="submit" className="w-full">Create Rate Table</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="calculator">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calculator"><Calculator className="w-4 h-4 mr-2" />Calculator</TabsTrigger>
          <TabsTrigger value="rates"><FileText className="w-4 h-4 mr-2" />Rate Tables</TabsTrigger>
          <TabsTrigger value="report"><TrendingUp className="w-4 h-4 mr-2" />Monthly Report</TabsTrigger>
          <TabsTrigger value="submissions"><Download className="w-4 h-4 mr-2" />Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-4 mt-6">
          <Card>
            <CardHeader><CardTitle>GOSI Calculator</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Employee</Label>
                  <Select onValueChange={v => { const emp = employees?.find(e => e.id === Number(v)); setCalcEmpId(Number(v)); if (emp) { setCalcBasic(Number(emp.basicSalary)); setCalcHousing(Number(emp.housingAllowance)); } }}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{employees?.map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Basic Salary</Label><Input type="number" value={calcBasic} onChange={e => setCalcBasic(Number(e.target.value))} /></div>
                <div><Label>Housing Allowance</Label><Input type="number" value={calcHousing} onChange={e => setCalcHousing(Number(e.target.value))} /></div>
              </div>
              {calcResult && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  <Card className="bg-blue-50"><CardContent className="p-4"><p className="text-sm text-blue-600">Contribution Base</p><p className="text-xl font-bold">{formatSAR(calcResult.contributionBase)}</p></CardContent></Card>
                  <Card className="bg-red-50"><CardContent className="p-4"><p className="text-sm text-red-600">Employee Share</p><p className="text-xl font-bold">{formatSAR(calcResult.employeeTotal)}</p></CardContent></Card>
                  <Card className="bg-orange-50"><CardContent className="p-4"><p className="text-sm text-orange-600">Employer Share</p><p className="text-xl font-bold">{formatSAR(calcResult.employerTotal)}</p></CardContent></Card>
                  <Card className="bg-emerald-50"><CardContent className="p-4"><p className="text-sm text-emerald-600">Total</p><p className="text-xl font-bold">{formatSAR(calcResult.totalContributions)}</p></CardContent></Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rates" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Effective Rate Tables</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead><TableHead>System</TableHead><TableHead>Effective</TableHead>
                    <TableHead>Emp. Ann.</TableHead><TableHead>Emp. Unemp.</TableHead>
                    <TableHead>Empr. Ann.</TableHead><TableHead>Empr. Haz.</TableHead><TableHead>Empr. Unemp.</TableHead>
                    <TableHead>Cap</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rates?.map(r => (
                    <TableRow key={r.id || r.effectiveFrom}>
                      <TableCell className="font-medium">{r.effectiveFrom}</TableCell>
                      <TableCell><Badge variant={r.systemType === "new" ? "default" : "secondary"}>{r.systemType}</Badge></TableCell>
                      <TableCell className="text-xs">{r.effectiveFrom}</TableCell>
                      <TableCell>{(r.employeeAnnuitiesRate * 100).toFixed(2)}%</TableCell>
                      <TableCell>{(r.employeeUnemploymentRate * 100).toFixed(2)}%</TableCell>
                      <TableCell>{(r.employerAnnuitiesRate * 100).toFixed(2)}%</TableCell>
                      <TableCell>{(r.employerHazardsRate * 100).toFixed(2)}%</TableCell>
                      <TableCell>{(r.employerUnemploymentRate * 100).toFixed(2)}%</TableCell>
                      <TableCell>{formatSAR(r.contributionCap)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="report" className="space-y-4 mt-6">
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-l-4 border-emerald-500"><CardContent className="p-4"><p className="text-sm text-slate-500">Employees</p><p className="text-2xl font-bold">{reportData?.rows.length || 0}</p></CardContent></Card>
            <Card className="border-l-4 border-red-500"><CardContent className="p-4"><p className="text-sm text-slate-500">Employee Share</p><p className="text-2xl font-bold text-red-600">{formatSAR(reportData?.totalEmployee || 0)}</p></CardContent></Card>
            <Card className="border-l-4 border-orange-500"><CardContent className="p-4"><p className="text-sm text-slate-500">Employer Share</p><p className="text-2xl font-bold text-orange-600">{formatSAR(reportData?.totalEmployer || 0)}</p></CardContent></Card>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead><TableHead>Nationality</TableHead><TableHead className="text-right">Base</TableHead>
                    <TableHead className="text-right">Employee</TableHead><TableHead className="text-right">Employer</TableHead><TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData?.rows.map(row => (
                    <TableRow key={row.employeeId}>
                      <TableCell className="font-medium">{row.employeeName}</TableCell>
                      <TableCell><Badge variant={row.nationality === "saudi" ? "default" : "outline"}>{row.nationality}</Badge></TableCell>
                      <TableCell className="text-right">{formatSAR(row.contributionBase)}</TableCell>
                      <TableCell className="text-right text-red-600">{formatSAR(row.employeeShare)}</TableCell>
                      <TableCell className="text-right text-orange-600">{formatSAR(row.employerShare)}</TableCell>
                      <TableCell className="text-right font-bold">{formatSAR(row.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                {reportData && reportData.rows.length > 0 && (
                  <tfoot>
                    <tr className="bg-muted/60 font-bold">
                      <td className="px-4 py-3" colSpan={3}>TOTAL</td>
                      <td className="px-4 py-3 text-red-600">{formatSAR(reportData.totalEmployee)}</td>
                      <td className="px-4 py-3 text-orange-600">{formatSAR(reportData.totalEmployer)}</td>
                      <td className="px-4 py-3">{formatSAR(reportData.grandTotal)}</td>
                    </tr>
                  </tfoot>
                )}
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Submission Log</CardTitle>
              <Button size="sm" onClick={() => {
                if (reportData) {
                  createSubmission.mutate({
                    periodMonth: new Date().getMonth() + 1,
                    periodYear: new Date().getFullYear(),
                    totalEmployeeShare: String(reportData.totalEmployee),
                    totalEmployerShare: String(reportData.totalEmployer),
                    employeeCount: reportData.rows.length,
                    notes: "Auto-generated from GOSI report",
                  });
                }
              }}><Download className="w-4 h-4 mr-2" />Submit to GOSI</Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead><TableHead className="text-right">Employee Share</TableHead>
                    <TableHead className="text-right">Employer Share</TableHead><TableHead className="text-right">Total</TableHead>
                    <TableHead>Employees</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions?.map(s => (
                    <TableRow key={s.id}>
                      <TableCell>{s.periodMonth}/{s.periodYear}</TableCell>
                      <TableCell className="text-right">{formatSAR(Number(s.totalEmployeeShare))}</TableCell>
                      <TableCell className="text-right">{formatSAR(Number(s.totalEmployerShare))}</TableCell>
                      <TableCell className="text-right font-bold">{formatSAR(Number(s.totalContributions))}</TableCell>
                      <TableCell>{s.employeeCount}</TableCell>
                      <TableCell><Badge variant={s.status === "submitted" ? "default" : s.status === "acknowledged" ? "secondary" : "outline"}>{s.status}</Badge></TableCell>
                      <TableCell className="text-xs">{s.submissionDate ? new Date(s.submissionDate).toLocaleDateString() : "-"}</TableCell>
                    </TableRow>
                  ))}
                  {(!submissions || submissions.length === 0) && (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-400"><AlertCircle className="w-6 h-6 mx-auto mb-2" />No submissions yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
