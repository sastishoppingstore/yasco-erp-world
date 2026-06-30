import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";

export default function ScorecardView() {
  const [supplierId, setSupplierId] = useState(0);
  const { data: scorecard, refetch } = trpc.scm.supplierScorecard.useQuery({ supplierId }, { enabled: supplierId > 0 });
  const { data: evaluation } = trpc.scm.evaluateSupplier.useQuery({ supplierId }, { enabled: supplierId > 0 });
  const { data: suppliers } = trpc.purchase.supplierList.useQuery();
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Supplier Scorecard</h2>
      <Card><CardContent className="p-4 flex gap-4 items-end">
        <div><Label>Supplier</Label>
          <select className="w-64 border rounded p-2 mt-1" value={supplierId} onChange={e => setSupplierId(Number(e.target.value))}>
            <option value={0}>Select supplier...</option>
            {suppliers?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <Button onClick={() => refetch()}>Load</Button>
      </CardContent></Card>
      {evaluation && (
        <div className="grid grid-cols-5 gap-4">
          <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-blue-600">{evaluation.avgQuality.toFixed(1)}</div><div className="text-xs text-slate-500">Quality</div></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-green-600">{evaluation.avgDelivery.toFixed(1)}</div><div className="text-xs text-slate-500">Delivery</div></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-purple-600">{evaluation.avgPrice.toFixed(1)}</div><div className="text-xs text-slate-500">Price</div></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-orange-600">{evaluation.avgService.toFixed(1)}</div><div className="text-xs text-slate-500">Service</div></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><div className={`text-2xl font-bold ${evaluation.category === 'excellent' ? 'text-green-600' : evaluation.category === 'poor' ? 'text-red-600' : 'text-yellow-600'}`}>{evaluation.overall.toFixed(1)}</div><div className="text-xs text-slate-500">Overall ({evaluation.category})</div></CardContent></Card>
        </div>
      )}
      <Card><CardHeader><CardTitle>Performance Metrics</CardTitle></CardHeader><CardContent>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left"><th className="pb-2 font-medium">Period</th><th className="pb-2 font-medium">On-Time Delivery</th><th className="pb-2 font-medium">Quality Rate</th><th className="pb-2 font-medium">Fill Rate</th><th className="pb-2 font-medium">Lead Time</th><th className="pb-2 font-medium">Return Rate</th></tr></thead>
          <tbody>
            {scorecard?.performanceMetrics?.map((m: any) => (
              <tr key={m.id} className="border-b last:border-0"><td className="py-2">{m.periodStart} - {m.periodEnd}</td><td className="py-2">{m.onTimeDeliveryRate}%</td><td className="py-2">{m.qualityAcceptanceRate}%</td><td className="py-2">{m.fillRate}%</td><td className="py-2">{m.leadTimeDays}d</td><td className="py-2">{m.returnRate}%</td></tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
    </div>
  );
}
