import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Banknote, Calculator } from "lucide-react";

export default function PayrollPage() {
  const { data: periods } = trpc.hrm.payrollPeriodList.useQuery();
  const { data: salarySlips, refetch } = trpc.hrm.salarySlipList.useQuery();
  const { data: employees } = trpc.hrm.employeeList.useQuery();
  const createPeriod = trpc.hrm.payrollPeriodCreate.useMutation({ onSuccess: () => refetch() });
  const createSlip = trpc.hrm.salarySlipCreate.useMutation({ onSuccess: () => refetch() });
  const [openPeriod, setOpenPeriod] = useState(false);
  const [openSlip, setOpenSlip] = useState(false);
  const [periodFilter, setPeriodFilter] = useState("");
  const [periodForm, setPeriodForm] = useState({ name: "", startDate: "", endDate: "", month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [slipForm, setSlipForm] = useState({
    payrollPeriodId: 0, employeeId: 0, basicSalary: "0", housingAllowance: "0",
    transportAllowance: "0", otherAllowances: "0", overtimePay: "0",
    grossSalary: "0", taxDeduction: "0", socialInsurance: "0",
    loanDeduction: "0", advanceDeduction: "0", otherDeductions: "0",
    totalDeductions: "0", netSalary: "0",
  });

  const filteredSlips = salarySlips?.filter(s => !periodFilter || s.payrollPeriodId === Number(periodFilter)) || [];
  const totalGross = filteredSlips.reduce((s, slip) => s + Number(slip.grossSalary), 0);
  const totalNet = filteredSlips.reduce((s, slip) => s + Number(slip.netSalary), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Payroll</h2><p className="text-slate-500">Salary processing and payslip generation</p></div>
        <div className="flex gap-2">
          <Dialog open={openPeriod} onOpenChange={setOpenPeriod}>
            <DialogTrigger asChild><Button variant="outline"><Plus className="w-4 h-4 mr-2" />New Period</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Payroll Period</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createPeriod.mutate(periodForm); setOpenPeriod(false); }} className="space-y-3">
                <div><Label>Period Name</Label><Input value={periodForm.name} onChange={e => setPeriodForm({...periodForm, name: e.target.value})} required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Start Date</Label><Input type="date" value={periodForm.startDate} onChange={e => setPeriodForm({...periodForm, startDate: e.target.value})} required /></div>
                  <div><Label>End Date</Label><Input type="date" value={periodForm.endDate} onChange={e => setPeriodForm({...periodForm, endDate: e.target.value})} required /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Month</Label><Input type="number" value={periodForm.month} onChange={e => setPeriodForm({...periodForm, month: Number(e.target.value)})} required /></div>
                  <div><Label>Year</Label><Input type="number" value={periodForm.year} onChange={e => setPeriodForm({...periodForm, year: Number(e.target.value)})} required /></div>
                </div>
                <Button type="submit" className="w-full">Create Period</Button>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={openSlip} onOpenChange={setOpenSlip}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Salary Slip</Button></DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Create Salary Slip</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createSlip.mutate(slipForm); setOpenSlip(false); }} className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Payroll Period</Label>
                    <Select onValueChange={v => setSlipForm({...slipForm, payrollPeriodId: Number(v)})}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{periods?.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Employee</Label>
                    <Select onValueChange={v => setSlipForm({...slipForm, employeeId: Number(v)})}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{employees?.map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Basic Salary</Label><Input type="number" value={slipForm.basicSalary} onChange={e => setSlipForm({...slipForm, basicSalary: e.target.value})} /></div>
                  <div><Label>Housing</Label><Input type="number" value={slipForm.housingAllowance} onChange={e => setSlipForm({...slipForm, housingAllowance: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Transport</Label><Input type="number" value={slipForm.transportAllowance} onChange={e => setSlipForm({...slipForm, transportAllowance: e.target.value})} /></div>
                  <div><Label>Overtime</Label><Input type="number" value={slipForm.overtimePay} onChange={e => setSlipForm({...slipForm, overtimePay: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Tax Deduction</Label><Input type="number" value={slipForm.taxDeduction} onChange={e => setSlipForm({...slipForm, taxDeduction: e.target.value})} /></div>
                  <div><Label>Social Insurance</Label><Input type="number" value={slipForm.socialInsurance} onChange={e => setSlipForm({...slipForm, socialInsurance: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Loan Deduction</Label><Input type="number" value={slipForm.loanDeduction} onChange={e => setSlipForm({...slipForm, loanDeduction: e.target.value})} /></div>
                  <div><Label>Advance Deduction</Label><Input type="number" value={slipForm.advanceDeduction} onChange={e => setSlipForm({...slipForm, advanceDeduction: e.target.value})} /></div>
                </div>
                <Button type="submit" className="w-full">Create Salary Slip</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><Banknote className="w-5 h-5 text-blue-600" /></div><div><p className="text-sm text-slate-500">Periods</p><p className="text-xl font-bold">{periods?.length || 0}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-emerald-100 rounded-lg"><Calculator className="w-5 h-5 text-emerald-600" /></div><div><p className="text-sm text-slate-500">Salary Slips</p><p className="text-xl font-bold">{filteredSlips.length}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-purple-100 rounded-lg"><Banknote className="w-5 h-5 text-purple-600" /></div><div><p className="text-sm text-slate-500">Gross Total</p><p className="text-xl font-bold">{totalGross.toLocaleString()} SAR</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-amber-100 rounded-lg"><Banknote className="w-5 h-5 text-amber-600" /></div><div><p className="text-sm text-slate-500">Net Total</p><p className="text-xl font-bold">{totalNet.toLocaleString()} SAR</p></div></CardContent></Card>
      </div>

      <div className="flex items-center gap-4">
        <Select value={periodFilter || "all"} onValueChange={v => setPeriodFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-56"><SelectValue placeholder="All Periods" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Periods</SelectItem>
            {periods?.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Gross</TableHead>
                <TableHead className="text-right">Deductions</TableHead>
                <TableHead className="text-right">Net Salary</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSlips.map(slip => (
                <TableRow key={slip.id}>
                  <TableCell>
                    <div className="font-medium text-sm">{employees?.find(e => e.id === slip.employeeId)?.firstName} {employees?.find(e => e.id === slip.employeeId)?.lastName || `Emp #${slip.employeeId}`}</div>
                  </TableCell>
                  <TableCell className="text-sm">{periods?.find(p => p.id === slip.payrollPeriodId)?.name || `Period #${slip.payrollPeriodId}`}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{Number(slip.grossSalary).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono text-red-600">{Number(slip.totalDeductions).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono font-bold text-emerald-600">{Number(slip.netSalary).toLocaleString()}</TableCell>
                  <TableCell><span className={`text-xs px-2 py-1 rounded-full ${slip.status === "paid" ? "bg-emerald-100 text-emerald-700" : slip.status === "approved" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"}`}>{slip.status}</span></TableCell>
                </TableRow>
              ))}
              {filteredSlips.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-slate-400 py-8">No salary slips found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
