import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Wrench, Car, Users, ClipboardList, FileText,
  Search, AlertTriangle, ArrowRight, Clock, DollarSign, CheckCircle
} from "lucide-react";
import ActionButton3D from "@/components/ui/ActionButton3D";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  in_progress: "bg-blue-100 text-blue-700",
  quality_check: "bg-purple-100 text-purple-700",
  completed: "bg-emerald-100 text-emerald-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-slate-100 text-slate-700",
};

const statusIcons: Record<string, any> = {
  pending: Clock, in_progress: Wrench, quality_check: Search, completed: CheckCircle, delivered: CheckCircle,
};

export default function WorkshopDashboard() {
  const navigate = useNavigate();
  const { data: jobCards, refetch } = trpc.workshop.jobCardList.useQuery(undefined);
  const { data: stats } = trpc.workshop.workshopStats.useQuery(undefined);
  const { data: vehicles } = trpc.workshop.vehicleList.useQuery(undefined);
  const { data: technicians } = trpc.workshop.technicianList.useQuery(undefined);
  const createJobCard = trpc.workshop.jobCardCreate.useMutation({ onSuccess: () => { refetch(); setOpen(false); } });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ vehicleId: "", customerId: "", jobNumber: "", serviceType: "", description: "", estimatedCost: "", technicianId: "", priority: "normal" });

  const kpiCards = [
    { label: "Pending Jobs", value: stats?.pendingJobs || 0, icon: ClipboardList, color: "from-amber-50 to-amber-100 border-amber-200 text-amber-700" },
    { label: "In Progress", value: stats?.activeJobs || 0, icon: Wrench, color: "from-blue-50 to-blue-100 border-blue-200 text-blue-700" },
    { label: "Quality Check", value: stats?.qualityCheck || 0, icon: Search, color: "from-purple-50 to-purple-100 border-purple-200 text-purple-700" },
    { label: "Completed Today", value: stats?.completedToday || 0, icon: CheckCircle, color: "from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700" },
    { label: "Vehicles", value: stats?.totalVehicles || 0, icon: Car, color: "from-cyan-50 to-cyan-100 border-cyan-200 text-cyan-700" },
    { label: "Technicians", value: stats?.totalTechnicians || 0, icon: Users, color: "from-purple-50 to-purple-100 border-purple-200 text-purple-700" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workshop Dashboard</h2>
          <p className="text-slate-500">Automotive service center management</p>
        </div>
        <div className="flex gap-2">
          <ActionButton3D icon={<Plus className="size-4" />} label="New Job Card" color="blue" onClick={() => setOpen(true)} />
          <ActionButton3D icon={<Car className="size-4" />} label="New Vehicle" color="emerald" onClick={() => navigate("/app/verticals/workshop/vehicles")} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiCards.map(kpi => (
          <Card key={kpi.label} className={`bg-gradient-to-br ${kpi.color}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <kpi.icon className="size-4" />
                <p className="text-xs font-medium">{kpi.label}</p>
              </div>
              <p className="text-2xl font-bold mt-1">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats Row */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Recent Job Cards</CardTitle>
            <ActionButton3D icon={<ArrowRight className="size-3" />} label="View All" color="slate" onClick={() => navigate("/app/verticals/workshop/job-cards")} />
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job #</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobCards?.slice(0, 5).map(job => (
                  <TableRow key={job.id}>
                    <TableCell className="font-mono font-medium">{job.jobNumber}</TableCell>
                    <TableCell>{job.serviceType}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${statusColors[job.status] || ""}`} variant="outline">
                        {job.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ActionButton3D icon={<FileText className="size-3" />} label="View" color="blue" size="xs" onClick={() => navigate(`/app/verticals/workshop/job-cards?id=${job.id}`)} />
                    </TableCell>
                  </TableRow>
                ))}
                {(!jobCards || jobCards.length === 0) && (
                  <TableRow><TableCell colSpan={4} className="text-center text-slate-500 py-8">No job cards yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            <ActionButton3D icon={<ClipboardList className="size-4" />} label="Create Job Card" color="blue" fullWidth onClick={() => setOpen(true)} />
            <ActionButton3D icon={<Car className="size-4" />} label="Register Vehicle" color="emerald" fullWidth onClick={() => navigate("/app/verticals/workshop/vehicles")} />
            <ActionButton3D icon={<FileText className="size-4" />} label="New Estimate" color="purple" fullWidth onClick={() => navigate("/app/verticals/workshop/estimates")} />
            <ActionButton3D icon={<Users className="size-4" />} label="Manage Technicians" color="amber" fullWidth onClick={() => navigate("/app/verticals/workshop/technicians")} />
            <ActionButton3D icon={<Search className="size-4" />} label="Inspections" color="rose" fullWidth onClick={() => navigate("/app/verticals/workshop/inspections")} />
          </CardContent>
        </Card>
      </div>

      {/* Create Job Card Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Job Card</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            createJobCard.mutate({
              vehicleId: parseInt(form.vehicleId), customerId: parseInt(form.customerId) || 1,
              jobNumber: form.jobNumber, serviceType: form.serviceType,
              description: form.description, estimatedCost: form.estimatedCost,
              technicianId: form.technicianId ? parseInt(form.technicianId) : undefined,
              priority: form.priority,
            });
          }} className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Job #</Label><Input value={form.jobNumber} onChange={e => setForm({...form, jobNumber: e.target.value})} placeholder="JOB-2026-001" required /></div>
              <div><Label>Vehicle</Label><Select value={form.vehicleId} onValueChange={v => setForm({...form, vehicleId: v})}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{vehicles?.map(v => <SelectItem key={v.id} value={v.id.toString()}>{v.make} {v.model} - {v.plateNumber}</SelectItem>)}</SelectContent></Select></div>
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
    </div>
  );
}
