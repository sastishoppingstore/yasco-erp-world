import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/providers/trpc";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Gauge, ShieldCheck, XCircle } from "lucide-react";
import { Link } from "react-router";

const statusStyle = {
  complete: "border-emerald-200 bg-emerald-50 text-emerald-700",
  partial: "border-amber-200 bg-amber-50 text-amber-700",
  missing: "border-red-200 bg-red-50 text-red-700",
};

const statusIcon = {
  complete: CheckCircle2,
  partial: AlertTriangle,
  missing: XCircle,
};

function StatusBadge({ status }: { status: "complete" | "partial" | "missing" }) {
  const Icon = statusIcon[status];
  return (
    <Badge variant="outline" className={cn("gap-1 capitalize", statusStyle[status])}>
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
}

export default function MasterControlPage() {
  const coverage = trpc.master.competitionCoverage.useQuery();
  const saudi = trpc.master.saudiReadiness.useQuery();
  const snapshot = trpc.master.systemSnapshot.useQuery();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Master Control</h2>
          <p className="text-slate-500">Zoho/Odoo gap control, Saudi readiness, tenant health and audit traceability.</p>
        </div>
        <Button asChild>
          <Link to="/app/settings">Open Company Settings</Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm"><Gauge className="h-4 w-4" /> Competitor Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{coverage.data?.score ?? 0}%</div>
            <Progress value={coverage.data?.score ?? 0} className="mt-3" />
            <p className="mt-2 text-xs text-slate-500">
              Complete {coverage.data?.summary.complete ?? 0}, partial {coverage.data?.summary.partial ?? 0}, missing {coverage.data?.summary.missing ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm"><ShieldCheck className="h-4 w-4" /> Saudi Market Readiness</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{saudi.data?.score ?? 0}%</div>
            <Progress value={saudi.data?.score ?? 0} className="mt-3" />
            <p className="mt-2 text-xs text-slate-500">
              {saudi.data?.blockers.length ?? 0} blockers, {saudi.data?.invoiceCount ?? 0} ZATCA invoices created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tenant Data Footprint</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-2 text-center text-xs">
            {Object.entries(snapshot.data?.counts ?? {}).slice(0, 9).map(([key, value]) => (
              <div key={key} className="rounded border bg-slate-50 p-2">
                <div className="text-lg font-bold">{String(value)}</div>
                <div className="capitalize text-slate-500">{key.replace(/([A-Z])/g, " $1")}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Saudi Launch Blockers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {saudi.data?.checks.map((check) => (
              <div key={check.key} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">{check.label}</div>
                  <StatusBadge status={check.status} />
                </div>
                <p className="mt-1 text-sm text-slate-500">{check.detail}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zoho/Odoo Gap Matrix</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Capability</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Engineering Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coverage.data?.items.map((item) => (
                <TableRow key={item.key}>
                  <TableCell className="font-medium">
                    {item.route ? <Link className="text-emerald-700 hover:underline" to={item.route}>{item.name}</Link> : item.name}
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell><StatusBadge status={item.status} /></TableCell>
                  <TableCell className="capitalize">{item.priority}</TableCell>
                  <TableCell className="max-w-xl text-sm text-slate-600">{item.note}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Audit Trail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {snapshot.data?.recentAudit.length ? snapshot.data.recentAudit.map((log) => (
            <div key={log.id} className="flex items-center justify-between rounded border bg-slate-50 px-3 py-2 text-sm">
              <div>
                <span className="font-medium">{log.action}</span>
                <span className="ml-2 text-slate-500">{log.entityType} #{log.entityId ?? "-"}</span>
              </div>
              <span className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString()}</span>
            </div>
          )) : <p className="text-sm text-slate-500">No audit logs yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
