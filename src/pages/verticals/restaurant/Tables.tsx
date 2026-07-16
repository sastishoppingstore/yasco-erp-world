import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/providers/language";
import { Grid, Users, PlusCircle, CheckCircle2, ShieldCheck, Clock } from "lucide-react";

interface Table {
  number: number;
  capacity: number;
  status: "available" | "occupied" | "reserved";
  guestsCount?: number;
}

const initialTables: Table[] = [
  { number: 1, capacity: 2, status: "available" },
  { number: 2, capacity: 4, status: "occupied", guestsCount: 3 },
  { number: 3, capacity: 4, status: "occupied", guestsCount: 4 },
  { number: 4, capacity: 6, status: "available" },
  { number: 5, capacity: 2, status: "reserved" },
  { number: 6, capacity: 8, status: "available" },
  { number: 7, capacity: 4, status: "occupied", guestsCount: 2 },
  { number: 8, capacity: 6, status: "reserved" }
];

export default function RestaurantTablesPage() {
  const { language, dir } = useLanguage();
  const isAr = language === "ar";
  const [tables, setTables] = useState<Table[]>(initialTables);

  const toggleTableStatus = (number: number) => {
    setTables(prev => prev.map(t => {
      if (t.number === number) {
        let newStatus: Table["status"] = "available";
        let guests = 0;
        if (t.status === "available") {
          newStatus = "occupied";
          guests = t.capacity;
        } else if (t.status === "occupied") {
          newStatus = "reserved";
        } else {
          newStatus = "available";
        }
        return { ...t, status: newStatus, guestsCount: guests || undefined };
      }
      return t;
    }));
  };

  const activeOccupied = tables.filter(t => t.status === "occupied").length;
  const activeReserved = tables.filter(t => t.status === "reserved").length;
  const totalGuests = tables.reduce((acc, t) => acc + (t.guestsCount || 0), 0);

  return (
    <div className="space-y-6" dir={dir}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Grid className="size-6 text-red-600" />
            {isAr ? "خريطة طاولات صالة الطعام" : "Dining Tables Floor Map"}
          </h2>
          <p className="text-slate-500">
            {isAr ? "مراقبة إشغال وحجز الطاولات في الصالة بشكل فوري" : "Real-time floor grid status and seating capacity checks"}
          </p>
        </div>
      </div>

      {/* Seating KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-slate-50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-1">{isAr ? "إجمالي الطاولات" : "Total Tables"}</p>
            <p className="text-2xl font-bold">{tables.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50/50 border-red-200">
          <CardContent className="p-4">
            <p className="text-xs text-red-600 mb-1">{isAr ? "طاولات مشغولة" : "Occupied Tables"}</p>
            <p className="text-2xl font-bold text-red-700">{activeOccupied}</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50/50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-xs text-blue-600 mb-1">{isAr ? "طاولات محجوزة" : "Reserved Tables"}</p>
            <p className="text-2xl font-bold text-blue-700">{activeReserved}</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50/50 border-emerald-200">
          <CardContent className="p-4">
            <p className="text-xs text-emerald-600 mb-1">{isAr ? "ضيوف حاليين" : "Current Guests Seated"}</p>
            <p className="text-2xl font-bold text-emerald-700">{totalGuests}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{isAr ? "توزيع صالة المطعم" : "Floor Layout Grid"}</CardTitle>
          <CardDescription>{isAr ? "اضغط على أي طاولة لتعديل حالتها (متاحة، مشغولة، محجوزة)" : "Click on any table block to cycle status (Available -> Occupied -> Reserved)"}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {tables.map(t => (
              <div
                key={t.number}
                onClick={() => toggleTableStatus(t.number)}
                className={`p-5 border rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-105 select-none ${
                  t.status === "available" ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100/80" :
                  t.status === "occupied" ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100/80" : "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100/80"
                }`}
              >
                <Grid className="size-8 mb-2" />
                <span className="font-bold text-base">{isAr ? `طاولة ${t.number}` : `Table ${t.number}`}</span>
                <span className="text-xs opacity-80 mt-1 flex items-center gap-1">
                  <Users className="size-3" />
                  {t.capacity} {isAr ? "مقاعد" : "seats"}
                </span>
                {t.guestsCount && (
                  <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full mt-1.5 font-bold">
                    {t.guestsCount} {isAr ? "عملاء" : "guests"}
                  </span>
                )}
                <Badge variant="outline" className="mt-3 text-[10px] capitalize bg-white/80">
                  {t.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
