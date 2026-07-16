import { Fragment, useMemo, useState } from "react";
import {
  Search, Filter, MoreHorizontal,
  CheckCircle2, XCircle, Repeat, Clock, Trash2, Key, Copy, Check,
  Archive, RotateCcw, ShieldCheck, AlertTriangle,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function SuperAdminCompanies() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPlan, setFilterPlan] = useState("all");
  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);
  const [showChangePlan, setShowChangePlan] = useState(false);
  const [showExtendTrial, setShowExtendTrial] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showLicense, setShowLicense] = useState(false);
  const [newPlanId, setNewPlanId] = useState<number>(0);
  const [extendDays, setExtendDays] = useState("7");
  const [licenseResult, setLicenseResult] = useState<{ key: string; expiresAt: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const utils = trpc.useUtils();
  const plansQuery = trpc.superAdmin.plans.list.useQuery();
  const companiesQuery = trpc.superAdmin.companies.list.useQuery(undefined, { refetchInterval: 30000 });
  const readinessQuery = trpc.superAdmin.compliance.globalReadiness.useQuery(
    { limit: 100, onlyNotReady: false },
    { refetchInterval: 45000 },
  );
  const plans = plansQuery.data || [];
  const companies = companiesQuery.data?.items || [];
  const readinessByTenant = useMemo(() => {
    const map = new Map<number, any>();
    (readinessQuery.data?.items || []).forEach((item: any) => {
      if (item.tenant?.id) map.set(item.tenant.id, item);
    });
    return map;
  }, [readinessQuery.data]);

  const activateMutation = trpc.superAdmin.companies.activate.useMutation({
    onSuccess: () => { utils.superAdmin.companies.list.invalidate(); toast.success(isAr ? "تم تفعيل الشركة" : "Company activated"); },
  });
  const deactivateMutation = trpc.superAdmin.companies.deactivate.useMutation({
    onSuccess: () => { utils.superAdmin.companies.list.invalidate(); toast.success(isAr ? "تم إيقاف الشركة" : "Company deactivated"); },
  });
  const archiveMutation = trpc.superAdmin.companies.archive.useMutation({
    onSuccess: () => {
      utils.superAdmin.companies.list.invalidate();
      utils.superAdmin.compliance.globalReadiness.invalidate();
      toast.success(isAr ? "تم أرشفة الشركة" : "Company archived");
    },
  });
  const restoreMutation = trpc.superAdmin.companies.restore.useMutation({
    onSuccess: () => {
      utils.superAdmin.companies.list.invalidate();
      utils.superAdmin.compliance.globalReadiness.invalidate();
      toast.success(isAr ? "تمت استعادة الشركة" : "Company restored");
    },
  });
  const changePlanMutation = trpc.superAdmin.companies.changePlan.useMutation({
    onSuccess: () => { utils.superAdmin.companies.list.invalidate(); toast.success(isAr ? "تم تغيير الخطة" : "Plan changed"); setShowChangePlan(false); },
  });
  const extendTrialMutation = trpc.superAdmin.companies.extendTrial.useMutation({
    onSuccess: () => { utils.superAdmin.companies.list.invalidate(); toast.success(isAr ? "تم تمديد الفترة التجريبية" : "Trial extended"); setShowExtendTrial(false); },
  });
  const deleteMutation = trpc.superAdmin.companies.delete.useMutation({
    onSuccess: () => { utils.superAdmin.companies.list.invalidate(); toast.success(isAr ? "تم حذف الشركة" : "Company deleted"); setShowDelete(false); },
  });
  const licenseMutation = trpc.superAdmin.licenses.generate.useMutation({
    onSuccess: (data) => { setLicenseResult({ key: data.licenseKey, expiresAt: data.expiresAt }); setShowLicense(true); },
  });

  const getPlanName = (planValue: string) => {
    const p = plans.find(pl => pl.name.toLowerCase() === planValue.toLowerCase());
    return p ? (isAr && p.nameAr ? p.nameAr : p.name) : planValue;
  };

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    trial: "bg-blue-100 text-blue-700",
    suspended: "bg-red-100 text-red-700",
    cancelled: "bg-slate-100 text-slate-600",
  };

  const filtered = companies.filter((c: any) => {
    const name = c.name || "";
    if (search && !name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (filterPlan !== "all") {
      const planMatch = (c.plan || "").toLowerCase() === filterPlan.toLowerCase();
      const subPlan = c.subscription?.planId
        ? plans.find(p => p.id === c.subscription.planId)
        : null;
      const subPlanMatch = subPlan ? subPlan.name.toLowerCase() === filterPlan.toLowerCase() : false;
      if (!planMatch && !subPlanMatch) return false;
    }
    return true;
  });

  const handleActivate = (tenantId: number) => {
    activateMutation.mutate({ tenantId });
  };

  const handleDeactivate = (tenantId: number) => {
    deactivateMutation.mutate({ tenantId });
  };

  const handleArchive = (tenantId: number) => {
    archiveMutation.mutate({ tenantId, reason: "Archived from super admin company management" });
  };

  const handleRestore = (tenantId: number) => {
    restoreMutation.mutate({ tenantId, subscriptionStatus: "active" });
  };

  const handleChangePlan = () => {
    if (!selectedTenantId || !newPlanId) return;
    changePlanMutation.mutate({ tenantId: selectedTenantId, planId: newPlanId, billingCycle: "monthly" });
  };

  const handleExtendTrial = () => {
    if (!selectedTenantId) return;
    extendTrialMutation.mutate({ tenantId: selectedTenantId, days: Number(extendDays) });
  };

  const handleDelete = () => {
    if (!selectedTenantId) return;
    deleteMutation.mutate({ tenantId: selectedTenantId, confirm: true });
  };

  const handleGenerateLicense = (tenantId: number, companyName: string) => {
    licenseMutation.mutate({ tenantId, companyName, plan: "desktop", maxDevices: 1, validDays: 365 });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success(isAr ? "تم نسخ المفتاح" : "License key copied");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const detailRows = (company: any) => {
    const sub = company.subscription;
    return (
      <tr key={`details-${company.id}`}>
        <td colSpan={7} className="px-4 py-4 bg-slate-50">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">{isAr ? "البريد" : "Email"}:</span>
              <span className="ml-2 font-medium">{company.email || "-"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">{isAr ? "البلد" : "Country"}:</span>
              <span className="ml-2 font-medium">{company.country || "-"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">{isAr ? "الخطة" : "Plan"}:</span>
              <span className="ml-2 font-medium">{getPlanName(company.plan || "")}</span>
            </div>
            <div>
              <span className="text-muted-foreground">{isAr ? "انتهاء التجربة" : "Trial Ends"}:</span>
              <span className="ml-2 font-medium">
                {company.trialEndsAt ? new Date(company.trialEndsAt).toLocaleDateString() : "-"}
              </span>
            </div>
            {sub && (
              <>
                <div>
                  <span className="text-muted-foreground">{isAr ? "حالة الاشتراك" : "Sub Status"}:</span>
                  <span className="ml-2 font-medium">{sub.status}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{isAr ? "دورة الفوترة" : "Billing"}:</span>
                  <span className="ml-2 font-medium">{sub.billingCycle || "-"}</span>
                </div>
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{isAr ? "إدارة الشركات" : "Company Management"}</h1>
          <p className="text-sm text-muted-foreground">{isAr ? "إدارة جميع الشركات على المنصة" : "Manage all companies on the platform"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <a href="/app/admin/super-compliance">
              <ShieldCheck className="mr-2 size-4" />
              {isAr ? "الامتثال" : "Compliance"}
            </a>
          </Button>
          <Badge variant="secondary">{companiesQuery.data?.total || 0} {isAr ? "شركة" : "companies"}</Badge>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input className="pl-10" placeholder={isAr ? "بحث..." : "Search companies..."} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]">
            <Filter className="size-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isAr ? "الكل" : "All"}</SelectItem>
            <SelectItem value="active">{isAr ? "نشط" : "Active"}</SelectItem>
            <SelectItem value="trial">{isAr ? "تجريبي" : "Trial"}</SelectItem>
            <SelectItem value="suspended">{isAr ? "موقوف" : "Suspended"}</SelectItem>
            <SelectItem value="cancelled">{isAr ? "ملغي" : "Cancelled"}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPlan} onValueChange={setFilterPlan}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={isAr ? "الخطة" : "Plan"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isAr ? "الكل" : "All"}</SelectItem>
            {plans.map(p => (
              <SelectItem key={p.id} value={p.name.toLowerCase()}>
                {isAr && p.nameAr ? p.nameAr : p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {companiesQuery.isLoading ? (
            <div className="p-8 text-center text-muted-foreground">{isAr ? "جاري التحميل..." : "Loading..."}</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{isAr ? "الشركة" : "Company"}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{isAr ? "الخطة" : "Plan"}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{isAr ? "الحالة" : "Status"}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{isAr ? "الجاهزية" : "Readiness"}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{isAr ? "تاريخ التسجيل" : "Created"}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{isAr ? "الترخيص" : "License"}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((company: any) => {
                  const readiness = readinessByTenant.get(company.id);
                  return (
                  <Fragment key={company.id}>
                    <tr key={company.id} className="border-b hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                            {(company.name || "?").charAt(0)}
                          </div>
                          <div>
                            <span className="font-medium text-sm">{company.name}</span>
                            <p className="text-xs text-muted-foreground">{company.email || "-"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{getPlanName(company.plan || "")}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={statusColors[company.status] || "bg-slate-100 text-slate-600"}>{company.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        {readiness ? (
                          <div className="flex items-center gap-2">
                            <Badge className={readiness.readyForSale ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                              {readiness.score || 0}%
                            </Badge>
                            {readiness.readyForSale ? (
                              <CheckCircle2 className="size-4 text-emerald-600" />
                            ) : (
                              <AlertTriangle className="size-4 text-amber-600" />
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {company.createdAt ? new Date(company.createdAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleGenerateLicense(company.id, company.name)}
                          disabled={licenseMutation.isPending}
                        >
                          <Key className="size-3 mr-1" />
                          {isAr ? "توليد" : "Generate"}
                        </Button>
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm"><MoreHorizontal className="size-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {company.status !== "active" && (
                              <DropdownMenuItem onClick={() => handleActivate(company.id)}>
                                <CheckCircle2 className="size-3 mr-2 text-green-600" />
                                {isAr ? "تفعيل" : "Activate"}
                              </DropdownMenuItem>
                            )}
                            {company.status === "active" && (
                              <DropdownMenuItem onClick={() => handleDeactivate(company.id)}>
                                <XCircle className="size-3 mr-2 text-red-600" />
                                {isAr ? "إيقاف" : "Deactivate"}
                              </DropdownMenuItem>
                            )}
                            {company.status === "suspended" ? (
                              <DropdownMenuItem onClick={() => handleRestore(company.id)}>
                                <RotateCcw className="size-3 mr-2 text-emerald-600" />
                                {isAr ? "استعادة" : "Restore"}
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleArchive(company.id)}>
                                <Archive className="size-3 mr-2 text-amber-600" />
                                {isAr ? "أرشفة" : "Archive"}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => { setSelectedTenantId(company.id); setNewPlanId(0); setShowChangePlan(true); }}>
                              <Repeat className="size-3 mr-2" />
                              {isAr ? "تغيير الخطة" : "Change Plan"}
                            </DropdownMenuItem>
                            {company.status === "trial" && (
                              <DropdownMenuItem onClick={() => { setSelectedTenantId(company.id); setShowExtendTrial(true); }}>
                                <Clock className="size-3 mr-2" />
                                {isAr ? "تمديد التجربة" : "Extend Trial"}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => { setSelectedTenantId(company.id); setShowDelete(true); }}>
                              <Trash2 className="size-3 mr-2" />
                              {isAr ? "حذف" : "Delete"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                    {detailRows(company)}
                  </Fragment>
                );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      {isAr ? "لا توجد شركات" : "No companies found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showChangePlan} onOpenChange={setShowChangePlan}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAr ? "تغيير الخطة" : "Change Plan"}</DialogTitle>
            <DialogDescription>
              {isAr ? "اختر الخطة الجديدة" : "Select a new plan"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Select value={String(newPlanId)} onValueChange={(v) => setNewPlanId(Number(v))}>
              <SelectTrigger>
                <SelectValue placeholder={isAr ? "اختر خطة" : "Select a plan"} />
              </SelectTrigger>
              <SelectContent>
                {plans.map(p => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {isAr && p.nameAr ? p.nameAr : p.name} - {p.priceMonth} {p.currency}/{isAr ? "شهرياً" : "mo"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangePlan(false)}>{isAr ? "إلغاء" : "Cancel"}</Button>
            <Button onClick={handleChangePlan} disabled={!newPlanId}>{isAr ? "تأكيد" : "Confirm"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showExtendTrial} onOpenChange={setShowExtendTrial}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAr ? "تمديد الفترة التجريبية" : "Extend Trial"}</DialogTitle>
            <DialogDescription>
              {isAr ? "أدخل عدد الأيام للإضافة" : "Enter number of days to add"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Input value={extendDays} onChange={(e) => setExtendDays(e.target.value)} type="number" placeholder={isAr ? "عدد الأيام" : "Days"} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExtendTrial(false)}>{isAr ? "إلغاء" : "Cancel"}</Button>
            <Button onClick={handleExtendTrial}>{isAr ? "تمديد" : "Extend"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showLicense && !!licenseResult} onOpenChange={(open) => { if (!open) setLicenseResult(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isAr ? "مفتاح الترخيص" : "License Key Generated"}</DialogTitle>
            <DialogDescription>
              {isAr ? "قم بنسخ مفتاح الترخيص وإرساله إلى الشركة" : "Copy the license key and send it to the company"}
            </DialogDescription>
          </DialogHeader>
          {licenseResult && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-slate-50 p-4">
                <p className="text-xs text-muted-foreground mb-1">{isAr ? "مفتاح الترخيص" : "License Key"}:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-slate-100 px-3 py-2 text-sm font-mono break-all">{licenseResult.key}</code>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(licenseResult.key)}>
                    {copied ? <Check className="size-4 text-green-600" /> : <Copy className="size-4" />}
                  </Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {isAr ? "تاريخ الانتهاء" : "Expires"}: {new Date(licenseResult.expiresAt).toLocaleDateString()}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => { setLicenseResult(null); setShowLicense(false); }}>
              {isAr ? "إغلاق" : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isAr ? "تأكيد الحذف" : "Confirm Deletion"}</AlertDialogTitle>
            <AlertDialogDescription>
              {isAr
                ? `هل أنت متأكد من حذف هذه الشركة؟ سيتم حذف جميع بياناتها.`
                : `Are you sure you want to delete this company? All data will be lost.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isAr ? "إلغاء" : "Cancel"}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              {isAr ? "حذف" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
