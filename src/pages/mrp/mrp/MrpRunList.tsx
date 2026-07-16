import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import { Play, Eye } from "lucide-react";

export default function MrpRunList() {
  const { data: runs, refetch } = trpc.mrp.mrpRunList.useQuery();
  const [horizon, setHorizon] = useState({ start: "", end: "" });
  const runMrp = trpc.mrp.runMrp.useMutation({ onSuccess: () => refetch() });
  return (
    <div className="space-y-4">
      <div><h2 className="text-2xl font-bold">MRP Runs</h2></div>
      <Card><CardHeader><CardTitle>Run MRP</CardTitle></CardHeader><CardContent className="flex gap-4 items-end">
        <div><Label>Horizon Start</Label><Input type="date" value={horizon.start} onChange={e => setHorizon({...horizon, start: e.target.value})} /></div>
        <div><Label>Horizon End</Label><Input type="date" value={horizon.end} onChange={e => setHorizon({...horizon, end: e.target.value})} /></div>
        <Button onClick={() => runMrp.mutate({ horizonStart: horizon.start, horizonEnd: horizon.end })} disabled={runMrp.isPending}><Play className="w-4 h-4 mr-2" />Run MRP</Button>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Previous Runs</CardTitle></CardHeader><CardContent>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left"><th className="pb-2 font-medium">Date</th><th className="pb-2 font-medium">Horizon</th><th className="pb-2 font-medium">Status</th><th className="pb-2 font-medium">Duration</th><th className="pb-2 font-medium"></th></tr></thead>
          <tbody>
            {runs?.map((r: any) => (
              <tr key={r.id} className="border-b last:border-0"><td className="py-2">{new Date(r.runDate).toLocaleString()}</td><td className="py-2">{r.horizonStart} - {r.horizonEnd}</td><td className="py-2"><span className={`px-2 py-0.5 rounded text-xs ${r.status === 'completed' ? 'bg-green-100 text-green-700' : r.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{r.status}</span></td><td className="py-2">{r.executionTimeMs ? `${r.executionTimeMs}ms` : '-'}</td><td className="py-2"><Link to={`/app/mrp/runs/${r.id}`}><Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button></Link></td></tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
    </div>
  );
}
