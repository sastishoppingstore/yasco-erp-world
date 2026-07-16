import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { Activity, Wifi, WifiOff, Thermometer, AlertTriangle, Server, Gauge } from "lucide-react";

export default function IotDashboardPage() {
  const { data: dashboard, refetch } = trpc.iot.getDashboard.useQuery();
  const { data: alerts } = trpc.iot.listThresholds.useQuery();

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">IoT Dashboard</h2><p className="text-sm text-slate-500">Real-time device monitoring and sensor data</p></div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Total Devices</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{dashboard?.totalDevices ?? 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Online</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-2">
            <p className="text-3xl font-bold text-green-500">{dashboard?.onlineDevices ?? 0}</p>
            <Wifi className="w-5 h-5 text-green-500" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Offline</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-2">
            <p className="text-3xl font-bold text-red-500">{dashboard?.offlineDevices ?? 0}</p>
            <WifiOff className="w-5 h-5 text-red-500" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Active Alerts</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-2">
            <p className="text-3xl font-bold text-amber-500">{dashboard?.activeAlerts ?? 0}</p>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Connected Devices</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {!dashboard?.devices.length ? (
              <p className="text-sm text-slate-500 text-center py-8">No devices registered yet.</p>
            ) : dashboard.devices.map((device: any) => (
              <div key={device.deviceId} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Server className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="font-medium text-sm">{device.name}</p>
                    <p className="text-xs text-slate-500">{device.type} · {device.deviceId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {device.isOnline ? (
                    <Badge variant="outline" className="bg-green-100 text-green-800"><Wifi className="w-3 h-3 mr-1" />Online</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-100 text-red-800"><WifiOff className="w-3 h-3 mr-1" />Offline</Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Threshold Alerts</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {!alerts?.length ? (
              <p className="text-sm text-slate-500 text-center py-8">No threshold alerts configured.</p>
            ) : alerts.map((alert: any) => (
              <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Thermometer className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium">{alert.sensorType}</p>
                    <p className="text-xs text-slate-500">
                      {alert.minValue !== undefined && `Min: ${alert.minValue}`}
                      {alert.minValue !== undefined && alert.maxValue !== undefined && " · "}
                      {alert.maxValue !== undefined && `Max: ${alert.maxValue}`}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={alert.enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                  {alert.enabled ? "Active" : "Disabled"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
