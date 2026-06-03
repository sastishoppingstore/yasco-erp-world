import { useState } from "react";
import {
  Plus, Edit3, Trash2, ToggleLeft, ToggleRight, MoreHorizontal,
  Check, X, Loader2, Search,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

interface Plan {
  id: string;
  name: string;
  priceMonth: number;
  priceYear: number;
  productLimit: number;
  userLimit: number;
  features: string[];
  active: boolean;
  createdAt: string;
}

const initialPlans: Plan[] = [
  { id: "1", name: "Starter", priceMonth: 40, priceYear: 400, productLimit: 50, userLimit: 3, features: ["50 Products", "3 Users", "Basic Reports"], active: true, createdAt: "2026-01-01" },
  { id: "2", name: "Business", priceMonth: 100, priceYear: 1000, productLimit: 500, userLimit: 10, features: ["500 Products", "10 Users", "Advanced Reports", "CRM"], active: true, createdAt: "2026-01-01" },
  { id: "3", name: "Enterprise", priceMonth: 300, priceYear: 3000, productLimit: 999999, userLimit: 999, features: ["Unlimited Products", "Unlimited Users", "All Modules", "API"], active: true, createdAt: "2026-01-01" },
  { id: "4", name: "Legacy Basic", priceMonth: 25, priceYear: 250, productLimit: 25, userLimit: 2, features: ["25 Products", "2 Users"], active: false, createdAt: "2025-06-01" },
];

export default function SuperAdminPlans() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deletePlan, setDeletePlan] = useState<Plan | null>(null);

  const [name, setName] = useState("");
  const [priceMonth, setPriceMonth] = useState("");
  const [priceYear, setPriceYear] = useState("");
  const [productLimit, setProductLimit] = useState("");
  const [userLimit, setUserLimit] = useState("");
  const [features, setFeatures] = useState("");
  const [active, setActive] = useState(true);

  const createMutation = trpc.superAdmin.plans.create.useMutation({
    onSuccess: () => { setShowCreate(false); resetForm(); },
  });
  const updateMutation = trpc.superAdmin.plans.update.useMutation();
  const deleteMutation = trpc.superAdmin.plans.delete.useMutation();
  const toggleMutation = trpc.superAdmin.plans.toggleActive.useMutation();

  const filtered = plans.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setName(""); setPriceMonth(""); setPriceYear("");
    setProductLimit(""); setUserLimit(""); setFeatures(""); setActive(true);
  };

  const openEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setPriceMonth(String(plan.priceMonth));
    setPriceYear(String(plan.priceYear));
    setProductLimit(String(plan.productLimit));
    setUserLimit(String(plan.userLimit));
    setFeatures(plan.features.join("\n"));
    setActive(plan.active);
  };

  const handleCreate = () => {
    createMutation.mutate({
      name, priceMonth: Number(priceMonth), priceYear: Number(priceYear),
      productLimit: Number(productLimit), userLimit: Number(userLimit),
      features: features.split("\n").filter(Boolean), active,
    } as any);
  };

  const handleUpdate = () => {
    if (!editingPlan) return;
    updateMutation.mutate({
      id: editingPlan.id, name, priceMonth: Number(priceMonth), priceYear: Number(priceYear),
      productLimit: Number(productLimit), userLimit: Number(userLimit),
      features: features.split("\n").filter(Boolean), active,
    } as any);
    setEditingPlan(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!deletePlan) return;
    deleteMutation.mutate({ id: deletePlan.id } as any);
    setPlans((prev) => prev.filter((p) => p.id !== deletePlan.id));
    setDeletePlan(null);
  };

  const handleToggle = (plan: Plan) => {
    toggleMutation.mutate({ id: plan.id, active: !plan.active } as any);
    setPlans((prev) => prev.map((p) => p.id === plan.id ? { ...p, active: !p.active } : p));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{isAr ? "إدارة الخطط" : "Plan Management"}</h1>
          <p className="text-sm text-muted-foreground">{isAr ? "إدارة خطط الاشتراك" : "Manage subscription plans"}</p>
        </div>
        <Button onClick={() => { resetForm(); setShowCreate(true); }}>
          <Plus className="size-4 mr-2" />
          {isAr ? "خطة جديدة" : "New Plan"}
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        <Input className="pl-10" placeholder={isAr ? "بحث عن خطة..." : "Search plans..."} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{isAr ? "الاسم" : "Name"}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{isAr ? "شهريًا" : "Price/Mo"}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{isAr ? "سنويًا" : "Price/Yr"}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{isAr ? "المنتجات" : "Products"}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{isAr ? "المستخدمون" : "Users"}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{isAr ? "الميزات" : "Features"}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{isAr ? "الحالة" : "Status"}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((plan) => (
                <tr key={plan.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <span className="font-medium text-sm">{plan.name}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">{plan.priceMonth} SAR</td>
                  <td className="px-4 py-3 text-sm">{plan.priceYear} SAR</td>
                  <td className="px-4 py-3 text-sm">
                    {plan.productLimit === 999999 ? (isAr ? "غير محدود" : "Unlimited") : plan.productLimit}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {plan.userLimit === 999 ? (isAr ? "غير محدود" : "Unlimited") : plan.userLimit}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {plan.features.slice(0, 2).map((f) => (
                        <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                      ))}
                      {plan.features.length > 2 && (
                        <Badge variant="secondary" className="text-xs">+{plan.features.length - 2}</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Switch checked={plan.active} onCheckedChange={() => handleToggle(plan)} />
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm"><MoreHorizontal className="size-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(plan)}>
                          <Edit3 className="size-3 mr-2" />
                          {isAr ? "تعديل" : "Edit"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => setDeletePlan(plan)}>
                          <Trash2 className="size-3 mr-2" />
                          {isAr ? "حذف" : "Delete"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isAr ? "خطة جديدة" : "New Plan"}</DialogTitle>
            <DialogDescription>{isAr ? "أدخل تفاصيل الخطة" : "Enter plan details"}</DialogDescription>
          </DialogHeader>
          <PlanForm
            name={name} setName={setName}
            priceMonth={priceMonth} setPriceMonth={setPriceMonth}
            priceYear={priceYear} setPriceYear={setPriceYear}
            productLimit={productLimit} setProductLimit={setProductLimit}
            userLimit={userLimit} setUserLimit={setUserLimit}
            features={features} setFeatures={setFeatures}
            active={active} setActive={setActive}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>{isAr ? "إلغاء" : "Cancel"}</Button>
            <Button onClick={handleCreate} disabled={!name || createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
              {isAr ? "إنشاء" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingPlan} onOpenChange={(v) => { if (!v) setEditingPlan(null); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isAr ? "تعديل الخطة" : "Edit Plan"}</DialogTitle>
            <DialogDescription>{isAr ? "تحديث تفاصيل الخطة" : "Update plan details"}</DialogDescription>
          </DialogHeader>
          <PlanForm
            name={name} setName={setName}
            priceMonth={priceMonth} setPriceMonth={setPriceMonth}
            priceYear={priceYear} setPriceYear={setPriceYear}
            productLimit={productLimit} setProductLimit={setProductLimit}
            userLimit={userLimit} setUserLimit={setUserLimit}
            features={features} setFeatures={setFeatures}
            active={active} setActive={setActive}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPlan(null)}>{isAr ? "إلغاء" : "Cancel"}</Button>
            <Button onClick={handleUpdate} disabled={!name || updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
              {isAr ? "حفظ" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletePlan} onOpenChange={(v) => { if (!v) setDeletePlan(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isAr ? "تأكيد الحذف" : "Confirm Deletion"}</AlertDialogTitle>
            <AlertDialogDescription>
              {isAr
                ? `هل أنت متأكد من حذف خطة "${deletePlan?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`
                : `Are you sure you want to delete "${deletePlan?.name}"? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isAr ? "إلغاء" : "Cancel"}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              {deleteMutation.isPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
              {isAr ? "حذف" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function PlanForm({
  name, setName, priceMonth, setPriceMonth, priceYear, setPriceYear,
  productLimit, setProductLimit, userLimit, setUserLimit,
  features, setFeatures, active, setActive,
}: {
  name: string; setName: (v: string) => void;
  priceMonth: string; setPriceMonth: (v: string) => void;
  priceYear: string; setPriceYear: (v: string) => void;
  productLimit: string; setProductLimit: (v: string) => void;
  userLimit: string; setUserLimit: (v: string) => void;
  features: string; setFeatures: (v: string) => void;
  active: boolean; setActive: (v: boolean) => void;
}) {
  const { language } = useLanguage();
  const isAr = language === "ar";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{isAr ? "اسم الخطة" : "Plan Name"}</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={isAr ? "اسم الخطة" : "Plan name"} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{isAr ? "السعر شهريًا" : "Price/Month (SAR)"}</Label>
          <Input value={priceMonth} onChange={(e) => setPriceMonth(e.target.value)} type="number" />
        </div>
        <div className="space-y-2">
          <Label>{isAr ? "السعر سنويًا" : "Price/Year (SAR)"}</Label>
          <Input value={priceYear} onChange={(e) => setPriceYear(e.target.value)} type="number" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{isAr ? "حد المنتجات" : "Product Limit"}</Label>
          <Input value={productLimit} onChange={(e) => setProductLimit(e.target.value)} type="number" />
        </div>
        <div className="space-y-2">
          <Label>{isAr ? "حد المستخدمين" : "User Limit"}</Label>
          <Input value={userLimit} onChange={(e) => setUserLimit(e.target.value)} type="number" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>{isAr ? "الميزات (سطر لكل ميزة)" : "Features (one per line)"}</Label>
        <Textarea value={features} onChange={(e) => setFeatures(e.target.value)} rows={4} placeholder={isAr ? "ميزة 1\nميزة 2" : "Feature 1\nFeature 2"} />
      </div>
      <div className="flex items-center gap-3">
        <Switch checked={active} onCheckedChange={setActive} />
        <Label>{isAr ? "نشطة" : "Active"}</Label>
      </div>
    </div>
  );
}
