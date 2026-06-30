import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";

export default function SessionCreate() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [form, setForm] = useState({ sessionName: "", sessionType: "chat" });
  const create = trpc.ws.createSession.useMutation({ onSuccess: () => { utils.ws.listSessions.refetch(); navigate("/app/collaboration/sessions"); } });

  return (
    <div className="max-w-xl space-y-4">
      <h2 className="text-2xl font-bold">Create Collaboration Session</h2>
      <Card><CardContent className="space-y-4 pt-6">
        <div><Label>Session Name</Label><Input value={form.sessionName} onChange={e => setForm({...form, sessionName: e.target.value})} /></div>
        <div><Label>Type</Label><Select value={form.sessionType} onValueChange={v => setForm({...form, sessionType: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="document_review">Document Review</SelectItem><SelectItem value="dashboard">Dashboard</SelectItem><SelectItem value="record_edit">Record Edit</SelectItem><SelectItem value="chat">Chat</SelectItem></SelectContent></Select></div>
        <Button onClick={() => create.mutate(form as any)} disabled={create.isPending}>Create Session</Button>
      </CardContent></Card>
    </div>
  );
}
