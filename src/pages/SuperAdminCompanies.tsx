import { useState } from "react";
import {
  Search, Filter, ChevronDown, ChevronUp, MoreHorizontal,
  CheckCircle2, XCircle, Repeat, Clock, Trash2, Loader2,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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

interface Company {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: "active" | "trial" | "inactive" | "suspended";
  createdDate: string;
  trialEnds?: string;
  employeesCount?: number;
  country?: string;
}

const initialCompanies: Company[] = [
  { id: "1", name: "Alfa Corp", email: "info@alfacorp.com", plan: "Business", status: "active", createdDate: "2026-05-15", employeesCount: 8, country: "SA" },
  { id: "2", name: "Beta LLC", email: "contact@betallc.com", plan: "Starter", status: "trial", createdDate: "2026-06-01", trialEnds: "2026-06-04", employeesCount: 3, country: "AE" },
  { id: "3", name: "Gamma Trading", email: "admin@gammatrading.com", plan: "Enterprise", status: "active", createdDate: "2026-04-20", employeesCount: 25, country: "SA" },
  { id: "4", name: "Delta Services", email: "ceo@deltaservices.com", plan: "Business", status: "inactive", createdDate: "2026-03-10", employeesCount: 5, country: "PK" },
  { id: "5", name: "Epsilon Co", email: "info@epsilonco.com", plan: "Starter", status: "suspended", createdDate: "2026-02-01", employeesCount: 2, country: "EG" },
];

export default function SuperAdminCompanies() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPlan, setFilterPlan] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showChangePlan, setShowChangePlan] = useState(false);
  const [showExtendTrial, setShowExtendTrial] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [newPlan, setNewPlan] = useState("Business");
  const [extendDays, setExtendDays] = useState("7");

  const activateMutation = trpc.superAdmin.companies.activate.useMutation();
  const deactivateMutation = trpc.superAdmin.companies.deactivate.useMutation();
  const changePlanMutation = trpc.superAdmin.companies.changePlan.useMutation();
  const extendTrialMutation = trpc.superAdmin.companies.extendTrial.useMutation();
  const deleteMutation = trpc.superAdmin.companies.delete.useMutation();

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    trial: "bg-blue-100 text-blue-700",
    inactive: "bg-slate-100 text-slate-600",
    suspended: "bg-red-100 text-red-700",
  };

  const filtered = companies.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (filterPlan !== "all" && c.plan !== filterPlan) return false;
    return true;
  });

  const handleAction = (companyId: string, action: string) => {
    switch (action) {
      case "activate":
        activateMutation.mutate({ id: companyId } as any);
        setCompanies((prev) => prev.map((c) => c.id === companyId ? { ...c, status: "active" } : c));
        break;
      case "deactivate":
        deactivateMutation.mutate({ id: companyId } as any);
        setCompanies((prev) => prev.map((c) => c.id === companyId ? { ...c, status: "inactive" } : c));
        break;
      case "delete":
        setSelectedCompany(companies.find((c) => c.id === companyId) || null);
        setShowDelete(true);
        break;
      case "changePlan":
        setSelectedCompany(companies.find((c) => c.id === companyId) || null);
        setNewPlan(companies.find((c) => c.id === companyId)?.plan || "Business");
        setShowChangePlan(true);
        break;
      case "extendTrial":
        setSelectedCompany(companies.find((c) => c.id === companyId) || null);
        setShowExtendTrial(true);
        break;
    }
  };

  const handleDeleteConfirm = () => {
    if (!selectedCompany) return;
    deleteMutation.mutate({ id: selectedCompany.id } as any);
    setCompanies((prev) => prev.filter((c) => c.id !== selectedCompany.id));
    setShowDelete(false);
  };

  const handleChangePlanConfirm = () => {
    if (!selectedCompany) return;
    changePlanMutation.mutate({ id: selectedCompany.id, plan: newPlan } as any);
    setCompanies((prev) => prev.map((c) => c.id === selectedCompany.id ? { ...c, plan: newPlan } : c));
    setShowChangePlan(false);
  };

  const handleExtendTrialConfirm = () => {
    if (!selectedCompany) return;
    extendTrialMutation.mutate({ id: selectedCompany.id, days: Number(extendDays) } as any);
    setShowExtendTrial(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{isAr ? "إدارة الشركات" : "Company Management"}</h1>
          <p className="text-sm text-muted-foreground">{isAr ? "إدارة جميع الشركات على المنصة" : "Manage all companies on the platform"}</p>
        </div>
        <Badge variant="secondary">{companies.length} {isAr ? "شركة" : "companies"}</Badge>
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
            <SelectItem value="inactive">{isAr ? "غير نشط" : "Inactive"}</SelectItem>
            <SelectItem value="suspended">{isAr ? "موقوف" : "Suspended"}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPlan} onValueChange={setFilterPlan}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={isAr ? "الخطة" : "Plan"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isAr ? "الكل" : "All"}</SelectItem>
            <SelectItem value="Starter">Starter</SelectItem>
            <SelectItem value="Business">Business</SelectItem>
            <SelectItem value="Enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{isAr ? "الشركة" : "Company"}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{isAr ? "الخطة" : "Plan"}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{isAr ? "الحالة" : "Status"}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{isAr ? "تاريخ التسجيل" : "Created"}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((company) => (
                <>
                  <tr key={company.id} className="border-b hover:bg-slate-50 cursor-pointer" onClick={() => setExpandedId(expandedId === company.id ? null : company.id)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                          {company.name[0]}
                        </div>
                        <div>
                          <span className="font-medium text-sm">{company.name}</span>
                          <p className="text-xs text-muted-foreground">{company.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{company.plan}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={statusColors[company.status]}>{company.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{company.createdDate}</td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm"><MoreHorizontal className="size-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {company.status !== "active" && (
                            <DropdownMenuItem onClick={() => handleAction(company.id, "activate")}>
                              <CheckCircle2 className="size-3 mr-2 text-green-600" />
                              {isAr ? "تفعيل" : "Activate"}
                            </DropdownMenuItem>
                          )}
                          {company.status === "active" && (
                            <DropdownMenuItem onClick={() => handleAction(company.id, "deactivate")}>
                              <XCircle className="size-3 mr-2 text-red-600" />
                              {isAr ? "إيقاف" : "Deactivate"}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleAction(company.id, "changePlan")}>
                            <Repeat className="size-3 mr-2" />
                            {isAr ? "تغيير الخطة" : "Change Plan"}
                          </DropdownMenuItem>
                          {company.status === "trial" && (
                            <DropdownMenuItem onClick={() => handleAction(company.id, "extendTrial")}>
                              <Clock className="size-3 mr-2" />
                              {isAr ? "تمديد التجربة" : "Extend Trial"}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => handleAction(company.id, "delete")}>
                            <Trash2 className="size-3 mr-2" />
                            {isAr ? "حذف" : "Delete"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                  {expandedId === company.id && (
                    <tr key={`${company.id}-details`}>
                      <td colSpan={5} className="px-4 py-4 bg-slate-50">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">{isAr ? "الموظفون" : "Employees"}:</span>
                            <span className="ml-2 font-medium">{company.employeesCount || "-"}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{isAr ? "الدولة" : "Country"}:</span>
                            <span className="ml-2 font-medium">{company.country || "-"}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{isAr ? "انتهاء التجربة" : "Trial Ends"}:</span>
                            <span className="ml-2 font-medium">{company.trialEnds || "-"}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={showChangePlan} onOpenChange={setShowChangePlan}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAr ? "تغيير الخطة" : "Change Plan"}</DialogTitle>
            <DialogDescription>
              {isAr
                ? `تغيير خطة ${selectedCompany?.name}`
                : `Change plan for ${selectedCompany?.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Select value={newPlan} onValueChange={setNewPlan}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Starter">Starter</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangePlan(false)}>{isAr ? "إلغاء" : "Cancel"}</Button>
            <Button onClick={handleChangePlanConfirm}>{isAr ? "تأكيد" : "Confirm"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showExtendTrial} onOpenChange={setShowExtendTrial}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAr ? "تمديد الفترة التجريبية" : "Extend Trial"}</DialogTitle>
            <DialogDescription>
              {isAr
                ? `تمديد الفترة التجريبية لـ ${selectedCompany?.name}`
                : `Extend trial for ${selectedCompany?.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Input value={extendDays} onChange={(e) => setExtendDays(e.target.value)} type="number" placeholder={isAr ? "عدد الأيام" : "Days"} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExtendTrial(false)}>{isAr ? "إلغاء" : "Cancel"}</Button>
            <Button onClick={handleExtendTrialConfirm}>{isAr ? "تمديد" : "Extend"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isAr ? "تأكيد الحذف" : "Confirm Deletion"}</AlertDialogTitle>
            <AlertDialogDescription>
              {isAr
                ? `هل أنت متأكد من حذف ${selectedCompany?.name}؟ سيتم حذف جميع بيانات الشركة.`
                : `Are you sure you want to delete ${selectedCompany?.name}? All company data will be lost.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isAr ? "إلغاء" : "Cancel"}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              {isAr ? "حذف" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
