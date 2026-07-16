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
import { Plus, Users, Wrench, Star, Clock, ArrowLeft, Phone, Mail, DollarSign } from "lucide-react";
import ActionButton3D from "@/components/ui/ActionButton3D";

export default function TechniciansPage() {
  const navigate = useNavigate();
  const { data: technicians, refetch } = trpc.workshop.technicianList.useQuery(undefined);
  const createTechnician = trpc.workshop.technicianCreate.useMutation({ onSuccess: () => { refetch(); setOpen(false); } });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", specialty: "", hourlyRate: "" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Technicians</h2>
          <p className="text-slate-500">Manage workshop technicians and assignments</p>
        </div>
        <div className="flex gap-2">
          <ActionButton3D icon={<ArrowLeft className="size-4" />} label="Dashboard" color="slate" onClick={() => navigate("/app/verticals/workshop")} />
          <ActionButton3D icon={<Plus className="size-4" />} label="Add Technician" color="blue" onClick={() => setOpen(true)} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {technicians?.map(t => (
          <Card key={t.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.specialty || "General"}</div>
                  </div>
                </div>
                <Badge variant={t.isActive ? "outline" : "secondary"} className={t.isActive ? "text-emerald-600 border-emerald-200 bg-emerald-50" : ""}>
                  {t.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {t.phone && (
                  <div className="flex items-center gap-1 text-slate-600">
                    <Phone className="size-3" /> {t.phone}
                  </div>
                )}
                {t.email && (
                  <div className="flex items-center gap-1 text-slate-600 truncate">
                    <Mail className="size-3" /> {t.email}
                  </div>
                )}
                {t.hourlyRate && (
                  <div className="flex items-center gap-1 text-slate-600">
                    <DollarSign className="size-3" /> {t.hourlyRate} SAR/hr
                  </div>
                )}
                <div className="flex items-center gap-1 text-slate-600">
                  <Wrench className="size-3" /> {t.jobsCompleted || 0} jobs
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!technicians || technicians.length === 0) && (
          <div className="col-span-full text-center py-12 text-slate-500">
            <Users className="size-12 mx-auto mb-3 text-slate-300" />
            <p>No technicians yet</p>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Technician</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createTechnician.mutate(form); }} className="space-y-3">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Specialty</Label><Input value={form.specialty} onChange={e => setForm({...form, specialty: e.target.value})} placeholder="Engine / AC / Electrical" /></div>
              <div><Label>Hourly Rate (SAR)</Label><Input type="number" value={form.hourlyRate} onChange={e => setForm({...form, hourlyRate: e.target.value})} /></div>
            </div>
            <Button type="submit" className="w-full">Add Technician</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
