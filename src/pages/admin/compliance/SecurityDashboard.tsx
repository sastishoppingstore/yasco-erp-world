import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertTriangle, CheckCircle2, Clock, Activity, FileText, Users } from "lucide-react";

export default function SecurityDashboardPage() {
  const stats = {
    totalAuditLogs: 0, totalAccessLogs: 0, openIncidents: 0, pendingDsars: 0, totalChanges: 0,
    frameworks: [] as any[],
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Security & Compliance Dashboard</h2><p className="text-sm text-slate-500">SOC2, ISO 27001, GDPR, and Saudi PDPL readiness overview</p></div>

      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-slate-500">Audit Events</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-2"><Activity className="w-4 h-4 text-blue-500" /><span className="text-2xl font-bold">{stats.totalAuditLogs}</span></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-slate-500">Access Logs</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-2"><FileText className="w-4 h-4 text-emerald-500" /><span className="text-2xl font-bold">{stats.totalAccessLogs}</span></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-slate-500">Open Incidents</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500" /><span className="text-2xl font-bold">{stats.openIncidents}</span></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-slate-500">Pending DSARs</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-2"><Users className="w-4 h-4 text-amber-500" /><span className="text-2xl font-bold">{stats.pendingDsars}</span></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-slate-500">Changes</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-2"><Clock className="w-4 h-4 text-purple-500" /><span className="text-2xl font-bold">{stats.totalChanges}</span></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Compliance Frameworks</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "SOC 2", status: "not_started" },
              { name: "ISO 27001", status: "not_started" },
              { name: "GDPR", status: "not_started" },
              { name: "Saudi PDPL", status: "not_started" },
            ].map(fw => (
              <div key={fw.name} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-slate-400" />
                  <span className="font-medium">{fw.name}</span>
                </div>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                  <Clock className="w-3 h-3 mr-1" />Not Started
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Security Events</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 text-center py-8">No security events recorded. Security monitoring is active and will log events as they occur.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
