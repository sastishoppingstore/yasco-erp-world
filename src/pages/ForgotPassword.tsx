import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Mail, ArrowLeft, ShieldCheck, LockKeyhole } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const forgotMutation = trpc.registration.forgotPassword.useMutation({
    onSuccess: () => {
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    forgotMutation.mutate({ email });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[1fr_460px]">
        <section className="hidden lg:flex items-center px-6 py-10 lg:px-12">
          <div className="max-w-3xl space-y-7">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">YA</div>
              <div>
                <p className="text-lg font-semibold text-white leading-5">YASCO</p>
                <p className="text-xs text-slate-400">Enterprise OS</p>
              </div>
            </div>
            <div className="space-y-4">
              <Badge className="bg-blue-500 text-white hover:bg-blue-500">
                <LockKeyhole className="size-3 mr-1" />
                {isAr ? "استعادة كلمة المرور" : "Password Recovery"}
              </Badge>
              <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                {isAr ? "نسيت كلمة المرور؟" : "Forgot Your Password?"}
              </h1>
              <p className="max-w-xl text-sm leading-6 text-slate-300">
                {isAr
                  ? "أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور"
                  : "Enter your email and we'll send you a password reset link"}
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-white px-4 py-8">
          <Card className="w-full max-w-md border-slate-200 shadow-xl">
            <CardHeader>
              <div className="mb-3 flex size-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <ShieldCheck className="size-5" />
              </div>
              <CardTitle className="text-2xl">{isAr ? "استعادة كلمة المرور" : "Forgot Password"}</CardTitle>
              <CardDescription>
                {isAr
                  ? "أدخل بريدك الإلكتروني المسجل لاستعادة كلمة المرور"
                  : "Enter your registered email to reset your password"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      placeholder="name@company.com"
                      required
                    />
                  </div>
                </div>

                <Button className="w-full" disabled={forgotMutation.isPending}>
                  {forgotMutation.isPending
                    ? (isAr ? "جاري الإرسال..." : "Sending...")
                    : (isAr ? "إرسال رابط الاستعادة" : "Send Reset Link")}
                </Button>
              </form>

              {(error || success) && (
                <Alert className={`mt-4 ${error ? "destructive" : ""}`}>
                  <AlertDescription>{error || success}</AlertDescription>
                </Alert>
              )}

              <div className="mt-6 text-center">
                <Link to="/login" className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600">
                  <ArrowLeft className="size-3 mr-1" />
                  {isAr ? "العودة لتسجيل الدخول" : "Back to login"}
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
