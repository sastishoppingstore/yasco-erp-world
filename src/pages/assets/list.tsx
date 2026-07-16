import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Plus, Building2, Wrench, Truck } from "lucide-react";
import { Link } from "react-router";

export default function AssetsPage() {
  const { data: assets, refetch } = trpc.assets.assetList.useQuery(undefined);
  const { data: vehicles } = trpc.assets.vehicleList.useQuery(undefined);
  const { data: stats } = trpc.assets.assetStats.useQuery(undefined);
  const createAsset = trpc.assets.assetCreate.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ assetCode: "", name: "", category: "", purchaseCost: "0", usefulLife: 5 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Assets & Fleet</h2><p className="text-slate-500">Track fixed assets, vehicles, and maintenance</p></div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link to="/app/assets/fleet"><Truck className="w-4 h-4 mr-2" />Fleet</Link></Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Asset</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Asset</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createAsset.mutate({ ...form }); setOpen(false); }} className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Asset Code</Label><Input value={form.assetCode} onChange={e => setForm({...form, assetCode: e.target.value})} required /></div>
                  <div><Label>Category</Label><Input value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="e.g. IT Equipment" /></div>
                </div>
                <div><Label>Asset Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Purchase Cost</Label><Input type="number" value={form.purchaseCost} onChange={e => setForm({...form, purchaseCost: e.target.value})} /></div>
                  <div><Label>Useful Life (years)</Label><Input type="number" value={form.usefulLife} onChange={e => setForm({...form, usefulLife: Number(e.target.value)})} /></div>
                </div>
                <Button type="submit" className="w-full">Create Asset</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><Building2 className="w-5 h-5 text-blue-600" /></div><div><p className="text-sm text-slate-500">Total Assets</p><p className="text-xl font-bold">{stats?.totalAssets || 0}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-emerald-100 rounded-lg"><Building2 className="w-5 h-5 text-emerald-600" /></div><div><p className="text-sm text-slate-500">Active</p><p className="text-xl font-bold">{stats?.activeAssets || 0}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-purple-100 rounded-lg"><Truck className="w-5 h-5 text-purple-600" /></div><div><p className="text-sm text-slate-500">Vehicles</p><p className="text-xl font-bold">{stats?.totalVehicles || 0}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-amber-100 rounded-lg"><Wrench className="w-5 h-5 text-amber-600" /></div><div><p className="text-sm text-slate-500">Total Value</p><p className="text-xl font-bold">{stats?.totalValue?.toLocaleString() || 0} SAR</p></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Fixed Assets</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Asset</TableHead><TableHead>Category</TableHead><TableHead>Location</TableHead><TableHead className="text-right">Purchase Cost</TableHead><TableHead className="text-right">Book Value</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {assets?.map(asset => (
                <TableRow key={asset.id}>
                  <TableCell className="font-mono text-sm">{asset.assetCode}</TableCell>
                  <TableCell><div className="font-medium">{asset.name}</div>{asset.model && <div className="text-xs text-slate-500">{asset.manufacturer} {asset.model}</div>}</TableCell>
                  <TableCell>{asset.category}</TableCell>
                  <TableCell className="text-sm">{asset.location || "N/A"}</TableCell>
                  <TableCell className="text-right font-mono">{Number(asset.purchaseCost).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{Number(asset.bookValue).toLocaleString()}</TableCell>
                  <TableCell><span className={`text-xs px-2 py-1 rounded-full ${asset.status === "active" ? "bg-emerald-100 text-emerald-700" : asset.status === "under_maintenance" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"}`}>{asset.status}</span></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
