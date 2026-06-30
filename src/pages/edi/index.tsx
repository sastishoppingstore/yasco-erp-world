import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";
import { Users, FileText, Send, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router";

export default function EdiDashboardPage() {
  const { data: dashboard } = trpc.edi.ediDashboard.useQuery();

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">EDI Integration</h2><p className="text-sm text-slate-500">Electronic Data Interchange Management</p></div>
      <div className="grid grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Partners</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{dashboard?.partnerCount ?? 0}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Document Types</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{dashboard?.documentTypeCount ?? 0}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Outbound</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{dashboard?.outboundCount ?? 0}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Pending</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-amber-500">{dashboard?.pendingCount ?? 0}</p></CardContent></Card>
      </div>
      <div className="flex gap-2">
        <Link to="/app/edi/partners" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"><Users className="w-4 h-4" />Partners</Link>
        <Link to="/app/edi/documents" className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"><FileText className="w-4 h-4" />Documents</Link>
        <Link to="/app/edi/transactions" className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"><Send className="w-4 h-4" />Transactions</Link>
        <Link to="/app/edi/monitor" className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700"><Clock className="w-4 h-4" />Monitor</Link>
      </div>
      <Card><CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader><CardContent className="space-y-2">
        {!dashboard?.recentLogs?.length ? <p className="text-sm text-slate-500 text-center py-4">No recent EDI activity.</p> :
          dashboard.recentLogs.map((log: any) => (
            <div key={log.id} className="flex items-center justify-between p-2 rounded border text-sm"><span className="text-slate-600">{log.documentType || "N/A"}</span><span>{log.status}</span><span className="text-xs text-slate-400">{new Date(log.createdAt).toLocaleString()}</span></div>
          ))}
      </CardContent></Card>
    </div>
  );
}
