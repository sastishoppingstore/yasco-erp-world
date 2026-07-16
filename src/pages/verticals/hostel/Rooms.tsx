import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/providers/language";
import { Bed, DoorOpen, Wrench, Search, Plus } from "lucide-react";

interface Room {
  id: string;
  number: string;
  floor: string;
  type: string;
  capacity: number;
  status: "Available" | "Occupied" | "Maintenance" | "Reserved";
  monthlyRate: number;
  tenant?: string;
}

const rooms: Room[] = [
  { id: "1", number: "101", floor: "1st", type: "Single", capacity: 1, status: "Occupied", monthlyRate: 1500, tenant: "Ahmed Al-Otaibi" },
  { id: "2", number: "102", floor: "1st", type: "Single", capacity: 1, status: "Available", monthlyRate: 1500 },
  { id: "3", number: "103", floor: "1st", type: "Double", capacity: 2, status: "Occupied", monthlyRate: 2500, tenant: "Mohammed Ali" },
  { id: "4", number: "104", floor: "1st", type: "Double", capacity: 2, status: "Maintenance", monthlyRate: 2500 },
  { id: "5", number: "201", floor: "2nd", type: "Single", capacity: 1, status: "Available", monthlyRate: 1800 },
  { id: "6", number: "202", floor: "2nd", type: "Single", capacity: 1, status: "Occupied", monthlyRate: 1800, tenant: "Khalid Al-Harbi" },
  { id: "7", number: "203", floor: "2nd", type: "Double", capacity: 2, status: "Occupied", monthlyRate: 2800, tenant: "Fahad Al-Dosari" },
  { id: "8", number: "204", floor: "2nd", type: "Suite", capacity: 3, status: "Available", monthlyRate: 4000 },
  { id: "9", number: "301", floor: "3rd", type: "Single", capacity: 1, status: "Reserved", monthlyRate: 2000 },
  { id: "10", number: "302", floor: "3rd", type: "Double", capacity: 2, status: "Occupied", monthlyRate: 3000, tenant: "Saud Al-Shammari" },
];

const statusColor: Record<string, string> = {
  Available: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Occupied: "bg-amber-100 text-amber-700 border-amber-200",
  Maintenance: "bg-rose-100 text-rose-700 border-rose-200",
  Reserved: "bg-blue-100 text-blue-700 border-blue-200",
};

export default function HostelRooms() {
  const { language } = useLanguage();
  const rtl = language === "ar";
  const [search, setSearch] = useState("");

  const filtered = rooms.filter((r) =>
    r.number.includes(search) || r.tenant?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{rtl ? "إدارة الغرف" : "Room Management"}</h1>
        <Button>
          <Plus className="size-4 ml-2" />
          {rtl ? "إضافة غرفة" : "Add Room"}
        </Button>
      </div>

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        <Input
          placeholder={rtl ? "بحث..." : "Search..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((room) => (
          <Card key={room.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">{rtl ? `غرفة ${room.number}` : `Room ${room.number}`}</CardTitle>
              <Badge className={statusColor[room.status]}>
                {rtl
                  ? { Available: "متاحة", Occupied: "مشغولة", Maintenance: "صيانة", Reserved: "محجوزة" }[room.status]
                  : room.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">{rtl ? "الطابق:" : "Floor:"}</span> {room.floor}</p>
                <p><span className="font-medium">{rtl ? "النوع:" : "Type:"}</span> {room.type}</p>
                <p><span className="font-medium">{rtl ? "السعة:" : "Capacity:"}</span> {room.capacity} {rtl ? "أشخاص" : "persons"}</p>
                <p><span className="font-medium">{rtl ? "الإيجار الشهري:" : "Monthly Rate:"}</span> {room.monthlyRate} SAR</p>
                {room.tenant && (
                  <p><span className="font-medium">{rtl ? "النزيل:" : "Tenant:"}</span> {room.tenant}</p>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" className="flex-1">{rtl ? "تعديل" : "Edit"}</Button>
                <Button variant="outline" size="sm" className="flex-1">{rtl ? "سجل الصيانة" : "Maintenance"}</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
