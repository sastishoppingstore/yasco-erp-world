import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { UserCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ImpersonatePage() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const [userId, setUserId] = useState("");
  const impersonateMut = trpc.superAdmin.impersonateUser.useMutation({
    onSuccess: () => { toast.success(isAr ? "تم التبديل" : "Impersonation started"); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{isAr ? "انتحال المستخدم" : "Impersonate User"}</h2>
        <p className="text-slate-500">{isAr ? "الدخول كمستخدم آخر للدعم الفني" : "Login as another user for support"}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserCheck className="h-5 w-5" />{isAr ? "انتحال المستخدم" : "Impersonate User"}</CardTitle>
          <CardDescription>{isAr ? "أدخل معرف المستخدم للدخول بحسابه" : "Enter user ID to access their account"}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); impersonateMut.mutate({ userId: Number(userId) }); }} className="space-y-4">
            <div><Label>{isAr ? "معرف المستخدم" : "User ID"}</Label><Input type="number" value={userId} onChange={e => setUserId(e.target.value)} required /></div>
            <Button type="submit" disabled={impersonateMut.isPending}>
              {impersonateMut.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <UserCheck className="h-4 w-4 mr-1" />}
              {isAr ? "تبديل" : "Impersonate"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
