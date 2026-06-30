import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import { Webhook, Key, Activity, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WebhookDashboardPage() {
  const { data: dashboard } = trpc.webhooks.webhookDashboard.useQuery();
  const { data: usage } = trpc.webhooks.apiUsageDashboard.useQuery();

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Webhook & API Gateway</h2><p className="text-sm text-slate-500">Manage webhooks, API keys, and event delivery</p></div>
      <div className="grid grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Active Subscriptions</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{dashboard?.activeSubscriptions ?? 0}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Failed Deliveries</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-red-500">{dashboard?.failedDeliveries ?? 0}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Total Events</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{dashboard?.totalEvents ?? 0}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">API Keys</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{usage?.totalKeys ?? 0}</p></CardContent></Card>
      </div>
      <div className="flex gap-2">
        <Link to="/app/webhooks/subscriptions"><Button><Webhook className="w-4 h-4 mr-2" />Subscriptions</Button></Link>
        <Link to="/app/webhooks/keys"><Button variant="outline"><Key className="w-4 h-4 mr-2" />API Keys</Button></Link>
        <Link to="/app/webhooks/logs"><Button variant="outline"><Activity className="w-4 h-4 mr-2" />Delivery Logs</Button></Link>
      </div>
      <Card><CardHeader><CardTitle>Recent Deliveries</CardTitle></CardHeader><CardContent className="space-y-2">
        {dashboard?.recentDeliveries?.map((d: any) => (
          <div key={d.id} className="flex items-center justify-between p-2 rounded border text-sm"><span>{d.eventType}</span><span className={d.status === "delivered" ? "text-green-600" : "text-red-600"}>{d.status}</span><span className="text-xs text-slate-400">{new Date(d.createdAt).toLocaleString()}</span></div>
        ))}
      </CardContent></Card>
    </div>
  );
}
