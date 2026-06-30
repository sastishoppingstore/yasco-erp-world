import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";

export default function CubeQueryBuilder() {
  const { data: cubes } = trpc.olap.listCubes.useQuery();
  const [selectedCube, setSelectedCube] = useState<number | null>(null);
  const { data: cubeData } = trpc.olap.getCubeData.useQuery({ cubeId: selectedCube || 0 }, { enabled: !!selectedCube });

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Cube Query Builder</h2><p className="text-sm text-slate-500">Interactive OLAP query interface</p></div>
      <div className="grid grid-cols-4 gap-4">
        {cubes?.map((c: any) => (
          <Card key={c.id} className={`cursor-pointer hover:shadow-md ${selectedCube === c.id ? "ring-2 ring-blue-500" : ""}`} onClick={() => setSelectedCube(c.id)}><CardHeader><CardTitle className="text-sm">{c.cubeName}</CardTitle></CardHeader><CardContent><p className="text-xs text-slate-500">{c.cubeCode}</p></CardContent></Card>
        ))}
      </div>
      {cubeData && (
        <Card><CardHeader><CardTitle>Cube: {cubeData.cube.cubeName}</CardTitle></CardHeader><CardContent>
          <div className="mb-4"><h4 className="text-sm font-medium mb-2">Dimensions</h4><div className="flex flex-wrap gap-2">{
            cubeData.dimensions?.map((d: any) => <span key={d.id} className="px-2 py-1 bg-slate-100 rounded text-xs">{d.roleName || `Dim #${d.dimensionId}`}</span>)
          }</div></div>
          <div><h4 className="text-sm font-medium mb-2">Measures</h4><div className="flex flex-wrap gap-2">{
            cubeData.measures?.map((m: any) => <span key={m.id} className="px-2 py-1 bg-blue-100 rounded text-xs">{m.measureName} ({m.aggregationType})</span>)
          }</div></div>
          <div className="mt-6 p-8 text-center text-slate-400 border-2 border-dashed rounded"><p>Drag dimensions to rows/columns and measures to values</p><p className="text-xs mt-1">Interactive pivot table will appear here</p></div>
        </CardContent></Card>
      )}
    </div>
  );
}
