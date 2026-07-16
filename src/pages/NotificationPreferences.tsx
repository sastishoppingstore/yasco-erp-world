import { useState } from "react";
import { Bell, Mail, MessageSquare, Smartphone, ShieldCheck } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const NOTIFICATION_CATEGORIES = [
  { key: "registration", labelEn: "Registration", labelAr: "التسجيل" },
  { key: "welcome", labelEn: "Welcome Email", labelAr: "بريد الترحيب" },
  { key: "trial", labelEn: "Trial Notifications", labelAr: "إشعارات التجربة" },
  { key: "plan", labelEn: "Plan Changes", labelAr: "تغييرات الخطة" },
  { key: "payment", labelEn: "Payment Notifications", labelAr: "إشعارات الدفع" },
  { key: "invoice", labelEn: "Invoice Notifications", labelAr: "إشعارات الفواتير" },
  { key: "order", labelEn: "Order Notifications", labelAr: "إشعارات الطلبات" },
  { key: "task", labelEn: "Task Assignments", labelAr: "المهام المسندة" },
  { key: "meeting", labelEn: "Meeting Reminders", labelAr: "تذكيرات الاجتماعات" },
  { key: "password", labelEn: "Password & Security", labelAr: "كلمة المرور والأمان" },
  { key: "tax", labelEn: "Tax API Alerts", labelAr: "تنبيهات API الضرائب" },
  { key: "backup", labelEn: "Backup Notifications", labelAr: "إشعارات النسخ الاحتياطي" },
  { key: "system", labelEn: "System Announcements", labelAr: "إعلانات النظام" },
  { key: "stock", labelEn: "Low Stock Alerts", labelAr: "تنبيهات انخفاض المخزون" },
  { key: "report", labelEn: "Report Notifications", labelAr: "إشعارات التقارير" },
];

export default function NotificationPreferences() {
  const { language, t } = useLanguage();
  const isAr = language === "ar";

  const { data: prefs, isLoading } = trpc.notifications2.getPreferences.useQuery();
  const updatePrefs = trpc.notifications2.updatePreferences.useMutation({
    onSuccess: () => toast.success(isAr ? "تم حفظ التفضيلات" : "Preferences saved"),
    onError: (err) => toast.error(err.message),
  });

  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  useState(() => {
    if (prefs) {
      setEmailEnabled(prefs.emailEnabled);
      setSmsEnabled(prefs.smsEnabled);
      setWhatsappEnabled(prefs.whatsappEnabled);
      setPushEnabled(prefs.pushEnabled);
      setCategories(prefs.categories || []);
    }
  });

  const toggleCategory = (key: string) => {
    setCategories((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  };

  const handleSave = () => {
    updatePrefs.mutate({ emailEnabled, smsEnabled, whatsappEnabled, pushEnabled, categories });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <Badge className="mb-2">
          <Bell className="size-3 mr-1" />
          {isAr ? "إعدادات الإشعارات" : "Notifications"}
        </Badge>
        <h1 className="text-2xl font-bold">{isAr ? "تفضيلات الإشعارات" : "Notification Preferences"}</h1>
        <p className="text-muted-foreground">{isAr ? "تحكم في كيفية تلقي الإشعارات" : "Control how you receive notifications"}</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">{isAr ? "قنوات الإشعارات" : "Notification Channels"}</CardTitle>
          <CardDescription>{isAr ? "اختر القنوات التي تريد تلقي الإشعارات من خلالها" : "Choose the channels to receive notifications"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="size-5 text-blue-500" />
              <div>
                <Label>{isAr ? "البريد الإلكتروني" : "Email"}</Label>
                <p className="text-xs text-muted-foreground">{isAr ? "تلقي الإشعارات عبر البريد الإلكتروني" : "Receive notifications via email"}</p>
              </div>
            </div>
            <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="size-5 text-green-500" />
              <div>
                <Label>SMS</Label>
                <p className="text-xs text-muted-foreground">{isAr ? "تلقي الإشعارات عبر الرسائل النصية" : "Receive notifications via SMS"}</p>
              </div>
            </div>
            <Switch checked={smsEnabled} onCheckedChange={setSmsEnabled} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="size-5 text-emerald-500" />
              <div>
                <Label>WhatsApp</Label>
                <p className="text-xs text-muted-foreground">{isAr ? "تلقي الإشعارات عبر واتساب" : "Receive notifications via WhatsApp"}</p>
              </div>
            </div>
            <Switch checked={whatsappEnabled} onCheckedChange={setWhatsappEnabled} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="size-5 text-purple-500" />
              <div>
                <Label>{isAr ? "إشعارات داخل التطبيق" : "In-App Notifications"}</Label>
                <p className="text-xs text-muted-foreground">{isAr ? "تلقي الإشعارات داخل التطبيق" : "Receive notifications inside the app"}</p>
              </div>
            </div>
            <Switch checked={pushEnabled} onCheckedChange={setPushEnabled} />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">{isAr ? "فئات الإشعارات" : "Notification Categories"}</CardTitle>
          <CardDescription>{isAr ? "اختر أنواع الإشعارات التي تريد تلقيها" : "Select which notification types you want to receive"}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {NOTIFICATION_CATEGORIES.map((cat) => (
              <div key={cat.key} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Label className="cursor-pointer text-sm">{isAr ? cat.labelAr : cat.labelEn}</Label>
                <Switch
                  checked={categories.includes(cat.key)}
                  onCheckedChange={() => toggleCategory(cat.key)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
        <ShieldCheck className="size-3" />
        <span>{isAr ? "يتم حفظ تفضيلاتك بشكل آمن" : "Your preferences are saved securely"}</span>
      </div>

      <Button onClick={handleSave} disabled={updatePrefs.isPending} className="w-full">
        {updatePrefs.isPending
          ? (isAr ? "جاري الحفظ..." : "Saving...")
          : (isAr ? "حفظ التفضيلات" : "Save Preferences")}
      </Button>
    </div>
  );
}
