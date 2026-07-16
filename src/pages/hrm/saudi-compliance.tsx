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
import {
  Shield, FileText, IdCard, BarChart3, AlertTriangle, CheckCircle2,
  Users, RefreshCw, Eye, Ban,
} from "lucide-react";

function formatSAR(val: number) {
  return val.toLocaleString("en-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " SAR";
}

const CATEGORY_COLORS: Record<string, string> = {
  platinum: "bg-purple-100 text-purple-700 border-purple-300",
  green: "bg-emerald-100 text-emerald-700 border-emerald-300",
  yellow: "bg-amber-100 text-amber-700 border-amber-300",
  red: "bg-red-100 text-red-700 border-red-300",
};

export default function SaudiCompliancePage() {
  const { data: employees } = trpc.hrm.employeeList.useQuery();
  const { data: iqamas, refetch: refetchIqama } = trpc.saudiCompliance.iqamaList.useQuery();
  const { data: contracts, refetch: refetchQiwa } = trpc.saudiCompliance.qiwaContractList.useQuery();
  const { data: nitaqat, refetch: refetchNitaqat } = trpc.saudiCompliance.nitaqatStatus.useQuery();
  const { data: expiring } = trpc.saudiCompliance.iqamaExpiring.useQuery({ withinDays: 30 });
  const { data: expired } = trpc.saudiCompliance.iqamaExpired.useQuery();
  const createSnapshot = trpc.saudiCompliance.nitaqatSnapshotCreate.useMutation({ onSuccess: () => refetchNitaqat() });
  const syncQiwa = trpc.saudiCompliance.qiwaSyncContract.useMutation();
  const iqamaUpsert = trpc.saudiCompliance.iqamaUpsert.useMutation({ onSuccess: () => refetchIqama() });

  const [whatIf, setWhatIf] = useState({ hireSaudi: 0, hireExpat: 0, fireSaudi: 0, fireExpat: 0 });
  const { data: whatIfResult } = trpc.saudiCompliance.nitaqatWhatIf.useQuery(whatIf);

  const [qiwaForm, setQiwaForm] = useState({ employeeId: 0, basicSalary: 0, housingAllowance: 0, transportAllowance: 0, otherAllowances: 0 });
  const [iqamaForm, setIqamaForm] = useState({ employeeId: 0, iqamaNumber: "", passportNumber: "", expiryDate: "", profession: "" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-600" /> Saudi Compliance Dashboard
          </h2>
          <p className="text-slate-500">Qiwa · Muqeem · Nitaqat · Unified compliance monitoring</p>
        </div>
        <div className="flex gap-2">
          {expired && expired.length > 0 && (
            <Badge variant="destructive" className="text-sm px-4 py-2">
              <AlertTriangle className="w-4 h-4 mr-2" /> {expired.length} Expired Iqamas
            </Badge>
          )}
          {nitaqat && (
            <Badge className={`text-sm px-4 py-2 ${CATEGORY_COLORS[nitaqat.category]}`}>
              <BarChart3 className="w-4 h-4 mr-2" /> Nitaqat: {nitaqat.category.toUpperCase()}
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="nitaqat">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="nitaqat"><BarChart3 className="w-4 h-4 mr-2" />Nitaqat</TabsTrigger>
          <TabsTrigger value="muqeem"><IdCard className="w-4 h-4 mr-2" />Muqeem (Iqama)</TabsTrigger>
          <TabsTrigger value="qiwa"><FileText className="w-4 h-4 mr-2" />Qiwa Contracts</TabsTrigger>
        </TabsList>

        <TabsContent value="nitaqat" className="space-y-4 mt-6">
          {nitaqat && (
            <div className="grid grid-cols-4 gap-4">
              <Card className="border-l-4 border-blue-500"><CardContent className="p-4"><p className="text-sm text-slate-500">Total Employees</p><p className="text-2xl font-bold">{nitaqat.totalEmployees}</p></CardContent></Card>
              <Card className="border-l-4 border-emerald-500"><CardContent className="p-4"><p className="text-sm text-slate-500">Saudi Nationals</p><p className="text-2xl font-bold text-emerald-600">{nitaqat.totalSaudis}</p></CardContent></Card>
              <Card className="border-l-4 border-orange-500"><CardContent className="p-4"><p className="text-sm text-slate-500">Expatriates</p><p className="text-2xl font-bold text-orange-600">{nitaqat.totalExpats}</p></CardContent></Card>
              <Card className={`border-l-4 ${CATEGORY_COLORS[nitaqat.category].split(" ")[0]}`}>
                <CardContent className="p-4">
                  <p className="text-sm text-slate-500">Saudization Ratio</p>
                  <p className="text-2xl font-bold">{(nitaqat.saudiRatio * 100).toFixed(1)}%</p>
                  <Badge className={CATEGORY_COLORS[nitaqat.category]}>{nitaqat.category}</Badge>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>What-If Analysis</CardTitle>
              <Button size="sm" variant="outline" onClick={() => createSnapshot.mutate()}><RefreshCw className="w-4 h-4 mr-2" /> Take Snapshot</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div><Label>Hire Saudi</Label><Input type="number" value={whatIf.hireSaudi} onChange={e => setWhatIf({...whatIf, hireSaudi: Number(e.target.value)})} /></div>
                <div><Label>Hire Expat</Label><Input type="number" value={whatIf.hireExpat} onChange={e => setWhatIf({...whatIf, hireExpat: Number(e.target.value)})} /></div>
                <div><Label>Terminate Saudi</Label><Input type="number" value={whatIf.fireSaudi} onChange={e => setWhatIf({...whatIf, fireSaudi: Number(e.target.value)})} /></div>
                <div><Label>Terminate Expat</Label><Input type="number" value={whatIf.fireExpat} onChange={e => setWhatIf({...whatIf, fireExpat: Number(e.target.value)})} /></div>
              </div>
              {whatIfResult && (
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-slate-50"><CardContent className="p-3">
                    <p className="text-xs font-semibold">Current: {(whatIfResult.current.saudiRatio * 100).toFixed(1)}% ({whatIfResult.current.category})</p>
                    <p className="text-xs text-slate-500">{whatIfResult.current.totalSaudis} Saudi / {whatIfResult.current.totalExpats} Expat</p>
                  </CardContent></Card>
                  <Card className="bg-blue-50"><CardContent className="p-3">
                    <p className="text-xs font-semibold">Projected: {(whatIfResult.projected.saudiRatio * 100).toFixed(1)}% ({whatIfResult.projected.category})</p>
                    <p className="text-xs text-slate-500">{whatIfResult.projected.totalSaudis} Saudi / {whatIfResult.projected.totalExpats} Expat</p>
                    {whatIfResult.shortfall > 0 && <p className="text-xs text-red-500 mt-1">Shortfall to Green: {(whatIfResult.shortfall * 100).toFixed(1)}%</p>}
                  </CardContent></Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="muqeem" className="space-y-4 mt-6">
          {(expiring && expiring.length > 0) || (expired && expired.length > 0) ? (
            <div className="flex gap-2">
              {expired && expired.length > 0 && (
                <Card className="border-red-300 bg-red-50 flex-1"><CardContent className="p-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="font-bold text-red-700">{expired.length} Expired Iqamas – action required</span>
                </CardContent></Card>
              )}
              {expiring && expiring.length > 0 && (
                <Card className="border-amber-300 bg-amber-50 flex-1"><CardContent className="p-3 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-amber-600" />
                  <span className="font-bold text-amber-700">{expiring.length} Iqamas expiring within 30 days</span>
                </CardContent></Card>
              )}
            </div>
          ) : null}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Iqama Records</CardTitle>
              <div className="flex gap-2">
                <Select onValueChange={v => {
                  const emp = employees?.find(e => e.id === Number(v));
                  if (emp) setIqamaForm({...iqamaForm, employeeId: emp.id});
                }}>
                  <SelectTrigger className="w-48"><SelectValue placeholder="Add iqama for..." /></SelectTrigger>
                  <SelectContent>{employees?.filter(e => e.nationality !== "saudi" && e.nationality !== "Saudi").map(e =>
                    <SelectItem key={e.id} value={e.id.toString()}>{e.firstName} {e.lastName}</SelectItem>
                  )}</SelectContent>
                </Select>
                <Button size="sm" onClick={() => iqamaUpsert.mutate(iqamaForm)}><IdCard className="w-4 h-4 mr-2" /> Save</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead><TableHead>Iqama #</TableHead><TableHead>Passport</TableHead>
                    <TableHead>Expiry</TableHead><TableHead>Status</TableHead><TableHead>Profession</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {iqamas?.map((row: any) => (
                    <TableRow key={row.record.id}>
                      <TableCell className="font-medium">{row.employeeName}</TableCell>
                      <TableCell className="font-mono text-xs">{row.record.iqamaNumber}</TableCell>
                      <TableCell className="font-mono text-xs">{row.record.passportNumber || "-"}</TableCell>
                      <TableCell className="text-xs">{new Date(row.record.expiryDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={row.record.status === "active" ? "default" : "destructive"}>
                          {row.record.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{row.record.profession || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Passport Number Validation</Label>
              <Input placeholder="Enter passport number" onChange={e => {
                const v = e.target.value;
                const valid = /^[A-Za-z0-9]{6,20}$/.test(v);
                e.target.className = valid ? "border-emerald-500" : v.length > 0 ? "border-red-500" : "";
              }} />
            </div>
            <div>
              <Label>Iqama Number Validation</Label>
              <Input placeholder="Enter 10-digit iqama" onChange={e => {
                const v = e.target.value.replace(/\s/g, "");
                const valid = /^\d{10}$/.test(v);
                e.target.className = valid ? "border-emerald-500" : v.length > 0 ? "border-red-500" : "";
              }} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="qiwa" className="space-y-4 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Qiwa Contract Mirroring</CardTitle>
              <div className="flex gap-2">
                <Select onValueChange={v => {
                  const emp = employees?.find(e => e.id === Number(v));
                  if (emp) setQiwaForm({...qiwaForm, employeeId: emp.id, basicSalary: Number(emp.basicSalary), housingAllowance: Number(emp.housingAllowance), transportAllowance: Number(emp.transportAllowance), otherAllowances: Number(emp.otherAllowance)});
                }}>
                  <SelectTrigger className="w-48"><SelectValue placeholder="Select employee" /></SelectTrigger>
                  <SelectContent>{employees?.map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent>
                </Select>
                <Button size="sm" onClick={() => syncQiwa.mutate(qiwaForm)}><RefreshCw className="w-4 h-4 mr-2" /> Sync with Qiwa</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div><Label>Basic Salary</Label><Input type="number" value={qiwaForm.basicSalary} onChange={e => setQiwaForm({...qiwaForm, basicSalary: Number(e.target.value)})} /></div>
                <div><Label>Housing</Label><Input type="number" value={qiwaForm.housingAllowance} onChange={e => setQiwaForm({...qiwaForm, housingAllowance: Number(e.target.value)})} /></div>
                <div><Label>Transport</Label><Input type="number" value={qiwaForm.transportAllowance} onChange={e => setQiwaForm({...qiwaForm, transportAllowance: Number(e.target.value)})} /></div>
                <div><Label>Other</Label><Input type="number" value={qiwaForm.otherAllowances} onChange={e => setQiwaForm({...qiwaForm, otherAllowances: Number(e.target.value)})} /></div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead><TableHead className="text-right">Basic</TableHead>
                    <TableHead className="text-right">Housing</TableHead><TableHead className="text-right">Transport</TableHead>
                    <TableHead className="text-right">Total</TableHead><TableHead>Matched</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts?.map((row: any) => (
                    <TableRow key={row.contract.id}>
                      <TableCell className="font-medium">{row.employeeName}</TableCell>
                      <TableCell className="text-right">{formatSAR(Number(row.contract.basicSalary))}</TableCell>
                      <TableCell className="text-right">{formatSAR(Number(row.contract.housingAllowance))}</TableCell>
                      <TableCell className="text-right">{formatSAR(Number(row.contract.transportAllowance))}</TableCell>
                      <TableCell className="text-right font-bold">{formatSAR(Number(row.contract.totalSalary))}</TableCell>
                      <TableCell>
                        {row.contract.isMatched ? (
                          <Badge className="bg-emerald-100 text-emerald-700"><CheckCircle2 className="w-3 h-3 mr-1" /> Matched</Badge>
                        ) : (
                          <Badge variant="destructive"><Ban className="w-3 h-3 mr-1" /> Mismatch</Badge>
                        )}
                      </TableCell>
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
