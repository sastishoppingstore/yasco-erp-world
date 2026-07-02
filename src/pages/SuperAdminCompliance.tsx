import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  FileWarning,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

const readinessBadge = (ready: boolean) =>
  ready ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700";

const severityBadge: Record<string, string> = {
  critical: "bg-red-100 text-red-700",
  warning: "bg-amber-100 text-amber-700",
  info: "bg-blue-100 text-blue-700",
  passed: "bg-emerald-100 text-emerald-700",
};

function ScoreRing({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score || 0));
  return (
    <div className="relative flex size-24 items-center justify-center rounded-full bg-slate-950 text-white shadow-xl shadow-slate-900/15">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(#10b981 ${clamped * 3.6}deg, rgba(255,255,255,0.14) 0deg)`,
        }}
      />
      <div className="absolute inset-2 rounded-full bg-slate-950" />
      <span className="relative text-2xl font-bold">{clamped}</span>
    </div>
  );
}

export default function SuperAdminCompliance() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const [onlyNotReady, setOnlyNotReady] = useState(false);

  const readinessQuery = trpc.superAdmin.compliance.globalReadiness.useQuery(
    { limit: 100, onlyNotReady },
    { refetchInterval: 45000 },
  );
  const failuresQuery = trpc.superAdmin.compliance.zatcaFailures.useQuery(
    { limit: 25 },
    { refetchInterval: 45000 },
  );

  const readiness = readinessQuery.data;
  const items = readiness?.items || [];
  const readyPercent = readiness?.totalChecked
    ? Math.round((readiness.ready / readiness.totalChecked) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-lg bg-slate-950 p-6 text-white shadow-2xl shadow-slate-900/10">
        <div className="absolute inset-0 opacity-35">
          <div className="absolute left-8 top-8 size-24 rounded-full border border-emerald-300/30" />
          <div className="absolute right-12 top-10 size-16 rotate-45 border border-sky-300/30" />
          <div className="absolute bottom-6 left-1/3 h-px w-56 bg-gradient-to-r from-transparent via-emerald-300/50 to-transparent" />
        </div>
        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <Badge className="mb-3 border-emerald-300/30 bg-emerald-400/15 text-emerald-50">
              <ShieldCheck className="mr-1 size-3" />
              {isAr ? "جاهزية المنصة" : "Saudi SaaS readiness"}
            </Badge>
            <h1 className="text-2xl font-bold">
              {isAr ? "مركز الامتثال والفوترة الإلكترونية" : "Compliance and ZATCA Control Center"}
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">
              {isAr
                ? "تحقق من جاهزية كل شركة للاشتراك، بيانات الضريبة، العنوان الوطني، شهادات ZATCA وسجلات الفشل."
                : "Monitor every company for subscription access, Saudi VAT data, national address, ZATCA certificates and failed invoice submissions."}
            </p>
          </div>
          <ScoreRing score={readyPercent} />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <Building2 className="size-5 text-sky-600" />
              <Badge variant="outline">{readinessQuery.isFetching ? "..." : readiness?.totalChecked || 0}</Badge>
            </div>
            <p className="mt-4 text-2xl font-bold">{readiness?.totalChecked || 0}</p>
            <p className="text-sm text-muted-foreground">{isAr ? "الشركات المفحوصة" : "Companies checked"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <CheckCircle2 className="size-5 text-emerald-600" />
            <p className="mt-4 text-2xl font-bold">{readiness?.ready || 0}</p>
            <p className="text-sm text-muted-foreground">{isAr ? "جاهزة للبيع" : "Ready for sale"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <AlertTriangle className="size-5 text-red-600" />
            <p className="mt-4 text-2xl font-bold">{readiness?.criticalOpen || 0}</p>
            <p className="text-sm text-muted-foreground">{isAr ? "مشاكل حرجة" : "Critical issues"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <FileWarning className="size-5 text-amber-600" />
            <p className="mt-4 text-2xl font-bold">{failuresQuery.data?.length || 0}</p>
            <p className="text-sm text-muted-foreground">{isAr ? "فشل ZATCA" : "ZATCA failures"}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">{isAr ? "جاهزية الشركات" : "Company readiness"}</CardTitle>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{isAr ? "غير الجاهزة فقط" : "Not ready only"}</span>
            <Switch checked={onlyNotReady} onCheckedChange={setOnlyNotReady} />
            <Button variant="outline" size="sm" onClick={() => readinessQuery.refetch()}>
              <RefreshCw className="mr-2 size-4" />
              {isAr ? "تحديث" : "Refresh"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px]">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">{isAr ? "الشركة" : "Company"}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">{isAr ? "الدرجة" : "Score"}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">{isAr ? "الحالة" : "Status"}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">{isAr ? "ZATCA" : "ZATCA"}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">{isAr ? "المشاكل" : "Open items"}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any) => (
                  <tr key={item.tenant?.id} className="border-b align-top hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="font-medium">{item.tenant?.name || item.company?.legalName || `Tenant #${item.tenant?.id}`}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.company?.vatNumber || "-"} · {item.tenant?.status || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex min-w-36 items-center gap-3">
                        <span className="w-10 font-semibold">{item.score || 0}</span>
                        <Progress value={item.score || 0} className="h-2" />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={readinessBadge(Boolean(item.readyForSale))}>
                        {item.readyForSale ? (isAr ? "جاهزة" : "Ready") : (isAr ? "تحتاج عمل" : "Needs work")}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div>{isAr ? "اعتماد:" : "Cleared:"} {item.zatca?.clearedInvoices || 0}</div>
                      <div className="text-muted-foreground">{isAr ? "فشل:" : "Failed:"} {item.zatca?.failedApiLogs || 0}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {(item.checks || []).filter((check: any) => !check.passed).slice(0, 4).map((check: any) => (
                          <Badge key={check.key} className={severityBadge[check.severity] || severityBadge.info}>
                            {check.label}
                          </Badge>
                        ))}
                        {item.criticalOpen === 0 && item.warningsOpen === 0 && (
                          <Badge className="bg-emerald-100 text-emerald-700">
                            <CheckCircle2 className="mr-1 size-3" />
                            {isAr ? "لا توجد مشاكل" : "No open items"}
                          </Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!readinessQuery.isLoading && items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      {isAr ? "لا توجد نتائج" : "No readiness results"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{isAr ? "آخر أخطاء ZATCA" : "Latest ZATCA failures"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(failuresQuery.data || []).map((log: any) => (
            <div key={log.id} className="flex items-start gap-3 rounded-lg border p-3">
              <XCircle className="mt-0.5 size-4 text-red-600" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">Tenant #{log.tenantId}</span>
                  <Badge variant="outline">{log.endpoint || "ZATCA"}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : "-"}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {log.errorMessage || log.responseBody || log.requestBody || "-"}
                </p>
              </div>
            </div>
          ))}
          {!failuresQuery.isLoading && (failuresQuery.data || []).length === 0 && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              {isAr ? "لا توجد أخطاء ZATCA حالياً" : "No failed ZATCA logs right now"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
