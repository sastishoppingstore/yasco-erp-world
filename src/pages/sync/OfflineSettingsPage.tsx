import { useState } from "react";
import { useLanguage } from "@/providers/language";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Save, Database, Clock, Shield, Trash2 } from "lucide-react";
import { toast } from "sonner";
import db from "@/lib/db/localDatabase";

export default function OfflineSettingsPage() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [offlineGraceDays, setOfflineGraceDays] = useState(30);
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState(5);
  const [encryptLocalData, setEncryptLocalData] = useState(true);

  const handleSave = () => {
    localStorage.setItem("offline_grace_days", String(offlineGraceDays));
    localStorage.setItem("auto_sync", String(autoSync));
    localStorage.setItem("sync_interval", String(syncInterval));
    localStorage.setItem("encrypt_local_data", String(encryptLocalData));
    toast.success(isAr ? "تم حفظ الإعدادات" : "Settings saved");
  };

  const handleClearLocalData = async () => {
    if (!confirm(isAr ? "هل أنت متأكد؟ سيتم حذف جميع البيانات المحلية." : "Are you sure? All local data will be deleted.")) return;
    await db.delete();
    await db.open();
    toast.success(isAr ? "تم مسح البيانات المحلية" : "Local data cleared");
  };

  // Get stats
  const getTableStats = async () => {
    const tables = ["products", "customers", "suppliers", "invoices", "sales", "purchases", "payments", "tasks", "meetings"];
    const stats: Record<string, number> = {};
    for (const t of tables) {
      try {
        stats[t] = await (db as any)[t].count();
      } catch { stats[t] = 0; }
    }
    return stats;
  };

  const [tableStats, setTableStats] = useState<Record<string, number> | null>(null);
  useState(() => {
    getTableStats().then(setTableStats);
  });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <Badge className="mb-2">
          <Database className="size-3 mr-1" />
          {isAr ? "دون اتصال" : "Offline"}
        </Badge>
        <h1 className="text-2xl font-bold">{isAr ? "إعدادات العمل دون اتصال" : "Offline Settings"}</h1>
        <p className="text-muted-foreground">
          {isAr ? "تكوين سلوك التطبيق عند العمل دون اتصال بالإنترنت" : "Configure app behavior when working offline"}
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">{isAr ? "المزامنة" : "Sync"}</CardTitle>
          <CardDescription>{isAr ? "إعدادات المزامنة التلقائية" : "Automatic sync settings"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>{isAr ? "المزامنة التلقائية" : "Auto Sync"}</Label>
              <p className="text-xs text-muted-foreground">
                {isAr ? "مزامنة البيانات تلقائيًا عند الاتصال" : "Automatically sync data when connected"}
              </p>
            </div>
            <Switch checked={autoSync} onCheckedChange={setAutoSync} />
          </div>
          <Separator />
          <div>
            <Label>{isAr ? "فترة المزامنة (دقائق)" : "Sync Interval (minutes)"}</Label>
            <Input
              type="number"
              min={1}
              max={60}
              value={syncInterval}
              onChange={(e) => setSyncInterval(Number(e.target.value))}
              className="mt-1 w-32"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">{isAr ? "فترة السماح دون اتصال" : "Offline Grace Period"}</CardTitle>
          <CardDescription>
            {isAr ? "عدد الأيام المسموح بها للعمل دون اتصال بعد انتهاء الاشتراك" : "Days allowed to work offline after subscription expiry"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Clock className="size-5 text-muted-foreground" />
            <Input
              type="number"
              min={1}
              max={365}
              value={offlineGraceDays}
              onChange={(e) => setOfflineGraceDays(Number(e.target.value))}
              className="w-32"
            />
            <span className="text-sm text-muted-foreground">{isAr ? "يوم" : "days"}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">{isAr ? "الأمان" : "Security"}</CardTitle>
          <CardDescription>{isAr ? "إعدادات أمان البيانات المحلية" : "Local data security settings"}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="size-5 text-muted-foreground" />
              <div>
                <Label>{isAr ? "تشفير البيانات المحلية" : "Encrypt Local Data"}</Label>
                <p className="text-xs text-muted-foreground">
                  {isAr ? "تشفير البيانات المخزنة محليًا على الجهاز" : "Encrypt data stored locally on device"}
                </p>
              </div>
            </div>
            <Switch checked={encryptLocalData} onCheckedChange={setEncryptLocalData} />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">{isAr ? "قاعدة البيانات المحلية" : "Local Database"}</CardTitle>
          <CardDescription>{isAr ? "إحصائيات البيانات المخزنة محليًا" : "Statistics of locally stored data"}</CardDescription>
        </CardHeader>
        <CardContent>
          {tableStats && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              {Object.entries(tableStats).map(([table, count]) => (
                <div key={table} className="p-2 rounded-lg border text-center">
                  <p className="text-lg font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground capitalize">{table}</p>
                </div>
              ))}
            </div>
          )}
          <Button variant="destructive" onClick={handleClearLocalData}>
            <Trash2 className="size-4 mr-2" />
            {isAr ? "مسح جميع البيانات المحلية" : "Clear All Local Data"}
          </Button>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full">
        <Save className="size-4 mr-2" />
        {isAr ? "حفظ الإعدادات" : "Save Settings"}
      </Button>
    </div>
  );
}
