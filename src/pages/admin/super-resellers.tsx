import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Settings, Key, User, Save } from "lucide-react";

export default function SuperResellersPage() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [editLimit, setEditLimit] = useState<{ open: boolean; userId: number; userName: string; maxKeys: number }>({ open: false, userId: 0, userName: "", maxKeys: 0 });

  const { data: resellerLimits, isLoading } = trpc.licenseKey.resellerLimits.list.useQuery(undefined, {
    enabled: user?.role === "super_admin",
  });
  const setLimitMutation = trpc.licenseKey.resellerLimits.setLimit.useMutation({
    onSuccess: () => { utils.licenseKey.resellerLimits.list.invalidate(); setEditLimit(f => ({ ...f, open: false })); },
  });

  if (user?.role !== "super_admin") {
    return <div className="text-center py-12 text-slate-500">Only Super Admin can access this page.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Reseller Management</h2>
        <p className="text-sm text-slate-500">Set key generation limits for resellers</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Resellers & Key Limits</CardTitle><CardDescription>Manage how many keys each reseller can generate</CardDescription></CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : !resellerLimits?.length ? (
            <p className="text-sm text-slate-500">No resellers found. Add reseller users first.</p>
          ) : (
            <div className="space-y-3">
              {resellerLimits.map((rl: any) => (
                <div key={rl.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{rl.reseller?.name || `Reseller #${rl.resellerUserId}`}</span>
                        <Badge variant="outline" className="bg-purple-100 text-purple-800">Reseller</Badge>
                      </div>
                      <p className="text-xs text-slate-500">{rl.reseller?.email || ""}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs">
                        <span className="text-slate-500">Max Keys: <strong>{rl.maxKeys}</strong></span>
                        <span className="text-slate-500">Used: <strong>{rl.keysUsed}</strong></span>
                        <span className={`${rl.maxKeys - rl.keysUsed > 0 ? "text-green-600" : "text-red-600"}`}>
                          Remaining: <strong>{rl.maxKeys - rl.keysUsed}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setEditLimit({
                    open: true, userId: rl.resellerUserId, userName: rl.reseller?.name || `Reseller #${rl.resellerUserId}`, maxKeys: rl.maxKeys,
                  })}>
                    <Settings className="w-4 h-4 mr-1" />Set Limit
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editLimit.open} onOpenChange={(o) => setEditLimit(f => ({ ...f, open: o }))}>
        <DialogContent>
          <DialogHeader><DialogTitle>Set Key Limit for {editLimit.userName}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Maximum Keys Allowed</Label>
              <Input type="number" value={editLimit.maxKeys} onChange={e => setEditLimit(f => ({ ...f, maxKeys: Number(e.target.value) }))} />
            </div>
            <Button className="w-full" disabled={setLimitMutation.isPending}
              onClick={() => setLimitMutation.mutate({ resellerUserId: editLimit.userId, maxKeys: editLimit.maxKeys })}>
              <Save className="w-4 h-4 mr-2" />Save Limit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
