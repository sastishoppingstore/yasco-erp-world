import { useEffect, useState } from "react";
import { useLanguage } from "@/providers/language";
import db from "@/lib/db/localDatabase";
import { syncEngine } from "@/lib/sync/syncEngine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Database, HardDrive, RefreshCw, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

export default function LocalDatabaseStatusPage() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dbSize, setDbSize] = useState("0 KB");

  const loadStats = async () => {
    setLoading(true);
    const s = await syncEngine.getStats();
    setStats(s);

    // Estimate DB size (IndexedDB storage estimate)
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      setDbSize(`${(usage / 1024 / 1024).toFixed(2)} MB / ${(quota / 1024 / 1024).toFixed(2)} MB`);
    }

    setLoading(false);
  };

  useEffect(() => { loadStats(); }, []);

  const tables = [
    "products", "customers", "suppliers", "invoices", "invoiceItems",
    "sales", "saleItems", "purchases", "purchaseItems",
    "payments", "receipts", "tasks", "meetings",
    "syncQueue", "syncLogs",
  ];

  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      const c: Record<string, number> = {};
      for (const t of tables) {
        try {
          c[t] = await (db as any).table(t).count();
        } catch { c[t] = 0; }
      }
      setCounts(c);
    })();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{isAr ? "حالة قاعدة البيانات المحلية" : "Local Database Status"}</h1>
          <p className="text-muted-foreground">
            {isAr ? "معلومات حول قاعدة البيانات المحلية والتخزين" : "Information about the local database and storage"}
          </p>
        </div>
        <Button variant="outline" onClick={loadStats}>
          <RefreshCw className={`size-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          {isAr ? "تحديث" : "Refresh"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="size-4 text-blue-500" />
              <p className="text-sm font-medium">{isAr ? "حجم التخزين" : "Storage Size"}</p>
            </div>
            <p className="text-lg font-bold">{dbSize}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="size-4 text-green-500" />
              <p className="text-sm font-medium">{isAr ? "إجمالي السجلات" : "Total Records"}</p>
            </div>
            <p className="text-lg font-bold">
              {Object.values(counts).reduce((a, b) => a + b, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="size-4 text-purple-500" />
              <p className="text-sm font-medium">{isAr ? "حالة المزامنة" : "Sync Status"}</p>
            </div>
            <Badge variant="outline" className="text-sm">
              {stats?.pending} pending · {stats?.failed} failed
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{isAr ? "جداول قاعدة البيانات" : "Database Tables"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {tables.map((table) => (
              <div key={table} className="p-3 rounded-lg border">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium capitalize">{table.replace(/([A-Z])/g, " $1").trim()}</p>
                  {counts[table] > 0 ? (
                    <CheckCircle2 className="size-3 text-green-500" />
                  ) : (
                    <div className="size-3" />
                  )}
                </div>
                <p className="text-lg font-bold">{counts[table] || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {isAr ? "سجل" : "records"}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
