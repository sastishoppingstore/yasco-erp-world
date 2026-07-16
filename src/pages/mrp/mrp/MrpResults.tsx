import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";

export default function MrpResults() {
  const { data: netReqs, refetch } = trpc.mrp.netRequirementsList.useQuery();
  const { data: plannedOrders } = trpc.mrp.plannedOrderList.useQuery();
  const release = trpc.mrp.releasePlannedOrder.useMutation({ onSuccess: () => refetch() });
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">MRP Results</h2>
      <Card><CardHeader><CardTitle>Net Requirements</CardTitle></CardHeader><CardContent>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left"><th className="pb-2 font-medium">Product</th><th className="pb-2 font-medium">Period</th><th className="pb-2 font-medium">Net Requirement</th></tr></thead>
          <tbody>
            {netReqs?.map((nr: any) => (
              <tr key={nr.id} className="border-b last:border-0"><td className="py-2">{nr.productId}</td><td className="py-2">{nr.periodStart} - {nr.periodEnd}</td><td className="py-2 font-semibold">{nr.netRequirement}</td></tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Planned Orders</CardTitle></CardHeader><CardContent>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left"><th className="pb-2 font-medium">Product</th><th className="pb-2 font-medium">Type</th><th className="pb-2 font-medium">Quantity</th><th className="pb-2 font-medium">Due</th><th className="pb-2 font-medium">Status</th><th className="pb-2 font-medium"></th></tr></thead>
          <tbody>
            {plannedOrders?.map((o: any) => (
              <tr key={o.id} className="border-b last:border-0"><td className="py-2">{o.productId}</td><td className="py-2">{o.orderType}</td><td className="py-2">{o.quantity}</td><td className="py-2">{o.dueDate}</td><td className="py-2">{o.status}</td><td className="py-2">{o.status === 'planned' && <Button size="sm" onClick={() => release.mutate({ id: o.id })} disabled={release.isPending}>Release</Button>}</td></tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
    </div>
  );
}
