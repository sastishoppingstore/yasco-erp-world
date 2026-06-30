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
import { Plus, Wrench } from "lucide-react";

const statusColors: Record<string, string> = {
  reported: "bg-slate-100 text-slate-700", assigned: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700", resolved: "bg-emerald-100 text-emerald-700",
  closed: "bg-green-100 text-green-700", cancelled: "bg-red-100 text-red-700",
};

export default function MaintenancePage() {
  const { data: requests, refetch } = trpc.realEstate.maintenanceRequestList.useQuery(undefined);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Maintenance Requests</h2><p className="text-slate-500">Property maintenance tracking</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Report Issue</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Maintenance Request</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); setOpen(false); refetch(); }} className="space-y-3">
              <div><Label>Unit ID</Label><Input type="number" required /></div>
              <div><Label>Category</Label><Input placeholder="e.g. Plumbing, Electrical" /></div>
              <div><Label>Description</Label><Input required /></div>
              <div><Label>Priority</Label><Select><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent></Select></div>
              <Button type="submit" className="w-full">Submit Request</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Requests</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Unit</TableHead><TableHead>Category</TableHead><TableHead>Description</TableHead><TableHead>Priority</TableHead><TableHead className="text-right">Est. Cost</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {requests?.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-sm">{r.requestNumber}</TableCell>
                  <TableCell>{r.unitId}</TableCell>
                  <TableCell>{r.category || "—"}</TableCell>
                  <TableCell className="text-sm max-w-xs truncate">{r.description}</TableCell>
                  <TableCell><Badge variant={r.priority === "urgent" ? "destructive" : r.priority === "high" ? "default" : "secondary"} className="capitalize">{r.priority}</Badge></TableCell>
                  <TableCell className="text-right font-mono">{Number(r.estimatedCost).toLocaleString()}</TableCell>
                  <TableCell><Badge className={statusColors[r.status]}>{r.status.replace("_", " ")}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
