import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Percent } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700", approved: "bg-blue-100 text-blue-700",
  paid: "bg-emerald-100 text-emerald-700", cancelled: "bg-slate-100 text-slate-700",
};

export default function CommissionsPage() {
  const { data: commissions, refetch } = trpc.realEstate.commissionList.useQuery(undefined);

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Commissions</h2><p className="text-slate-500">Agent commission tracking</p></div>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Commission Records</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Agent</TableHead><TableHead>Type</TableHead><TableHead>Lease</TableHead><TableHead className="text-right">Percent</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="text-right">Paid</TableHead><TableHead>Due Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {commissions?.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium"><div className="flex items-center gap-2"><Percent className="w-4 h-4 text-slate-400" />{c.agentName}</div></TableCell>
                  <TableCell className="capitalize">{c.commissionType}</TableCell>
                  <TableCell>{c.leaseId || "—"}</TableCell>
                  <TableCell className="text-right">{c.commissionPercent}%</TableCell>
                  <TableCell className="text-right font-mono">{Number(c.commissionAmount).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{Number(c.paidAmount).toLocaleString()}</TableCell>
                  <TableCell>{c.dueDate || "—"}</TableCell>
                  <TableCell><Badge className={statusColors[c.status]}>{c.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
