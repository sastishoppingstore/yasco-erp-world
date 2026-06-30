import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { Bell, Search, CheckCheck, Check, AlertCircle, Info, AlertTriangle } from "lucide-react";

const typeIcons: Record<string, any> = {
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle2,
};
import { CheckCircle2 } from "lucide-react";

export default function NotificationCenter() {
  const [search, setSearch] = useState("");
  const { data, isLoading, refetch } = trpc.ws.listNotifications.useQuery();
  const markRead = trpc.ws.markNotificationRead.useMutation({ onSuccess: () => refetch() });
  const markAllRead = trpc.ws.markAllNotificationsRead.useMutation({ onSuccess: () => refetch() });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Card><CardContent className="p-6 space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-16 w-full" />)}</CardContent></Card>
      </div>
    );
  }

  const filtered = (data?.items || []).filter((n: any) =>
    !search || n.title?.toLowerCase().includes(search.toLowerCase()) || n.body?.toLowerCase().includes(search.toLowerCase())
  );

  const unreadCount = (data?.items || []).filter((n: any) => !n.isRead).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-amber-500" />
          <h2 className="text-2xl font-bold">Notifications</h2>
          {unreadCount > 0 && <Badge>{unreadCount} unread</Badge>}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending}>
            <CheckCheck className="w-4 h-4 mr-2" />Mark All Read
          </Button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search notifications..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0 divide-y">
          {filtered.length > 0 ? filtered.map((n: any) => {
            const TypeIcon = typeIcons[n.type] || Info;
            return (
              <div key={n.id} className={`flex items-start gap-4 p-4 ${!n.isRead ? "bg-blue-50/50 dark:bg-blue-950/20" : ""}`}>
                <div className={`p-1.5 rounded-full ${n.type === "error" ? "bg-red-100 dark:bg-red-900/30" : n.type === "warning" ? "bg-amber-100 dark:bg-amber-900/30" : n.type === "success" ? "bg-green-100 dark:bg-green-900/30" : "bg-blue-100 dark:bg-blue-900/30"}`}>
                  <TypeIcon className={`w-4 h-4 ${n.type === "error" ? "text-red-500" : n.type === "warning" ? "text-amber-500" : n.type === "success" ? "text-green-500" : "text-blue-500"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{n.title}</p>
                    {!n.isRead && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={n.type === "error" ? "destructive" : n.type === "warning" ? "secondary" : "default"} className="capitalize">{n.type}</Badge>
                  {!n.isRead && <Button size="sm" variant="ghost" onClick={() => markRead.mutate({ id: n.id })} disabled={markRead.isPending}><Check className="w-3 h-3" /></Button>}
                </div>
              </div>
            );
          }) : (
            <div className="p-12 text-center text-muted-foreground">
              <Bell className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No notifications</p>
              <p className="text-xs">{search ? "Try a different search" : "You're all caught up"}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
