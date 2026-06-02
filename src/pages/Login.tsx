import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router";
import { Building2, LockKeyhole, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Login() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [username, setUsername] = useState("wafaweb");
  const [password, setPassword] = useState("");
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
      <div className="grid min-h-screen lg:grid-cols-[1fr_460px]">
        <section className="flex items-center px-6 py-10 lg:px-12">
          <div className="max-w-3xl space-y-7">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-600 font-bold">YA</div>
              <div>
                <p className="text-lg font-semibold leading-5">YASCO</p>
                <p className="text-xs text-slate-400">Enterprise OS</p>
              </div>
            </div>

            <div className="space-y-4">
              <Badge className="bg-blue-500 text-white hover:bg-blue-500">
                <Sparkles className="size-3" />
                Private ERP login
              </Badge>
              <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
                Secure access for finance, operations, sales, HR, inventory, and management.
              </h1>
              <p className="max-w-xl text-sm leading-6 text-slate-300">
                Password login is enabled for the admin account. Email OTP works through your SMTP settings for staff and customer portal access.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Admin password", icon: LockKeyhole },
                { label: "SMTP email OTP", icon: Mail },
                { label: "Audit-ready session", icon: ShieldCheck },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <item.icon className="size-5 text-blue-300" />
                  <p className="mt-3 text-sm font-medium">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-white px-4 py-8 text-slate-950">
          <Card className="w-full max-w-md border-slate-200 shadow-xl">
            <CardHeader>
              <div className="mb-3 flex size-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Building2 className="size-5" />
              </div>
              <CardTitle className="text-2xl">Sign in</CardTitle>
              <p className="text-sm text-slate-500">Use admin password or verify email with OTP.</p>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="password">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="password">Password</TabsTrigger>
                  <TabsTrigger value="otp">Email OTP</TabsTrigger>
                </TabsList>

                <TabsContent value="password" className="mt-5">
                  <form onSubmit={onPasswordSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        autoComplete="username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        placeholder="wafaweb"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Enter admin password"
                        required
                      />
                    </div>
                    <Button className="w-full" disabled={isBusy}>
                      {passwordLogin.isPending ? "Signing in..." : "Sign in"}
                    </Button>
                  </form>
                </TabsContent>

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
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
