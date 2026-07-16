import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";

export default function MappingCreate() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [form, setForm] = useState({ mappingName: "", direction: "outbound" });
  const create = trpc.edi.createMapping.useMutation({ onSuccess: () => { utils.edi.listMappings.refetch(); navigate("/app/edi/documents/mappings"); } });

  return (
    <div className="max-w-xl space-y-4">
      <h2 className="text-2xl font-bold">Create Mapping</h2>
      <Card><CardContent className="space-y-4 pt-6">
        <div><Label>Mapping Name</Label><Input value={form.mappingName} onChange={e => setForm({...form, mappingName: e.target.value})} /></div>
        <div><Label>Direction</Label><Select value={form.direction} onValueChange={v => setForm({...form, direction: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="inbound">Inbound</SelectItem><SelectItem value="outbound">Outbound</SelectItem></SelectContent></Select></div>
        <Button onClick={() => create.mutate(form as any)} disabled={create.isPending}>Create Mapping</Button>
      </CardContent></Card>
    </div>
  );
}
