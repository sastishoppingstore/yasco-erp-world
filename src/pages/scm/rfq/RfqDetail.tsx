import { useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";

export default function RfqDetail() {
  const { id } = useParams();
  const { data } = trpc.scm.rfqGet.useQuery({ id: Number(id) });
  if (!data) return null;
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">RFQ: {data.header?.rfqNumber}</h2>
      <Card><CardHeader><CardTitle>Items</CardTitle></CardHeader><CardContent>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left"><th className="pb-2 font-medium">Product</th><th className="pb-2 font-medium">Quantity</th><th className="pb-2 font-medium">Unit</th><th className="pb-2 font-medium">Target Price</th></tr></thead>
          <tbody>
            {data.items?.map((item: any) => (
              <tr key={item.id} className="border-b last:border-0"><td className="py-2">{item.productName}</td><td className="py-2">{item.quantity}</td><td className="py-2">{item.unit}</td><td className="py-2">{item.targetPrice}</td></tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Supplier Quotes</CardTitle></CardHeader><CardContent>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left"><th className="pb-2 font-medium">Supplier</th><th className="pb-2 font-medium">Submitted</th><th className="pb-2 font-medium">Valid Until</th><th className="pb-2 font-medium">Status</th></tr></thead>
          <tbody>
            {data.quotes?.map((q: any) => (
              <tr key={q.id} className="border-b last:border-0"><td className="py-2">{q.supplierId}</td><td className="py-2">{new Date(q.submittedDate).toLocaleDateString()}</td><td className="py-2">{q.validUntil}</td><td className="py-2">{q.status}</td></tr>
            ))}
          </tbody>
        </table>
        {data.quoteLines?.length > 0 && (
          <table className="w-full text-sm mt-4">
            <thead><tr className="border-b text-left"><th className="pb-2 font-medium">Quote Line</th><th className="pb-2 font-medium">Unit Price</th><th className="pb-2 font-medium">Quantity</th><th className="pb-2 font-medium">Total</th></tr></thead>
            <tbody>
              {data.quoteLines.map((ql: any) => (
                <tr key={ql.id} className="border-b last:border-0"><td className="py-2">Item #{ql.rfqItemId}</td><td className="py-2">{ql.unitPrice}</td><td className="py-2">{ql.quantity}</td><td className="py-2">{ql.totalPrice}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent></Card>
    </div>
  );
}
