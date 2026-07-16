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
  Dumbbell, Users, User, Calendar, CheckCircle2,
  PlusCircle, Search, Clock, ShieldCheck, AlertCircle, ArrowUpRight
} from "lucide-react";

interface GymMember {
  id: string;
  name: string;
  phone: string;
  membershipPlan: string;
  status: "active" | "frozen" | "expired";
  expiryDate: string;
  lastCheckIn: string;
}

const initialMembers: GymMember[] = [
  { id: "GYM-801", name: "Khalid Al-Ghamdi", phone: "+966 50 222 3333", membershipPlan: "3 Months Fitness", status: "active", expiryDate: "2026-10-08", lastCheckIn: "Today, 08:30 AM" },
  { id: "GYM-802", name: "Yasmeen Al-Rashed", phone: "+966 55 444 5555", membershipPlan: "Annual Gold Club", status: "active", expiryDate: "2027-07-01", lastCheckIn: "Yesterday, 06:15 PM" },
  { id: "GYM-803", name: "Bandar bin Saad", phone: "+966 53 666 7777", membershipPlan: "1 Month Basic", status: "expired", expiryDate: "2026-07-01", lastCheckIn: "2026-07-01, 09:00 AM" },
  { id: "GYM-804", name: "Hassan bin Ali", phone: "+966 54 888 9999", membershipPlan: "3 Months Fitness", status: "frozen", expiryDate: "2026-11-15", lastCheckIn: "2026-06-25, 07:00 AM" }
];

const gymPlans = [
  { name: "1 Month Basic", price: 350, description: "Gym access only" },
  { name: "3 Months Fitness", price: 900, description: "Gym access + 3 trainer sessions" },
  { name: "Annual Gold Club", price: 2900, description: "All-inclusive + pool + classes" }
];

export default function GymPage() {
  const { language, dir } = useLanguage();
  const isAr = language === "ar";
  const [members, setMembers] = useState<GymMember[]>(initialMembers);
  const [search, setSearch] = useState("");
  const [checkInId, setCheckInId] = useState("");
  const [newMemberOpen, setNewMemberOpen] = useState(false);

  // New member states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [membershipPlan, setMembershipPlan] = useState("3 Months Fitness");
  const [duration, setDuration] = useState("3");

  const filteredMembers = members.filter(m => {
    return m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search) ||
      m.id.toLowerCase().includes(search.toLowerCase());
  });

  const handleRegisterMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + Number(duration));

    const newM: GymMember = {
      id: `GYM-80${members.length + 1}`,
      name,
      phone,
      membershipPlan,
      status: "active",
      expiryDate: expiry.toISOString().split("T")[0],
      lastCheckIn: "Not checked in"
    };

    setMembers([newM, ...members]);
    setNewMemberOpen(false);

    // Reset Form
    setName("");
    setPhone("");
  };

  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInId) return;

    const memberIndex = members.findIndex(m => m.id.toLowerCase() === checkInId.toLowerCase() || m.phone === checkInId);
    if (memberIndex !== -1) {
      const updated = [...members];
      if (updated[memberIndex].status === "expired") {
        alert(isAr ? "عذراً! هذا العضوية منتهية" : "Sorry! This membership is expired.");
      } else {
        updated[memberIndex].lastCheckIn = `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        setMembers(updated);
        setCheckInId("");
        alert(isAr ? "تم تسجيل الدخول بنجاح!" : "Check-in successful!");
      }
    } else {
      alert(isAr ? "لم يتم العثور على العضو" : "Member not found.");
    }
  };

  const planBadges: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700 border-emerald-200",
    frozen: "bg-blue-100 text-blue-700 border-blue-200",
    expired: "bg-rose-100 text-rose-700 border-rose-200"
  };

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Dumbbell className="size-6 text-lime-600" />
            {isAr ? "نظام إدارة النادي الرياضي والاشتراكات" : "Gym & Fitness Club Management"}
          </h2>
          <p className="text-slate-500">
            {isAr ? "إدارة اشتراكات الأعضاء، تسجيل الدخول اليومي، وباقات المدربين" : "Manage member subscriptions, daily check-ins, packages and trainers"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ActionButton3D
            icon={<PlusCircle className="size-4" />}
            label={isAr ? "تسجيل عضو جديد" : "Register Member"}
            color="lime"
            onClick={() => setNewMemberOpen(true)}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Members List (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3 flex-wrap">
              <div>
                <CardTitle className="text-base">{isAr ? "سجل المشتركين" : "Members Directory"}</CardTitle>
                <CardDescription>{isAr ? "متابعة صلاحية الاشتراك وتاريخ الدخول للأعضاء" : "Track check-ins and member contract expiries"}</CardDescription>
              </div>
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  placeholder={isAr ? "بحث بالاسم/الجوال..." : "Search name/phone..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {filteredMembers.map(member => (
                  <div key={member.id} className="py-4 flex items-center justify-between flex-wrap gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{member.id}</span>
                        <Badge variant="outline" className={`text-[10px] ${planBadges[member.status]}`}>
                          {member.status}
                        </Badge>
                        <span className="text-xs text-slate-500">{member.membershipPlan}</span>
                      </div>
                      <p className="text-sm font-semibold">{member.name} · <span className="text-xs text-slate-500 font-normal">{member.phone}</span></p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>{isAr ? "تاريخ الانتهاء" : "Expiry"}: {member.expiryDate}</span>
                        <span>{isAr ? "آخر دخول" : "Last Entry"}: {member.lastCheckIn}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {member.status === "active" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const updated = members.map(m => m.id === member.id ? { ...m, status: "frozen" as const } : m);
                            setMembers(updated);
                          }}
                          className="h-8 text-xs"
                        >
                          {isAr ? "تجميد" : "Freeze"}
                        </Button>
                      )}
                      {member.status === "frozen" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const updated = members.map(m => m.id === member.id ? { ...m, status: "active" as const } : m);
                            setMembers(updated);
                          }}
                          className="h-8 text-xs text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                        >
                          {isAr ? "تفعيل" : "Resume"}
                        </Button>
                      )}
                      {member.status === "expired" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs text-rose-600 bg-rose-50 hover:bg-rose-100"
                        >
                          {isAr ? "تجديد" : "Renew"}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {filteredMembers.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <Users className="size-12 mx-auto mb-2 text-slate-300" />
                    <p>{isAr ? "لا يوجد مشتركين يطابقون البحث" : "No members found"}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Check-In panel & Packages (Right column) */}
        <div className="space-y-4">
          <Card className="border-lime-200">
            <CardHeader className="bg-lime-50/50">
              <CardTitle className="text-base text-lime-800 flex items-center gap-2">
                <Clock className="size-4" />
                {isAr ? "تسجيل الدخول السريع" : "Quick Access Gate"}
              </CardTitle>
              <CardDescription>{isAr ? "إدخال معرف العضو أو رقم الجوال للتحقق" : "Simulate biometric or barcode entry"}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleCheckIn} className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">{isAr ? "معرف العضو / الجوال" : "Member ID / Phone"}</Label>
                  <Input
                    required
                    placeholder="e.g. GYM-801"
                    value={checkInId}
                    onChange={(e) => setCheckInId(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full bg-lime-600 hover:bg-lime-700 text-white gap-2">
                  <ShieldCheck className="size-4" />
                  {isAr ? "تسجيل الحضور" : "Confirm Entry Check-In"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {newMemberOpen ? (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-base">{isAr ? "تسجيل مشترك جديد" : "New Gym Subscription"}</CardTitle>
                <CardDescription>{isAr ? "سجل بيانات المشترك وحدد الباقة المفضلة" : "Enroll member details & contract length"}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegisterMember} className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs">{isAr ? "الاسم الكامل" : "Full Name"} *</Label>
                    <Input required placeholder="Omar bin Firas" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{isAr ? "رقم الجوال" : "Mobile Phone"} *</Label>
                    <Input required placeholder="+966 50 000 0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{isAr ? "باقة الاشتراك" : "Membership Plan"}</Label>
                    <Select value={membershipPlan} onValueChange={(val) => {
                      setMembershipPlan(val);
                      if (val.includes("Annual")) setDuration("12");
                      else if (val.includes("3 Months")) setDuration("3");
                      else setDuration("1");
                    }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {gymPlans.map(p => (
                          <SelectItem key={p.name} value={p.name}>{p.name} ({p.price} SAR)</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setNewMemberOpen(false)}>{isAr ? "إلغاء" : "Cancel"}</Button>
                    <Button type="submit" size="sm" className="bg-lime-600 hover:bg-lime-700 text-white">{isAr ? "تأكيد الاشتراك" : "Subscribe"}</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{isAr ? "باقات العضوية النشطة" : "Subscription Packages"}</CardTitle>
                <CardDescription>{isAr ? "أسعار خطط النادي المعتمدة" : "Active fitness package rates"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {gymPlans.map(p => (
                  <div key={p.name} className="flex justify-between items-center text-sm p-2 border-b">
                    <div>
                      <span className="font-semibold text-slate-800">{p.name}</span>
                      <p className="text-[10px] text-slate-400">{p.description}</p>
                    </div>
                    <span className="font-bold text-lime-600">{p.price} SAR</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
