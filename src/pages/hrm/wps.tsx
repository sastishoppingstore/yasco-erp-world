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
import { Upload, Download, CheckCircle2, AlertCircle, Ban, Shield } from "lucide-react";

function formatSAR(val: number) {
  return val.toLocaleString("en-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " SAR";
}

export default function WPSPage() {
  const { data: employees } = trpc.hrm.employeeList.useQuery();
  const { data: periods } = trpc.hrm.payrollPeriodList.useQuery();
  const { data: submissions, refetch: refetchSubs } = trpc.wps.list.useQuery();
  const { data: exceptions, refetch: refetchExc } = trpc.wps.exceptionList.useQuery();
  const { data: compliance } = trpc.wps.complianceStats.useQuery();
  const generateWps = trpc.wps.generate.useMutation({ onSuccess: () => refetchSubs() });
  const submitWps = trpc.wps.submit.useMutation({ onSuccess: () => refetchSubs() });
  const createException = trpc.wps.exceptionCreate.useMutation({ onSuccess: () => refetchExc() });

  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [bankFormat, setBankFormat] = useState<string>("sarie");
  const [estId, setEstId] = useState("EST001");
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);

  const [excForm, setExcForm] = useState({ employeeId: 0, exceptionType: "unpaid_leave" as const, amount: 0, reason: "" });

  const { data: fileResult } = trpc.wps.getFile.useQuery(
    { id: 0 },
    { enabled: false },
  );

  const activeEmployees = employees?.filter(e => e.status === "active") || [];

  const handleGenerate = async () => {
    const emps = activeEmployees.filter(e => selectedEmployees.length === 0 || selectedEmployees.includes(e.id));
    if (emps.length === 0) return;
    const wpsEmployees = emps.map((e, i) => ({
      employeeCode: e.employeeCode,
      bankIban: e.bankIban || "SA0000000000000000000000",
      beneficiaryName: `${e.firstName} ${e.lastName}`.substring(0, 200),
      amount: Number(e.basicSalary) + Number(e.housingAllowance) + Number(e.transportAllowance),
      paymentDate,
      bankCode: e.bankIban?.slice(4, 7) || "000",
    }));
    generateWps.mutate({
      establishmentId: estId,
      payrollPeriodId: Number(selectedPeriod),
      bankFormat: bankFormat as any,
      paymentDate,
      employees: wpsEmployees,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Upload className="w-6 h-6 text-blue-600" /> Wage Protection System (WPS / Mudad)
          </h2>
          <p className="text-slate-500">نظام حماية الأجور – SARIE-compliant wage file generation</p>
        </div>
        {compliance && (
          <Badge variant={compliance.complianceRate >= 90 ? "default" : "destructive"} className="text-sm px-4 py-2">
            <Shield className="w-4 h-4 mr-2" /> Compliance: {compliance.complianceRate}%
          </Badge>
        )}
      </div>

      <Tabs defaultValue="generate">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate"><Download className="w-4 h-4 mr-2" />Generate WPS File</TabsTrigger>
          <TabsTrigger value="submissions"><Upload className="w-4 h-4 mr-2" />Submissions</TabsTrigger>
          <TabsTrigger value="exceptions"><Ban className="w-4 h-4 mr-2" />Exceptions</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4 mt-6">
          <Card>
            <CardHeader><CardTitle>WPS Wage File Generator</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Establishment ID</Label>
                  <Input value={estId} onChange={e => setEstId(e.target.value)} />
                </div>
                <div>
                  <Label>Bank Format</Label>
                  <Select value={bankFormat} onValueChange={setBankFormat}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sarie">SARIE (Saudi Payments)</SelectItem>
                      <SelectItem value="alrajhi">Al Rajhi Bank</SelectItem>
                      <SelectItem value="ncb">NCB (Ahli)</SelectItem>
                      <SelectItem value="samba">Samba</SelectItem>
                      <SelectItem value="riyad">Riyad Bank</SelectItem>
                      <SelectItem value="anb">Arab National Bank</SelectItem>
                      <SelectItem value="albilad">Bank AlBilad</SelectItem>
                      <SelectItem value="aljazira">Bank AlJazira</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Payment Date</Label>
                  <Input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Payroll Period</Label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{periods?.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Employees to include ({activeEmployees.length} active)</Label>
                <div className="border rounded-md p-2 max-h-40 overflow-y-auto space-y-1">
                  {activeEmployees.map(e => (
                    <label key={e.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={selectedEmployees.includes(e.id) || selectedEmployees.length === 0}
                        onChange={() => setSelectedEmployees(prev =>
                          prev.includes(e.id) ? prev.filter(id => id !== e.id) : [...prev, e.id],
                        )}
                      />
                      {e.firstName} {e.lastName} – {formatSAR(Number(e.basicSalary) + Number(e.housingAllowance) + Number(e.transportAllowance))}
                    </label>
                  ))}
                </div>
              </div>
              <Button onClick={handleGenerate} disabled={!selectedPeriod}>
                <Download className="w-4 h-4 mr-2" /> Generate WPS File
              </Button>
              {generateWps.data && (
                <Card className="bg-emerald-50 border-emerald-200">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-emerald-700 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> File Generated</p>
                      <p className="text-sm text-emerald-600">{generateWps.data.file.fileName} – {generateWps.data.file.employeeCount} employees – {formatSAR(generateWps.data.file.totalAmount)}</p>
                      <p className="text-xs text-emerald-500">Compliance rate: {generateWps.data.file.complianceRate}%</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => {
                      const blob = new Blob([generateWps.data.file.fileContent], { type: generateWps.data.file.mimeType });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url; a.download = generateWps.data.file.fileName; a.click();
                      URL.revokeObjectURL(url);
                    }}><Download className="w-4 h-4 mr-2" /> Download</Button>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="mt-6">
          <Card>
            <CardHeader><CardTitle>WPS Submission History</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead><TableHead>Date</TableHead><TableHead>Format</TableHead>
                    <TableHead className="text-right">Amount</TableHead><TableHead>Employees</TableHead>
                    <TableHead>Compliance</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions?.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-xs">{s.fileName}</TableCell>
                      <TableCell className="text-xs">{new Date(s.submissionDate).toLocaleDateString()}</TableCell>
                      <TableCell><Badge variant="outline">{s.bankFormat}</Badge></TableCell>
                      <TableCell className="text-right font-mono">{formatSAR(Number(s.totalAmount))}</TableCell>
                      <TableCell>{s.employeeCount}</TableCell>
                      <TableCell>{s.complianceRate ? `${s.complianceRate}%` : "-"}</TableCell>
                      <TableCell><Badge variant={s.status === "submitted" ? "default" : s.status === "acknowledged" ? "secondary" : "outline"}>{s.status}</Badge></TableCell>
                      <TableCell>
                        {s.status === "draft" && <Button size="sm" variant="outline" onClick={() => submitWps.mutate({ id: s.id })}>Submit</Button>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exceptions" className="space-y-4 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Justified Exceptions</CardTitle>
              <Button size="sm" onClick={() => createException.mutate({ ...excForm, payrollPeriodId: Number(selectedPeriod) })}>
                <Ban className="w-4 h-4 mr-2" /> Add Exception
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>Employee</Label>
                  <Select onValueChange={v => setExcForm({...excForm, employeeId: Number(v)})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{employees?.map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={excForm.exceptionType} onValueChange={v => setExcForm({...excForm, exceptionType: v as any})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unpaid_leave">Unpaid Leave</SelectItem>
                      <SelectItem value="disciplinary_deduction">Disciplinary</SelectItem>
                      <SelectItem value="bank_account_change">Bank Change</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Amount</Label><Input type="number" value={excForm.amount} onChange={e => setExcForm({...excForm, amount: Number(e.target.value)})} /></div>
                <div><Label>Reason</Label><Input value={excForm.reason} onChange={e => setExcForm({...excForm, reason: e.target.value})} /></div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Amount</TableHead>
                    <TableHead>Reason</TableHead><TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exceptions?.map(ex => (
                    <TableRow key={ex.id}>
                      <TableCell>{employees?.find(e => e.id === ex.employeeId)?.firstName} {employees?.find(e => e.id === ex.employeeId)?.lastName}</TableCell>
                      <TableCell><Badge variant="outline">{ex.exceptionType}</Badge></TableCell>
                      <TableCell className="text-right">{formatSAR(Number(ex.amount))}</TableCell>
                      <TableCell className="text-xs">{ex.reason}</TableCell>
                      <TableCell><Badge variant={ex.status === "approved" ? "default" : ex.status === "rejected" ? "destructive" : "secondary"}>{ex.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
