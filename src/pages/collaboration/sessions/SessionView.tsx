import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import { useParams } from "react-router";

export default function SessionView() {
  const { id } = useParams();
  const sessionId = Number(id);
  const { data: session, refetch } = trpc.ws.getSession.useQuery({ id: sessionId });
  const joinSession = trpc.ws.joinSession.useMutation({ onSuccess: () => refetch() });
  const leaveSession = trpc.ws.leaveSession.useMutation({ onSuccess: () => refetch() });

  if (!session) return <div className="p-6 text-slate-500">Loading session...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h2 className="text-2xl font-bold">{session.sessionName}</h2><Badge>{session.sessionType}</Badge></div><div className="flex gap-2"><Button onClick={() => joinSession.mutate({ sessionId })}>Join</Button><Button variant="outline" onClick={() => leaveSession.mutate({ sessionId })}>Leave</Button></div></div>
      <div className="grid grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle>Participants ({session.participants?.length || 0})</CardTitle></CardHeader><CardContent className="space-y-2">
          {session.participants?.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between p-2 rounded border text-sm"><span>User #{p.userId}</span><Badge variant="outline">{p.role}</Badge></div>
          ))}
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Activity Feed</CardTitle></CardHeader><CardContent className="space-y-2 max-h-80 overflow-y-auto">
          {session.activities?.map((a: any) => (
            <div key={a.id} className="p-2 rounded border text-xs"><span className="font-medium">{a.activityType}</span><span className="text-slate-400 ml-2">{new Date(a.createdAt).toLocaleString()}</span></div>
          ))}
        </CardContent></Card>
      </div>
    </div>
  );
}
