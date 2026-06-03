import { AlertCircle, CheckCircle2, Clock, FileWarning } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/providers/trpc";

const statusColor: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "secondary",
  signed: "outline",
  pending: "secondary",
  submitted: "outline",
  cleared: "default",
  reported: "default",
  rejected: "destructive",
  failed: "destructive",
};

export default function ZatcaStatusReportPage() {
  const { data } = trpc.zatca.statusReport.useQuery();
  const { data: dashboard } = trpc.zatca.dashboard.useQuery();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">ZATCA Status</h2>
        <p className="text-slate-500">Track Saudi FATOORA Phase 2 invoice XML, QR, clearance/reporting and error logs.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="flex items-center gap-3 p-4"><Clock className="h-5 w-5 text-slate-500" /><div><p className="text-sm text-slate-500">Pending</p><p className="text-2xl font-bold">{dashboard?.pendingInvoices ?? 0}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><CheckCircle2 className="h-5 w-5 text-emerald-600" /><div><p className="text-sm text-slate-500">Cleared</p><p className="text-2xl font-bold">{dashboard?.clearedInvoices ?? 0}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><AlertCircle className="h-5 w-5 text-red-600" /><div><p className="text-sm text-slate-500">Failed</p><p className="text-2xl font-bold">{dashboard?.failedInvoices ?? 0}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><FileWarning className="h-5 w-5 text-amber-600" /><div><p className="text-sm text-slate-500">VAT Summary</p><p className="text-2xl font-bold">SAR {dashboard?.vatSummary ?? 0}</p></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Invoice Status Tracking</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>UUID</TableHead>
                <TableHead>Counter</TableHead>
                <TableHead>Hash</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.invoiceId}</TableCell>
                  <TableCell className="max-w-[220px] truncate font-mono text-xs">{row.invoiceUuid}</TableCell>
                  <TableCell>{row.invoiceCounter}</TableCell>
                  <TableCell className="max-w-[220px] truncate font-mono text-xs">{row.invoiceHash}</TableCell>
                  <TableCell><Badge variant={statusColor[row.status] || "secondary"}>{row.status}</Badge></TableCell>
                  <TableCell className="max-w-[260px] truncate text-xs text-red-600">{row.errorMessage || row.errorCode || "-"}</TableCell>
                </TableRow>
              ))}
              {!data?.rows.length && (
                <TableRow><TableCell colSpan={6} className="py-8 text-center text-slate-500">No ZATCA invoice status records yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>API & Activity Logs</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.invoiceId || "-"}</TableCell>
                  <TableCell>{log.environment}</TableCell>
                  <TableCell><Badge variant={log.status === "failed" ? "destructive" : log.status === "success" ? "default" : "secondary"}>{log.status}</Badge></TableCell>
                  <TableCell className="max-w-[360px] truncate text-xs text-red-600">{log.errorMessage || "-"}</TableCell>
                </TableRow>
              ))}
              {!data?.logs.length && (
                <TableRow><TableCell colSpan={5} className="py-8 text-center text-slate-500">No ZATCA API logs yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
