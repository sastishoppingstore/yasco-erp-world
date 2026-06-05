import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { Mail, ShieldCheck, ArrowLeft, Clock } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const isAr = language === "ar";

  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const verifyMutation = trpc.registration.verifyOtp.useMutation({
    onSuccess: (data) => {
      navigate(`/select-plan?email=${encodeURIComponent(email)}&tenantId=${data.tenantId ?? ""}`);
    },
    onError: (err) => setError(err.message),
  });

  const resendMutation = trpc.registration.resendOtp.useMutation({
    onSuccess: (data) => {
      setMessage(isAr ? "تم إعادة إرسال رمز التحقق" : "OTP resent successfully");
      setCooldown(30);
    },
    onError: (err) => setError(err.message),
  });

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (otp.length !== 6) return;
    verifyMutation.mutate({ email, otp, purpose: "registration" });
  };

  const handleResend = () => {
    if (cooldown > 0 || resendMutation.isPending) return;
    setError("");
    setMessage("");
    resendMutation.mutate({ email, purpose: "registration" });
  };

  const isBusy = verifyMutation.isPending || resendMutation.isPending;

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
                <ShieldCheck className="size-3 mr-1" />
                {isAr ? "التحقق من البريد الإلكتروني" : "Email Verification"}
              </Badge>
              <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                {isAr ? "تحقق من بريدك الإلكتروني" : "Verify Your Email"}
              </h1>
              <p className="max-w-xl text-sm leading-6 text-slate-300">
                {isAr
                  ? "أدخل رمز التحقق المكون من 6 أرقام الذي أرسلناه إلى بريدك الإلكتروني"
                  : "Enter the 6-digit verification code we sent to your email address"}
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-white px-4 py-8">
          <Card className="w-full max-w-md border-slate-200 shadow-xl">
            <CardHeader>
              <div className="mb-3 flex size-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Mail className="size-5" />
              </div>
              <CardTitle className="text-2xl">{isAr ? "التحقق من OTP" : "OTP Verification"}</CardTitle>
              <CardDescription>
                {isAr
                  ? `أدخل رمز التحقق المرسل إلى ${email}`
                  : `Enter the code sent to ${email}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify} className="space-y-6">
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button className="w-full" disabled={isBusy || otp.length !== 6}>
                  {verifyMutation.isPending
                    ? (isAr ? "جاري التحقق..." : "Verifying...")
                    : (isAr ? "تحقق" : "Verify")}
                </Button>

                <div className="text-center">
                  <Button type="button" variant="link" onClick={handleResend} disabled={cooldown > 0 || isBusy} className="text-sm">
                    {cooldown > 0 ? (
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {isAr ? `إعادة الإرسال بعد ${cooldown} ث` : `Resend in ${cooldown}s`}
                      </span>
                    ) : (
                      isAr ? "إعادة إرسال الرمز" : "Resend Code"
                    )}
                  </Button>
                </div>
              </form>

              {(error || message) && (
                <Alert className={`mt-4 ${error ? "destructive" : ""}`}>
                  <AlertDescription>{error || message}</AlertDescription>
                </Alert>
              )}

              <div className="mt-6 text-center">
                <Link to="/register" className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600">
                  <ArrowLeft className="size-3 mr-1" />
                  {isAr ? "العودة للتسجيل" : "Back to registration"}
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
