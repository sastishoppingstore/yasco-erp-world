import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarCheck, DollarSign } from "lucide-react";

export default function RecognitionScheduleList() {
  const { data: schedules, refetch } = trpc.ifrs15.recognitionScheduleList.useQuery(undefined);
  const recognizeRev = trpc.ifrs15.recognizeRevenue.useMutation({ onSuccess: () => refetch() });
  const [jeForm, setJeForm] = useState({ scheduleId: 0, entryNumber: "", date: "" });

  const statusColors: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-800", recognized: "bg-green-100 text-green-800", skipped: "bg-gray-100 text-gray-800",
  };

  const handleRecognize = (scheduleId: number) => {
    recognizeRev.mutate({ scheduleId, entryNumber: `REV-${scheduleId}`, date: new Date().toISOString().split("T")[0] });
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Revenue Recognition Schedule</h2><p className="text-slate-500">IFRS 15 Step 5 - Recognize revenue</p></div>
      <Card>
        <CardHeader><CardTitle>Scheduled Recognitions</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left"><th className="pb-2 font-medium">Date</th><th className="pb-2 font-medium">Amount</th><th className="pb-2 font-medium">Cumulative</th><th className="pb-2 font-medium">Method</th><th className="pb-2 font-medium">Status</th><th className="pb-2 font-medium">Actions</th></tr></thead>
            <tbody>
              {schedules?.map(s => (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="py-2">{s.scheduledDate}</td>
                  <td className="py-2">{s.recognizedAmount}</td>
                  <td className="py-2">{s.cumulativeAmount}</td>
                  <td className="py-2 capitalize">{s.recognitionMethod.replace(/_/g, " ")}</td>
                  <td className="py-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[s.status]}`}>{s.status}</span></td>
                  <td className="py-2">
                    <Button size="sm" variant="outline" onClick={() => handleRecognize(s.id)}
                      disabled={s.status === "recognized" || recognizeRev.isPending}>
                      <DollarSign className="w-3 h-3 mr-1" />Recognize
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
