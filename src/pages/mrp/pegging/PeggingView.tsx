import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";

export default function PeggingView() {
  const [productId, setProductId] = useState(0);
  const { data, refetch } = trpc.mrp.peggingGraph.useQuery({ productId }, { enabled: productId > 0 });
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Pegging View</h2>
      <Card><CardContent className="p-4 flex gap-4 items-end">
        <div><Label>Product ID</Label><Input type="number" value={productId || ''} onChange={e => setProductId(Number(e.target.value))} /></div>
        <Button onClick={() => refetch()}>Search</Button>
      </CardContent></Card>
      {data && (
        <Card><CardHeader><CardTitle>Pegging Records for Product #{productId}</CardTitle></CardHeader><CardContent>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left"><th className="pb-2 font-medium">Demand ID</th><th className="pb-2 font-medium">Order ID</th><th className="pb-2 font-medium">Quantity</th><th className="pb-2 font-medium">MRP Run</th></tr></thead>
            <tbody>
              {data.records.map((rec: any) => (
                <tr key={rec.id} className="border-b last:border-0"><td className="py-2">{rec.demandId}</td><td className="py-2">{rec.orderId}</td><td className="py-2">{rec.quantity}</td><td className="py-2">{rec.mrpRunId}</td></tr>
              ))}
            </tbody>
          </table>
        </CardContent></Card>
      )}
    </div>
  );
}
