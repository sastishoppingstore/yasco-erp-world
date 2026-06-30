import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";

export default function ConnectorCreate() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [form, setForm] = useState({ connectorName: "", connectorType: "mysql" });
  const create = trpc.etl.createConnector.useMutation({ onSuccess: () => { utils.etl.listConnectors.refetch(); navigate("/app/etl/connectors"); } });

  return (
    <div className="max-w-xl space-y-4">
      <h2 className="text-2xl font-bold">Create Connector</h2>
      <Card><CardContent className="space-y-4 pt-6">
        <div><Label>Connector Name</Label><Input value={form.connectorName} onChange={e => setForm({...form, connectorName: e.target.value})} /></div>
        <div><Label>Type</Label><Select value={form.connectorType} onValueChange={v => setForm({...form, connectorType: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="mysql">MySQL</SelectItem><SelectItem value="postgres">PostgreSQL</SelectItem><SelectItem value="s3">S3</SelectItem><SelectItem value="ftp">FTP</SelectItem><SelectItem value="http">HTTP</SelectItem><SelectItem value="csv">CSV</SelectItem><SelectItem value="excel">Excel</SelectItem><SelectItem value="api">API</SelectItem><SelectItem value="custom">Custom</SelectItem></SelectContent></Select></div>
        <Button onClick={() => create.mutate(form as any)} disabled={create.isPending}>Create Connector</Button>
      </CardContent></Card>
    </div>
  );
}
