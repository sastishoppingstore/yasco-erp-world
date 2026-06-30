import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import { Plus } from "lucide-react";

export default function CapacityList() {
  const { data: resources } = trpc.mrp.resourceList.useQuery();
  const { data: rccps } = trpc.mrp.rccpList.useQuery();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Capacity Planning</h2></div>
        <Link to="/app/mrp/capacity/resource/new"><Button><Plus className="w-4 h-4 mr-2" />New Resource</Button></Link>
      </div>
      <Card>
        <CardHeader><CardTitle>Resources</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left"><th className="pb-2 font-medium">Code</th><th className="pb-2 font-medium">Name</th><th className="pb-2 font-medium">Type</th><th className="pb-2 font-medium">Hours</th><th className="pb-2 font-medium">Efficiency</th><th className="pb-2 font-medium">Cost/hr</th><th className="pb-2 font-medium">Status</th></tr></thead>
            <tbody>
              {resources?.map((r: any) => (
                <tr key={r.id} className="border-b last:border-0"><td className="py-2">{r.resourceCode}</td><td className="py-2">{r.resourceName}</td><td className="py-2">{r.resourceType}</td><td className="py-2">{r.availableHours}</td><td className="py-2">{r.efficiencyPercent}%</td><td className="py-2">{r.costPerHour}</td><td className="py-2"><span className={`px-2 py-0.5 rounded text-xs ${r.status === 'active' ? 'bg-green-100 text-green-700' : r.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'}`}>{r.status}</span></td></tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Rough-Cut Capacity Plans</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left"><th className="pb-2 font-medium">Resource</th><th className="pb-2 font-medium">Period</th><th className="pb-2 font-medium">Available</th><th className="pb-2 font-medium">Required</th><th className="pb-2 font-medium">Overload</th><th className="pb-2 font-medium">Status</th></tr></thead>
            <tbody>
              {rccps?.map((p: any) => (
                <tr key={p.id} className="border-b last:border-0"><td className="py-2">{p.resourceId}</td><td className="py-2">{p.periodStart} - {p.periodEnd}</td><td className="py-2">{p.availableCapacity}</td><td className="py-2">{p.requiredCapacity}</td><td className="py-2 text-red-600">{p.overloadPercent}%</td><td className="py-2">{p.status}</td></tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
