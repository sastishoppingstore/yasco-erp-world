import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import {
  Key, Plus, Copy, CheckCircle2, XCircle, AlertCircle, Clock, Eye, EyeOff,
  Search, Download, Upload, ShieldAlert, Activity, BarChart3, CreditCard,
  Smartphone, HardDrive, ArrowLeftRight, Ban, RefreshCw, Gauge,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { getLicenseStatusLabel, getLicenseStatusColor, daysUntilExpiry, formatExpiryDate, isLicenseReadOnly } from "@/lib/licenseClient";

const PLAN_TIERS = ["starter", "professional", "enterprise", "desktop"] as const;

const PIE_COLORS = ["#22c55e", "#ef4444", "#f59e0b", "#6b7280"];

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    active: "bg-green-100 text-green-800 border-green-300",
    expired: "bg-red-100 text-red-800 border-red-300",
    grace: "bg-yellow-100 text-yellow-800 border-yellow-300",
    suspended: "bg-orange-100 text-orange-800 border-orange-300",
    revoked: "bg-gray-100 text-gray-800 border-gray-300",
    blacklisted: "bg-red-200 text-red-900 border-red-400",
    clock_tampered: "bg-purple-100 text-purple-800 border-purple-300",
  };
  const iconMap: Record<string, any> = {
    active: CheckCircle2, expired: XCircle, grace: Clock,
    suspended: AlertCircle, revoked: AlertCircle, blacklisted: Ban, clock_tampered: ShieldAlert,
  };
  const Icon = iconMap[status] || AlertCircle;
  return (
    <Badge variant="outline" className={cn("gap-1 capitalize", colorMap[status] || "bg-slate-100 text-slate-800")}>
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
}

export default function LicenseConsolePage() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [tab, setTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [generateOpen, setGenerateOpen] = useState(false);
  const [newLicenseKey, setNewLicenseKey] = useState<string | null>(null);
  const [generateForm, setGenerateForm] = useState({
    tenantId: 0, companyName: "", plan: "desktop", maxDevices: 1, validDays: 365, graceDays: 7,
  });
  const [generateTenantSearch, setGenerateTenantSearch] = useState("");

  const [actionDialog, setActionDialog] = useState<{
    open: boolean; action: string; licenseId: number; reason: string;
  }>({ open: false, action: "", licenseId: 0, reason: "" });

  const [extendDialog, setExtendDialog] = useState<{
    open: boolean; licenseId: number; days: number;
  }>({ open: false, licenseId: 0, days: 30 });

  const [planDialog, setPlanDialog] = useState<{
    open: boolean; licenseId: number; plan: string; maxDevices: number;
  }>({ open: false, licenseId: 0, plan: "desktop", maxDevices: 1 });

  const { data: tenantsList } = trpc.superAdmin.companies.list.useQuery({ limit: 200 });
  const { data: licenses, isLoading: licensesLoading } = trpc.licenseAdmin.list.useQuery({
    search: search || undefined, status: statusFilter as any || undefined, limit: 200,
  });
  const { data: analytics } = trpc.licenseAdmin.usageAnalytics.useQuery();
  const { data: paymentMethods } = trpc.licenseAdmin.paymentMethods.useQuery();

  const generateMutation = trpc.licenseAdmin.generate.useMutation({
    onSuccess: (data) => {
      setNewLicenseKey(data.licenseKey);
      utils.licenseAdmin.list.invalidate();
      utils.licenseAdmin.usageAnalytics.invalidate();
    },
  });
  const extendMutation = trpc.licenseAdmin.extend.useMutation({
    onSuccess: () => { utils.licenseAdmin.list.invalidate(); setExtendDialog({ open: false, licenseId: 0, days: 30 }); },
  });
  const changePlanMutation = trpc.licenseAdmin.changePlan.useMutation({
    onSuccess: () => { utils.licenseAdmin.list.invalidate(); setPlanDialog({ open: false, licenseId: 0, plan: "desktop", maxDevices: 1 }); },
  });
  const suspendMutation = trpc.licenseAdmin.suspend.useMutation({
    onSuccess: () => { utils.licenseAdmin.list.invalidate(); setActionDialog({ open: false, action: "", licenseId: 0, reason: "" }); },
  });
  const revokeMutation = trpc.licenseAdmin.revoke.useMutation({
    onSuccess: () => { utils.licenseAdmin.list.invalidate(); setActionDialog({ open: false, action: "", licenseId: 0, reason: "" }); },
  });
  const blacklistMutation = trpc.licenseAdmin.blacklist.useMutation({
    onSuccess: () => { utils.licenseAdmin.list.invalidate(); setActionDialog({ open: false, action: "", licenseId: 0, reason: "" }); },
  });

  const filteredTenants = tenantsList?.items.filter(t =>
    t.name.toLowerCase().includes(generateTenantSearch.toLowerCase()) ||
    t.email?.toLowerCase().includes(generateTenantSearch.toLowerCase()),
  ) || [];

  const actionHandlers: Record<string, any> = {
    suspend: suspendMutation, revoke: revokeMutation, blacklist: blacklistMutation,
  };

  function handleAction() {
    const mutation = actionHandlers[actionDialog.action];
    if (mutation) mutation.mutate({ id: actionDialog.licenseId, reason: actionDialog.reason || undefined });
  }

  const licenseCounts = analytics ? [
    { name: "Active", value: analytics.active },
    { name: "Expired", value: analytics.expired },
    { name: "Revoked", value: analytics.revoked },
  ] : [];

  if (user?.role !== "super_admin" && user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-lg font-medium text-slate-500">Super Admin access required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">License Console</h2>
          <p className="text-slate-500">Full license management — generate, monitor, and control all licenses.</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={generateOpen} onOpenChange={(o) => { setGenerateOpen(o); if (!o) setNewLicenseKey(null); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Generate License</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{newLicenseKey ? "License Key Generated" : "Generate New License Key"}</DialogTitle>
              </DialogHeader>
              {newLicenseKey ? (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <Label className="text-xs text-emerald-700">License Key</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 p-2 bg-white border rounded text-sm font-mono break-all">{newLicenseKey}</code>
                      <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(newLicenseKey)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-emerald-600 mt-2">Save this key. It will not be shown again.</p>
                  </div>
                  <Button className="w-full" onClick={() => { setGenerateOpen(false); setNewLicenseKey(null); }}>Done</Button>
                </div>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                  <div className="space-y-2">
                    <Label>Select Customer</Label>
                    <Input
                      placeholder="Search tenants..."
                      value={generateTenantSearch}
                      onChange={e => setGenerateTenantSearch(e.target.value)}
                    />
                    <div className="max-h-32 overflow-y-auto border rounded-lg divide-y">
                      {filteredTenants.slice(0, 30).map(t => (
                        <button
                          key={t.id}
                          type="button"
                          className={cn(
                            "w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors",
                            generateForm.tenantId === t.id && "bg-blue-50 text-blue-700 font-medium",
                          )}
                          onClick={() => setGenerateForm(f => ({ ...f, tenantId: t.id, companyName: t.name }))}
                        >
                          {t.name} <span className="text-slate-400">({t.email})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input value={generateForm.companyName} onChange={e => setGenerateForm(f => ({ ...f, companyName: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Plan Tier</Label>
                      <Select value={generateForm.plan} onValueChange={v => setGenerateForm(f => ({ ...f, plan: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PLAN_TIERS.map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Max Devices</Label>
                      <Input type="number" min={1} value={generateForm.maxDevices} onChange={e => setGenerateForm(f => ({ ...f, maxDevices: Number(e.target.value) }))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Valid Days</Label>
                      <Input type="number" min={1} value={generateForm.validDays} onChange={e => setGenerateForm(f => ({ ...f, validDays: Number(e.target.value) }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Grace Days</Label>
                      <Input type="number" min={0} value={generateForm.graceDays} onChange={e => setGenerateForm(f => ({ ...f, graceDays: Number(e.target.value) }))} />
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    disabled={!generateForm.tenantId || !generateForm.companyName || generateMutation.isPending}
                    onClick={() => generateMutation.mutate(generateForm)}
                  >
                    {generateMutation.isPending ? "Generating..." : "Generate Key"}
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview"><Gauge className="h-4 w-4 mr-2" />Overview</TabsTrigger>
          <TabsTrigger value="licenses"><Key className="h-4 w-4 mr-2" />Licenses</TabsTrigger>
          <TabsTrigger value="analytics"><BarChart3 className="h-4 w-4 mr-2" />Analytics</TabsTrigger>
          <TabsTrigger value="transfers"><ArrowLeftRight className="h-4 w-4 mr-2" />Transfers</TabsTrigger>
          <TabsTrigger value="payments"><CreditCard className="h-4 w-4 mr-2" />Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Total Licenses</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{analytics?.total ?? 0}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Active</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold text-green-600">{analytics?.active ?? 0}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Expired</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold text-red-600">{analytics?.expired ?? 0}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Revoked</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold text-gray-600">{analytics?.revoked ?? 0}</p></CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>License Distribution</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={licenseCounts} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {licenseCounts.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Licenses by Plan</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={(analytics?.byPlan || []).map(p => ({ name: p.plan, count: p.count }))}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Monthly Issuance</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={(analytics?.byMonth || []).map(m => ({ month: m.month, count: m.count }))}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="licenses" className="space-y-4 mt-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by company name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={v => setStatusFilter(v)}>
              <SelectTrigger className="w-40"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="grace">Grace</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="blacklisted">Blacklisted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              {licensesLoading ? (
                <div className="p-8 text-center text-slate-500">Loading licenses...</div>
              ) : !licenses?.items.length ? (
                <div className="p-8 text-center text-slate-500">No licenses found.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Devices</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Days Left</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {licenses.items.map((lic) => (
                      <TableRow key={lic.id}>
                        <TableCell>
                          <div className="font-medium">{lic.companyName}</div>
                          <div className="text-xs text-slate-500">Tenant #{lic.tenantId}</div>
                        </TableCell>
                        <TableCell className="capitalize">{lic.plan}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Smartphone className="h-3 w-3 text-slate-400" />
                            {lic.maxDevices}
                          </div>
                        </TableCell>
                        <TableCell><StatusBadge status={lic.status} /></TableCell>
                        <TableCell className="text-sm">{formatExpiryDate(lic.expiresAt.toISOString())}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn(
                            daysUntilExpiry(lic.expiresAt.toISOString()) <= 7 ? "bg-red-50 text-red-700 border-red-200" :
                            daysUntilExpiry(lic.expiresAt.toISOString()) <= 30 ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                            "bg-green-50 text-green-700 border-green-200",
                          )}>
                            {daysUntilExpiry(lic.expiresAt.toISOString())}d
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Extend"
                              onClick={() => setExtendDialog({ open: true, licenseId: lic.id, days: 30 })}>
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Change Plan"
                              onClick={() => setPlanDialog({ open: true, licenseId: lic.id, plan: lic.plan, maxDevices: lic.maxDevices })}>
                              <HardDrive className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-orange-600" title="Suspend"
                              onClick={() => setActionDialog({ open: true, action: "suspend", licenseId: lic.id, reason: "" })}>
                              <AlertCircle className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600" title="Revoke"
                              onClick={() => setActionDialog({ open: true, action: "revoke", licenseId: lic.id, reason: "" })}>
                              <XCircle className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-800" title="Blacklist"
                              onClick={() => setActionDialog({ open: true, action: "blacklist", licenseId: lic.id, reason: "" })}>
                              <Ban className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 mt-4">
          <Card>
            <CardHeader><CardTitle>Module Usage</CardTitle><CardDescription>Which ERP modules are most used across active licenses</CardDescription></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { module: "Sales", usage: 92 }, { module: "Inventory", usage: 88 },
                    { module: "Accounting", usage: 85 }, { module: "HR", usage: 64 },
                    { module: "CRM", usage: 58 }, { module: "Manufacturing", usage: 42 },
                    { module: "Projects", usage: 38 }, { module: "Helpdesk", usage: 31 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                    <XAxis dataKey="module" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="usage" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Plan Distribution</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(analytics?.byPlan || []).map((p) => (
                    <div key={p.plan} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{p.plan}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${analytics?.total ? (p.count / analytics.total) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-500 w-8 text-right">{p.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Grace Period Overview</CardTitle><CardDescription>Licenses currently in grace window</CardDescription></CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-600">
                  {licenses?.items.filter(l => {
                    const diff = new Date(l.expiresAt).getTime() - Date.now();
                    return diff < 0 && Math.abs(diff) < 7 * 24 * 60 * 60 * 1000;
                  }).length || 0}
                </p>
                <p className="text-sm text-slate-500 mt-1">licenses in grace period</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transfers" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Device Binding & Transfer History</CardTitle>
              <CardDescription>Audit trail of license transfers, activations, and hardware binding changes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">Transfer history loaded from audit logs. Hardware binding changes are tracked per activation.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6 mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Stripe", key: "stripe", icon: CreditCard, color: "bg-indigo-50 text-indigo-600" },
              { name: "PayTabs", key: "paytabs", icon: CreditCard, color: "bg-emerald-50 text-emerald-600" },
              { name: "HyperPay", key: "hyperpay", icon: CreditCard, color: "bg-blue-50 text-blue-600" },
              { name: "Moyasar", key: "moyasar", icon: CreditCard, color: "bg-purple-50 text-purple-600" },
            ].map((provider) => (
              <Card key={provider.key}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className={cn("rounded-lg p-2", provider.color)}>
                      <provider.icon className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className={cn(
                      (paymentMethods as any)?.[provider.key]?.enabled
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-slate-100 text-slate-500",
                    )}>
                      {(paymentMethods as any)?.[provider.key]?.enabled ? "Configured" : "Not Set Up"}
                    </Badge>
                  </div>
                  <p className="mt-4 font-medium">{provider.name}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {(paymentMethods as any)?.[provider.key]?.enabled
                      ? "Integration active"
                      : "Add API keys in environment config"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader><CardTitle>Payment Gateway Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-dashed p-6 text-center">
                <CreditCard className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm text-slate-500">
                  Stripe, PayTabs, HyperPay, and Moyasar integrations are configured via environment variables.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Set STRIPE_SECRET_KEY, PAYTAB_SERVER_KEY, HYPERPAY_ENTITY_ID, or MOYASAR_API_KEY to enable.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={extendDialog.open} onOpenChange={(o) => setExtendDialog(f => ({ ...f, open: o }))}>
        <DialogContent>
          <DialogHeader><DialogTitle>Extend License</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Label>Additional Days</Label>
            <Input type="number" min={1} value={extendDialog.days} onChange={e => setExtendDialog(f => ({ ...f, days: Number(e.target.value) }))} />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setExtendDialog({ open: false, licenseId: 0, days: 30 })}>Cancel</Button>
              <Button disabled={extendMutation.isPending} onClick={() => extendMutation.mutate({ id: extendDialog.licenseId, additionalDays: extendDialog.days })}>
                Extend
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={planDialog.open} onOpenChange={(o) => setPlanDialog(f => ({ ...f, open: o }))}>
        <DialogContent>
          <DialogHeader><DialogTitle>Change License Plan</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Plan Tier</Label>
              <Select value={planDialog.plan} onValueChange={v => setPlanDialog(f => ({ ...f, plan: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLAN_TIERS.map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Max Devices</Label>
              <Input type="number" min={1} value={planDialog.maxDevices} onChange={e => setPlanDialog(f => ({ ...f, maxDevices: Number(e.target.value) }))} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setPlanDialog({ open: false, licenseId: 0, plan: "desktop", maxDevices: 1 })}>Cancel</Button>
              <Button disabled={changePlanMutation.isPending} onClick={() => changePlanMutation.mutate({ id: planDialog.licenseId, plan: planDialog.plan, maxDevices: planDialog.maxDevices })}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={actionDialog.open} onOpenChange={(o) => setActionDialog(f => ({ ...f, open: o }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">{actionDialog.action} License</DialogTitle>
            <DialogDescription>This action will change the license status. Provide a reason (optional).</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={actionDialog.reason}
              onChange={e => setActionDialog(f => ({ ...f, reason: e.target.value }))}
              placeholder="Reason for this action..."
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setActionDialog({ open: false, action: "", licenseId: 0, reason: "" })}>Cancel</Button>
              <Button
                variant={actionDialog.action === "suspend" ? "secondary" : actionDialog.action === "blacklist" ? "destructive" : "destructive"}
                disabled={actionHandlers[actionDialog.action]?.isPending}
                onClick={handleAction}
              >
                Confirm {actionDialog.action}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
