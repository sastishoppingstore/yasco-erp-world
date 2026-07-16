import { useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, Building2, CheckCircle2, CreditCard, Headphones,
  KeyRound, LifeBuoy, RefreshCw, ShieldCheck, UserCheck, XCircle,
} from "lucide-react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import ActionButton3D from "@/components/ui/ActionButton3D";
import { toast } from "sonner";

export default function SuperAdminMasterControl() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const utils = trpc.useUtils();
  const [selectedTenant, setSelectedTenant] = useState<number | null>(null);
  const [limits, setLimits] = useState({ userLimit: "", branchLimit: "", warehouseLimit: "", productLimit: "" });

  const stats = trpc.superAdmin.stats.dashboard.useQuery(undefined, { refetchInterval: 60000 });
  const companies = trpc.superAdmin.companies.list.useQuery({ limit: 100, offset: 0 }, { refetchInterval: 45000 });
  const readiness = trpc.superAdmin.compliance.globalReadiness.useQuery({ limit: 100, onlyNotReady: false }, { refetchInterval: 45000 });
  const tickets = trpc.superAdmin.supportTickets.list.useQuery({ limit: 8 }, { refetchInterval: 60000 });
  const audit = trpc.superAdmin.auditLogs.list.useQuery({ limit: 8, offset: 0 }, { refetchInterval: 60000 });

  const activate = trpc.superAdmin.companies.activate.useMutation({
    onSuccess: () => { utils.superAdmin.companies.list.invalidate(); toast.success("Company activated"); },
  });
  const suspend = trpc.superAdmin.companies.deactivate.useMutation({
    onSuccess: () => { utils.superAdmin.companies.list.invalidate(); toast.success("Company suspended"); },
  });
  const impersonate = trpc.superAdmin.impersonate.start.useMutation({
    onSuccess: (data) => toast.success(`Impersonation audit started for ${data.tenantName}`),
    onError: (error) => toast.error(error.message),
  });
  const setModule = trpc.superAdmin.modules.setTenantModule.useMutation({
    onSuccess: () => {
      utils.superAdmin.modules.listForTenant.invalidate();
      utils.superAdmin.serviceEvents.list.invalidate();
      toast.success("Module setting updated");
    },
    onError: (error) => toast.error(error.message),
  });
  const updateLimits = trpc.superAdmin.subscriptions.updateLimits.useMutation({
    onSuccess: () => {
      utils.superAdmin.companies.list.invalidate();
      utils.superAdmin.serviceEvents.list.invalidate();
      toast.success("Subscription controls updated");
    },
    onError: (error) => toast.error(error.message),
  });
  const requestBackup = trpc.superAdmin.serviceEvents.requestBackup.useMutation({
    onSuccess: () => {
      utils.superAdmin.serviceEvents.list.invalidate();
      toast.success("Request logged");
    },
    onError: (error) => toast.error(error.message),
  });

  const readinessByTenant = useMemo(() => {
    const map = new Map<number, any>();
    readiness.data?.items.forEach((item: any) => {
      if (item.tenant?.id) map.set(item.tenant.id, item);
    });
    return map;
  }, [readiness.data]);

  const tenantOptions = companies.data?.items ?? [];
  const selectedCompany = tenantOptions.find((company: any) => company.id === selectedTenant) ?? tenantOptions[0];
  const selectedReadiness = selectedCompany ? readinessByTenant.get(selectedCompany.id) : null;
  const modules = trpc.superAdmin.modules.listForTenant.useQuery(
    { tenantId: selectedCompany?.id ?? 0 },
    { enabled: Boolean(selectedCompany?.id), refetchInterval: 60000 },
  );
  const serviceEvents = trpc.superAdmin.serviceEvents.list.useQuery(
    { tenantId: selectedCompany?.id, limit: 8 },
    { enabled: Boolean(selectedCompany?.id), refetchInterval: 60000 },
  );
  const readyPercent = readiness.data?.totalChecked
    ? Math.round(((readiness.data.ready || 0) / readiness.data.totalChecked) * 100)
    : 0;

  const controlCards = [
    { label: "Companies", value: stats.data?.totalCompanies ?? 0, icon: Building2, tone: "bg-blue-50 text-blue-700" },
    { label: "Active", value: stats.data?.activeCompanies ?? 0, icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-700" },
    { label: "Suspended", value: stats.data?.suspendedCompanies ?? 0, icon: XCircle, tone: "bg-red-50 text-red-700" },
    { label: "Failed ZATCA", value: stats.data?.failedZatca ?? 0, icon: AlertTriangle, tone: "bg-amber-50 text-amber-700" },
  ];

  useEffect(() => {
    if (!selectedCompany?.subscription) return;
    setLimits({
      userLimit: String(selectedCompany.subscription.userLimit ?? ""),
      branchLimit: String(selectedCompany.subscription.branchLimit ?? ""),
      warehouseLimit: String(selectedCompany.subscription.warehouseLimit ?? ""),
      productLimit: String(selectedCompany.subscription.productLimit ?? ""),
    });
  }, [selectedCompany?.id, selectedCompany?.subscription]);

  const saveLimits = () => {
    if (!selectedCompany?.subscription) return;
    updateLimits.mutate({
      tenantId: selectedCompany.id,
      userLimit: Number(limits.userLimit || 0),
      branchLimit: Number(limits.branchLimit || 0),
      warehouseLimit: Number(limits.warehouseLimit || 0),
      productLimit: Number(limits.productLimit || 0),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{isAr ? "التحكم الكامل للمنصة" : "Platform Master Control"}</h1>
          <p className="text-sm text-slate-500">
            {isAr ? "إدارة العملاء، الخدمات، الاشتراكات، الامتثال والدعم من مكان واحد." : "Manage clients, services, subscriptions, compliance and support from one place."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm"><Link to="/app/admin/super-companies"><Building2 className="mr-2 size-4" />Companies</Link></Button>
          <Button asChild variant="outline" size="sm"><Link to="/app/admin/super-plans"><CreditCard className="mr-2 size-4" />Plans</Link></Button>
          <Button asChild size="sm"><Link to="/app/admin/super-compliance"><ShieldCheck className="mr-2 size-4" />Compliance</Link></Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {controlCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardContent className="p-5">
                <div className={`inline-flex rounded-lg p-2 ${card.tone}`}><Icon className="size-5" /></div>
                <p className="mt-4 text-2xl font-bold">{stats.isLoading ? "..." : card.value}</p>
                <p className="text-sm text-slate-500">{card.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><Activity className="size-5" />Tenant Command Center</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Select value={String(selectedCompany?.id ?? "")} onValueChange={(value) => setSelectedTenant(Number(value))}>
                <SelectTrigger className="w-[320px]"><SelectValue placeholder="Select company" /></SelectTrigger>
                <SelectContent>
                  {tenantOptions.map((company: any) => (
                    <SelectItem key={company.id} value={String(company.id)}>{company.name} · {company.status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCompany && (
                <div className="flex flex-wrap gap-2">
                  <ActionButton3D icon={<CheckCircle2 className="size-3.5" />} label="Activate" color="emerald" onClick={() => activate.mutate({ tenantId: selectedCompany.id })} />
                  <ActionButton3D icon={<XCircle className="size-3.5" />} label="Suspend" color="red" onClick={() => suspend.mutate({ tenantId: selectedCompany.id })} />
                  <ActionButton3D icon={<UserCheck className="size-3.5" />} label="Support Login" color="purple" onClick={() => impersonate.mutate({ tenantId: selectedCompany.id })} />
                  <ActionButton3D icon={<RefreshCw className="size-3.5" />} label="Backup" color="blue" variant="outline" onClick={() => requestBackup.mutate({ tenantId: selectedCompany.id, type: "backup_request" })} />
                </div>
              )}
            </div>

            {selectedCompany && (
              <div className="grid gap-4 rounded-lg border bg-slate-50 p-4 md:grid-cols-4">
                <div><p className="text-xs text-slate-500">Status</p><Badge className="mt-1 capitalize">{selectedCompany.status}</Badge></div>
                <div><p className="text-xs text-slate-500">Plan</p><p className="mt-1 font-semibold capitalize">{selectedCompany.plan || "-"}</p></div>
                <div><p className="text-xs text-slate-500">Subscription</p><p className="mt-1 font-semibold capitalize">{selectedCompany.subscription?.status || "none"}</p></div>
                <div><p className="text-xs text-slate-500">Readiness</p><p className="mt-1 font-semibold">{selectedReadiness?.score ?? 0}%</p></div>
                <div><p className="text-xs text-slate-500">Users</p><p className="mt-1 font-semibold">{selectedCompany.subscription?.userLimit ?? "-"}</p></div>
                <div><p className="text-xs text-slate-500">Branches</p><p className="mt-1 font-semibold">{selectedCompany.subscription?.branchLimit ?? "-"}</p></div>
                <div><p className="text-xs text-slate-500">Warehouses</p><p className="mt-1 font-semibold">{selectedCompany.subscription?.warehouseLimit ?? "-"}</p></div>
                <div className="flex items-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateLimits.mutate({ tenantId: selectedCompany.id, status: "past_due", graceDays: 7 })}
                    disabled={!selectedCompany.subscription}
                  >
                    7-day grace
                  </Button>
                </div>
                <div>
                  <p className="text-xs text-slate-500">User limit</p>
                  <Input className="mt-1 h-8" type="number" value={limits.userLimit} onChange={(event) => setLimits((prev) => ({ ...prev, userLimit: event.target.value }))} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Branch limit</p>
                  <Input className="mt-1 h-8" type="number" value={limits.branchLimit} onChange={(event) => setLimits((prev) => ({ ...prev, branchLimit: event.target.value }))} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Warehouse limit</p>
                  <Input className="mt-1 h-8" type="number" value={limits.warehouseLimit} onChange={(event) => setLimits((prev) => ({ ...prev, warehouseLimit: event.target.value }))} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Product limit</p>
                  <div className="mt-1 flex gap-2">
                    <Input className="h-8" type="number" value={limits.productLimit} onChange={(event) => setLimits((prev) => ({ ...prev, productLimit: event.target.value }))} />
                    <Button size="sm" onClick={saveLimits} disabled={!selectedCompany.subscription || updateLimits.isPending}>Save</Button>
                  </div>
                </div>
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>ZATCA</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenantOptions.slice(0, 12).map((company: any) => {
                  const rowReady = readinessByTenant.get(company.id);
                  return (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{company.status}</Badge></TableCell>
                      <TableCell className="capitalize">{company.plan || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={rowReady?.readyForSale ? "default" : "destructive"}>
                          {rowReady?.readyForSale ? "Ready" : `${rowReady?.criticalOpen ?? 0} blockers`}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => setSelectedTenant(company.id)}>Manage</Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Global Launch Readiness</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <span>{readiness.data?.ready ?? 0} ready / {readiness.data?.totalChecked ?? 0} checked</span>
                <span className="font-bold">{readyPercent}%</span>
              </div>
              <Progress value={readyPercent} className="mt-3" />
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded border bg-red-50 p-3 text-red-700">{readiness.data?.criticalOpen ?? 0} critical</div>
                <div className="rounded border bg-amber-50 p-3 text-amber-700">{readiness.data?.warningsOpen ?? 0} warnings</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Service Switchboard</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 gap-2">
              {(modules.data || []).slice(0, 12).map((item: any) => (
                <div key={item.moduleKey} className="rounded-lg border bg-slate-50 p-3 text-sm font-medium">
                  <div className="flex items-center justify-between">
                    <div>
                      <span>{item.name}</span>
                      <p className="text-xs font-normal text-slate-500">{item.category || item.moduleKey} · {item.source}</p>
                    </div>
                    <Switch
                      checked={Boolean(item.isEnabled)}
                      disabled={setModule.isPending}
                      onCheckedChange={(checked) => selectedCompany && setModule.mutate({
                        tenantId: selectedCompany.id,
                        moduleKey: item.moduleKey,
                        isEnabled: checked,
                        source: "override",
                      })}
                    />
                  </div>
                </div>
              ))}
              {!modules.data?.length && <p className="text-sm text-slate-500">No module registry records yet.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><LifeBuoy className="size-5" />Support Queue</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {(tickets.data || []).map((ticket: any) => (
                <div key={ticket.id} className="rounded border p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{ticket.subject || `Ticket #${ticket.id}`}</span>
                    <Badge variant="outline" className="capitalize">{ticket.status}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{ticket.priority || "normal"} · tenant #{ticket.tenantId ?? "-"}</p>
                </div>
              ))}
              {!tickets.data?.length && <p className="text-sm text-slate-500">No support tickets.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Tenant Service Events</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {(serviceEvents.data || []).map((event: any) => (
                <div key={event.id} className="rounded border p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{event.title}</span>
                    <Badge variant="outline" className="capitalize">{event.status}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{event.eventType}</p>
                </div>
              ))}
              {!serviceEvents.data?.length && <p className="text-sm text-slate-500">No service events yet.</p>}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><KeyRound className="size-5" />Owner Controls</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Button asChild variant="outline"><Link to="/app/admin/license-console"><KeyRound className="mr-2 size-4" />Licenses</Link></Button>
            <Button asChild variant="outline"><Link to="/app/admin/super-resellers"><Headphones className="mr-2 size-4" />Resellers</Link></Button>
            <Button asChild variant="outline"><Link to="/app/admin/super-smtp"><RefreshCw className="mr-2 size-4" />SMTP</Link></Button>
            <Button asChild variant="outline"><Link to="/app/admin/super-email-templates"><ShieldCheck className="mr-2 size-4" />Templates</Link></Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Recent Audit Trail</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {(audit.data?.items || []).map((log: any) => (
              <div key={log.id} className="flex items-center justify-between rounded border bg-slate-50 px-3 py-2 text-sm">
                <span className="font-medium">{log.action}</span>
                <span className="text-xs text-slate-500">{log.entityType} #{log.entityId ?? "-"}</span>
              </div>
            ))}
            {!audit.data?.items?.length && <p className="text-sm text-slate-500">No audit events yet.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
