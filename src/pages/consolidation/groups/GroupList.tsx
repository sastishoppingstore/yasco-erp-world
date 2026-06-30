import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router";
import { Plus, Building2 } from "lucide-react";

export default function GroupList() {
  const { data: groups, refetch } = trpc.consolidation.consolidationGroupList.useQuery(undefined);
  const { data: companies } = trpc.consolidation.companyList.useQuery(undefined);
  const createGroup = trpc.consolidation.consolidationGroupCreate.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", fiscalYearId: 0,
    baseCurrency: "SAR", consolidationMethod: "equity" as const,
    eliminationMethod: "line_by_line" as const,
    companyIds: [] as { companyId: number; ownershipPercent: string }[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createGroup.mutate(form);
    setOpen(false);
  };

  const toggleCompany = (companyId: number) => {
    setForm(prev => ({
      ...prev,
      companyIds: prev.companyIds.some(c => c.companyId === companyId)
        ? prev.companyIds.filter(c => c.companyId !== companyId)
        : [...prev.companyIds, { companyId, ownershipPercent: "100.0000" }],
    }));
  };

  const setOwnership = (companyId: number, ownershipPercent: string) => {
    setForm(prev => ({
      ...prev,
      companyIds: prev.companyIds.map(c => c.companyId === companyId ? { ...c, ownershipPercent } : c),
    }));
  };

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800", in_progress: "bg-blue-100 text-blue-800", completed: "bg-green-100 text-green-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Consolidation Groups</h2><p className="text-slate-500">Manage consolidation groups and entities</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Group</Button></DialogTrigger>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>New Consolidation Group</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Group Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div><Label>Description</Label><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Base Currency</Label>
                  <Select value={form.baseCurrency} onValueChange={v => setForm({...form, baseCurrency: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAR">SAR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Consolidation Method</Label>
                  <Select value={form.consolidationMethod} onValueChange={v => setForm({...form, consolidationMethod: v as any})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equity">Equity</SelectItem>
                      <SelectItem value="proportionate">Proportionate</SelectItem>
                      <SelectItem value="acquisition">Acquisition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Companies</Label>
                <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                  {companies?.map(c => (
                    <label key={c.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={form.companyIds.some(fc => fc.companyId === c.id)}
                        onChange={() => toggleCompany(c.id)} className="rounded" />
                      {c.legalName || c.displayName}
                      {form.companyIds.some(fc => fc.companyId === c.id) && (
                        <Input type="number" className="w-24 h-7 ml-auto" placeholder="%" value={form.companyIds.find(fc => fc.companyId === c.id)?.ownershipPercent || "100"}
                          onChange={e => setOwnership(c.id, e.target.value)} />
                      )}
                    </label>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full">Create Group</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4">
        {groups?.map(g => (
          <Link key={g.id} to={`/app/consolidation/groups/${g.id}`} className="block">
            <Card className="hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{g.name}</p>
                    <p className="text-xs text-slate-500">{g.baseCurrency} · {g.consolidationMethod} method</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[g.status] || ""}`}>{g.status}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
