import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";

export default function CubeCreate() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [form, setForm] = useState({ cubeName: "", cubeCode: "", description: "" });
  const create = trpc.olap.createCube.useMutation({ onSuccess: () => { utils.olap.listCubes.refetch(); navigate("/app/olap/cubes"); } });

  return (
    <div className="max-w-xl space-y-4">
      <h2 className="text-2xl font-bold">Create Cube</h2>
      <Card><CardContent className="space-y-4 pt-6">
        <div><Label>Cube Name</Label><Input value={form.cubeName} onChange={e => setForm({...form, cubeName: e.target.value})} /></div>
        <div><Label>Cube Code</Label><Input value={form.cubeCode} onChange={e => setForm({...form, cubeCode: e.target.value})} /></div>
        <div><Label>Description</Label><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
        <Button onClick={() => create.mutate(form as any)} disabled={create.isPending}>Create Cube</Button>
      </CardContent></Card>
    </div>
  );
}
