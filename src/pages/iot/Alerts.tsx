import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/providers/trpc";
import { Plus, Thermometer, AlertTriangle, Activity } from "lucide-react";

export default function IotAlertsPage() {
  const { data: devices } = trpc.iot.listDevices.useQuery();
  const { data: alerts, refetch } = trpc.iot.listThresholds.useQuery();
  const setThreshold = trpc.iot.setThreshold.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ deviceId: "", sensorType: "", minValue: "", maxValue: "" });

  const handleCreate = () => {
    setThreshold.mutate({
      deviceId: Number(form.deviceId), sensorType: form.sensorType,
      minValue: form.minValue ? Number(form.minValue) : undefined,
      maxValue: form.maxValue ? Number(form.maxValue) : undefined,
    });
    setForm({ deviceId: "", sensorType: "", minValue: "", maxValue: "" });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Threshold Alerts</h2><p className="text-sm text-slate-500">Configure threshold-based alerts for IoT devices</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Create Alert</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Threshold Alert</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Device</Label>
                <select value={form.deviceId} onChange={e => setForm(f => ({ ...f, deviceId: e.target.value }))} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                  <option value="">Select device...</option>
                  {devices?.map((d: any) => <option key={d.id} value={d.id}>{d.name} ({d.deviceId})</option>)}
                </select>
              </div>
              <div><Label>Sensor Type</Label><Input value={form.sensorType} onChange={e => setForm(f => ({ ...f, sensorType: e.target.value }))} placeholder="temperature, humidity, weight, gps_speed" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Min Value</Label><Input type="number" value={form.minValue} onChange={e => setForm(f => ({ ...f, minValue: e.target.value }))} placeholder="e.g. 0" /></div>
                <div><Label>Max Value</Label><Input type="number" value={form.maxValue} onChange={e => setForm(f => ({ ...f, maxValue: e.target.value }))} placeholder="e.g. 40" /></div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={!form.deviceId || !form.sensorType}>Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {!alerts?.length ? (
          <Card><CardContent className="py-12 text-center text-slate-500">No threshold alerts configured.</CardContent></Card>
        ) : alerts.map((alert: any) => (
          <Card key={alert.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                  <Thermometer className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-medium">{alert.sensorType} <Badge variant="outline" className="ml-2 text-xs">Device #{alert.deviceId}</Badge></p>
                  <p className="text-xs text-slate-500">
                    {alert.minValue !== undefined ? `Below ${alert.minValue} triggers alert` : ""}
                    {alert.minValue !== undefined && alert.maxValue !== undefined ? " | " : ""}
                    {alert.maxValue !== undefined ? `Above ${alert.maxValue} triggers alert` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {alert.enabled ? (
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-100 text-gray-800">Disabled</Badge>
                )}
                <Switch defaultChecked={alert.enabled} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
