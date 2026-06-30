import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import { Plus } from "lucide-react";

export default function MpsList() {
  const { data: mpsItems, refetch } = trpc.mrp.mpsList.useQuery();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Master Production Schedule</h2></div>
        <Link to="/app/mrp/mps/new"><Button><Plus className="w-4 h-4 mr-2" />New MPS</Button></Link>
      </div>
      <Card>
        <CardHeader><CardTitle>Scheduled Items</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left"><th className="pb-2 font-medium">Product</th><th className="pb-2 font-medium">Date</th><th className="pb-2 font-medium">Planned</th><th className="pb-2 font-medium">Confirmed</th><th className="pb-2 font-medium">Source</th><th className="pb-2 font-medium">Status</th></tr></thead>
            <tbody>
              {mpsItems?.map((mps: any) => (
                <tr key={mps.id} className="border-b last:border-0"><td className="py-2">{mps.productId}</td><td className="py-2">{mps.scheduleDate}</td><td className="py-2">{mps.plannedQuantity}</td><td className="py-2">{mps.confirmedQuantity}</td><td className="py-2">{mps.demandSource}</td><td className="py-2"><span className={`px-2 py-0.5 rounded text-xs ${mps.status === 'closed' ? 'bg-slate-100 text-slate-600' : mps.status === 'firmed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{mps.status}</span></td></tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
