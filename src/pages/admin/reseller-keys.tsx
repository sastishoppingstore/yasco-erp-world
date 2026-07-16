import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/providers/trpc";
import { Key, Plus, Copy, CheckCircle2, Clock, XCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function ResellerKeysPage() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [newKeyOpen, setNewKeyOpen] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<number>>(new Set());
  const [form, setForm] = useState({ companyName: "", plan: "standard", maxUsers: 5, maxDevices: 1, validDays: 365 });
  const [newLicenseKey, setNewLicenseKey] = useState<string | null>(null);

  const { data: quota } = trpc.licenseKey.reseller.myQuota.useQuery(undefined, { enabled: user?.role === "reseller" });
  const { data: myKeys, isLoading: keysLoading } = trpc.licenseKey.reseller.myKeys.useQuery(undefined, { enabled: user?.role === "reseller" });
  const generateMutation = trpc.licenseKey.reseller.generate.useMutation({
    onSuccess: (data) => {
      setNewLicenseKey(data.licenseKey);
      utils.licenseKey.reseller.myKeys.invalidate();
      utils.licenseKey.reseller.myQuota.invalidate();
    },
  });

  const statusBadge = (status: string) => {
    const map: Record<string, { color: string; icon: any }> = {
      pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-300", icon: Clock },
      approved: { color: "bg-blue-100 text-blue-800 border-blue-300", icon: CheckCircle2 },
      active: { color: "bg-green-100 text-green-800 border-green-300", icon: CheckCircle2 },
      rejected: { color: "bg-red-100 text-red-800 border-red-300", icon: XCircle },
      revoked: { color: "bg-gray-100 text-gray-800 border-gray-300", icon: AlertCircle },
      expired: { color: "bg-orange-100 text-orange-800 border-orange-300", icon: AlertCircle },
    };
    const s = map[status] || map.pending;
    const Icon = s.icon;
    return <Badge variant="outline" className={s.color}><Icon className="w-3 h-3 mr-1" />{status}</Badge>;
  };

  if (user?.role !== "reseller") {
    return <div className="text-center py-12 text-slate-500">Only resellers can access this page.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My License Keys</h2>
          <p className="text-sm text-slate-500">Generate and manage your license keys</p>
        </div>
        <Dialog open={newKeyOpen} onOpenChange={(open) => { setNewKeyOpen(open); if (!open) setNewLicenseKey(null); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Generate New Key</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{newLicenseKey ? "License Key Generated" : "Generate New License Key"}</DialogTitle>
            </DialogHeader>
            {newLicenseKey ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <Label className="text-xs text-emerald-700">Your License Key</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 p-2 bg-white border rounded text-sm font-mono break-all">{newLicenseKey}</code>
                    <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(newLicenseKey); }}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-emerald-600 mt-2">Save this key. You won't be able to see it again.</p>
                </div>
                <Button className="w-full" onClick={() => { setNewKeyOpen(false); setNewLicenseKey(null); }}>Done</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} placeholder="Enter company name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Plan</Label>
                    <Select value={form.plan} onValueChange={v => setForm(f => ({ ...f, plan: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Valid Days</Label>
                    <Input type="number" value={form.validDays} onChange={e => setForm(f => ({ ...f, validDays: Number(e.target.value) }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Max Users</Label>
                    <Input type="number" value={form.maxUsers} onChange={e => setForm(f => ({ ...f, maxUsers: Number(e.target.value) }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Devices</Label>
                    <Input type="number" value={form.maxDevices} onChange={e => setForm(f => ({ ...f, maxDevices: Number(e.target.value) }))} />
                  </div>
                </div>
                <Button className="w-full" disabled={!form.companyName || generateMutation.isPending}
                  onClick={() => generateMutation.mutate(form)}>
                  {generateMutation.isPending ? "Generating..." : "Generate Key"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {quota && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Total Quota</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{quota.maxKeys}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Used</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold text-blue-600">{quota.keysUsed}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Remaining</CardTitle></CardHeader>
            <CardContent><p className={`text-2xl font-bold ${quota.remaining > 0 ? "text-green-600" : "text-red-600"}`}>{quota.remaining}</p></CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Generated Keys</CardTitle><CardDescription>All license keys you have generated</CardDescription></CardHeader>
        <CardContent>
          {keysLoading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : !myKeys?.length ? (
            <p className="text-sm text-slate-500">No keys generated yet.</p>
          ) : (
            <div className="space-y-3">
              {myKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{key.companyName}</span>
                      {statusBadge(key.status)}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Key className="w-3 h-3" />
                        {visibleKeys.has(key.id) ? key.licenseKey : key.licenseKey.slice(0, 15) + "..."}
                        <button onClick={() => {
                          const next = new Set(visibleKeys);
                          if (visibleKeys.has(key.id)) next.delete(key.id); else next.add(key.id);
                          setVisibleKeys(next);
                        }}>
                          {visibleKeys.has(key.id) ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </span>
                      <span>{key.plan}</span>
                      <span>Users: {key.maxUsers}</span>
                    </div>
                    <p className="text-xs text-slate-400">Expires: {new Date(key.expiresAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
