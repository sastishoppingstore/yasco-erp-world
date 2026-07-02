import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Camera, Signature, ArrowLeft, FileText } from "lucide-react";
import ActionButton3D from "@/components/ui/ActionButton3D";

export default function InspectionsPage() {
  const navigate = useNavigate();
  const { data: inspections, refetch } = trpc.workshop.inspectionList.useQuery(undefined);
  const createInspection = trpc.workshop.inspectionCreate.useMutation({ onSuccess: () => { refetch(); setOpen(false); } });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ jobCardId: "", checklistJson: "", photos: "", notes: "" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Inspections</h2>
          <p className="text-slate-500">Vehicle inspection checklists</p>
        </div>
        <div className="flex gap-2">
          <ActionButton3D icon={<ArrowLeft className="size-4" />} label="Dashboard" color="slate" onClick={() => navigate("/app/verticals/workshop")} />
          <ActionButton3D icon={<Plus className="size-4" />} label="New Inspection" color="blue" onClick={() => setOpen(true)} />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Job Card</TableHead>
                <TableHead>Checklist Items</TableHead>
                <TableHead>Photos</TableHead>
                <TableHead>Signature</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inspections?.map(insp => (
                <TableRow key={insp.id}>
                  <TableCell className="font-mono">#{insp.id}</TableCell>
                  <TableCell>{insp.jobCardId}</TableCell>
                  <TableCell>
                    {insp.checklistJson ? (
                      <Badge variant="outline" className="text-xs">{JSON.parse(insp.checklistJson)?.length || 0} items</Badge>
                    ) : "—"}
                  </TableCell>
                  <TableCell>{insp.photos ? <Badge variant="outline" className="text-xs"><Camera className="size-3 mr-1" />Yes</Badge> : "—"}</TableCell>
                  <TableCell>{insp.customerSignature ? <Badge variant="outline" className="text-xs"><Signature className="size-3 mr-1" />Signed</Badge> : "—"}</TableCell>
                  <TableCell className="text-xs text-slate-500">{insp.createdAt ? new Date(insp.createdAt).toLocaleDateString() : "—"}</TableCell>
                  <TableCell className="text-right">
                    <ActionButton3D icon={<FileText className="size-3" />} label="View" color="blue" size="xs" onClick={() => {}} />
                  </TableCell>
                </TableRow>
              ))}
              {(!inspections || inspections.length === 0) && (
                <TableRow><TableCell colSpan={7} className="text-center py-12 text-slate-500">No inspections recorded</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Inspection</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createInspection.mutate({ jobCardId: parseInt(form.jobCardId), notes: form.notes }); }} className="space-y-3">
            <div><Label>Job Card ID</Label><Input type="number" value={form.jobCardId} onChange={e => setForm({...form, jobCardId: e.target.value})} required /></div>
            <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Inspection notes" /></div>
            <Button type="submit" className="w-full">Create Inspection</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
