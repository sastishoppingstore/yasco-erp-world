import { useSync } from "@/providers/sync";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useLanguage } from "@/providers/language";

export default function SyncNowButton() {
  const { status, sync } = useSync();
  const { language } = useLanguage();
  const isAr = language === "ar";

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => sync()}
      disabled={status.state === "syncing" || status.state === "offline"}
    >
      <RefreshCw className={`size-4 mr-2 ${status.state === "syncing" ? "animate-spin" : ""}`} />
      {status.state === "syncing"
        ? (isAr ? "مزامنة..." : "Syncing...")
        : (isAr ? "مزامنة الآن" : "Sync Now")}
    </Button>
  );
}
