import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { useOnlineUsers } from "@/lib/wsClient";
import { Users, MessageSquare, Bell, Activity } from "lucide-react";

export default function CollaborationDashboardPage() {
  const { data: dashboard } = trpc.ws.wsDashboard.useQuery();
  const onlineUsers = useOnlineUsers();

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Real-Time Collaboration</h2><p className="text-sm text-slate-500">WebSocket-powered team collaboration</p></div>
      <div className="grid grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Active Sessions</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{dashboard?.activeSessions ?? 0}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Online Users</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-green-500">{dashboard?.onlineUsers ?? 0}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Unread Notifications</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-amber-500">{dashboard?.unreadNotifications ?? 0}</p></CardContent></Card>
      </div>
      <div className="flex gap-2">
        <Link to="/app/collaboration/sessions"><Button><MessageSquare className="w-4 h-4 mr-2" />Sessions</Button></Link>
        <Link to="/app/collaboration/presence"><Button variant="outline"><Users className="w-4 h-4 mr-2" />Presence</Button></Link>
        <Link to="/app/collaboration/notifications"><Button variant="outline"><Bell className="w-4 h-4 mr-2" />Notifications</Button></Link>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle>Online Now</CardTitle></CardHeader><CardContent className="space-y-2">
          {onlineUsers.map((u: any) => (
            <div key={u.userId} className="flex items-center gap-3 p-2 rounded border text-sm"><div className="w-2 h-2 rounded-full bg-green-500" /><span>User #{u.userId}</span><Badge variant="outline">{u.status}</Badge></div>
          ))}
          {!onlineUsers.length && <p className="text-sm text-slate-500 text-center py-4">No users online</p>}
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader><CardContent className="space-y-2">
          {dashboard?.recentActivities?.map((a: any) => (
            <div key={a.id} className="flex items-center justify-between p-2 rounded border text-sm"><span className="text-slate-600">{a.activityType}</span><span className="text-xs text-slate-400">{new Date(a.createdAt).toLocaleString()}</span></div>
          ))}
        </CardContent></Card>
      </div>
    </div>
  );
}
