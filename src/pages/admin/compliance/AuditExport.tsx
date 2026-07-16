import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/providers/trpc";
import { Download, FileText, Shield, Activity, AlertTriangle, History } from "lucide-react";

export default function AuditExportPage() {
  const [from, setFrom] = useState("");
  const [to] = useState("");
  const [exporting, setExporting] = useState(false);

  const handleExport = (type: string) => {
    setExporting(true);
    setTimeout(() => setExporting(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Audit & Compliance Export</h2><p className="text-sm text-slate-500">Export audit logs in SOC2-compatible format</p></div>

      <div className="grid grid-cols-2 gap-4">
        <div><Label>From Date</Label><Input type="date" value={from} onChange={e => setFrom(e.target.value)} /></div>
        <div><Label>To Date</Label><Input type="date" value={to} disabled placeholder="Today" /></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-md cursor-pointer" onClick={() => handleExport("soc2")}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium">SOC2 Full Export</p>
                <p className="text-sm text-slate-500">Audit logs, access logs, change management, security incidents</p>
              </div>
              <Button variant="outline" size="sm" disabled={exporting}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md cursor-pointer" onClick={() => handleExport("audit")}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                <Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Audit Logs</p>
                <p className="text-sm text-slate-500">All system audit trail events</p>
              </div>
              <Button variant="outline" size="sm" disabled={exporting}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md cursor-pointer" onClick={() => handleExport("access")}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                <FileText className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Access Logs</p>
                <p className="text-sm text-slate-500">Document access and permission changes</p>
              </div>
              <Button variant="outline" size="sm" disabled={exporting}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md cursor-pointer" onClick={() => handleExport("changes")}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <History className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Change Management</p>
                <p className="text-sm text-slate-500">Configuration and schema change history</p>
              </div>
              <Button variant="outline" size="sm" disabled={exporting}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md cursor-pointer" onClick={() => handleExport("incidents")}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Security Incidents</p>
                <p className="text-sm text-slate-500">Security incident log for SOC2/ISO reporting</p>
              </div>
              <Button variant="outline" size="sm" disabled={exporting}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
