import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ParkingCircle, Wrench, Calendar } from "lucide-react";
import ActionButton3D from "@/components/ui/ActionButton3D";

const bayStatusColors: Record<string, string> = {
  available: "bg-emerald-100 text-emerald-700 border-emerald-200",
  occupied: "bg-blue-100 text-blue-700 border-blue-200",
  maintenance: "bg-amber-100 text-amber-700 border-amber-200",
  reserved: "bg-purple-100 text-purple-700 border-purple-200",
};

export default function BaysPage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const { data: bays, refetch } = trpc.workshop.bayList.useQuery(selectedDate ? { date: selectedDate } : undefined);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bay Schedule</h2>
          <p className="text-slate-500">Workshop bay utilization and scheduling</p>
        </div>
        <ActionButton3D icon={<ArrowLeft className="size-4" />} label="Dashboard" color="slate" onClick={() => navigate("/app/verticals/workshop")} />
      </div>

      <div className="flex items-center gap-3">
        <Calendar className="size-4 text-slate-400" />
        <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-48" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {bays?.map(bay => (
          <Card key={bay.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ParkingCircle className="size-5 text-slate-500" />
                  <span className="font-bold text-lg">Bay {bay.bayNumber}</span>
                </div>
                <Badge className={`text-xs ${bayStatusColors[bay.status]}`} variant="outline">
                  {bay.status}
                </Badge>
              </div>
              {bay.jobCardId && (
                <div className="text-sm text-slate-600">
                  Job #{bay.jobCardId}
                  {bay.startTime && <div className="text-xs text-slate-400 mt-1">{bay.startTime} - {bay.endTime || "..."}</div>}
                </div>
              )}
              {bay.status === "available" && (
                <div className="text-sm text-emerald-600 font-medium">Ready for use</div>
              )}
            </CardContent>
          </Card>
        ))}
        {(!bays || bays.length === 0) && (
          <div className="col-span-full text-center py-12 text-slate-500">
            <ParkingCircle className="size-12 mx-auto mb-3 text-slate-300" />
            <p>No bays configured for this date</p>
          </div>
        )}
      </div>
    </div>
  );
}
