import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";

export default function TransformationCreate() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [form, setForm] = useState({ transformationName: "", transformationType: "column_map" });
  const create = trpc.etl.createTransformation.useMutation({ onSuccess: () => { utils.etl.listTransformations.refetch(); navigate("/app/etl/transformations"); } });

  return (
    <div className="max-w-xl space-y-4">
      <h2 className="text-2xl font-bold">Create Transformation</h2>
      <Card><CardContent className="space-y-4 pt-6">
        <div><Label>Name</Label><Input value={form.transformationName} onChange={e => setForm({...form, transformationName: e.target.value})} /></div>
        <div><Label>Type</Label><Select value={form.transformationType} onValueChange={v => setForm({...form, transformationType: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="column_map">Column Map</SelectItem><SelectItem value="datatype_convert">Datatype Convert</SelectItem><SelectItem value="lookup">Lookup</SelectItem><SelectItem value="calculate">Calculate</SelectItem><SelectItem value="conditional">Conditional</SelectItem><SelectItem value="aggregate">Aggregate</SelectItem><SelectItem value="sort">Sort</SelectItem><SelectItem value="dedupe">Dedupe</SelectItem></SelectContent></Select></div>
        <Button onClick={() => create.mutate(form as any)} disabled={create.isPending}>Create</Button>
      </CardContent></Card>
    </div>
  );
}
