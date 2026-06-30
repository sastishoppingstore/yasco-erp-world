import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";

export default function RightOfUseAssetList() {
  const { data: assets } = trpc.ifrs16.rightOfUseAssetList.useQuery(undefined);

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800", fully_depreciated: "bg-gray-100 text-gray-800", disposed: "bg-red-100 text-red-800",
  };

  const assetsData = Array.isArray(assets) ? assets : [];

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Right of Use Assets</h2><p className="text-slate-500">ROU assets recognized under IFRS 16</p></div>
      <Card>
        <CardHeader><CardTitle>All ROU Assets</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left"><th className="pb-2 font-medium">Asset Name</th><th className="pb-2 font-medium">Cost</th><th className="pb-2 font-medium">Accum. Depr.</th><th className="pb-2 font-medium">Net Book Value</th><th className="pb-2 font-medium">Status</th></tr></thead>
            <tbody>
              {assetsData?.map((a: any) => {
                const asset = a.right_of_use_assets || a;
                return (
                  <tr key={asset.id} className="border-b last:border-0">
                    <td className="py-2">{asset.assetName}</td>
                    <td className="py-2">{asset.cost}</td>
                    <td className="py-2">{asset.accumulatedDepreciation}</td>
                    <td className="py-2">{asset.netBookValue}</td>
                    <td className="py-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[asset.status]}`}>{asset.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
