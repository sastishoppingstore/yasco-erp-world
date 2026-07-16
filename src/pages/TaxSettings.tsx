import { useState } from "react";
import { Save, Upload, Loader2, Shield, FileText, Globe, Link, CheckCircle2, AlertTriangle } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { useCountryDetection } from "@/providers/country-detection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function TaxSettings() {
  const { language } = useLanguage();
  const { selectedCountry, countryName } = useCountryDetection();
  const isAr = language === "ar";
  const country = selectedCountry;

  const [activeTab, setActiveTab] = useState("main");

  const saveMutation = trpc.settings.companySettingsUpdate.useMutation({
    onSuccess: () => setMessage(isAr ? "تم الحفظ" : "Saved successfully"),
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSave = (data: Record<string, any>) => {
    setMessage("");
    setError("");
    saveMutation.mutate(data as any);
  };

  const renderSaudiFields = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{isAr ? "السجل التجاري" : "Commercial Registration"}</CardTitle>
          <CardDescription>{isAr ? "رقم السجل التجاري للشركة" : "Company commercial registration number"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{isAr ? "رقم السجل التجاري" : "CR Number"}</Label>
            <Input placeholder="CR Number" />
          </div>
          <div className="space-y-2">
            <Label>{isAr ? "تاريخ الإصدار" : "Issue Date"}</Label>
            <Input type="date" />
          </div>
          <div className="space-y-2">
            <Label>{isAr ? "تاريخ الانتهاء" : "Expiry Date"}</Label>
            <Input type="date" />
          </div>
          <div className="space-y-2">
            <Label>{isAr ? "تحميل المستند" : "Upload Document"}</Label>
            <div className="flex items-center gap-3">
              <Button variant="outline">
                <Upload className="size-4 mr-2" />
                {isAr ? "رفع" : "Upload"}
              </Button>
              <span className="text-sm text-muted-foreground">{isAr ? "PDF أو صورة" : "PDF or Image"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{isAr ? "ضريبة القيمة المضافة" : "VAT Registration"}</CardTitle>
          <CardDescription>{isAr ? "بيانات التسجيل في ضريبة القيمة المضافة" : "VAT registration details"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{isAr ? "رقم ضريبة القيمة المضافة" : "VAT Number"}</Label>
            <Input placeholder="3-1234-5678-9012" />
          </div>
          <div className="flex items-center gap-3">
            <Switch />
            <div>
              <p className="text-sm font-medium">{isAr ? "حالة ZATCA" : "ZATCA Status"}</p>
              <p className="text-xs text-muted-foreground">{isAr ? "مفعل / غير مفعل" : "Active / Inactive"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ZATCA API {isAr ? "الإعدادات" : "Settings"}</CardTitle>
          <CardDescription>{isAr ? "إعدادات API للتكامل مع ZATCA" : "API settings for ZATCA integration"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>API {isAr ? "الرابط" : "Endpoint"}</Label>
            <Input placeholder="https://api.zatca.gov.sa" />
          </div>
          <div className="space-y-2">
            <Label>API Key</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label>Secret</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
        </CardContent>
      </Card>

      <Button onClick={() => handleSave({ crNumber: "test", vatNumber: "test" })} disabled={saveMutation.isPending}>
        {saveMutation.isPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
        {isAr ? "حفظ إعدادات الضرائب" : "Save Tax Settings"}
      </Button>
    </div>
  );

  const renderPakistanFields = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{isAr ? "بيانات FBR" : "FBR Settings"}</CardTitle>
          <CardDescription>{isAr ? "بيانات التسجيل في هيئة الإيرادات الاتحادية" : "Federal Board of Revenue registration"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>NTN Number</Label>
            <Input placeholder="NTN Number" />
          </div>
          <div className="space-y-2">
            <Label>STRN Number</Label>
            <Input placeholder="STRN Number" />
          </div>
          <div className="space-y-2">
            <Label>CNIC</Label>
            <Input placeholder="XXXXX-XXXXXXX-X" />
          </div>
          <div className="space-y-2">
            <Label>{isAr ? "المقاطعة" : "Province"}</Label>
            <Input placeholder={isAr ? "المقاطعة" : "Province"} />
          </div>
          <div className="space-y-2">
            <Label>{isAr ? "تحميل CNIC" : "Upload CNIC"}</Label>
            <div className="flex items-center gap-3">
              <Button variant="outline">
                <Upload className="size-4 mr-2" />
                {isAr ? "رفع" : "Upload"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={() => handleSave({ ntn: "test", strn: "test" })} disabled={saveMutation.isPending}>
        {saveMutation.isPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
        {isAr ? "حفظ إعدادات FBR" : "Save FBR Settings"}
      </Button>
    </div>
  );

  const renderUaeFields = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{isAr ? "ضريبة القيمة المضافة" : "VAT Settings"}</CardTitle>
          <CardDescription>{isAr ? "إعدادات ضريبة القيمة المضافة في الإمارات" : "UAE VAT settings"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>TRN Number</Label>
            <Input placeholder="1234567890123" />
          </div>
          <div className="space-y-2">
            <Label>{isAr ? "الرخصة التجارية" : "Trade License"}</Label>
            <Input placeholder={isAr ? "رقم الرخصة التجارية" : "Trade License Number"} />
          </div>
          <div className="space-y-2">
            <Label>{isAr ? "الإمارة" : "Emirate"}</Label>
            <Input placeholder={isAr ? "الإمارة" : "Emirate"} />
          </div>
          <div className="space-y-2">
            <Label>{isAr ? "تحميل الرخصة التجارية" : "Upload Trade License"}</Label>
            <div className="flex items-center gap-3">
              <Button variant="outline">
                <Upload className="size-4 mr-2" />
                {isAr ? "رفع" : "Upload"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={() => handleSave({ trn: "test" })} disabled={saveMutation.isPending}>
        {saveMutation.isPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
        {isAr ? "حفظ إعدادات VAT" : "Save VAT Settings"}
      </Button>
    </div>
  );

  const renderGenericFields = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{isAr ? "البيانات الضريبية" : "Tax Information"}</CardTitle>
          <CardDescription>{isAr ? "البيانات الضريبية العامة" : "General tax information"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{isAr ? "الرقم الضريبي" : "Tax Number"}</Label>
            <Input placeholder={isAr ? "الرقم الضريبي" : "Tax Number"} />
          </div>
          <div className="space-y-2">
            <Label>{isAr ? "الرخصة التجارية" : "Business License"}</Label>
            <Input placeholder={isAr ? "رقم الرخصة التجارية" : "Business License Number"} />
          </div>
          <div className="space-y-2">
            <Label>{isAr ? "تحميل المستندات" : "Upload Documents"}</Label>
            <div className="flex items-center gap-3">
              <Button variant="outline">
                <Upload className="size-4 mr-2" />
                {isAr ? "رفع" : "Upload"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={() => handleSave({ taxNumber: "test" })} disabled={saveMutation.isPending}>
        {saveMutation.isPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
        {isAr ? "حفظ" : "Save"}
      </Button>
    </div>
  );

  const getCountryTabs = () => {
    switch (country) {
      case "SA":
        return [
          { key: "main", label: isAr ? "الرئيسية" : "Main", content: renderSaudiFields() },
          { key: "docs", label: isAr ? "المستندات" : "Documents", content: (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{isAr ? "المستندات المرفوعة" : "Uploaded Documents"}</CardTitle>
                  <CardDescription>{isAr ? "المستندات الضريبية المرفوعة" : "Uploaded tax documents"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="py-8 text-center text-sm text-slate-500">{isAr ? "لا توجد مستندات مرفوعة" : "No documents uploaded"}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )},
        ];
      case "PK":
        return [
          { key: "main", label: "FBR", content: renderPakistanFields() },
        ];
      case "AE":
        return [
          { key: "main", label: "VAT", content: renderUaeFields() },
          { key: "docs", label: isAr ? "المستندات" : "Documents", content: (
            <Card>
              <CardHeader>
                <CardTitle>{isAr ? "المستندات المرفوعة" : "Uploaded Documents"}</CardTitle>
                <CardDescription>{isAr ? "المستندات الضريبية المرفوعة" : "Uploaded tax documents"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="py-8 text-center text-sm text-slate-500">{isAr ? "لا توجد مستندات مرفوعة" : "No documents uploaded"}</div>
              </CardContent>
            </Card>
          )},
        ];
      default:
        return [
          { key: "main", label: isAr ? "الرئيسية" : "Main", content: renderGenericFields() },
        ];
    }
  };

  const tabs = getCountryTabs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{isAr ? "إعدادات الضرائب" : "Tax Settings"}</h1>
        <p className="text-sm text-muted-foreground">
          {isAr ? `إعدادات ضريبة ${countryName}` : `Tax settings for ${countryName}`}
        </p>
        <Badge variant="secondary" className="mt-2">
          <Globe className="size-3 mr-1" />
          {countryName}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key}>{tab.label}</TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.key} value={tab.key} className="mt-4">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>

      {message && (
        <Alert>
          <AlertDescription className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-green-600" />
            {message}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
