import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";

export default function PickingTaskList() {
  const { data: tasks, refetch } = trpc.wms.pickingTaskList.useQuery();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Picking Tasks</h2></div>
        <div className="flex gap-2">
          <Link to="/app/wms/picking/wave"><Button variant="outline">Waves</Button></Link>
          <Link to="/app/wms/picking/execute"><Button>Execute Pick</Button></Link>
        </div>
      </div>
      <Card><CardHeader><CardTitle>All Tasks</CardTitle></CardHeader><CardContent>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left"><th className="pb-2 font-medium">Task #</th><th className="pb-2 font-medium">Product</th><th className="pb-2 font-medium">Quantity</th><th className="pb-2 font-medium">Source</th><th className="pb-2 font-medium">Status</th><th className="pb-2 font-medium">Priority</th></tr></thead>
          <tbody>
            {tasks?.map((t: any) => (
              <tr key={t.id} className="border-b last:border-0"><td className="py-2">{t.taskNumber}</td><td className="py-2">{t.productId}</td><td className="py-2">{t.quantity}</td><td className="py-2">{t.sourceType}</td><td className="py-2"><span className={`px-2 py-0.5 rounded text-xs ${t.status === 'completed' ? 'bg-green-100 text-green-700' : t.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : t.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{t.status}</span></td><td className="py-2">{t.priority}</td></tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
    </div>
  );
}
