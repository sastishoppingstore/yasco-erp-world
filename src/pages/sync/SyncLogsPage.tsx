import { useEffect, useState } from "react";
import { useLanguage } from "@/providers/language";
import { getSyncLogs } from "@/lib/sync/offlineStorage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowUpRight, ArrowDownLeft, Loader2 } from "lucide-react";

export default function SyncLogsPage() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    const items = await getSyncLogs(100);
    setLogs(items);
    setLoading(false);
  };

  useEffect(() => { loadLogs(); }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{isAr ? "سجل المزامنة" : "Sync Logs"}</h1>
          <p className="text-muted-foreground">{isAr ? "سجل جميع عمليات المزامنة" : "Record of all sync operations"}</p>
        </div>
        <Button variant="outline" onClick={loadLogs}>
          <RefreshCw className={`size-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          {isAr ? "تحديث" : "Refresh"}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-8 animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg font-medium">{isAr ? "لا توجد سجلات" : "No logs yet"}</p>
            <p className="text-sm text-muted-foreground">{isAr ? "سيتم تسجيل عمليات المزامنة هنا" : "Sync operations will be recorded here"}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <Card key={log.id}>
              <CardContent className="py-3">
                <div className="flex items-center gap-3">
                  {log.direction === "push" ? (
                    <ArrowUpRight className="size-4 text-blue-500" />
                  ) : (
                    <ArrowDownLeft className="size-4 text-green-500" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium capitalize">{log.direction}</span>
                      <Badge variant={log.status === "synced" ? "default" : log.status === "failed" ? "destructive" : "secondary"}>
                        {log.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {log.entityType && `${log.entityType} `}
                      {log.entityId && `#${log.entityId} `}
                      {log.action && `· ${log.action}`}
                      {log.message && ` · ${log.message}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
