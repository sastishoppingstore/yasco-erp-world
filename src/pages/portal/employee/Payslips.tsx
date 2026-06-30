import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye } from "lucide-react";

export default function EmployeePayslips() {
  const [slips, setSlips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewSlip, setViewSlip] = useState<any>(null);
  const token = localStorage.getItem("portal_token_employee");

  useEffect(() => {
    if (!token) return;
    fetch("/api/trpc/portalEmployee.payslipList", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).then(r => r.json()).then(j => setSlips(j.result?.data || [])).finally(() => setLoading(false));
  }, [token]);

  const handleView = async (id: number) => {
    const res = await fetch("/api/trpc/portalEmployee.payslipGet", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, id }),
    });
    const json = await res.json();
    setViewSlip(json.result?.data || null);
  };

  if (loading) return <div className="flex justify-center py-20 text-slate-400">Loading payslips...</div>;

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Payslips</h2><p className="text-slate-500">View and download your salary slips</p></div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Period</TableHead><TableHead className="text-right">Basic</TableHead><TableHead className="text-right">Allowances</TableHead><TableHead className="text-right">Deductions</TableHead><TableHead className="text-right">Net Salary</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {slips.map((slip: any) => (
                <TableRow key={slip.id}>
                  <TableCell className="text-sm font-medium">{slip.period?.name || `Period #${slip.payrollPeriodId}`}</TableCell>
                  <TableCell className="text-right font-mono">{Number(slip.basicSalary).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{Number(slip.housingAllowance || 0) + Number(slip.transportAllowance || 0) + Number(slip.otherAllowances || 0)}</TableCell>
                  <TableCell className="text-right font-mono text-red-600">{Number(slip.totalDeductions).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono font-bold text-emerald-600">{Number(slip.netSalary).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={slip.status === "paid" ? "default" : slip.status === "approved" ? "secondary" : "outline"}>
                      {slip.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleView(slip.id)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {slips.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-slate-400 py-8">No payslips found</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!viewSlip} onOpenChange={next => !next && setViewSlip(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Payslip Details</DialogTitle></DialogHeader>
          {viewSlip?.slip && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm p-4 rounded-lg bg-slate-50">
                <div><span className="text-slate-500">Employee:</span> <span className="font-medium">{viewSlip.employee?.firstName} {viewSlip.employee?.lastName}</span></div>
                <div><span className="text-slate-500">Period:</span> <span className="font-medium">{viewSlip.period?.name || `Period #${viewSlip.slip.payrollPeriodId}`}</span></div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span>Basic Salary</span><span className="font-mono">{Number(viewSlip.slip.basicSalary).toLocaleString()} SAR</span></div>
                {viewSlip.slip.housingAllowance && Number(viewSlip.slip.housingAllowance) > 0 && (
                  <div className="flex justify-between text-sm"><span>Housing Allowance</span><span className="font-mono">{Number(viewSlip.slip.housingAllowance).toLocaleString()} SAR</span></div>
                )}
                {viewSlip.slip.transportAllowance && Number(viewSlip.slip.transportAllowance) > 0 && (
                  <div className="flex justify-between text-sm"><span>Transport Allowance</span><span className="font-mono">{Number(viewSlip.slip.transportAllowance).toLocaleString()} SAR</span></div>
                )}
                {viewSlip.slip.otherAllowances && Number(viewSlip.slip.otherAllowances) > 0 && (
                  <div className="flex justify-between text-sm"><span>Other Allowances</span><span className="font-mono">{Number(viewSlip.slip.otherAllowances).toLocaleString()} SAR</span></div>
                )}
                {viewSlip.slip.overtimePay && Number(viewSlip.slip.overtimePay) > 0 && (
                  <div className="flex justify-between text-sm"><span>Overtime Pay</span><span className="font-mono">{Number(viewSlip.slip.overtimePay).toLocaleString()} SAR</span></div>
                )}
                <div className="flex justify-between text-sm font-medium border-t pt-1"><span>Gross Salary</span><span className="font-mono">{Number(viewSlip.slip.grossSalary).toLocaleString()} SAR</span></div>
                {viewSlip.slip.taxDeduction && Number(viewSlip.slip.taxDeduction) > 0 && (
                  <div className="flex justify-between text-sm text-red-600"><span>Tax Deduction</span><span className="font-mono">-{Number(viewSlip.slip.taxDeduction).toLocaleString()} SAR</span></div>
                )}
                {viewSlip.slip.socialInsurance && Number(viewSlip.slip.socialInsurance) > 0 && (
                  <div className="flex justify-between text-sm text-red-600"><span>Social Insurance</span><span className="font-mono">-{Number(viewSlip.slip.socialInsurance).toLocaleString()} SAR</span></div>
                )}
                {viewSlip.slip.loanDeduction && Number(viewSlip.slip.loanDeduction) > 0 && (
                  <div className="flex justify-between text-sm text-red-600"><span>Loan Deduction</span><span className="font-mono">-{Number(viewSlip.slip.loanDeduction).toLocaleString()} SAR</span></div>
                )}
                <div className="flex justify-between text-sm font-bold border-t pt-1 text-emerald-600"><span>Net Salary</span><span className="font-mono">{Number(viewSlip.slip.netSalary).toLocaleString()} SAR</span></div>
              </div>
              <div className="flex justify-end">
                <Button size="sm"><Download className="mr-2 h-4 w-4" />Download PDF</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
