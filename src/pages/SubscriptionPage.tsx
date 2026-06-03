import { useState } from "react";
import { useNavigate, Link } from "react-router";
import {
  CreditCard, Package, Users, Clock, AlertTriangle, Download,
  CheckCircle2, XCircle, Loader2, ArrowUpRight, FileText, Zap,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  plan: string;
}

const sampleInvoices: Invoice[] = [
  { id: "1", number: "INV-2026-001", date: "2026-06-01", amount: 100, status: "paid", plan: "Business" },
  { id: "2", number: "INV-2026-002", date: "2026-05-01", amount: 100, status: "paid", plan: "Business" },
  { id: "3", number: "INV-2026-003", date: "2026-04-01", amount: 100, status: "paid", plan: "Business" },
];

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [showCancel, setShowCancel] = useState(false);

  const subscriptionQuery = trpc.saas.subscription.current.useQuery();
  const cancelMutation = trpc.saas.subscription.cancel.useMutation({
    onSuccess: () => setShowCancel(false),
  });

  const sub = subscriptionQuery.data ?? {
    plan: "Business",
    status: "active",
    priceMonth: 100,
    billingMode: "monthly",
    trialEnds: null,
    productsUsed: 23,
    productLimit: 500,
    usersUsed: 4,
    userLimit: 10,
    nextBillingDate: "2026-07-01",
  };

  const isTrial = sub.status === "trial";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{isAr ? "الاشتراك" : "Subscription"}</h1>
          <p className="text-sm text-muted-foreground">
            {isAr ? "إدارة اشتراكك والفواتير" : "Manage your subscription and invoices"}
          </p>
        </div>
        <Button onClick={() => navigate("/app/upgrade-plan")}>
          <Zap className="size-4 mr-2" />
          {isAr ? "ترقية الخطة" : "Upgrade Plan"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl">{isAr ? "الخطة الحالية" : "Current Plan"}</CardTitle>
                <CardDescription>
                  {isAr ? "تفاصيل اشتراكك" : "Your subscription details"}
                </CardDescription>
              </div>
              <Badge className={
                sub.status === "active" ? "bg-green-100 text-green-700" :
                sub.status === "trial" ? "bg-blue-100 text-blue-700" :
                "bg-red-100 text-red-700"
              }>
                {sub.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">{isAr ? "الخطة" : "Plan"}</p>
                <p className="text-2xl font-bold">{sub.plan}</p>
                {isTrial && sub.trialEnds && (
                  <p className="text-xs text-blue-600 mt-1">
                    <Clock className="size-3 inline mr-1" />
                    {isAr ? `تنتهي التجربة: ${sub.trialEnds}` : `Trial ends: ${sub.trialEnds}`}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{isAr ? "المبلغ" : "Amount"}</p>
                <p className="text-2xl font-bold">
                  {sub.priceMonth} <span className="text-sm font-normal text-muted-foreground">SAR/{sub.billingMode === "monthly" ? (isAr ? "شهر" : "mo") : (isAr ? "سنة" : "yr")}</span>
                </p>
                {sub.nextBillingDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {isAr ? `الفاتورة القادمة: ${sub.nextBillingDate}` : `Next billing: ${sub.nextBillingDate}`}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{isAr ? "حالة الاشتراك" : "Status"}</p>
                <div className="flex items-center gap-2 mt-1">
                  {sub.status === "active" ? (
                    <CheckCircle2 className="size-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="size-5 text-yellow-600" />
                  )}
                  <span className="font-medium capitalize">{sub.status}</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowCancel(true)}>
              <XCircle className="size-4 mr-2" />
              {isAr ? "إلغاء الاشتراك" : "Cancel Subscription"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{isAr ? "سعة المنتجات" : "Products Usage"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-3">
              <Package className="size-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{sub.productsUsed} / {sub.productLimit === 999999 ? (isAr ? "غير محدود" : "∞") : sub.productLimit}</p>
                <p className="text-xs text-muted-foreground">{isAr ? "منتج مستخدم" : "Products used"}</p>
              </div>
            </div>
            {sub.productLimit !== 999999 && (
              <Progress value={(sub.productsUsed / sub.productLimit) * 100} className="h-2" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{isAr ? "سعة المستخدمين" : "Users Usage"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-3">
              <Users className="size-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{sub.usersUsed} / {sub.userLimit === 999 ? (isAr ? "غير محدود" : "∞") : sub.userLimit}</p>
                <p className="text-xs text-muted-foreground">{isAr ? "مستخدم نشط" : "Active users"}</p>
              </div>
            </div>
            {sub.userLimit !== 999 && (
              <Progress value={(sub.usersUsed / sub.userLimit) * 100} className="h-2" />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{isAr ? "سجل الفواتير" : "Invoice History"}</CardTitle>
          <CardDescription>
            {isAr ? "سجل فواتير الاشتراك" : "Subscription invoice history"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{isAr ? "الفاتورة" : "Invoice"}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{isAr ? "التاريخ" : "Date"}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{isAr ? "المبلغ" : "Amount"}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{isAr ? "الخطة" : "Plan"}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{isAr ? "الحالة" : "Status"}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {sampleInvoices.map((inv) => (
                <tr key={inv.id} className="border-b last:border-0">
                  <td className="px-4 py-3 text-sm font-medium">{inv.number}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{inv.date}</td>
                  <td className="px-4 py-3 text-sm">{inv.amount} SAR</td>
                  <td className="px-4 py-3 text-sm">{inv.plan}</td>
                  <td className="px-4 py-3">
                    <Badge variant={inv.status === "paid" ? "default" : inv.status === "pending" ? "secondary" : "destructive"} className="text-xs">
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm">
                      <Download className="size-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <AlertDialog open={showCancel} onOpenChange={setShowCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isAr ? "إلغاء الاشتراك" : "Cancel Subscription"}</AlertDialogTitle>
            <AlertDialogDescription>
              {isAr
                ? "هل أنت متأكد من إلغاء اشتراكك؟ سيتم إيقاف الخدمة في نهاية دورة الفوترة الحالية."
                : "Are you sure you want to cancel your subscription? The service will be stopped at the end of the current billing period."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isAr ? "رجوع" : "Keep Subscription"}</AlertDialogCancel>
            <AlertDialogAction onClick={() => cancelMutation.mutate()} className="bg-red-600 hover:bg-red-700">
              {cancelMutation.isPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
              {isAr ? "تأكيد الإلغاء" : "Confirm Cancellation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
