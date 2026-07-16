import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart3, Plus, RefreshCw, TrendingUp } from "lucide-react";

export default function BidComparisonView() {
  const [search, setSearch] = useState("");
  const { data: comparisons, isLoading, refetch } = trpc.scm.bidComparisonList.useQuery();
  const { data: rfqs } = trpc.scm.rfqList.useQuery();
  const [form, setForm] = useState({ rfqId: 0, comparisonDate: "", criteria: {}, summary: "", recommendedSupplierId: 0 });
  const create = trpc.scm.createBidComparison.useMutation({ onSuccess: () => { refetch(); setForm({ rfqId: 0, comparisonDate: "", criteria: {}, summary: "", recommendedSupplierId: 0 }); } });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 gap-4"><Skeleton className="h-48 w-full" /><Skeleton className="h-48 w-full" /></div>
      </div>
    );
  }

  const chartData = (comparisons || []).slice(0, 10).map((c: any) => ({
    name: `#${c.rfqId}`,
    score: c.totalScore || 0,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold">Bid Comparison</h2>
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()}><RefreshCw className="w-4 h-4" /></Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Plus className="w-4 h-4" />New Bid Comparison</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>RFQ</Label><select className="w-full border rounded p-2 text-sm" value={form.rfqId} onChange={e => setForm({...form, rfqId: Number(e.target.value)})}><option value={0}>Select RFQ...</option>{(rfqs || []).map((r: any) => <option key={r.id} value={r.id}>{r.rfqNumber} - {r.title}</option>)}</select></div>
            <div><Label>Date</Label><Input type="date" value={form.comparisonDate} onChange={e => setForm({...form, comparisonDate: e.target.value})} /></div>
          </div>
          <div><Label>Summary</Label><textarea className="w-full border rounded p-2 text-sm" rows={2} value={form.summary} onChange={e => setForm({...form, summary: e.target.value})} /></div>
          <Button onClick={() => create.mutate(form)} disabled={!form.rfqId || create.isPending}><Plus className="w-4 h-4 mr-2" />Create Comparison</Button>
        </CardContent></Card>

        <Card><CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-4 h-4" />Score Overview</CardTitle></CardHeader><CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="score" fill="#f97316" radius={[4,4,0,0]} name="Total Score" /></BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <BarChart3 className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm">No comparison data yet</p>
            </div>
          )}
        </CardContent></Card>
      </div>

      <Card><CardHeader><CardTitle>All Comparisons</CardTitle></CardHeader><CardContent className="p-0">
        <table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-3">RFQ</th><th className="p-3">Date</th><th className="p-3">Recommended Supplier</th><th className="p-3">Total Score</th><th className="p-3">Status</th></tr></thead><tbody>
          {(comparisons || []).length > 0 ? (comparisons || []).map((c: any) => (
            <tr key={c.id} className="border-b hover:bg-slate-50"><td className="p-3 font-medium">RFQ #{c.rfqId}</td><td className="p-3">{c.comparisonDate ? new Date(c.comparisonDate).toLocaleDateString() : "—"}</td><td className="p-3">{c.recommendedSupplierName || c.recommendedSupplierId || "—"}</td><td className="p-3 font-semibold text-orange-600">{c.totalScore ?? "—"}</td><td className="p-3"><Badge variant="outline" className="capitalize">{c.status || "draft"}</Badge></td></tr>
          )) : <tr><td colSpan={5} className="p-12 text-center text-muted-foreground"><BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No bid comparisons yet</p></td></tr>}
        </tbody></table>
      </CardContent></Card>
    </div>
  );
}
