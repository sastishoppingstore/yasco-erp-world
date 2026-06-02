import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Users, Flame, Thermometer, Snowflake } from "lucide-react";

export default function LeadsPage() {
  const { data: leads, refetch } = trpc.crm.leadList.useQuery(undefined);
  const createLead = trpc.crm.leadCreate.useMutation({ onSuccess: () => refetch() });
  const updateLead = trpc.crm.leadUpdate.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", company: "", source: "website" as const, rating: "warm" as const, estimatedValue: "0" });

  const filtered = leads?.filter(l => !statusFilter || l.status === statusFilter) || [];

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-700",
    contacted: "bg-purple-100 text-purple-700",
    qualified: "bg-emerald-100 text-emerald-700",
    proposal: "bg-amber-100 text-amber-700",
    negotiation: "bg-orange-100 text-orange-700",
    won: "bg-green-100 text-green-700",
    lost: "bg-red-100 text-red-700",
  };

  const ratingIcons = { hot: Flame, warm: Thermometer, cold: Snowflake };
  const ratingColors = { hot: "text-red-500", warm: "text-amber-500", cold: "text-blue-400" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Leads</h2><p className="text-slate-500">Track and manage sales leads pipeline</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Lead</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Lead</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createLead.mutate({ ...form }); setOpen(false); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>First Name</Label><Input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} required /></div>
                <div><Label>Last Name</Label><Input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              </div>
              <div><Label>Company</Label><Input value={form.company} onChange={e => setForm({...form, company: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Source</Label>
                  <Select value={form.source} onValueChange={(v: any) => setForm({...form, source: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="website">Website</SelectItem><SelectItem value="referral">Referral</SelectItem><SelectItem value="social_media">Social Media</SelectItem><SelectItem value="call">Call</SelectItem><SelectItem value="walk_in">Walk In</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Rating</Label>
                  <Select value={form.rating} onValueChange={(v: any) => setForm({...form, rating: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="hot">Hot</SelectItem><SelectItem value="warm">Warm</SelectItem><SelectItem value="cold">Cold</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full">Create Lead</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setStatusFilter("")} className={!statusFilter ? "bg-slate-100" : ""}>All</Button>
        {["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"].map(s => (
          <Button key={s} variant="outline" size="sm" onClick={() => setStatusFilter(s)} className={statusFilter === s ? "bg-slate-100 capitalize" : "capitalize"}>{s}</Button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(lead => {
          const RatingIcon = ratingIcons[lead.rating as keyof typeof ratingIcons] || Thermometer;
          return (
            <Card key={lead.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{lead.firstName} {lead.lastName}</h3>
                    <p className="text-sm text-slate-500">{lead.company || "No company"}</p>
                  </div>
                  <RatingIcon className={`w-5 h-5 ${ratingColors[lead.rating as keyof typeof ratingColors]}`} />
                </div>
                <div className="mt-3 space-y-1">
                  <p className="text-xs text-slate-500">{lead.email} {lead.phone && `| ${lead.phone}`}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[lead.status] || ""}`}>{lead.status}</span>
                    <span className="text-xs text-slate-400">{lead.source}</span>
                  </div>
                  {lead.estimatedValue && Number(lead.estimatedValue) > 0 && (
                    <p className="text-sm font-semibold mt-2">{Number(lead.estimatedValue).toLocaleString()} SAR</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
