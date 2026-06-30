import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Sparkles } from "lucide-react";

const taskColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700", in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700", skipped: "bg-slate-100 text-slate-700", issue_reported: "bg-red-100 text-red-700",
};

export default function HousekeepingPage() {
  const { data: tasks, refetch } = trpc.hotel.housekeepingList.useQuery({ date: new Date().toISOString().split("T")[0] });
  const [open, setOpen] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);
  const { data: filtered } = trpc.hotel.housekeepingList.useQuery({ date: filterDate || undefined });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Housekeeping</h2><p className="text-slate-500">Room cleaning and maintenance schedule</p></div>
        <div className="flex gap-2">
          <Input type="date" className="w-40" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          <Button variant="outline" onClick={() => refetch()}><Sparkles className="w-4 h-4 mr-2" />Refresh</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Schedule for {filterDate}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Room</TableHead><TableHead>Task Type</TableHead><TableHead>Assigned To</TableHead><TableHead>Status</TableHead><TableHead>Notes</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered?.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono">{t.roomId}</TableCell>
                  <TableCell className="capitalize"><div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-slate-400" />{t.taskType.replace("_", " ")}</div></TableCell>
                  <TableCell>{t.assignedTo || "—"}</TableCell>
                  <TableCell><Badge className={taskColors[t.status]}>{t.status.replace("_", " ")}</Badge></TableCell>
                  <TableCell className="text-sm text-slate-600 max-w-xs truncate">{t.notes || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
