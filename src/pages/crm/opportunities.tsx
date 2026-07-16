import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Target, TrendingUp } from "lucide-react";

export default function OpportunitiesPage() {
  const { data: opportunities, refetch } = trpc.crm.opportunityList.useQuery();
  const createOpportunity = trpc.crm.opportunityCreate.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [stageFilter, setStageFilter] = useState("");
  const [form, setForm] = useState({
    name: "", leadId: 0, customerId: 0, stage: "prospecting" as const,
    probability: 0, expectedValue: "0", expectedCloseDate: "", description: "",
  });

  const filtered = opportunities?.filter(o => !stageFilter || o.stage === stageFilter) || [];

  const stageColors: Record<string, string> = {
    prospecting: "bg-blue-100 text-blue-700",
    qualification: "bg-purple-100 text-purple-700",
    proposal: "bg-amber-100 text-amber-700",
    negotiation: "bg-orange-100 text-orange-700",
    closed_won: "bg-emerald-100 text-emerald-700",
    closed_lost: "bg-red-100 text-red-700",
  };

  const totalPipeline = filtered.reduce((s, o) => s + Number(o.expectedValue), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Opportunities</h2><p className="text-slate-500">Sales pipeline and opportunity management</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Opportunity</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Opportunity</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createOpportunity.mutate(form); setOpen(false); setForm({ name: "", leadId: 0, customerId: 0, stage: "prospecting", probability: 0, expectedValue: "0", expectedCloseDate: "", description: "" }); }} className="space-y-3">
              <div><Label>Opportunity Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Stage</Label>
                  <Select value={form.stage} onValueChange={(v: any) => setForm({...form, stage: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prospecting">Prospecting</SelectItem>
                      <SelectItem value="qualification">Qualification</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="negotiation">Negotiation</SelectItem>
                      <SelectItem value="closed_won">Closed Won</SelectItem>
                      <SelectItem value="closed_lost">Closed Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Probability (%)</Label><Input type="number" value={form.probability} onChange={e => setForm({...form, probability: Number(e.target.value)})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Expected Value</Label><Input type="number" value={form.expectedValue} onChange={e => setForm({...form, expectedValue: e.target.value})} /></div>
                <div><Label>Close Date</Label><Input type="date" value={form.expectedCloseDate} onChange={e => setForm({...form, expectedCloseDate: e.target.value})} /></div>
              </div>
              <div><Label>Description</Label><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <Button type="submit" className="w-full">Create Opportunity</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><Target className="w-5 h-5 text-blue-600" /></div><div><p className="text-sm text-slate-500">Total Opportunities</p><p className="text-xl font-bold">{opportunities?.length || 0}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-emerald-100 rounded-lg"><TrendingUp className="w-5 h-5 text-emerald-600" /></div><div><p className="text-sm text-slate-500">Pipeline Value</p><p className="text-xl font-bold">{totalPipeline.toLocaleString()} SAR</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-amber-100 rounded-lg"><Target className="w-5 h-5 text-amber-600" /></div><div><p className="text-sm text-slate-500">Avg Value</p><p className="text-xl font-bold">{opportunities?.length ? Math.round(totalPipeline / opportunities.length).toLocaleString() : 0} SAR</p></div></CardContent></Card>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setStageFilter("")} className={!stageFilter ? "bg-slate-100" : ""}>All</Button>
        {["prospecting", "qualification", "proposal", "negotiation", "closed_won", "closed_lost"].map(s => (
          <Button key={s} variant="outline" size="sm" onClick={() => setStageFilter(s)} className={stageFilter === s ? "bg-slate-100 capitalize" : "capitalize"}>{s.replace("_", " ")}</Button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(opp => (
          <Card key={opp.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs px-2 py-1 rounded-full ${stageColors[opp.stage] || ""}`}>{opp.stage.replace("_", " ")}</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">{opp.name}</h3>
              <p className="text-sm text-slate-500 mb-3 line-clamp-2">{opp.description || "No description"}</p>
              <div className="space-y-2 border-t pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Probability</span>
                  <span className="font-medium">{opp.probability}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Expected Value</span>
                  <span className="font-bold">{Number(opp.expectedValue).toLocaleString()} SAR</span>
                </div>
                {opp.expectedCloseDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Close Date</span>
                    <span>{new Date(opp.expectedCloseDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card><CardContent className="p-8 text-center text-slate-400">No opportunities found</CardContent></Card>
        )}
      </div>
    </div>
  );
}
