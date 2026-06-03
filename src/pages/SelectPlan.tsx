import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Check, Sparkles, Star, Gift, Tag, CreditCard, Zap, Loader2 } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface Plan {
  id: number;
  name: string;
  nameAr?: string;
  priceMonth: string;
  priceYear: string;
  productLimit: number;
  userLimit: number;
  branchLimit: number;
  warehouseLimit: number;
  features: { featureKey: string; name: string; nameAr: string; isActive: boolean }[];
  recommended?: boolean;
  isActive: boolean;
  sortOrder: number;
  trialDays: number;
}

export default function SelectPlan() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const isAr = language === "ar";

  const email = searchParams.get("email") || "";
  const tenantId = searchParams.get("tenantId") || "";

  const [billingMode, setBillingMode] = useState<"monthly" | "yearly">("monthly");
  const [coupon, setCoupon] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [trialDays, setTrialDays] = useState(3);
  const [couponApplied, setCouponApplied] = useState<{discountType: string; discountValue: number; code: string} | null>(null);
  const [couponError, setCouponError] = useState("");

  const { data: apiPlans, isLoading } = trpc.saas.plans.list.useQuery();
  const plans: Plan[] = (apiPlans || []).map((p: any) => ({
    ...p,
    id: p.id,
    priceMonth: p.priceMonth?.toString() || "0",
    priceYear: p.priceYear?.toString() || "0",
    recommended: p.sortOrder === 1,
    nameAr: p.nameAr || p.name,
    features: p.features || [],
  }));

  const validateCouponApi = trpc.saas.coupon.validate.useMutation();

  const handleApplyCoupon = async () => {
    if (!coupon || !selectedPlan) return;
    setCouponError("");
    try {
      const result = await validateCouponApi.mutateAsync({ code: coupon, planId: selectedPlan.id });
      if (result.valid) {
        setCouponApplied({ discountType: result.discountType, discountValue: Number(result.discountValue), code: result.code });
        setCouponError("");
      }
    } catch (e: any) {
      setCouponError(e.message || "Invalid coupon");
      setCouponApplied(null);
    }
  };

  const selectPlanMutation = trpc.saas.subscription.selectPlan.useMutation({
    onSuccess: () => {
      setShowConfirm(false);
      navigate("/app");
    },
    onError: (err) => setError(err.message),
  });

  const startTrialMutation = trpc.saas.subscription.startTrial.useMutation({
    onSuccess: () => {
      setShowConfirm(false);
      navigate("/app");
    },
    onError: (err) => setError(err.message),
  });

  const handleSelect = (plan: Plan, isTrial: boolean) => {
    setSelectedPlan(plan);
    setError("");
    if (isTrial) {
      startTrialMutation.mutate({ planId: plan.id, tenantId, billingMode } as any);
    } else {
      setShowConfirm(true);
    }
  };

  const handleConfirm = () => {
    if (!selectedPlan) return;
    selectPlanMutation.mutate({
      planId: selectedPlan.id,
      tenantId,
      billingMode,
      coupon: coupon || undefined,
    } as any);
  };

  const planFeaturesList = (plan: Plan) => {
    if (plan.features && plan.features.length > 0) {
      return plan.features.filter(f => f.isActive).map(f => isAr ? f.nameAr : f.name);
    }
    return [
      `${plan.productLimit >= 999999 ? (isAr ? "منتجات غير محدودة" : "Unlimited Products") : plan.productLimit + " " + (isAr ? "منتج" : "Products")}`,
      `${plan.userLimit >= 999 ? (isAr ? "مستخدمين غير محدودين" : "Unlimited Users") : plan.userLimit + " " + (isAr ? "مستخدم" : "Users")}`,
    ];
  };

  const price = (plan: Plan) => billingMode === "monthly" ? Number(plan.priceMonth) : Number(plan.priceYear);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">YA</div>
            <div className="text-left">
              <p className="text-lg font-semibold text-white leading-5">YASCO</p>
              <p className="text-xs text-slate-400">Enterprise OS</p>
            </div>
          </div>
          <Badge className="bg-blue-500 text-white mb-4">
            <Sparkles className="size-3 mr-1" />
            {isAr ? "اختر خطتك" : "Choose Your Plan"}
          </Badge>
          <h1 className="text-4xl font-bold text-white mb-2">
            {isAr ? "اختر الخطة المناسبة لشركتك" : "Select the Right Plan for Your Business"}
          </h1>
          <p className="text-slate-300">
            {isAr ? "جميع الخطط تتضمن 3 أيام تجربة مجانية" : "All plans include a 3-day free trial"}
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={`text-sm ${billingMode === "monthly" ? "text-white font-medium" : "text-slate-400"}`}>
            {isAr ? "شهري" : "Monthly"}
          </span>
          <Switch
            checked={billingMode === "yearly"}
            onCheckedChange={(v) => setBillingMode(v ? "yearly" : "monthly")}
          />
          <span className={`text-sm ${billingMode === "yearly" ? "text-white font-medium" : "text-slate-400"}`}>
            {isAr ? "سنوي" : "Yearly"}
          </span>
          {billingMode === "yearly" && (
            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
              <Gift className="size-3 mr-1" />
              {isAr ? "شهرين مجانًا" : "2 months free"}
            </Badge>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <Loader2 className="size-8 animate-spin mx-auto text-white" />
            <p className="text-slate-400 mt-4">{isAr ? "جاري تحميل الخطط..." : "Loading plans..."}</p>
          </div>
        ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {plans.filter(p => p.isActive).map((plan) => (
            <Card key={plan.id} className={`relative border-2 transition-shadow hover:shadow-xl ${
              plan.recommended ? "border-blue-500 shadow-lg shadow-blue-500/20" : "border-white/10 bg-white/5"
            }`}>
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white whitespace-nowrap">
                    <Star className="size-3 mr-1 fill-white" />
                    {isAr ? "الأكثر طلبًا" : "Recommended"}
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl text-white">{isAr ? (plan.nameAr || plan.name) : plan.name}</CardTitle>
                <CardDescription className="text-slate-300">
                  {plan.description || (isAr ? "خطة متكاملة" : "Complete plan")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <span className="text-4xl font-bold text-white">{price(plan)}</span>
                  <span className="text-slate-400 ml-1">
                    {isAr ? `ريال/${billingMode === "monthly" ? "شهر" : "سنة"}` : `SAR/${billingMode === "monthly" ? "mo" : "yr"}`}
                  </span>
                  {billingMode === "yearly" && (
                    <p className="text-xs text-green-400 mt-1">
                      {isAr ? `توفير ${Math.round((1 - Number(plan.priceYear) / (Number(plan.priceMonth) * 12)) * 100)}%` : `Save ${Math.round((1 - Number(plan.priceYear) / (Number(plan.priceMonth) * 12)) * 100)}%`}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">{isAr ? "المنتجات" : "Products"}</span>
                    <span className="text-white font-medium">{plan.productLimit >= 999999 ? (isAr ? "غير محدود" : "Unlimited") : plan.productLimit}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">{isAr ? "المستخدمين" : "Users"}</span>
                    <span className="text-white font-medium">{plan.userLimit >= 999 ? (isAr ? "غير محدود" : "Unlimited") : plan.userLimit}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {planFeaturesList(plan).map((f: string) => (
                    <div key={f} className="flex items-center gap-2">
                      <Check className="size-4 text-green-400 shrink-0" />
                      <span className="text-sm text-slate-300">{f}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-2">
                <Button
                  className="w-full"
                  variant={plan.recommended ? "default" : "outline"}
                  onClick={() => handleSelect(plan, true)}
                  disabled={startTrialMutation.isPending}
                >
                  {startTrialMutation.isPending && selectedPlan?.id === plan.id ? (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="size-4 mr-2" />
                  )}
                  {isAr ? `ابدأ تجربة ${trialDays} أيام` : `Start ${trialDays}-Day Trial`}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-slate-400 hover:text-white"
                  onClick={() => handleSelect(plan, false)}
                  disabled={selectPlanMutation.isPending}
                >
                  {isAr ? "اشتراك مباشر" : "Buy Now"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        )}

        <Card className="mt-6 border-white/10 bg-white/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Tag className="size-5 text-slate-400" />
              <div className="flex-1">
                <Input
                  placeholder={isAr ? "رمز الخصم" : "Coupon Code"}
                  value={coupon}
                  onChange={(e) => { setCoupon(e.target.value); setCouponApplied(null); setCouponError(""); }}
                  className="max-w-xs bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                />
                {couponApplied && (
                  <p className="text-xs text-green-400 mt-1">
                    {isAr ? `خصم ${couponApplied.discountValue}${couponApplied.discountType === "percentage" ? "%" : " "}` : `Discount: ${couponApplied.discountValue}${couponApplied.discountType === "percentage" ? "%" : ""}`}
                  </p>
                )}
                {couponError && <p className="text-xs text-red-400 mt-1">{couponError}</p>}
              </div>
              <Button variant="outline" className="text-white border-white/20" onClick={handleApplyCoupon} disabled={!coupon}>
                {isAr ? "تطبيق" : "Apply"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-400">
            {isAr ? "لديك سؤال؟" : "Have a question?"}{" "}
            <a href="mailto:sales@yasco.com" className="text-blue-400 hover:underline">sales@yasco.com</a>
          </p>
        </div>
      </div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAr ? "تأكيد الاشتراك" : "Confirm Subscription"}</DialogTitle>
            <DialogDescription>
              {isAr
                ? `سيتم تفعيل خطة ${selectedPlan ? (selectedPlan.nameAr || selectedPlan.name) : ""} ${billingMode === "monthly" ? "شهريًا" : "سنويًا"}`
                : `You are about to subscribe to the ${selectedPlan?.name} plan (${billingMode})`}
            </DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-2 py-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{isAr ? "الخطة" : "Plan"}</span>
                <span className="font-medium">{isAr ? (selectedPlan.nameAr || selectedPlan.name) : selectedPlan.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{isAr ? "المدة" : "Billing"}</span>
                <span className="font-medium">{billingMode === "monthly" ? (isAr ? "شهري" : "Monthly") : (isAr ? "سنوي" : "Yearly")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{isAr ? "السعر" : "Price"}</span>
                <span className="font-medium">{price(selectedPlan)} SAR/{billingMode === "monthly" ? "mo" : "yr"}</span>
              </div>
              {coupon && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{isAr ? "رمز الخصم" : "Coupon"}</span>
                  <span className="font-medium text-green-600">{coupon}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-medium border-t pt-2">
                <span>{isAr ? "المجموع" : "Total"}</span>
                <span>{price(selectedPlan)} SAR</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button onClick={handleConfirm} disabled={selectPlanMutation.isPending}>
              {selectPlanMutation.isPending ? (isAr ? "جاري..." : "Processing...") : (isAr ? "تأكيد" : "Confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {error && (
        <Alert variant="destructive" className="mt-4 mx-auto max-w-2xl">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
