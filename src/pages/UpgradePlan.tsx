import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Check, Zap, ArrowLeft, Loader2, Star, Info, ArrowRight,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Plan {
  id: string;
  name: string;
  nameAr: string;
  priceMonth: number;
  priceYear: number;
  features: string[];
  featuresAr: string[];
  recommended?: boolean;
}

const plans: Plan[] = [
  { id: "starter", name: "Starter", nameAr: "المبتدئ", priceMonth: 40, priceYear: 400, features: ["50 Products", "3 Users", "Basic Reports"], featuresAr: ["50 منتج", "3 مستخدمين", "تقارير أساسية"] },
  { id: "business", name: "Business", nameAr: "الأعمال", priceMonth: 100, priceYear: 1000, features: ["500 Products", "10 Users", "Advanced Reports", "CRM"], featuresAr: ["500 منتج", "10 مستخدمين", "تقارير متقدمة", "CRM"], recommended: true },
  { id: "enterprise", name: "Enterprise", nameAr: "المؤسسات", priceMonth: 300, priceYear: 3000, features: ["Unlimited Products", "Unlimited Users", "All Modules", "API"], featuresAr: ["منتجات غير محدودة", "مستخدمين غير محدودين", "جميع الوحدات", "API"] },
];

export default function UpgradePlan() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [billingMode, setBillingMode] = useState<"monthly" | "yearly">("monthly");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const currentPlanId = "starter";
  const currentPlan = plans.find((p) => p.id === currentPlanId);

  const upgradeMutation = trpc.saas.subscription.upgradePlan.useMutation({
    onSuccess: () => {
      setShowConfirm(false);
      navigate("/app/subscription");
    },
    onError: (err) => setError(err.message),
  });

  const handleSelect = (plan: Plan) => {
    if (plan.id === currentPlanId) return;
    setSelectedPlan(plan);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (!selectedPlan) return;
    upgradeMutation.mutate({
      planId: selectedPlan.id,
      billingMode,
    } as any);
  };

  const price = (plan: Plan) => billingMode === "monthly" ? plan.priceMonth : plan.priceYear;
  const prorationAmount = selectedPlan ? (price(selectedPlan) - price(currentPlan!)) * 0.5 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/app/subscription")}>
              <ArrowLeft className="size-4" />
            </Button>
            <h1 className="text-2xl font-bold">{isAr ? "ترقية الخطة" : "Upgrade Plan"}</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-10">
            {isAr ? "اختر خطة تناسب احتياجاتك" : "Choose a plan that fits your needs"}
          </p>
        </div>
      </div>

      {currentPlan && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">
                {isAr ? "الخطة الحالية" : "Current Plan"}
              </p>
              <p className="text-lg font-bold text-blue-800">{currentPlan.name} - {currentPlan.priceMonth} SAR/{isAr ? "شهر" : "mo"}</p>
            </div>
            <Badge className="bg-blue-600 text-white">{isAr ? "نشطة" : "Active"}</Badge>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-center gap-4">
        <span className={`text-sm ${billingMode === "monthly" ? "font-medium" : "text-muted-foreground"}`}>
          {isAr ? "شهري" : "Monthly"}
        </span>
        <Switch
          checked={billingMode === "yearly"}
          onCheckedChange={(v) => setBillingMode(v ? "yearly" : "monthly")}
        />
        <span className={`text-sm ${billingMode === "yearly" ? "font-medium" : "text-muted-foreground"}`}>
          {isAr ? "سنوي" : "Yearly"}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.filter((p) => p.id !== currentPlanId).map((plan) => (
          <Card key={plan.id} className={`relative border-2 transition-shadow hover:shadow-lg ${
            plan.recommended ? "border-blue-500 shadow-lg shadow-blue-500/20" : "border-slate-200"
          }`}>
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-blue-600 text-white">
                  <Star className="size-3 mr-1 fill-white" />
                  {isAr ? "الأفضل" : "Recommended"}
                </Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle>{isAr ? plan.nameAr : plan.name}</CardTitle>
              <CardDescription>
                {isAr ? "ترقية إلى هذه الخطة" : "Upgrade to this plan"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-3xl font-bold">{price(plan)}</span>
                <span className="text-muted-foreground ml-1">SAR/{billingMode === "monthly" ? "mo" : "yr"}</span>
              </div>
              <div className="space-y-2">
                {(isAr ? plan.featuresAr : plan.features).map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <Check className="size-4 text-green-500" />
                    <span className="text-sm">{f}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => handleSelect(plan)}>
                <Zap className="size-4 mr-2" />
                {isAr ? "التبديل إلى" : "Switch to"} {isAr ? plan.nameAr : plan.name}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAr ? "تأكيد الترقية" : "Confirm Upgrade"}</DialogTitle>
            <DialogDescription>
              {isAr ? "تأكيد ترقية خطتك" : "Confirm your plan upgrade"}
            </DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">{isAr ? "الخطة الحالية" : "Current Plan"}</span>
                  <span className="font-medium">{currentPlan?.name}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">{isAr ? "الخطة الجديدة" : "New Plan"}</span>
                  <span className="font-medium">{isAr ? selectedPlan.nameAr : selectedPlan.name}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{isAr ? "السعر الجديد" : "New Price"}</span>
                  <span className="font-medium">{price(selectedPlan)} SAR/{billingMode}</span>
                </div>
              </div>

              <Alert className="bg-amber-50 border-amber-200">
                <Info className="size-4 text-amber-600" />
                <AlertDescription className="text-sm text-amber-700">
                  {isAr
                    ? `سيتم احتساب فروق الأسعار بشكل نسبي. المبلغ التقريبي للفروق: ${prorationAmount} SAR`
                    : `Proration will be applied. Estimated prorated amount: ${prorationAmount} SAR`}
                </AlertDescription>
              </Alert>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button onClick={handleConfirm} disabled={upgradeMutation.isPending}>
              {upgradeMutation.isPending ? (
                <Loader2 className="size-4 mr-2 animate-spin" />
              ) : (
                <ArrowRight className="size-4 mr-2" />
              )}
              {isAr ? "تأكيد الترقية" : "Confirm Upgrade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
