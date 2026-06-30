import { useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";

export default function MrpRunDetail() {
  const { id } = useParams();
  const { data } = trpc.mrp.mrpRunGet.useQuery({ id: Number(id) });
  if (!data) return null;
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">MRP Run #{id} Details</h2>
      <Card><CardHeader><CardTitle>Net Requirements</CardTitle></CardHeader><CardContent>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left"><th className="pb-2 font-medium">Product</th><th className="pb-2 font-medium">Period</th><th className="pb-2 font-medium">Gross</th><th className="pb-2 font-medium">Sched Rec</th><th className="pb-2 font-medium">On Hand</th><th className="pb-2 font-medium">Net Req</th><th className="pb-2 font-medium">Order Receipt</th><th className="pb-2 font-medium">Order Release</th></tr></thead>
          <tbody>
            {data.netRequirements?.map((nr: any) => (
              <tr key={nr.id} className="border-b last:border-0"><td className="py-2">{nr.productId}</td><td className="py-2">{nr.periodStart} - {nr.periodEnd}</td><td className="py-2">{nr.grossRequirement}</td><td className="py-2">{nr.scheduledReceipts}</td><td className="py-2">{nr.projectedOnHand}</td><td className="py-2 font-semibold">{nr.netRequirement}</td><td className="py-2">{nr.plannedOrderReceipt}</td><td className="py-2">{nr.plannedOrderRelease}</td></tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Planned Orders</CardTitle></CardHeader><CardContent>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left"><th className="pb-2 font-medium">Product</th><th className="pb-2 font-medium">Type</th><th className="pb-2 font-medium">Quantity</th><th className="pb-2 font-medium">Due Date</th><th className="pb-2 font-medium">Status</th></tr></thead>
          <tbody>
            {data.plannedOrders?.map((o: any) => (
              <tr key={o.id} className="border-b last:border-0"><td className="py-2">{o.productId}</td><td className="py-2">{o.orderType}</td><td className="py-2">{o.quantity}</td><td className="py-2">{o.dueDate}</td><td className="py-2">{o.status}</td></tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
    </div>
  );
}
