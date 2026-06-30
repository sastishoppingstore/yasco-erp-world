import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DollarSign } from "lucide-react";

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700", submitted: "bg-blue-100 text-blue-700",
  approved: "bg-emerald-100 text-emerald-700", paid: "bg-purple-100 text-purple-700",
  partial: "bg-amber-100 text-amber-700", disputed: "bg-red-100 text-red-700",
};

export default function ProgressBillingPage() {
  const [projectFilter, setProjectFilter] = useState("");
  const { data: billing } = trpc.construction.progressBillingList.useQuery(undefined);
  const { data: retentions } = trpc.construction.retentionList.useQuery(undefined);

  const filtered = billing?.filter(b => !projectFilter || String(b.projectId) === projectFilter) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Progress Billing</h2><p className="text-slate-500">Milestone-based billing and retention tracking</p></div>
        <Input type="number" placeholder="Project ID" className="w-40" value={projectFilter} onChange={e => setProjectFilter(e.target.value)} />
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Billing Invoices</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Invoice #</TableHead><TableHead>Milestone</TableHead><TableHead>Period</TableHead><TableHead className="text-center">% Complete</TableHead><TableHead className="text-right">Billed</TableHead><TableHead className="text-right">Paid</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map(b => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-sm"><div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-slate-400" />{b.invoiceNumber}</div></TableCell>
                  <TableCell>{b.milestoneName || "—"}</TableCell>
                  <TableCell className="text-sm">{b.billingPeriod || "—"}</TableCell>
                  <TableCell className="text-center">{b.percentageComplete}%</TableCell>
                  <TableCell className="text-right font-mono">{Number(b.billedAmount).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{Number(b.paidAmount).toLocaleString()}</TableCell>
                  <TableCell><Badge className={statusColors[b.status]}>{b.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Retention Accounts</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Project</TableHead><TableHead>Subcontractor</TableHead><TableHead className="text-right">Total Retention</TableHead><TableHead className="text-right">Released</TableHead><TableHead className="text-right">Remaining</TableHead><TableHead>Release Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {retentions?.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{r.projectId}</TableCell>
                  <TableCell>{r.subcontractorId || "—"}</TableCell>
                  <TableCell className="text-right font-mono">{Number(r.totalRetention).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{Number(r.releasedAmount).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{Number(r.remainingAmount).toLocaleString()}</TableCell>
                  <TableCell>{r.expectedReleaseDate || "—"}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{r.status.replace("_", " ")}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
