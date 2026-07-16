import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CalendarPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const dateFrom = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
  const dateTo = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${lastDay}`;

  const { data: calendar } = trpc.hotel.calendarView.useQuery({ dateFrom, dateTo });
  const { data: inventory } = trpc.hotel.roomInventoryList.useQuery(undefined);

  const prevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); } else setCurrentMonth(m => m - 1); };
  const nextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); } else setCurrentMonth(m => m + 1); };

  const days = Array.from({ length: lastDay }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Booking Calendar</h2><p className="text-slate-500">Room availability and booking calendar</p></div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft className="w-4 h-4" /></Button>
          <span className="font-medium min-w-32 text-center">{new Date(currentYear, currentMonth).toLocaleString("default", { month: "long", year: "numeric" })}</span>
          <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 bg-slate-50 text-left text-sm font-medium">Room</th>
              {days.map(d => <th key={d} className={`border p-2 text-center text-xs font-medium w-10 ${d === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear() ? "bg-blue-50 text-blue-700" : "bg-slate-50"}`}>{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {inventory?.map(room => (
              <tr key={room.id}>
                <td className="border p-2 text-sm font-mono">{room.roomNumber}</td>
                {days.map(d => {
                  const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                  const entry = calendar?.find(c => c.roomId === room.id && c.date === dateStr);
                  return (
                    <td key={d} className={`border p-1 text-center text-xs ${entry?.status === "booked" ? "bg-blue-200" : entry?.status === "maintenance" ? "bg-amber-200" : entry?.status === "blocked" ? "bg-red-200" : "bg-emerald-100"}`}>
                      {entry && <span className="block truncate text-[10px]">{entry.status === "booked" ? "B" : entry.status === "maintenance" ? "M" : entry.status === "blocked" ? "X" : ""}</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-4 text-sm">
        <Badge className="bg-emerald-100 text-emerald-700">Available</Badge>
        <Badge className="bg-blue-200 text-blue-700">Booked</Badge>
        <Badge className="bg-amber-200 text-amber-700">Maintenance</Badge>
        <Badge className="bg-red-200 text-red-700">Blocked</Badge>
      </div>
    </div>
  );
}
