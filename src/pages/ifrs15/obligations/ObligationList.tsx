import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileSpreadsheet } from "lucide-react";

export default function ObligationList() {
  const { data: obligations, refetch } = trpc.ifrs15.obligationList.useQuery(undefined);
  const createObl = trpc.ifrs15.obligationCreate.useMutation({ onSuccess: () => refetch() });
  const allocPrice = trpc.ifrs15.calculateAllocatedPrice.useMutation({ onSuccess: () => refetch() });
  const genSchedule = trpc.ifrs15.generateSchedule.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    obligationName: "", description: "", obligationType: "good" as const,
    performanceTiming: "point_in_time" as const, transactionPrice: "0",
    standalonePrice: "0", allocatedAmount: "0",
    recognitionMethod: "straight_line" as const, startDate: "", endDate: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createObl.mutate(form);
    setOpen(false);
  };

  const statusColors: Record<string, string> = {
    identified: "bg-blue-100 text-blue-800", satisfied: "bg-green-100 text-green-800",
    partially_satisfied: "bg-amber-100 text-amber-800", cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Performance Obligations</h2><p className="text-slate-500">IFRS 15 Step 2 - Identify performance obligations</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Obligation</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>New Performance Obligation</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Obligation Name</Label><Input value={form.obligationName} onChange={e => setForm({...form, obligationName: e.target.value})} required /></div>
              <div><Label>Description</Label><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Type</Label>
                  <Select value={form.obligationType} onValueChange={v => setForm({...form, obligationType: v as any})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="software">Software</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="construction">Construction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Timing</Label>
                  <Select value={form.performanceTiming} onValueChange={v => setForm({...form, performanceTiming: v as any})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="point_in_time">Point in Time</SelectItem><SelectItem value="over_time">Over Time</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Transaction Price</Label><Input type="number" value={form.transactionPrice} onChange={e => setForm({...form, transactionPrice: e.target.value})} /></div>
                <div><Label>Standalone Price</Label><Input type="number" value={form.standalonePrice} onChange={e => setForm({...form, standalonePrice: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} /></div>
                <div><Label>End Date</Label><Input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} /></div>
              </div>
              <Button type="submit" className="w-full">Create Obligation</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-2">
        {obligations?.map(o => (
          <Card key={o.id} className="hover:shadow-md transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{o.obligationName}</p>
                    <p className="text-xs text-slate-500">{o.obligationType} · {o.performanceTiming} · Allocated: {o.allocatedAmount} SAR</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[o.status]}`}>{o.status}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
