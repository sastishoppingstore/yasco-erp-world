import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Wrench, Car, Users, ClipboardList, FileText, Search,
  Clock, CheckCircle, XCircle, ArrowLeft, Filter, AlertTriangle
} from "lucide-react";
import ActionButton3D from "@/components/ui/ActionButton3D";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  quality_check: "bg-purple-100 text-purple-700 border-purple-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  delivered: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-slate-100 text-slate-700 border-slate-200",
};

const statusActions: Record<string, { next: string; label: string; color: string; icon: any }[]> = {
  pending: [
    { next: "in_progress", label: "Start Job", color: "emerald", icon: Wrench },
  ],
  in_progress: [
    { next: "quality_check", label: "Quality Check", color: "purple", icon: Search },
  ],
  quality_check: [
    { next: "completed", label: "Complete", color: "emerald", icon: CheckCircle },
  ],
  completed: [
    { next: "delivered", label: "Deliver", color: "green", icon: CheckCircle },
  ],
};

export default function JobCardsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobIdParam = searchParams.get("id");

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: jobCards, refetch } = trpc.workshop.jobCardList.useQuery(
    statusFilter !== "all" ? { status: statusFilter } : undefined
  );
  const updateJobCard = trpc.workshop.jobCardUpdate.useMutation({ onSuccess: () => refetch() });
  const deleteJobCard = trpc.workshop.jobCardDelete.useMutation({ onSuccess: () => refetch() });

  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  const [form, setForm] = useState({ jobNumber: "", serviceType: "", description: "", estimatedCost: "", priority: "normal", vehicleId: "", customerId: "1", technicianId: "" });
  const { data: vehicles } = trpc.workshop.vehicleList.useQuery(undefined);
  const { data: technicians } = trpc.workshop.technicianList.useQuery(undefined);
  const createJobCard = trpc.workshop.jobCardCreate.useMutation({ onSuccess: () => { refetch(); setOpen(false); } });

  const handleStatusChange = (jobId: number, newStatus: string) => {
    updateJobCard.mutate({ id: jobId, status: newStatus });
  };

  const tabs = [
    { value: "all", label: "All", count: jobCards?.length || 0 },
    { value: "pending", label: "Pending", count: jobCards?.filter(j => j.status === "pending").length || 0 },
    { value: "in_progress", label: "In Progress", count: jobCards?.filter(j => j.status === "in_progress").length || 0 },
    { value: "quality_check", label: "Quality Check", count: jobCards?.filter(j => j.status === "quality_check").length || 0 },
    { value: "completed", label: "Completed", count: jobCards?.filter(j => j.status === "completed").length || 0 },
    { value: "delivered", label: "Delivered", count: jobCards?.filter(j => j.status === "delivered").length || 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Job Cards</h2>
          <p className="text-slate-500">Manage workshop job cards</p>
        </div>
        <div className="flex gap-2">
          <ActionButton3D icon={<ArrowLeft className="size-4" />} label="Dashboard" color="slate" onClick={() => navigate("/app/verticals/workshop")} />
          <ActionButton3D icon={<Plus className="size-4" />} label="New Job Card" color="blue" onClick={() => setOpen(true)} />
        </div>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          {tabs.map(t => (
            <TabsTrigger key={t.value} value={t.value} className="relative">
              {t.label}
              <Badge variant="secondary" className="ml-2 text-xs">{t.count}</Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job #</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Est. Cost</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobCards?.map(job => (
                <TableRow key={job.id}>
                  <TableCell className="font-mono font-medium">{job.jobNumber}</TableCell>
                  <TableCell>{job.serviceType}</TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${statusColors[job.status] || ""}`} variant="outline">
                      {job.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {job.priority === "urgent" ? (
                      <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Urgent</Badge>
                    ) : job.priority === "express" ? (
                      <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">Express</Badge>
                    ) : (
                      <Badge variant="outline" className="text-slate-600">Normal</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono">{Number(job.estimatedCost || 0).toLocaleString()} SAR</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <ActionButton3D icon={<FileText className="size-3" />} label="View" color="blue" size="xs" onClick={() => {
                        setSelectedJob(job);
                        setDetailOpen(true);
                      }} />
                      {statusActions[job.status]?.map(action => (
                        <ActionButton3D
                          key={action.next}
                          icon={<action.icon className="size-3" />}
                          label={action.label}
                          color={action.color as any}
                          size="xs"
                          onClick={() => handleStatusChange(job.id, action.next)}
                        />
                      ))}
                      <ActionButton3D icon={<XCircle className="size-3" />} label="Cancel" color="rose" size="xs" onClick={() => {
                        if (confirm("Cancel this job card?")) {
                          updateJobCard.mutate({ id: job.id, status: "cancelled" });
                        }
                      }} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!jobCards || jobCards.length === 0) && (
                <TableRow><TableCell colSpan={6} className="text-center text-slate-500 py-12">No job cards found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Job Card Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Job Card</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            createJobCard.mutate({
              vehicleId: parseInt(form.vehicleId), customerId: parseInt(form.customerId),
              jobNumber: form.jobNumber, serviceType: form.serviceType,
              description: form.description, estimatedCost: form.estimatedCost,
              technicianId: form.technicianId ? parseInt(form.technicianId) : undefined,
              priority: form.priority,
            });
          }} className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Job #</Label><Input value={form.jobNumber} onChange={e => setForm({...form, jobNumber: e.target.value})} placeholder="JOB-2026-001" required /></div>
              <div><Label>Vehicle</Label><Select value={form.vehicleId} onValueChange={v => setForm({...form, vehicleId: v})}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{vehicles?.map(v => <SelectItem key={v.id} value={v.id.toString()}>{v.make} {v.model}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div><Label>Service Type</Label><Input value={form.serviceType} onChange={e => setForm({...form, serviceType: e.target.value})} placeholder="Oil Change / Repair" /></div>
            <div><Label>Description</Label><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe the issue" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Technician</Label><Select value={form.technicianId} onValueChange={v => setForm({...form, technicianId: v})}><SelectTrigger><SelectValue placeholder="Assign" /></SelectTrigger><SelectContent>{technicians?.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Priority</Label><Select value={form.priority} onValueChange={v => setForm({...form, priority: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="normal">Normal</SelectItem><SelectItem value="urgent">Urgent</SelectItem><SelectItem value="express">Express</SelectItem></SelectContent></Select></div>
            </div>
            <div><Label>Est. Cost (SAR)</Label><Input type="number" value={form.estimatedCost} onChange={e => setForm({...form, estimatedCost: e.target.value})} /></div>
            <Button type="submit" className="w-full">Create Job Card</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Job Card Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Job Card: {selectedJob?.jobNumber}</DialogTitle></DialogHeader>
          {selectedJob && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-500">Service:</span> <span className="font-medium">{selectedJob.serviceType}</span></div>
                <div><span className="text-slate-500">Status:</span> <Badge className={`text-xs ${statusColors[selectedJob.status] || ""}`} variant="outline">{selectedJob.status.replace("_", " ")}</Badge></div>
                <div><span className="text-slate-500">Priority:</span> <span className="font-medium capitalize">{selectedJob.priority}</span></div>
                <div><span className="text-slate-500">Est. Cost:</span> <span className="font-mono">{Number(selectedJob.estimatedCost || 0).toLocaleString()} SAR</span></div>
              </div>
              {selectedJob.description && (
                <div><span className="text-sm text-slate-500">Description:</span><p className="text-sm mt-1">{selectedJob.description}</p></div>
              )}
              {selectedJob.notes && (
                <div><span className="text-sm text-slate-500">Notes:</span><p className="text-sm mt-1">{selectedJob.notes}</p></div>
              )}
              <div className="flex gap-2 pt-2 border-t">
                {statusActions[selectedJob.status]?.map(action => (
                  <ActionButton3D
                    key={action.next}
                    icon={<action.icon className="size-3" />}
                    label={action.label}
                    color={action.color as any}
                    onClick={() => { handleStatusChange(selectedJob.id, action.next); setDetailOpen(false); }}
                  />
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
