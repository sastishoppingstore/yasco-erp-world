import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { useParams } from "react-router";
import { useState } from "react";

export default function CubeDesigner() {
  const { id } = useParams();
  const cubeId = Number(id);
  const { data: cube, refetch } = trpc.olap.getCube.useQuery({ id: cubeId });
  const { data: dimensions } = trpc.olap.dimensionList.useQuery();
  const addDim = trpc.olap.addCubeDimension.useMutation({ onSuccess: () => refetch() });
  const addMeas = trpc.olap.addCubeMeasure.useMutation({ onSuccess: () => refetch() });
  const [measure, setMeasure] = useState({ measureName: "", aggregationType: "sum" });

  if (!cube) return <div className="p-6 text-slate-500">Loading cube...</div>;

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">{cube.cubeName}</h2><p className="text-sm text-slate-500">{cube.cubeCode} — Cube Designer</p></div>
      <div className="grid grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle>Dimensions</CardTitle></CardHeader><CardContent className="space-y-2">
          {cube.dimensions?.map((d: any) => <div key={d.id} className="flex items-center justify-between p-2 rounded border text-sm"><span>{d.roleName || `Dimension #${d.dimensionId}`}</span><Badge>{d.dimensionType}</Badge></div>)}
          {dimensions?.map((d: any) => (
            <Button key={d.id} size="sm" variant="outline" className="w-full justify-start text-xs" onClick={() => addDim.mutate({ cubeId, dimensionId: d.id })}>+ {d.dimensionName}</Button>
          ))}
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Measures</CardTitle></CardHeader><CardContent className="space-y-2">
          {cube.measures?.map((m: any) => <div key={m.id} className="flex items-center justify-between p-2 rounded border text-sm"><span>{m.measureName}</span><Badge>{m.aggregationType}</Badge></div>)}
          <div className="flex gap-2 pt-2"><input className="flex-1 px-2 py-1 text-sm border rounded" placeholder="Measure name" value={measure.measureName} onChange={e => setMeasure({...measure, measureName: e.target.value})} /><Button size="sm" onClick={() => { addMeas.mutate({ cubeId, measureName: measure.measureName, aggregationType: measure.aggregationType as any }); setMeasure({ measureName: "", aggregationType: "sum" }); }}>Add</Button></div>
        </CardContent></Card>
      </div>
    </div>
  );
}
