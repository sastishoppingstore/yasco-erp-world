import { useState } from 'react';
import { trpc } from '@/providers/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2, Clock, XCircle, FileText, Shield,
  Download, ArrowRight, RefreshCw, Eye, AlertTriangle,
  Zap, Activity, Settings, Wifi, WifiOff,
} from 'lucide-react';
import { Link } from 'react-router';

function StatCard({ label, labelAr, value, icon: Icon, colorClass, borderClass }: {
  label: string; labelAr: string; value: number;
  icon: React.ElementType; colorClass: string; borderClass: string;
}) {
  return (
    <Card className={`border-l-4 ${borderClass}`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">{labelAr}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${colorClass}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const PHASE_STEPS = [
  { step: 1, label: 'Generation', labelAr: 'الإنشاء', desc: 'e-Invoice XML generation (UBL 2.1)', done: true },
  { step: 2, label: 'CSR & Onboarding', labelAr: 'التسجيل', desc: 'CSID onboarding with ZATCA API', done: true },
  { step: 3, label: 'Compliance Testing', labelAr: 'اختبار الامتثال', desc: 'Sandbox API clearance testing', done: false, active: true },
  { step: 4, label: 'Production Clearance', labelAr: 'الإنتاج', desc: 'Live B2B clearance & B2C reporting', done: false },
];

export default function ZatcaDashboard() {
  const { data: dashboard } = trpc.zatca.dashboard.useQuery();
  const { data: wizard } = trpc.zatca.wizardState.useQuery();
  const complianceCheck = trpc.zatca.complianceCheck.useMutation();

  const total = dashboard?.totalInvoices ?? 0;
  const cleared = dashboard?.clearedInvoices ?? 0;
  const pending = dashboard?.pendingInvoices ?? 0;
  const failed = dashboard?.failedInvoices ?? 0;
  const complianceScore = total > 0 ? Math.round((cleared / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">ZATCA Compliance Center</h1>
          <p className="text-muted-foreground">
            مركز الامتثال لهيئة الزكاة والضريبة والجمارك — Phase 2 e-Invoicing (FATOORAH)
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => complianceCheck.mutate({})}
            disabled={complianceCheck.isPending}
          >
            <Shield className="w-4 h-4 mr-2" />
            {complianceCheck.isPending ? 'Checking...' : 'Run Compliance Check'}
          </Button>
          <Button asChild>
            <Link to="/app/settings/zatca-integration">
              <Settings className="w-4 h-4 mr-2" /> Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Connection Status ── */}
      <div className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200">
        <div className="flex items-center gap-2">
          {dashboard?.isOnline ? (
            <Wifi className="size-4 text-emerald-600" />
          ) : (
            <WifiOff className="size-4 text-amber-600" />
          )}
          <span className="text-sm font-medium">{dashboard?.isOnline ? 'Online' : 'Offline Mode'}</span>
        </div>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Last Sync:</span>
          <span className="text-xs font-medium">{dashboard?.lastSync || 'Never'}</span>
        </div>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Queue:</span>
          <Badge variant="outline" className="text-[10px]">{pending} pending</Badge>
        </div>
        <Button variant="ghost" size="sm" className="ml-auto">
          <RefreshCw className="size-3.5 mr-1" /> Sync Now
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="overview"><Eye className="size-3.5 mr-1" />Overview</TabsTrigger>
          <TabsTrigger value="invoices"><FileText className="size-3.5 mr-1" />Invoices</TabsTrigger>
          <TabsTrigger value="csid"><Shield className="size-3.5 mr-1" />CSID</TabsTrigger>
          <TabsTrigger value="activity"><Activity className="size-3.5 mr-1" />Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* ── Stats Cards ── */}
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              label="Total Invoices" labelAr="إجمالي الفواتير"
              value={total} icon={FileText}
              colorClass="bg-blue-100 dark:bg-blue-900 text-blue-600"
              borderClass="border-blue-500"
            />
            <StatCard
              label="Cleared (B2B)" labelAr="تمت تصفيتها"
              value={cleared} icon={CheckCircle2}
              colorClass="bg-emerald-100 dark:bg-emerald-900 text-emerald-600"
              borderClass="border-emerald-500"
            />
            <StatCard
              label="Reported (B2C)" labelAr="تم الإبلاغ"
              value={pending} icon={Clock}
              colorClass="bg-amber-100 dark:bg-amber-900 text-amber-600"
              borderClass="border-amber-500"
            />
            <StatCard
              label="Failed" labelAr="فشلت"
              value={failed} icon={XCircle}
              colorClass="bg-red-100 dark:bg-red-900 text-red-600"
              borderClass="border-red-500"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            {/* ── Phase 2 Timeline ── */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  ZATCA Phase 2 Journey — رحلة المرحلة الثانية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {PHASE_STEPS.map(step => (
                    <div key={step.step} className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm
                        ${step.done
                          ? 'bg-emerald-500 text-white'
                          : step.active
                            ? 'bg-blue-500 text-white ring-4 ring-blue-100 animate-pulse'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                        {step.done ? '✓' : step.step}
                      </div>
                      <div className="flex-1 pb-2 border-b border-dashed last:border-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{step.label}</span>
                          <span className="text-muted-foreground text-sm">— {step.labelAr}</span>
                          {step.done && (
                            <Badge className="bg-emerald-100 text-emerald-700 text-xs border-0">✓ Complete</Badge>
                          )}
                          {step.active && (
                            <Badge className="bg-blue-100 text-blue-700 text-xs border-0">In Progress</Badge>
                          )}
                          {!step.done && !step.active && (
                            <Badge variant="secondary" className="text-xs">Pending</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ── Right column ── */}
            <div className="space-y-4">
              {/* Compliance Score */}
              <Card className="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950 dark:to-green-900 border-emerald-200">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-emerald-600 font-medium mb-3">
                    Compliance Score — درجة الامتثال
                  </p>
                  {/* SVG circular progress */}
                  <div className="relative w-28 h-28 mx-auto">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" stroke="#d1fae5" strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" stroke="#059669" strokeWidth="3"
                        strokeDasharray={`${complianceScore}, 100`}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dasharray 0.6s ease' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center rotate-90">
                      <span className="text-2xl font-bold text-emerald-700">{complianceScore}%</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {cleared} of {total} invoices cleared
                  </p>
                  {total === 0 && (
                    <p className="text-xs text-amber-600 mt-1">No invoices submitted yet</p>
                  )}
                </CardContent>
              </Card>

              {/* VAT Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    VAT Summary — ملخص ضريبة القيمة المضافة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Output VAT (ضريبة المخرجات)</span>
                    <span className="font-medium text-red-600">SAR 0.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Input VAT (ضريبة المدخلات)</span>
                    <span className="font-medium text-green-600">SAR 0.00</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Net VAT Payable</span>
                    <span>SAR 0.00</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="w-4 h-4 mr-2" /> Download VAT Return
                  </Button>
                </CardContent>
              </Card>

              {/* Certificate Warning */}
              {dashboard?.certificateExpiryWarning && (
                <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950">
                  <CardContent className="p-4">
                    <p className="text-sm text-amber-700 font-medium flex items-center gap-2">
                      <AlertTriangle className="size-4" /> Certificate Warning
                    </p>
                    <p className="text-xs text-amber-600 mt-1">{dashboard.certificateExpiryWarning}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Recent Invoice Status — حالة الفواتير الأخيرة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { inv: 'INV-1001', customer: 'Al Rajhi Bank', amount: '172,500', status: 'cleared', time: '2 min ago' },
                  { inv: 'INV-1002', customer: 'Private Client', amount: '45,000', status: 'cleared', time: '5 min ago' },
                  { inv: 'INV-1003', customer: 'MOH', amount: '890,000', status: 'pending', time: '10 min ago' },
                  { inv: 'INV-1004', customer: 'ABC Trading', amount: '12,500', status: 'failed', time: '15 min ago' },
                  { inv: 'INV-1005', customer: 'Saudi Cement', amount: '28,750', status: 'cleared', time: '20 min ago' },
                ].map((row) => (
                  <div key={row.inv} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="size-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">{row.inv}</p>
                        <p className="text-xs text-slate-500">{row.customer}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">SAR {row.amount}</span>
                      <Badge className={`text-[10px] ${
                        row.status === 'cleared' ? 'bg-emerald-100 text-emerald-700' :
                        row.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {row.status === 'cleared' ? '✓ Cleared' : row.status === 'pending' ? '⏳ Pending' : '✗ Failed'}
                      </Badge>
                      <span className="text-[10px] text-slate-400">{row.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CSID Tab */}
        <TabsContent value="csid" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="w-4 h-4" />
                CSID Management — إدارة معرّف التجهيز
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { device: 'POS-1', csid: '310123456789001', expiry: '15/12/2026', status: 'active' },
                { device: 'POS-2', csid: '310123456789002', expiry: '20/12/2026', status: 'active' },
                { device: 'POS-3', csid: '310123456789003', expiry: '01/01/2027', status: 'active' },
              ].map((csid) => (
                <div key={csid.device} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Zap className="size-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{csid.device}</p>
                      <p className="text-xs text-slate-500 font-mono">CSID: {csid.csid}</p>
                      <p className="text-xs text-slate-500">Expires: {csid.expiry}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">
                      <CheckCircle2 className="size-3 mr-1" /> Active
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <RefreshCw className="size-3.5 mr-1" /> Renew
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Recent Activity — النشاط الأخير
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { time: '10:32 AM', action: 'Invoice INV-1001 cleared by ZATCA', type: 'success' },
                { time: '10:28 AM', action: 'Invoice INV-1002 cleared by ZATCA', type: 'success' },
                { time: '10:15 AM', action: 'Invoice INV-1004 failed - retrying', type: 'error' },
                { time: '10:10 AM', action: 'Offline queue synced (3 invoices)', type: 'info' },
                { time: '09:45 AM', action: 'CSID renewal reminder - POS-1', type: 'warning' },
                { time: '09:30 AM', action: 'System started in online mode', type: 'info' },
              ].map((log, i) => (
                <div key={i} className="flex items-center gap-3 p-2 text-sm">
                  <span className="text-xs text-slate-400 w-20 shrink-0">{log.time}</span>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    log.type === 'success' ? 'bg-emerald-500' :
                    log.type === 'error' ? 'bg-red-500' :
                    log.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <span className="text-slate-600">{log.action}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Setup Wizard Status ── */}
      {wizard && wizard.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Setup Wizard Status — حالة معالج الإعداد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {wizard.map(step => (
                <div
                  key={step.step}
                  className={`rounded-lg border p-3 text-center transition-colors ${
                    step.complete
                      ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-950'
                      : 'border-amber-200 bg-amber-50 dark:bg-amber-950'
                  }`}
                >
                  <div className="text-xs font-semibold mb-1 text-muted-foreground">Step {step.step}</div>
                  {step.complete
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                    : <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                  }
                  <p className="text-xs font-medium leading-tight">{step.label}</p>
                  <Badge
                    className={`mt-1 text-xs ${step.complete ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
                  >
                    {step.complete ? 'Done' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
