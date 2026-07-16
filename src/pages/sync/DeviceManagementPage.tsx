import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { getDeviceId } from "@/lib/sync/offlineStorage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Smartphone, Monitor, Laptop, Globe, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function DeviceManagementPage() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const currentDeviceId = getDeviceId();

  const { data: devices, isLoading, refetch } = trpc.sync.listDevices.useQuery();
  const deactivateMutation = trpc.sync.deactivateDevice.useMutation({
    onSuccess: () => {
      toast.success(isAr ? "تم تعطيل الجهاز" : "Device deactivated");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const deviceIcon = (platform?: string) => {
    switch (platform) {
      case "windows": return <Monitor className="size-4" />;
      case "macos": return <Laptop className="size-4" />;
      case "web": return <Globe className="size-4" />;
      default: return <Smartphone className="size-4" />;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{isAr ? "إدارة الأجهزة" : "Device Management"}</h1>
        <p className="text-muted-foreground">
          {isAr ? "عرض وإدارة الأجهزة المتصلة بحسابك" : "View and manage devices connected to your account"}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-8 animate-spin" />
        </div>
      ) : !devices?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Smartphone className="size-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">{isAr ? "لا توجد أجهزة مسجلة" : "No devices registered"}</p>
            <p className="text-sm text-muted-foreground">
              {isAr ? "عند تسجيل الدخول من جهاز جديد، سيظهر هنا" : "When you log in from a new device, it will appear here"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isAr ? "الجهاز" : "Device"}</TableHead>
                  <TableHead>{isAr ? "المنصة" : "Platform"}</TableHead>
                  <TableHead>{isAr ? "آخر ظهور" : "Last Seen"}</TableHead>
                  <TableHead>{isAr ? "آخر مزامنة" : "Last Sync"}</TableHead>
                  <TableHead>{isAr ? "الحالة" : "Status"}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((device: any) => (
                  <TableRow key={device.deviceId}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {deviceIcon(device.platform)}
                        <div>
                          <p className="text-sm font-medium">
                            {device.deviceName || device.deviceId}
                            {device.deviceId === currentDeviceId && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                {isAr ? "هذا الجهاز" : "This device"}
                              </Badge>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">{device.deviceId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{device.platform || "-"}</TableCell>
                    <TableCell className="text-sm">
                      {device.lastSeen ? new Date(device.lastSeen).toLocaleString() : "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {device.lastSyncAt ? new Date(device.lastSyncAt).toLocaleString() : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={device.isActive ? "default" : "destructive"}>
                        {device.isActive ? (isAr ? "نشط" : "Active") : (isAr ? "معطل" : "Inactive")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {device.deviceId !== currentDeviceId && device.isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deactivateMutation.mutate({ deviceId: device.deviceId })}
                        >
                          <XCircle className="size-4 text-red-500" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
