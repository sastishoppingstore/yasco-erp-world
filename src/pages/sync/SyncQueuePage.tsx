import { useEffect, useState } from "react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { useSync } from "@/providers/sync";
import { getPendingSyncItems, getFailedSyncItems, getConflictItems, markSyncQueueItem } from "@/lib/sync/offlineStorage";
import { syncEngine } from "@/lib/sync/syncEngine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, RefreshCw, AlertTriangle, CheckCircle2, Clock, Upload, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function SyncQueuePage() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const { sync, retryAllFailed } = useSync();
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: stats } = trpc.sync.status.useQuery();

  const loadQueue = async () => {
    setLoading(true);
    const pending = await getPendingSyncItems();
    const failed = await getFailedSyncItems();
    const conflicts = await getConflictItems();
    setQueue([...pending, ...failed, ...conflicts].sort((a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
    setLoading(false);
  };

  useEffect(() => { loadQueue(); }, []);

  const handleRetry = async (id: number) => {
    await syncEngine.retryFailedItem(id);
    loadQueue();
  };

  const handleRetryAll = async () => {
    retryAllFailed();
    toast.success(isAr ? "جاري إعادة المحاولة" : "Retrying all failed items");
    setTimeout(loadQueue, 2000);
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; labelAr: string; variant: any }> = {
      pending: { label: "Pending", labelAr: "معلق", variant: "outline" },
      syncing: { label: "Syncing", labelAr: "مزامنة", variant: "outline" },
      synced: { label: "Synced", labelAr: "متزامن", variant: "default" },
      failed: { label: "Failed", labelAr: "فشل", variant: "destructive" },
      conflict: { label: "Conflict", labelAr: "تعارض", variant: "destructive" },
    };
    const m = map[status] || map.pending;
    return <Badge variant={m.variant}>{isAr ? m.labelAr : m.label}</Badge>;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{isAr ? "قائمة المزامنة" : "Sync Queue"}</h1>
          <p className="text-muted-foreground">
            {isAr ? "عرض وإدارة عناصر المزامنة المعلقة" : "View and manage pending sync items"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadQueue}>
            <RefreshCw className={`size-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {isAr ? "تحديث" : "Refresh"}
          </Button>
          <Button onClick={handleRetryAll}>
            <Upload className="size-4 mr-2" />
            {isAr ? "إعادة المحاولة للكل" : "Retry All"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{queue.filter((i) => i.status === "pending").length}</p>
            <p className="text-xs text-muted-foreground">{isAr ? "معلق" : "Pending"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-green-600">{queue.filter((i) => i.status === "synced").length}</p>
            <p className="text-xs text-muted-foreground">{isAr ? "متزامن" : "Synced"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-red-600">{queue.filter((i) => i.status === "failed").length}</p>
            <p className="text-xs text-muted-foreground">{isAr ? "فشل" : "Failed"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{queue.filter((i) => i.status === "conflict").length}</p>
            <p className="text-xs text-muted-foreground">{isAr ? "تعارض" : "Conflicts"}</p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-8 animate-spin" />
        </div>
      ) : queue.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="size-12 mx-auto text-green-500 mb-4" />
            <p className="text-lg font-medium">{isAr ? "كل شيء متزامن" : "All Synced"}</p>
            <p className="text-sm text-muted-foreground">{isAr ? "لا توجد عناصر انتظار للمزامنة" : "No items waiting to sync"}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {queue.map((item) => (
            <Card key={item.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {item.status === "failed" && <XCircle className="size-4 text-red-500" />}
                    {item.status === "conflict" && <AlertTriangle className="size-4 text-orange-500" />}
                    {item.status === "pending" && <Clock className="size-4 text-yellow-500" />}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.entityType}</span>
                        {statusBadge(item.status)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {item.action} · {new Date(item.createdAt).toLocaleString()}
                        {item.errorMessage && ` · ${item.errorMessage}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRetry(item.id)}
                      disabled={item.status === "syncing"}
                    >
                      <RefreshCw className={`size-3 mr-1 ${item.status === "syncing" ? "animate-spin" : ""}`} />
                      {isAr ? "إعادة" : "Retry"}
                    </Button>
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
