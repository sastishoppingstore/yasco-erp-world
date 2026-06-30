import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/providers/trpc";
import { CheckCircle2, XCircle, Clock, ChevronRight } from "lucide-react";

export default function MobileApprovals() {
  const { data: approvals, refetch } = trpc.mobile.getPendingApprovals.useQuery({ limit: 20 });
  const approveReq = trpc.mobile.approveRequest.useMutation({ onSuccess: () => refetch() });
  const rejectReq = trpc.mobile.rejectRequest.useMutation({ onSuccess: () => refetch() });
  const [notes, setNotes] = useState("");

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Approvals</h1>
        <Badge variant="outline" className="bg-blue-100 text-blue-800">{approvals?.length ?? 0} Pending</Badge>
      </div>

      {!approvals?.length ? (
        <Card><CardContent className="py-12 text-center text-slate-500"><CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-400" /><p>No pending approvals</p></CardContent></Card>
      ) : approvals.map((req: any) => (
        <Card key={req.id}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="font-medium capitalize">{req.entityType} #{req.entityId}</span>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">{req.status}</Badge>
            </div>
            <p className="text-sm text-slate-500">Requested by User #{req.requestedBy}</p>
            <Textarea placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="text-sm" />
            <div className="flex gap-2">
              <Button className="flex-1 bg-green-600 hover:bg-green-700" size="sm" onClick={() => approveReq.mutate({ requestId: req.id, notes })}>
                <CheckCircle2 className="w-4 h-4 mr-1" />Approve
              </Button>
              <Button className="flex-1" variant="destructive" size="sm" onClick={() => rejectReq.mutate({ requestId: req.id, notes })}>
                <XCircle className="w-4 h-4 mr-1" />Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
