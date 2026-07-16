import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/providers/language";
import { CalendarCheck, Plus, Search } from "lucide-react";

interface Booking {
  id: string;
  guest: string;
  room: string;
  checkIn: string;
  checkOut: string;
  status: "Checked In" | "Checked Out" | "Upcoming" | "Cancelled";
  amount: number;
  paid: number;
}

const initial: Booking[] = [
  { id: "BKG-001", guest: "Ahmed Al-Otaibi", room: "203", checkIn: "2026-07-05", checkOut: "2026-07-10", status: "Checked In", amount: 3000, paid: 1500 },
  { id: "BKG-002", guest: "Mohammed Al-Ghamdi", room: "105", checkIn: "2026-07-06", checkOut: "2026-07-08", status: "Checked In", amount: 1200, paid: 1200 },
  { id: "BKG-003", guest: "Khalid Al-Harbi", room: "310", checkIn: "2026-07-08", checkOut: "2026-07-15", status: "Upcoming", amount: 4200, paid: 2000 },
  { id: "BKG-004", guest: "Saud Al-Dosari", room: "407", checkIn: "2026-07-04", checkOut: "2026-07-07", status: "Checked Out", amount: 1800, paid: 1800 },
  { id: "BKG-005", guest: "Fahad Al-Mutairi", room: "112", checkIn: "2026-07-07", checkOut: "2026-07-09", status: "Checked In", amount: 1000, paid: 500 },
];

const statusColor: Record<string, string> = {
  "Checked In": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Checked Out": "bg-slate-100 text-slate-600 border-slate-200",
  "Upcoming": "bg-blue-100 text-blue-700 border-blue-200",
  "Cancelled": "bg-rose-100 text-rose-700 border-rose-200",
};

export default function HostelBookings() {
  const { language } = useLanguage();
  const rtl = language === "ar";
  const [search, setSearch] = useState("");
  const [bookings, setBookings] = useState(initial);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ guest: "", room: "", checkIn: "", checkOut: "", amount: 0 });

  const filtered = bookings.filter((b) =>
    b.guest.toLowerCase().includes(search.toLowerCase()) || b.id.includes(search)
  );

  const handleCreate = () => {
    setBookings((prev) => [
      ...prev,
      { id: `BKG-${String(prev.length + 1).padStart(3, "0")}`, ...form, status: "Upcoming" as const, paid: 0 },
    ]);
    setOpen(false);
    setForm({ guest: "", room: "", checkIn: "", checkOut: "", amount: 0 });
  };

  const updateStatus = (id: string, status: Booking["status"]) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{rtl ? "الحجوزات" : "Bookings"}</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 ml-2" />
              {rtl ? "حجز جديد" : "New Booking"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{rtl ? "حجز جديد" : "New Booking"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{rtl ? "اسم النزيل" : "Guest Name"}</Label>
                <Input value={form.guest} onChange={(e) => setForm({ ...form, guest: e.target.value })} />
              </div>
              <div>
                <Label>{rtl ? "رقم الغرفة" : "Room Number"}</Label>
                <Input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{rtl ? "تاريخ الدخول" : "Check-in"}</Label>
                  <Input type="date" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} />
                </div>
                <div>
                  <Label>{rtl ? "تاريخ المغادرة" : "Check-out"}</Label>
                  <Input type="date" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>{rtl ? "المبلغ" : "Amount (SAR)"}</Label>
                <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
              </div>
              <Button onClick={handleCreate} className="w-full">{rtl ? "إنشاء الحجز" : "Create Booking"}</Button>
            </div>
          </DialogContent>
        </Dialog>
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

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{rtl ? "المعرف" : "ID"}</TableHead>
                <TableHead>{rtl ? "النزيل" : "Guest"}</TableHead>
                <TableHead>{rtl ? "الغرفة" : "Room"}</TableHead>
                <TableHead>{rtl ? "الدخول" : "Check-in"}</TableHead>
                <TableHead>{rtl ? "المغادرة" : "Check-out"}</TableHead>
                <TableHead>{rtl ? "الحالة" : "Status"}</TableHead>
                <TableHead>{rtl ? "المبلغ" : "Amount"}</TableHead>
                <TableHead>{rtl ? "الإجراءات" : "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.id}</TableCell>
                  <TableCell>{b.guest}</TableCell>
                  <TableCell>{b.room}</TableCell>
                  <TableCell>{b.checkIn}</TableCell>
                  <TableCell>{b.checkOut}</TableCell>
                  <TableCell>
                    <Badge className={statusColor[b.status]}>{b.status}</Badge>
                  </TableCell>
                  <TableCell>{b.amount} SAR</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {b.status === "Upcoming" && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, "Checked In")}>
                          {rtl ? "تسجيل دخول" : "Check-in"}
                        </Button>
                      )}
                      {b.status === "Checked In" && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, "Checked Out")}>
                          {rtl ? "تسجيل مغادرة" : "Check-out"}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
