import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/providers/language";
import ActionButton3D from "@/components/ui/ActionButton3D";
import {
  Scissors, Calendar, Clock, Sparkles, Users, User,
  PlusCircle, Search, DollarSign, CheckCircle2, MessageSquare, AlertCircle
} from "lucide-react";

interface SalonAppointment {
  id: string;
  clientName: string;
  clientPhone: string;
  service: string;
  stylistName: string;
  time: string;
  status: "scheduled" | "in-service" | "completed" | "cancelled";
  price: number;
}

const initialAppointments: SalonAppointment[] = [
  { id: "SAL-101", clientName: "Fatimah Al-Hassan", clientPhone: "+966 50 111 2222", service: "Hair Cut & Blowdry", stylistName: "Lina", time: "10:00 AM", status: "completed", price: 150 },
  { id: "SAL-102", clientName: "Mona Al-Qahtani", clientPhone: "+966 55 333 4444", service: "Dermatology Laser Session", stylistName: "Dr. Sarah", time: "11:30 AM", status: "in-service", price: 450 },
  { id: "SAL-103", clientName: "Sarah Al-Sudairy", clientPhone: "+966 53 555 6666", service: "Hydrafacial Treatment", stylistName: "Amaal", time: "01:00 PM", status: "scheduled", price: 300 },
  { id: "SAL-104", clientName: "Reema Al-Harbi", clientPhone: "+966 54 777 8888", service: "Manicure & Pedicure", stylistName: "Jasmine", time: "03:30 PM", status: "scheduled", price: 120 }
];

const salonServices = [
  { name: "Hair Cut & Styling", price: 150, category: "Hair" },
  { name: "Dermatology Laser Session", price: 450, category: "Laser" },
  { name: "Hydrafacial Treatment", price: 300, category: "Spa" },
  { name: "Manicure & Pedicure", price: 120, category: "Nails" },
  { name: "Bridal Makeup Package", price: 1500, category: "Makeup" }
];

export default function SalonPage() {
  const { language, dir } = useLanguage();
  const isAr = language === "ar";
  const [appointments, setAppointments] = useState<SalonAppointment[]>(initialAppointments);
  const [search, setSearch] = useState("");
  const [newBookingOpen, setNewBookingOpen] = useState(false);

  // New booking form state
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [service, setService] = useState("Hair Cut & Styling");
  const [stylistName, setStylistName] = useState("Lina");
  const [time, setTime] = useState("10:00 AM");

  const filteredAppts = appointments.filter(app => {
    return app.clientName.toLowerCase().includes(search.toLowerCase()) ||
      app.clientPhone.includes(search) ||
      app.service.toLowerCase().includes(search.toLowerCase());
  });

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) return;

    const selectedService = salonServices.find(s => s.name === service);
    const price = selectedService ? selectedService.price : 150;

    const newAppt: SalonAppointment = {
      id: `SAL-${100 + appointments.length + 1}`,
      clientName,
      clientPhone,
      service,
      stylistName,
      time,
      status: "scheduled",
      price
    };

    setAppointments([...appointments, newAppt]);
    setNewBookingOpen(false);

    // Reset Form
    setClientName("");
    setClientPhone("");
  };

  const updateStatus = (id: string, status: SalonAppointment["status"]) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const sendReminder = (app: SalonAppointment) => {
    const message = isAr
      ? `عزيزتي ${app.clientName}، نذكرك بموعدك في الصالون اليوم الساعة ${app.time} لخدمة ${app.service}. بانتظارك!`
      : `Dear ${app.clientName}, reminding you of your appointment today at ${app.time} for ${app.service}. We look forward to seeing you!`;
    window.open(`https://wa.me/${app.clientPhone.replace(/\s+/g, "")}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const statusColors: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-700 border-blue-200",
    "in-service": "bg-amber-100 text-amber-700 border-amber-200",
    completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    cancelled: "bg-slate-100 text-slate-700 border-slate-200"
  };

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Scissors className="size-6 text-rose-600" />
            {isAr ? "نظام إدارة الصالون والسبا والعيادات التجميلية" : "Salon, Spa & Beauty Clinic Management"}
          </h2>
          <p className="text-slate-500">
            {isAr ? "حجوزات المواعيد، توزيع خبيرات التجميل، والعمولات والمبيعات" : "Appointment schedules, stylist assignments, commission tracking and checkout"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ActionButton3D
            icon={<PlusCircle className="size-4" />}
            label={isAr ? "حجز موعد جديد" : "Book Appointment"}
            color="rose"
            onClick={() => setNewBookingOpen(true)}
          />
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Appointments List (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3 flex-wrap">
              <div>
                <CardTitle className="text-base">{isAr ? "جدول الحجوزات اليوم" : "Today's Schedule"}</CardTitle>
                <CardDescription>{isAr ? "إدارة مواعيد وحالات العملاء الحالية" : "Manage statuses of today's client list"}</CardDescription>
              </div>
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  placeholder={isAr ? "بحث بالعميلة/الخدمة..." : "Search client/service..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {filteredAppts.map((appt) => (
                  <div key={appt.id} className="py-4 flex items-center justify-between flex-wrap gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{appt.time}</span>
                        <Badge variant="outline" className={`text-[10px] ${statusColors[appt.status]}`}>
                          {appt.status}
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold">{appt.clientName} · <span className="text-xs text-slate-500 font-normal">{appt.clientPhone}</span></p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Sparkles className="size-3 text-rose-500" /> {appt.service}</span>
                        <span className="flex items-center gap-1"><User className="size-3 text-slate-400" /> {appt.stylistName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right mr-3">
                        <p className="text-sm font-bold">{appt.price} SAR</p>
                        <span className="text-[10px] text-slate-400">{isAr ? "شامل الضريبة 15%" : "Incl. 15% VAT"}</span>
                      </div>

                      <Select
                        value={appt.status}
                        onValueChange={(val) => updateStatus(appt.id, val as SalonAppointment["status"])}
                      >
                        <SelectTrigger className="h-8 text-xs w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">{isAr ? "مجدول" : "Scheduled"}</SelectItem>
                          <SelectItem value="in-service">{isAr ? "في الخدمة" : "In Service"}</SelectItem>
                          <SelectItem value="completed">{isAr ? "مكتمل" : "Completed"}</SelectItem>
                          <SelectItem value="cancelled">{isAr ? "ملغي" : "Cancelled"}</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => sendReminder(appt)}
                        className="h-8 w-8 text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                        title={isAr ? "إرسال تذكير واتساب" : "Send WhatsApp Reminder"}
                      >
                        <MessageSquare className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredAppts.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <Calendar className="size-12 mx-auto mb-2 text-slate-300" />
                    <p>{isAr ? "لا توجد حجوزات اليوم" : "No appointments found"}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form and Services List (Right Column) */}
        <div className="space-y-4">
          {newBookingOpen ? (
            <Card className="border-rose-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-base text-rose-700">{isAr ? "حجز موعد صالون جديد" : "New Salon Booking"}</CardTitle>
                <CardDescription>{isAr ? "أدخلي تفاصيل العميل والخدمة المختارة" : "Enter client detail and service item"}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateBooking} className="space-y-4">
                  <div className="space-y-2">
                    <Label>{isAr ? "اسم العميل" : "Customer Name"} *</Label>
                    <Input required placeholder="Rawan Al-Yousef" value={clientName} onChange={(e) => setClientName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{isAr ? "رقم الجوال" : "Mobile Phone"} *</Label>
                    <Input required placeholder="+966 50 000 0000" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{isAr ? "الخدمة" : "Service"}</Label>
                    <Select value={service} onValueChange={setService}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {salonServices.map(s => (
                          <SelectItem key={s.name} value={s.name}>{s.name} ({s.price} SAR)</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>{isAr ? "الأخصائية" : "Stylist / Staff"}</Label>
                      <Select value={stylistName} onValueChange={setStylistName}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Lina">Lina</SelectItem>
                          <SelectItem value="Dr. Sarah">Dr. Sarah (Laser)</SelectItem>
                          <SelectItem value="Amaal">Amaal</SelectItem>
                          <SelectItem value="Jasmine">Jasmine</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{isAr ? "التوقيت" : "Time Slot"}</Label>
                      <Input type="text" placeholder="11:30 AM" value={time} onChange={(e) => setTime(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <Button type="button" variant="outline" onClick={() => setNewBookingOpen(false)}>{isAr ? "إلغاء" : "Cancel"}</Button>
                    <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white">{isAr ? "حجز وتأكيد" : "Book & Confirm"}</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{isAr ? "قائمة الخدمات والأسعار" : "Services & Pricing"}</CardTitle>
                <CardDescription>{isAr ? "العناية بالشعر، العناية بالأظافر، علاجات السبا، الليزر" : "Hair, nails, spa, and beauty laser service catalog"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {salonServices.map(s => (
                  <div key={s.name} className="flex justify-between items-center text-sm p-2 border-b">
                    <div>
                      <span className="font-semibold text-slate-800">{s.name}</span>
                      <p className="text-[10px] text-rose-500 uppercase">{s.category}</p>
                    </div>
                    <span className="font-bold text-rose-600">{s.price} SAR</span>
                  </div>
                ))}

                <div className="mt-4 p-3 bg-rose-50/50 border border-rose-100 rounded-lg">
                  <h4 className="text-xs font-semibold text-rose-800 flex items-center gap-1 mb-1">
                    <Users className="size-3.5" />
                    {isAr ? "حساب عمولات خبيرات التجميل" : "Stylist Commission Tracking"}
                  </h4>
                  <p className="text-[10px] text-rose-700/80">
                    {isAr ? "يتم احتساب نسبة عمولة 10% تلقائياً للأخصائيات على جميع الخدمات المكتملة." : "Standard 10% commission is computed for completed salon services."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
