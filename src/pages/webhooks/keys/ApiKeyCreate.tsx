import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";

const SCOPE_OPTIONS = ["invoices:read", "invoices:write", "orders:read", "orders:write", "customers:read", "products:read", "*"];

export default function ApiKeyCreate() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [form, setForm] = useState({ keyName: "", permissions: [] as string[] });
  const [result, setResult] = useState<string | null>(null);
  const create = trpc.webhooks.generateApiKey.useMutation({
    onSuccess: (data) => {
      setResult(data.apiKey);
      utils.webhooks.listApiKeys.refetch();
    },
  });

  const toggleScope = (s: string) => {
    setForm(f => ({ ...f, permissions: f.permissions.includes(s) ? f.permissions.filter(p => p !== s) : [...f.permissions, s] }));
  };

  return (
    <div className="max-w-xl space-y-4">
      <h2 className="text-2xl font-bold">Generate API Key</h2>
      {result ? (
        <Card><CardContent className="pt-6 space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded text-sm"><p className="font-bold text-amber-800">Save this key - it will not be shown again!</p><code className="block mt-2 p-2 bg-white rounded text-xs break-all">{result}</code></div>
          <Button onClick={() => navigate("/app/webhooks/keys")}>Done</Button>
        </CardContent></Card>
      ) : (
        <Card><CardContent className="space-y-4 pt-6">
          <div><Label>Key Name</Label><Input value={form.keyName} onChange={e => setForm({...form, keyName: e.target.value})} /></div>
          <div><Label>Permissions</Label><div className="flex flex-wrap gap-2 mt-1">{
            SCOPE_OPTIONS.map(s => (
              <button key={s} onClick={() => toggleScope(s)} className={`px-3 py-1 rounded-full text-xs border ${form.permissions.includes(s) ? "bg-blue-100 border-blue-300 text-blue-700" : "bg-white border-slate-200 text-slate-600"}`}>{s}</button>
            ))
          }</div></div>
          <Button onClick={() => create.mutate(form as any)} disabled={create.isPending}>Generate Key</Button>
        </CardContent></Card>
      )}
    </div>
  );
}
