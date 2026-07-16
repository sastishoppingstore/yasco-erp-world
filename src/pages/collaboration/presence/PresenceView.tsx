import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { usePresence, useOnlineUsers } from "@/lib/wsClient";
import { Search, Users, Wifi, WifiOff } from "lucide-react";
import { useState } from "react";

const statusColors: Record<string, string> = {
  online: "bg-green-500",
  away: "bg-amber-500",
  busy: "bg-red-500",
  offline: "bg-gray-300",
};

export default function PresenceView() {
  const [search, setSearch] = useState("");
  const presence = usePresence();
  const onlineUsers = useOnlineUsers();

  const filtered = onlineUsers.filter((u: any) =>
    !search || u.status?.toLowerCase().includes(search.toLowerCase()) || String(u.userId).includes(search) || (u.currentModule || "").toLowerCase().includes(search.toLowerCase())
  );

  if (!presence) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wifi className="w-6 h-6 text-green-500" />
          <h2 className="text-2xl font-bold">User Presence</h2>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline" className="gap-1"><div className="w-2 h-2 rounded-full bg-green-500" />{onlineUsers.filter((u: any) => u.status === "online").length} online</Badge>
          <Badge variant="outline" className="gap-1"><div className="w-2 h-2 rounded-full bg-amber-500" />{onlineUsers.filter((u: any) => u.status === "away").length} away</Badge>
          <Badge variant="outline" className="gap-1"><div className="w-2 h-2 rounded-full bg-red-500" />{onlineUsers.filter((u: any) => u.status === "busy").length} busy</Badge>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Filter by status or module..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((u: any) => (
          <Card key={u.userId} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm">U{u.userId}</div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${statusColors[u.status] || "bg-gray-300"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">User #{u.userId}</p>
                <p className="text-xs text-muted-foreground truncate">{u.currentModule || "No module"}</p>
              </div>
              <Badge variant={u.status === "online" ? "default" : u.status === "busy" ? "destructive" : "secondary"} className="capitalize">{u.status}</Badge>
            </CardContent>
          </Card>
        ))}
        {!filtered.length && (
          <div className="col-span-full">
            <Card><CardContent className="p-12 text-center text-muted-foreground">
              <WifiOff className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No users found</p>
              <p className="text-xs">{search ? "Try a different filter" : "No users currently online"}</p>
            </CardContent></Card>
          </div>
        )}
      </div>
    </div>
  );
}
