import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { Search, Users, Download } from "lucide-react";

export default function SubcontractorPaymentList() {
  const [search, setSearch] = useState("");
  const { data: subs, isLoading } = trpc.construction.subcontractorList.useQuery(undefined);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div><Skeleton className="h-8 w-56" /><Skeleton className="h-4 w-72 mt-1" /></div>
        <Card><CardContent className="p-6"><div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div></CardContent></Card>
      </div>
    );
  }

  const filtered = subs?.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.trade?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">Subcontractor Payments</h2>
          <p className="text-muted-foreground">Manage payments to subcontractors</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />Export
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search subcontractors..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mb-3 opacity-50" />
              <p className="font-medium">No subcontractors found</p>
              <p className="text-sm">{search ? "Try a different search term" : "Add subcontractors to track payments"}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subcontractor</TableHead>
                  <TableHead>Trade</TableHead>
                  <TableHead>Contract Amount</TableHead>
                  <TableHead className="text-right">Paid Amount</TableHead>
                  <TableHead className="text-right">Retention</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(s => {
                  const contractAmount = Number(s.contractAmount);
                  const paidAmount = Number(s.paidAmount);
                  const retentionPercent = Number(s.retentionPercent);
                  const retentionAmount = contractAmount * retentionPercent / 100;
                  const balance = contractAmount - paidAmount - retentionAmount;
                  return (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{s.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{s.trade || "—"}</TableCell>
                      <TableCell className="font-mono">{contractAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{paidAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{retentionAmount.toLocaleString()} ({retentionPercent}%)</TableCell>
                      <TableCell className="text-right font-mono">{balance.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={balance <= 0 ? "default" : "secondary"}>
                          {balance <= 0 ? "Settled" : "Outstanding"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
