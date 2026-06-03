import { useSync } from "@/providers/sync";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { WifiOff, RefreshCw } from "lucide-react";
import { useLanguage } from "@/providers/language";

export default function OfflineBanner() {
  const { status, sync } = useSync();
  const { language } = useLanguage();
  const isAr = language === "ar";

  if (status.state !== "offline" && status.state !== "sync_failed") return null;

  return (
    <Alert variant={status.state === "offline" ? "destructive" : "default"} className="rounded-none border-x-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status.state === "offline" ? (
            <WifiOff className="size-4" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          <AlertDescription>
            {status.state === "offline"
              ? (isAr ? "أنت غير متصل بالإنترنت. التغييرات محفوظة محليًا وستتم مزامنتها عند عودة الاتصال." : "You are offline. Changes are saved locally and will sync when connection resumes.")
              : (isAr ? `فشلت المزامنة: ${status.lastSyncError || ""}` : `Sync failed: ${status.lastSyncError || ""}`)}
          </AlertDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => sync()}
          disabled={status.state === "offline"}
        >
          <RefreshCw className={`size-3 mr-2 ${status.state === "syncing" ? "animate-spin" : ""}`} />
          {isAr ? "إعادة المحاولة" : "Retry"}
        </Button>
      </div>
    </Alert>
  );
}
