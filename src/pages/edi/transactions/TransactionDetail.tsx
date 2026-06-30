import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Send, FileText } from "lucide-react";

export default function TransactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: tx, isLoading } = trpc.edi.getTransaction.useQuery({ id: Number(id) }, { enabled: !!id });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Card><CardContent className="p-6 space-y-3">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-10 w-full" />)}
        </CardContent></Card>
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
        <Card><CardContent className="p-12 text-center text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Transaction not found</p>
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-4 h-4" /></Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">Transaction #{id}</h2>
            <Badge variant={tx.status === "processed" ? "default" : tx.status === "failed" ? "destructive" : "secondary"}>{tx.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{tx.documentReference || "No reference"}</p>
        </div>
        {tx.status === "pending" && <Button><Send className="w-4 h-4 mr-2" />Send</Button>}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Direction</CardTitle></CardHeader><CardContent><p className="text-lg font-semibold capitalize">{tx.direction || "—"}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Document Type</CardTitle></CardHeader><CardContent><p className="text-lg font-semibold">{tx.documentType || "—"}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Partner</CardTitle></CardHeader><CardContent><p className="text-lg font-semibold">{tx.partnerId || "—"}</p></CardContent></Card>
      </div>

      <Card><CardHeader><CardTitle>EDI Payload</CardTitle></CardHeader><CardContent>
        <pre className="text-xs bg-slate-50 dark:bg-slate-900 rounded p-4 overflow-auto max-h-96 font-mono whitespace-pre-wrap">
          {tx.rawPayload || "No payload available"}
        </pre>
      </CardContent></Card>

      <Card><CardHeader><CardTitle>Processing Log</CardTitle></CardHeader><CardContent className="p-0">
        <table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-3">Status</th><th className="p-3">Message</th><th className="p-3">Time</th></tr></thead><tbody>
          {(tx.logs as any[])?.map((log: any) => (
            <tr key={log.id} className="border-b hover:bg-slate-50"><td className="p-3"><Badge variant={log.status === "success" ? "default" : "destructive"}>{log.status}</Badge></td><td className="p-3">{log.message}</td><td className="p-3 text-xs text-slate-400">{new Date(log.createdAt).toLocaleString()}</td></tr>
          ))}
          {(!tx.logs || !tx.logs.length) && <tr><td colSpan={3} className="p-4 text-center text-muted-foreground">No processing logs</td></tr>}
        </tbody></table>
      </CardContent></Card>
    </div>
  );
}
