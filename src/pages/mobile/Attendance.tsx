import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { Clock, MapPin, CheckCircle2, XCircle, Navigation } from "lucide-react";

export default function MobileAttendance() {
  const employeeId = 1;
  const { data: today, refetch } = trpc.mobile.getTodayAttendance.useQuery({ employeeId });
  const clockIn = trpc.mobile.clockIn.useMutation({ onSuccess: () => refetch() });
  const clockOut = trpc.mobile.clockOut.useMutation({ onSuccess: () => refetch() });
  const { data: history } = trpc.mobile.getMyAttendance.useQuery({ employeeId, limit: 10 });
  const [gpsStatus, setGpsStatus] = useState<{ lat?: number; lng?: number }>({});

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setGpsStatus({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setGpsStatus({}),
      );
    }
  }, []);

  const isClockedIn = !!today?.checkIn && !today?.checkOut;

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold">Attendance</h1>

      <Card className="text-center">
        <CardContent className="py-8">
          <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-4">
            <Clock className={`w-10 h-10 ${isClockedIn ? "text-green-500" : "text-blue-500"}`} />
          </div>
          <p className="text-lg font-bold">{isClockedIn ? "Clocked In" : "Not Clocked In"}</p>
          <p className="text-sm text-slate-500">
            {today?.checkIn ? new Date(today.checkIn).toLocaleTimeString() : "---"}
            {today?.checkOut ? ` - ${new Date(today.checkOut).toLocaleTimeString()}` : ""}
          </p>
          {today?.workHours && <p className="text-sm font-medium mt-1">{today.workHours} hours</p>}

          {gpsStatus.lat && (
            <p className="text-xs text-slate-400 mt-2 flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3" />{gpsStatus.lat.toFixed(4)}, {gpsStatus.lng?.toFixed(4)}
            </p>
          )}

          <div className="mt-6 space-y-2">
            {!today?.checkIn ? (
              <Button className="w-full" onClick={() => clockIn.mutate({ employeeId, latitude: gpsStatus.lat ?? 0, longitude: gpsStatus.lng ?? 0 })}>
                <Clock className="w-4 h-4 mr-2" />Clock In
              </Button>
            ) : !today?.checkOut ? (
              <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={() => clockOut.mutate({ employeeId })}>
                <Clock className="w-4 h-4 mr-2" />Clock Out
              </Button>
            ) : (
              <Badge className="bg-green-100 text-green-800 text-sm py-2 w-full justify-center">
                <CheckCircle2 className="w-4 h-4 mr-1" />Completed
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Recent History</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {history?.slice(0, 5).map((h: any) => (
            <div key={h.id} className="flex items-center justify-between text-sm">
              <span>{h.date}</span>
              <span className="text-xs text-slate-500">
                {h.checkIn ? new Date(h.checkIn).toLocaleTimeString() : "---"}
                {h.workHours ? ` (${h.workHours}h)` : ""}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
