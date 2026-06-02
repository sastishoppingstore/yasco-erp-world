import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, CircleDollarSign } from "lucide-react";

export default function CostCentersPage() {
  const { data: costCenters, refetch } = trpc.accounting.costCenterList.useQuery();
  const createCostCenter = trpc.accounting.costCenterCreate.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", description: "", budgetAmount: "0" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cost Centers</h2>
          <p className="text-slate-500">Budget allocation and cost center management</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Add Cost Center</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Cost Center</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createCostCenter.mutate(form); setOpen(false); setForm({ code: "", name: "", description: "", budgetAmount: "0" }); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Code</Label><Input value={form.code} onChange={e => setForm({...form, code: e.target.value})} required /></div>
                <div><Label>Budget Amount</Label><Input type="number" value={form.budgetAmount} onChange={e => setForm({...form, budgetAmount: e.target.value})} /></div>
              </div>
              <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <Button type="submit" className="w-full">Create Cost Center</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {costCenters?.map(cc => (
          <Card key={cc.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <CircleDollarSign className="w-5 h-5 text-blue-600" />
                <span className="font-mono text-xs text-slate-500">{cc.code}</span>
              </div>
              <h3 className="font-semibold mb-1">{cc.name}</h3>
              <p className="text-xs text-slate-500 mb-3 line-clamp-2">{cc.description || "No description"}</p>
              <div className="flex items-center justify-between text-sm border-t pt-3">
                <span className="text-slate-500">Budget</span>
                <span className="font-bold">{Number(cc.budgetAmount).toLocaleString()} SAR</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-slate-500">Actual</span>
                <span className="font-medium">{Number(cc.actualAmount).toLocaleString()} SAR</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!costCenters || costCenters.length === 0) && (
          <Card><CardContent className="p-8 text-center text-slate-400">No cost centers yet. Create your first one.</CardContent></Card>
        )}
      </div>
    </div>
  );
}
