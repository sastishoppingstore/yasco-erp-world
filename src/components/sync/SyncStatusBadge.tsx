import { useSync } from "@/providers/sync";
import { Badge } from "@/components/ui/badge";
import {
  Wifi, WifiOff, RefreshCw, AlertTriangle, CheckCircle2,
} from "lucide-react";
import { useLanguage } from "@/providers/language";

export default function SyncStatusBadge() {
  const { status } = useSync();
  const { language } = useLanguage();
  const isAr = language === "ar";

  const config: Record<string, { label: string; labelAr: string; icon: any; className: string }> = {
    online: {
      label: "Online",
      labelAr: "متصل",
      icon: Wifi,
      className: "bg-green-500/10 text-green-600 border-green-200",
    },
    offline: {
      label: "Offline",
      labelAr: "غير متصل",
      icon: WifiOff,
      className: "bg-red-500/10 text-red-600 border-red-200",
    },
    syncing: {
      label: "Syncing...",
      labelAr: "مزامنة...",
      icon: RefreshCw,
      className: "bg-blue-500/10 text-blue-600 border-blue-200",
    },
    sync_failed: {
      label: "Sync Failed",
      labelAr: "فشلت المزامنة",
      icon: AlertTriangle,
      className: "bg-orange-500/10 text-orange-600 border-orange-200",
    },
    unknown: {
      label: "Checking...",
      labelAr: "تحقق...",
      icon: RefreshCw,
      className: "bg-gray-500/10 text-gray-600 border-gray-200",
    },
  };

  const cfg = config[status.state] || config.unknown;
  const Icon = cfg.icon;

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className={`flex items-center gap-1.5 px-3 py-1 ${cfg.className}`}>
        <Icon className={`size-3 ${status.state === "syncing" ? "animate-spin" : ""}`} />
        <span className="text-xs font-medium">{isAr ? cfg.labelAr : cfg.label}</span>
      </Badge>
      {status.pendingCount > 0 && (
        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-200">
          <RefreshCw className="size-3 mr-1" />
          <span className="text-xs">{status.pendingCount} {isAr ? "معلق" : "pending"}</span>
        </Badge>
      )}
      {status.failedCount > 0 && (
        <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200">
          <AlertTriangle className="size-3 mr-1" />
          <span className="text-xs">{status.failedCount} {isAr ? "فشل" : "failed"}</span>
        </Badge>
      )}
      {status.state === "online" && status.pendingCount === 0 && status.failedCount === 0 && (
        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
          <CheckCircle2 className="size-3 mr-1" />
          <span className="text-xs">{isAr ? "متزامن" : "Synced"}</span>
        </Badge>
      )}
    </div>
  );
}
