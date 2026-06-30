import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/providers/trpc";
import { FileSignature, Send, CheckCircle2, XCircle, Clock, Eye } from "lucide-react";

export default function SignatureRequest() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const docId = searchParams.get("documentId");
  const { data: requests, refetch } = trpc.documents.listSignatureRequests.useQuery();
  const createReq = trpc.documents.createSignatureRequest.useMutation({ onSuccess: () => refetch() });

  const [form, setForm] = useState({ documentId: docId || "", signerEmail: "", signerName: "", message: "", expiresAt: "" });
  const [tab, setTab] = useState("new");

  const handleSend = () => {
    createReq.mutate({
      documentId: Number(form.documentId), signerEmail: form.signerEmail,
      signerName: form.signerName, message: form.message,
      expiresAt: form.expiresAt || undefined,
    });
    setForm({ documentId: "", signerEmail: "", signerName: "", message: "", expiresAt: "" });
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { color: string; icon: any }> = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      viewed: { color: "bg-blue-100 text-blue-800", icon: Eye },
      signed: { color: "bg-green-100 text-green-800", icon: CheckCircle2 },
      declined: { color: "bg-red-100 text-red-800", icon: XCircle },
      expired: { color: "bg-gray-100 text-gray-800", icon: XCircle },
    };
    const s = map[status] || map.pending;
    const Icon = s.icon;
    return <Badge variant="outline" className={s.color}><Icon className="w-3 h-3 mr-1" />{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">E-Signature Requests</h2><p className="text-sm text-slate-500">Send documents for electronic signature</p></div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="new">New Request</TabsTrigger>
          <TabsTrigger value="sent">Sent Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          <Card>
            <CardHeader><CardTitle>Send for Signature</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Document ID</Label><Input value={form.documentId} onChange={e => setForm(f => ({ ...f, documentId: e.target.value }))} placeholder="Enter document ID" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Signer Email *</Label><Input value={form.signerEmail} onChange={e => setForm(f => ({ ...f, signerEmail: e.target.value }))} placeholder="signer@example.com" /></div>
                <div><Label>Signer Name</Label><Input value={form.signerName} onChange={e => setForm(f => ({ ...f, signerName: e.target.value }))} placeholder="Full name" /></div>
              </div>
              <div><Label>Message</Label><Textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Optional message to the signer" /></div>
              <div><Label>Expires At</Label><Input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} /></div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => navigate("/app/documents")}>Back</Button>
                <Button onClick={handleSend} disabled={!form.documentId || !form.signerEmail}>
                  <Send className="w-4 h-4 mr-2" />Send for Signature
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent" className="space-y-3">
          {!requests?.length ? (
            <Card><CardContent className="py-12 text-center text-slate-500">No signature requests sent yet.</CardContent></Card>
          ) : requests.map(req => (
            <Card key={req.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <FileSignature className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium">{req.signerName || req.signerEmail} · Doc #{req.documentId}</p>
                    <p className="text-xs text-slate-500">{new Date(req.createdAt).toLocaleDateString()} · {req.signatureType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {statusBadge(req.status)}
                  {req.status === "signed" && (
                    <Button variant="outline" size="sm" onClick={() => navigate(`/app/documents/signature-pad?requestId=${req.id}`)}>
                      <Eye className="w-4 h-4 mr-1" />View
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
