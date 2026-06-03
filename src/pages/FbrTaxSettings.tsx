import { useState } from "react";
import { Save, Upload, Loader2, FileText, Globe, Link, CheckCircle2, AlertTriangle, Building } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function FbrTaxSettings() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const { data: settings, isLoading } = trpc.taxCompliance.fbrSettings.useQuery();
  const saveMutation = trpc.taxCompliance.updateFbrSettings.useMutation({
    onSuccess: () => toast.success(isAr ? "تم حفظ إعدادات FBR" : "FBR settings saved"),
    onError: (err) => toast.error(err.message),
  });

  const [fbrEnabled, setFbrEnabled] = useState(false);
  const [fbrSandbox, setFbrSandbox] = useState(true);
  const [ntn, setNtn] = useState("");
  const [strn, setStrn] = useState("");
  const [fbrUsername, setFbrUsername] = useState("");
  const [fbrPassword, setFbrPassword] = useState("");
  const [fbrApiKey, setFbrApiKey] = useState("");
  const [fbrApiEndpoint, setFbrApiEndpoint] = useState("https://sandbox.fbr.gov.pk/api/v1");

  useState(() => {
    if (settings) {
      setFbrEnabled(settings.enabled || false);
      setFbrSandbox(settings.sandbox !== false);
      setNtn(settings.ntnNumber || "");
      setStrn(settings.strnNumber || "");
      setFbrUsername(settings.username || "");
      setFbrPassword(settings.password || "");
      setFbrApiKey(""); // not exposed in current API
      setFbrApiEndpoint("https://sandbox.fbr.gov.pk/api/v1");
    }
  });

  const handleSave = () => {
    saveMutation.mutate({
      enabled: fbrEnabled,
      sandbox: fbrSandbox,
      ntnNumber: ntn,
      strnNumber: strn,
      username: fbrUsername,
      password: fbrPassword,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <Badge className="mb-2 bg-green-600">
          <Building className="size-3 mr-1" />
          FBR
        </Badge>
        <h1 className="text-2xl font-bold">{isAr ? "إعدادات ضريبة FBR باكستان" : "FBR Pakistan Tax Settings"}</h1>
        <p className="text-muted-foreground">
          {isAr ? "تكوين التكامل مع نظام FBR الباكستاني" : "Configure FBR Pakistan tax system integration"}
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">{isAr ? "عام" : "General"}</TabsTrigger>
          <TabsTrigger value="api">{isAr ? "إعدادات API" : "API Settings"}</TabsTrigger>
          <TabsTrigger value="sync">{isAr ? "المزامنة" : "Sync"}</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{isAr ? "معلومات FBR" : "FBR Information"}</CardTitle>
              <CardDescription>{isAr ? "أدخل معلومات تسجيل FBR الخاصة بك" : "Enter your FBR registration information"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{isAr ? "تفعيل تكامل FBR" : "Enable FBR Integration"}</Label>
                <Switch checked={fbrEnabled} onCheckedChange={setFbrEnabled} />
              </div>
              <Separator />
              <div>
                <Label>NTN {isAr ? "(الرقم الضريبي الوطني)" : "(National Tax Number)"}</Label>
                <Input value={ntn} onChange={(e) => setNtn(e.target.value)} placeholder="1234567-8" className="mt-1" />
              </div>
              <div>
                <Label>STRN {isAr ? "(رقم التسجيل الضريبي للمبيعات)" : "(Sales Tax Registration Number)"}</Label>
                <Input value={strn} onChange={(e) => setStrn(e.target.value)} placeholder="12-3456789-0" className="mt-1" />
              </div>
              <Alert>
                <AlertTriangle className="size-4" />
                <AlertDescription>
                  {isAr
                    ? "NTN و STRN هما معرفات ضريبية صادرة عن FBR. تأكد من صحتهما قبل المتابعة."
                    : "NTN and STRN are FBR-issued tax identifiers. Verify their correctness before proceeding."}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">API {isAr ? "الإعدادات" : "Settings"}</CardTitle>
              <CardDescription>{isAr ? "تكوين اتصال API مع FBR" : "Configure FBR API connection"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{isAr ? "وضع الاختبار (Sandbox)" : "Sandbox Mode"}</Label>
                <Switch checked={fbrSandbox} onCheckedChange={setFbrSandbox} />
              </div>
              <div>
                <Label>{isAr ? "رابط API" : "API Endpoint"}</Label>
                <Input value={fbrApiEndpoint} onChange={(e) => setFbrApiEndpoint(e.target.value)} className="mt-1 font-mono text-sm" />
              </div>
              <div>
                <Label>{isAr ? "اسم المستخدم" : "Username"}</Label>
                <Input value={fbrUsername} onChange={(e) => setFbrUsername(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>{isAr ? "كلمة المرور" : "Password"}</Label>
                <Input type="password" value={fbrPassword} onChange={(e) => setFbrPassword(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>API Key</Label>
                <Input value={fbrApiKey} onChange={(e) => setFbrApiKey(e.target.value)} className="mt-1 font-mono text-sm" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{isAr ? "المزامنة والتقارير" : "Sync & Reports"}</CardTitle>
              <CardDescription>{isAr ? "مزامنة البيانات مع FBR وإدارة التقارير" : "Sync data with FBR and manage reports"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/30">
                <CheckCircle2 className="size-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-300">
                    {isAr ? "جاهز لتكامل FBR" : "Ready for FBR Integration"}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {isAr
                      ? "أدخل بيانات اعتماد FBR لحفظ الإعدادات"
                      : "Enter your FBR credentials and save the settings"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border text-center">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-muted-foreground">{isAr ? "الفواتير المرسلة" : "Invoices Sent"}</p>
                </div>
                <div className="p-4 rounded-lg border text-center">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-muted-foreground">{isAr ? "في انتظار الإرسال" : "Pending Send"}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full" disabled>
                <Upload className="size-4 mr-2" />
                {isAr ? "إرسال الفواتير المعلقة" : "Send Pending Invoices"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex gap-2 items-center text-xs text-muted-foreground">
        <Globe className="size-3" />
        <span>{isAr ? "باكستان - FBR" : "Pakistan - FBR"}</span>
      </div>

      <Button onClick={handleSave} disabled={saveMutation.isPending} className="w-full mt-4">
        {saveMutation.isPending ? (
          <Loader2 className="size-4 animate-spin mr-2" />
        ) : (
          <Save className="size-4 mr-2" />
        )}
        {isAr ? "حفظ إعدادات FBR" : "Save FBR Settings"}
      </Button>
    </div>
  );
}
