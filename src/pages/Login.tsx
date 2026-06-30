import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router";
import { Building2, Eye, EyeOff } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

export default function Login() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [devOtp, setDevOtp] = useState("");

  const finishLogin = async () => {
    await utils.auth.me.invalidate();
    navigate("/app");
  };

  const passwordLogin = trpc.auth.passwordLogin.useMutation({
    onSuccess: finishLogin,
    onError: (error) => setMessage(error.message),
  });

  const requestOtp = trpc.auth.requestEmailOtp.useMutation({
    onSuccess: (data) => {
      setMessage(data.sent ? "OTP email sent. Check your inbox." : "SMTP is not configured; development OTP is shown below.");
      setDevOtp(data.devOtp ?? "");
    },
    onError: (error) => setMessage(error.message),
  });

  const verifyOtp = trpc.auth.verifyEmailOtp.useMutation({
    onSuccess: finishLogin,
    onError: (error) => setMessage(error.message),
  });

  const onPasswordSubmit = (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    passwordLogin.mutate({ username, password });
  };

  const onOtpRequest = (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    setDevOtp("");
    requestOtp.mutate({ email });
  };

  const onOtpVerify = (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    verifyOtp.mutate({ email, otp });
  };

  const isBusy = passwordLogin.isPending || requestOtp.isPending || verifyOtp.isPending;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-[1fr_480px]">
        {/* Left Panel — Branding */}
        <section className="flex items-center px-6 py-10 lg:px-12">
          <div className="max-w-3xl space-y-8">
            <div className="flex items-center gap-3">
              <img src="/logo-40.png" alt="YASCO" className="size-10 rounded-lg object-contain" />
              <div>
                <p className="text-lg font-semibold leading-5">YASCO</p>
                <p className="text-xs text-slate-400">Enterprise Resource Planning</p>
              </div>
            </div>

            <div className="space-y-5">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
                Welcome back to your business operating system
              </h1>
              <p className="max-w-xl text-sm leading-6 text-slate-300">
                Sign in to manage finance, inventory, sales, HR, and operations — all in one unified platform.
              </p>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-emerald-400" />
                Multi-country & multi-currency
              </div>
              <div className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-emerald-400" />
                ZATCA & tax compliant
              </div>
              <div className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-emerald-400" />
                Real-time sync
              </div>
            </div>

            <div className="border-t border-white/5 pt-6 text-xs text-slate-500">
              &copy; {new Date().getFullYear()} YASCO Technologies. All rights reserved.
            </div>

          </div>
        </section>

        {/* Right Panel — Login Form */}
        <section className="flex items-center justify-center bg-white px-4 py-8 text-slate-950">
          <Card className="w-full max-w-md border-slate-200 shadow-xl">
            <CardHeader>
              <div className="mb-3 flex size-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Building2 className="size-5" />
              </div>
              <CardTitle className="text-2xl">Sign in to YASCO</CardTitle>
              <p className="text-sm text-slate-500">Enter your credentials to access the ERP.</p>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="password">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="password">Password</TabsTrigger>
                  <TabsTrigger value="otp">Email OTP</TabsTrigger>
                </TabsList>

                {/* Password Tab */}
                <TabsContent value="password" className="mt-5">
                  <form onSubmit={onPasswordSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        autoComplete="username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        placeholder="Enter your username"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link
                          to="/forgot-password"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          placeholder="Enter your password"
                          className="pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remember-me"
                        checked={rememberMe}
                        onCheckedChange={(v) => setRememberMe(!!v)}
                      />
                      <Label htmlFor="remember-me" className="text-sm font-normal cursor-pointer">
                        Remember me
                      </Label>
                    </div>
                    <Button className="w-full" disabled={isBusy}>
                      {passwordLogin.isPending ? "Signing in..." : "Sign in"}
                    </Button>
                  </form>
                </TabsContent>

                {/* OTP Tab */}
                <TabsContent value="otp" className="mt-5 space-y-4">
                  <form onSubmit={onOtpRequest} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="name@company.com"
                        required
                      />
                    </div>
                    <Button type="submit" variant="outline" className="w-full" disabled={isBusy}>
                      {requestOtp.isPending ? "Sending OTP..." : "Send OTP"}
                    </Button>
                  </form>

                  <form onSubmit={onOtpVerify} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="otp">6-digit OTP</Label>
                      <Input
                        id="otp"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="000000"
                        required
                      />
                    </div>
                    <Button className="w-full" disabled={isBusy || otp.length !== 6}>
                      {verifyOtp.isPending ? "Verifying..." : "Verify and sign in"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {(message || devOtp) && (
                <Alert className="mt-5">
                  <AlertDescription>
                    {message}
                    {devOtp && <span className="block pt-2 font-mono text-sm">Development OTP: {devOtp}</span>}
                  </AlertDescription>
                </Alert>
              )}

              {/* Register link */}
              <p className="mt-6 text-center text-sm text-slate-500">
                New business?{" "}
                <Link to="/register" className="text-blue-600 font-medium hover:underline">
                  Register here
                </Link>
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
