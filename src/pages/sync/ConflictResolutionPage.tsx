import { useEffect, useState } from "react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import db from "@/lib/db/localDatabase";
import { syncEngine } from "@/lib/sync/syncEngine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertTriangle, CheckCircle2, RefreshCw, Loader2,
  ArrowLeft, ArrowRight, Merge,
} from "lucide-react";
import { toast } from "sonner";

export default function ConflictResolutionPage() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConflicts, setSelectedConflicts] = useState<Record<string, string>>({});

  const resolveMutation = trpc.sync.resolveConflict.useMutation({
    onSuccess: () => {
      toast.success(isAr ? "تم حل التعارض" : "Conflict resolved");
      loadConflicts();
    },
    onError: (err) => toast.error(err.message),
  });

  const loadConflicts = async () => {
    setLoading(true);
    const items = await db.syncQueue.where("status").equals("conflict").toArray();
    setConflicts(items);
    setLoading(false);
  };

  useEffect(() => { loadConflicts(); }, []);

  const handleResolve = async (item: any) => {
    const localUuid = item.entityId;
    const resolution = selectedConflicts[item.id] || "keep_local";

    resolveMutation.mutate({
      entityType: item.entityType,
      localUuid,
      resolution: resolution as any,
    });

    await db.syncQueue.put({ ...item, status: "synced", updatedAt: new Date().toISOString() } as any);
    loadConflicts();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{isAr ? "حل التعارضات" : "Conflict Resolution"}</h1>
          <p className="text-muted-foreground">
            {isAr ? "حل التعارضات بين البيانات المحلية وبيانات الخادم" : "Resolve conflicts between local and server data"}
          </p>
        </div>
        <Button variant="outline" onClick={loadConflicts}>
          <RefreshCw className={`size-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          {isAr ? "تحديث" : "Refresh"}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-8 animate-spin" />
        </div>
      ) : conflicts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="size-12 mx-auto text-green-500 mb-4" />
            <p className="text-lg font-medium">{isAr ? "لا توجد تعارضات" : "No Conflicts"}</p>
            <p className="text-sm text-muted-foreground">
              {isAr ? "جميع البيانات متزامنة دون تعارضات" : "All data is synced without conflicts"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {conflicts.map((item) => {
            const payload = item.payloadJson ? JSON.parse(item.payloadJson) : {};
            const serverVersion = payload.serverVersion;

            return (
              <Card key={item.id} className="border-orange-200">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="size-5 text-orange-500" />
                    <div>
                      <CardTitle className="text-lg capitalize">
                        {item.entityType} {isAr ? "تعارض" : "Conflict"}
                      </CardTitle>
                      <CardDescription>
                        {isAr ? "تم تغيير هذا السجل على جهازين" : "This record was changed on two devices"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/30">
                      <p className="text-xs font-medium text-blue-600 mb-1">
                        {isAr ? "النسخة المحلية" : "Local Version"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isAr ? "تم التعديل على هذا الجهاز" : "Modified on this device"}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/30">
                      <p className="text-xs font-medium text-green-600 mb-1">
                        {isAr ? "نسخة الخادم" : "Server Version"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {serverVersion
                          ? (isAr ? `الإصدار ${serverVersion.version || serverVersion.id}` : `Version ${serverVersion.version || serverVersion.id}`)
                          : (isAr ? "أحدث على الخادم" : "Newer on server")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Select
                      value={selectedConflicts[item.id] || "keep_local"}
                      onValueChange={(val) => setSelectedConflicts((prev) => ({ ...prev, [item.id]: val }))}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder={isAr ? "اختر الحل" : "Choose resolution"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="keep_local">
                          <div className="flex items-center gap-2">
                            <ArrowLeft className="size-3" />
                            {isAr ? "الاحتفاظ بالمحلي" : "Keep Local"}
                          </div>
                        </SelectItem>
                        <SelectItem value="keep_server">
                          <div className="flex items-center gap-2">
                            <ArrowRight className="size-3" />
                            {isAr ? "الاحتفاظ بالخادم" : "Keep Server"}
                          </div>
                        </SelectItem>
                        <SelectItem value="merge">
                          <div className="flex items-center gap-2">
                            <Merge className="size-3" />
                            {isAr ? "دمج يدويًا" : "Merge Manually"}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      onClick={() => handleResolve(item)}
                      disabled={resolveMutation.isPending}
                      size="sm"
                    >
                      {resolveMutation.isPending ? (
                        <Loader2 className="size-3 animate-spin mr-2" />
                      ) : (
                        <CheckCircle2 className="size-3 mr-2" />
                      )}
                      {isAr ? "حل التعارض" : "Resolve"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
