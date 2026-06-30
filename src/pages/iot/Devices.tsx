import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/providers/trpc";
import { Plus, Server, Wifi, WifiOff, Trash2, Activity } from "lucide-react";

export default function IotDevicesPage() {
  const { data: devices, refetch } = trpc.iot.listDevices.useQuery();
  const registerDevice = trpc.iot.registerDevice.useMutation({ onSuccess: () => refetch() });
  const deleteDevice = trpc.iot.deleteDevice.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ deviceId: "", name: "", type: "", location: "" });

  const handleRegister = () => {
    registerDevice.mutate(form);
    setForm({ deviceId: "", name: "", type: "", location: "" });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">IoT Devices</h2><p className="text-sm text-slate-500">Manage registered IoT devices</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Register Device</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Register New Device</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Device ID *</Label><Input value={form.deviceId} onChange={e => setForm(f => ({ ...f, deviceId: e.target.value }))} placeholder="e.g. sensor-001" /></div>
              <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Cold Storage #1" /></div>
              <div><Label>Type *</Label><Input value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} placeholder="temperature_sensor, gps_tracker, weight_scale" /></div>
              <div><Label>Location</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Warehouse B, Riyadh" /></div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleRegister} disabled={!form.deviceId || !form.name || !form.type}>Register</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {!devices?.length ? (
          <Card><CardContent className="py-12 text-center text-slate-500">No devices registered. Click "Register Device" to add one.</CardContent></Card>
        ) : devices.map((device: any) => (
          <Card key={device.deviceId}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Server className="w-6 h-6 text-slate-400" />
                <div>
                  <p className="font-medium">{device.name}</p>
                  <p className="text-xs text-slate-500">{device.type} · {device.deviceId}{device.location ? ` · ${device.location}` : ""}</p>
                  {device.lastSeen && <p className="text-xs text-slate-400">Last seen: {new Date(device.lastSeen).toLocaleString()}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {device.isOnline ? (
                  <Badge variant="outline" className="bg-green-100 text-green-800"><Wifi className="w-3 h-3 mr-1" />Online</Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-100 text-red-800"><WifiOff className="w-3 h-3 mr-1" />Offline</Badge>
                )}
                <Button variant="ghost" size="sm" onClick={() => deleteDevice.mutate({ deviceId: device.deviceId })}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
