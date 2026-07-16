import { useState } from "react";
import { Save, Send, CheckCircle2, XCircle, Loader2, Settings, Eye, EyeOff } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

export default function SuperAdminSmtp() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [host, setHost] = useState("smtp.gmail.com");
  const [port, setPort] = useState("587");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [encryption, setEncryption] = useState("tls");
  const [senderName, setSenderName] = useState("YASCO ERP");
  const [senderEmail, setSenderEmail] = useState("noreply@yasco.com");
  const [replyTo, setReplyTo] = useState("support@yasco.com");
  const [testEmail, setTestEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const saveMutation = trpc.superAdmin.smtp.saveSettings.useMutation({
    onSuccess: () => setSuccess(isAr ? "تم حفظ الإعدادات" : "Settings saved successfully"),
    onError: (err) => setError(err.message),
  });

  const testMutation = trpc.superAdmin.smtp.test.useMutation({
    onSuccess: (data) => setTestResult(data),
    onError: (err) => setTestResult({ success: false, message: err.message }),
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    saveMutation.mutate({
      host, port: Number(port), username, password, encryption,
      senderName, senderEmail,
      replyTo: replyTo || undefined,
    } as any);
  };

  const handleTest = () => {
    setTestResult(null);
    setError("");
    testMutation.mutate({
      host, port: Number(port), username, password, encryption,
      senderName, senderEmail, testEmail: testEmail || senderEmail,
    } as any);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{isAr ? "إعدادات SMTP" : "SMTP Settings"}</h1>
        <p className="text-sm text-muted-foreground">
          {isAr ? "تكوين خادم البريد لإرسال الإشعارات" : "Configure mail server for sending notifications"}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="size-5" />
              {isAr ? "إعدادات الخادم" : "Server Settings"}
            </CardTitle>
            <CardDescription>
              {isAr ? "إعدادات خادم SMTP" : "SMTP server configuration"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Host</Label>
                <Input value={host} onChange={(e) => setHost(e.target.value)} placeholder="smtp.gmail.com" required />
              </div>
              <div className="space-y-2">
                <Label>Port</Label>
                <Input value={port} onChange={(e) => setPort(e.target.value)} type="number" placeholder="587" required />
              </div>
              <div className="space-y-2">
                <Label>{isAr ? "التشفير" : "Encryption"}</Label>
                <Select value={encryption} onValueChange={setEncryption}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="ssl">SSL</SelectItem>
                    <SelectItem value="tls">TLS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isAr ? "اسم المستخدم" : "Username"}</Label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="user@gmail.com" required />
              </div>
              <div className="space-y-2">
                <Label>{isAr ? "كلمة المرور" : "Password"}</Label>
                <div className="relative">
                  <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{isAr ? "إعدادات المرسل" : "Sender Settings"}</CardTitle>
            <CardDescription>
              {isAr ? "تخصيص معلومات المرسل" : "Customize sender information"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{isAr ? "اسم المرسل" : "Sender Name"}</Label>
                <Input value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="YASCO ERP" />
              </div>
              <div className="space-y-2">
                <Label>{isAr ? "البريد الإلكتروني" : "Sender Email"}</Label>
                <Input value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} type="email" placeholder="noreply@yasco.com" required />
              </div>
              <div className="space-y-2">
                <Label>Reply-To</Label>
                <Input value={replyTo} onChange={(e) => setReplyTo(e.target.value)} type="email" placeholder="support@yasco.com" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button variant="outline" type="button" onClick={handleTest} disabled={testMutation.isPending}>
            {testMutation.isPending ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <Send className="size-4 mr-2" />
            )}
            {isAr ? "اختبار الاتصال" : "Test Connection"}
          </Button>
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <Save className="size-4 mr-2" />
            )}
            {isAr ? "حفظ الإعدادات" : "Save Settings"}
          </Button>
        </div>
      </form>

      {testResult && (
        <Alert variant={testResult.success ? "default" : "destructive"}>
          <AlertDescription className="flex items-center gap-2">
            {testResult.success ? (
              <CheckCircle2 className="size-4 text-green-600" />
            ) : (
              <XCircle className="size-4 text-red-600" />
            )}
            {testResult.message}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-green-600" />
            {success}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
