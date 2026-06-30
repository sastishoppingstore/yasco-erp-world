import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/providers/trpc";
import { Waves, Plus, CheckCircle2, RefreshCw, Package } from "lucide-react";

export default function WavePickingView() {
  const [search, setSearch] = useState("");
  const { data: waves, isLoading, refetch } = trpc.wms.waveList.useQuery();
  const [form, setForm] = useState({ waveType: "single_order" as any, orderIds: "" });
  const createWave = trpc.wms.createWave.useMutation({ onSuccess: () => refetch() });
  const completeWave = trpc.wms.completeWave.useMutation({ onSuccess: () => refetch() });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Waves className="w-6 h-6 text-cyan-500" />
          <h2 className="text-2xl font-bold">Wave Picking</h2>
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()}><RefreshCw className="w-4 h-4" /></Button>
      </div>

      <Card><CardHeader><CardTitle className="flex items-center gap-2"><Plus className="w-4 h-4" />Create Wave</CardTitle></CardHeader><CardContent>
        <div className="flex gap-4 items-end flex-wrap">
          <div className="w-48">
            <Label>Type</Label>
            <Select value={form.waveType} onValueChange={(v) => setForm({...form, waveType: v as any})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="single_order">Single Order</SelectItem>
                <SelectItem value="multi_order">Multi Order</SelectItem>
                <SelectItem value="zone">Zone</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <Label>Order IDs (comma-separated)</Label>
            <Input value={form.orderIds} onChange={e => setForm({...form, orderIds: e.target.value})} placeholder="e.g. 101, 102, 103" />
          </div>
          <Button onClick={() => createWave.mutate({ waveType: form.waveType, orderIds: form.orderIds.split(',').map(Number) })} disabled={!form.orderIds || createWave.isPending}>
            <Plus className="w-4 h-4 mr-2" />Create Wave
          </Button>
        </div>
      </CardContent></Card>

      <Card><CardHeader><CardTitle className="flex items-center gap-2"><Package className="w-4 h-4" />Waves</CardTitle></CardHeader><CardContent className="p-0">
        <table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-3">Wave #</th><th className="p-3">Type</th><th className="p-3">Items</th><th className="p-3">Orders</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead><tbody>
          {(waves || []).length > 0 ? (waves || []).map((w: any) => (
            <tr key={w.id} className="border-b hover:bg-slate-50"><td className="p-3 font-medium">{w.waveNumber}</td><td className="p-3"><Badge variant="outline">{w.waveType}</Badge></td><td className="p-3">{w.totalItems}</td><td className="p-3">{w.orderCount ?? "—"}</td><td className="p-3"><Badge variant={w.status === "completed" ? "default" : w.status === "created" ? "secondary" : "outline"} className="capitalize">{w.status}</Badge></td><td className="p-3">{w.status === "created" && <Button size="sm" onClick={() => completeWave.mutate({ id: w.id })} disabled={completeWave.isPending}><CheckCircle2 className="w-3 h-3 mr-1" />Complete</Button>}</td></tr>
          )) : <tr><td colSpan={6} className="p-12 text-center text-muted-foreground"><Waves className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No waves created yet</p></td></tr>}
        </tbody></table>
      </CardContent></Card>
    </div>
  );
}
