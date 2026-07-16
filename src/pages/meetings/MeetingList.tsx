import { useState } from "react";
import {
  Plus, Video, MapPin, Calendar, Clock, Users, MoreHorizontal,
  Edit3, XCircle, MessageSquare, Loader2, ChevronLeft, ChevronRight,
  Search,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

type MeetingType = "online" | "offline";
type MeetingStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

interface Attendee {
  id: string;
  name: string;
  email: string;
  status: "pending" | "accepted" | "declined";
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
  type: MeetingType;
  location?: string;
  link?: string;
  status: MeetingStatus;
  attendees: Attendee[];
  notes?: string;
}

const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function MeetingList() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [view, setView] = useState<"list" | "calendar">("list");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  const [title, setTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [meetingTz, setMeetingTz] = useState("Asia/Riyadh");
  const [meetingType, setMeetingType] = useState<MeetingType>("online");
  const [location, setLocation] = useState("");
  const [link, setLink] = useState("");
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);

  const [meetings, setMeetings] = useState<Meeting[]>([]);

  const createMutation = trpc.meetings.create.useMutation({
    onSuccess: () => { setShowCreate(false); resetForm(); },
  });

  const updateMutation = trpc.meetings.update.useMutation();

  const cancelMutation = trpc.meetings.cancel.useMutation();

  const filtered = meetings.filter((m) => {
    if (search && !m.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const resetForm = () => {
    setTitle(""); setMeetingDate(""); setStartTime(""); setEndTime("");
    setMeetingTz("Asia/Riyadh"); setMeetingType("online"); setLocation(""); setLink("");
    setSelectedAttendees([]);
  };

  const handleCreate = () => {
    createMutation.mutate({
      title, date: meetingDate, startTime, endTime, timezone: meetingTz,
      type: meetingType, location: meetingType === "offline" ? location : undefined,
      link: meetingType === "online" ? link : undefined, attendeeIds: selectedAttendees,
    } as any);
  };

  const handleCancel = (meetingId: string) => {
    cancelMutation.mutate({ id: meetingId } as any);
    setMeetings((prev) => prev.map((m) => m.id === meetingId ? { ...m, status: "cancelled" } : m));
  };

  const getStatusBadge = (status: MeetingStatus) => {
    const colors: Record<MeetingStatus, string> = {
      scheduled: "bg-blue-100 text-blue-700",
      in_progress: "bg-green-100 text-green-700",
      completed: "bg-slate-100 text-slate-600",
      cancelled: "bg-red-100 text-red-700",
    };
    return <Badge className={colors[status]}>{status.replace("_", " ")}</Badge>;
  };

  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDay = (month: number, year: number) => new Date(year, month, 1).getDay();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{isAr ? "الاجتماعات" : "Meetings"}</h1>
          <p className="text-sm text-muted-foreground">{isAr ? "جدولة وإدارة الاجتماعات" : "Schedule and manage meetings"}</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="size-4 mr-2" />
          {isAr ? "اجتماع جديد" : "Schedule Meeting"}
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input className="pl-10" placeholder={isAr ? "بحث..." : "Search meetings..."} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as "list" | "calendar")}>
        <TabsList>
          <TabsTrigger value="list"><Users className="size-4 mr-2" />{isAr ? "قائمة" : "List"}</TabsTrigger>
          <TabsTrigger value="calendar"><Calendar className="size-4 mr-2" />{isAr ? "تقويم" : "Calendar"}</TabsTrigger>
        </TabsList>
      </Tabs>

      {view === "list" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.length === 0 ? (
            <div className="col-span-full">
              <Card><CardContent className="py-12 text-center text-slate-500">{isAr ? "لا توجد اجتماعات" : "No meetings found"}</CardContent></Card>
            </div>
          ) : filtered.map((meeting) => (
            <Card key={meeting.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedMeeting(meeting)}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{meeting.title}</CardTitle>
                  {getStatusBadge(meeting.status)}
                </div>
                <CardDescription>
                  <div className="flex items-center gap-1 text-xs">
                    <Calendar className="size-3" />
                    {meeting.date}
                    <Clock className="size-3 ml-2" />
                    {meeting.startTime} - {meeting.endTime}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {meeting.type === "online" ? <Video className="size-4" /> : <MapPin className="size-4" />}
                  <span>{meeting.type === "online" ? (isAr ? "عن بعد" : "Online") : (isAr ? "حضوري" : "Offline")}</span>
                </div>
                <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                  <Users className="size-4" />
                  <span>{meeting.attendees.length} {isAr ? "مشارك" : "attendees"}</span>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <div className="flex -space-x-2">
                  {meeting.attendees.slice(0, 4).map((a) => (
                    <Avatar key={a.id} className="size-7 border-2 border-white">
                      <AvatarFallback className="text-[10px]">{a.name[0]}</AvatarFallback>
                    </Avatar>
                  ))}
                  {meeting.attendees.length > 4 && (
                    <div className="flex size-7 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-500 border-2 border-white">
                      +{meeting.attendees.length - 4}
                    </div>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {view === "calendar" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => { if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(calendarYear - 1); } else setCalendarMonth(calendarMonth - 1); }}>
                <ChevronLeft className="size-4" />
              </Button>
              <CardTitle>{monthNames[calendarMonth]} {calendarYear}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => { if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(calendarYear + 1); } else setCalendarMonth(calendarMonth + 1); }}>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
                <div key={d} className="text-center text-xs font-medium text-slate-500 py-2">{d}</div>
              ))}
              {Array.from({ length: getFirstDay(calendarMonth, calendarYear) }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: getDaysInMonth(calendarMonth, calendarYear) }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayMeetings = filtered.filter((m) => m.date === dateStr);
                return (
                  <div key={day} className="min-h-[90px] rounded-lg border p-1 hover:bg-slate-50 cursor-pointer">
                    <span className="text-xs font-medium">{day}</span>
                    {dayMeetings.map((m) => (
                      <div key={m.id} className="mt-1 rounded bg-blue-100 px-1 py-0.5 text-[10px] text-blue-700 truncate" onClick={() => setSelectedMeeting(m)}>
                        {m.startTime} {m.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Sheet open={!!selectedMeeting} onOpenChange={(v) => { if (!v) setSelectedMeeting(null); }}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          {selectedMeeting && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedMeeting.title}</SheetTitle>
                <SheetDescription>
                  <div className="mt-2">{getStatusBadge(selectedMeeting.status)}</div>
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="size-4 text-slate-400" />
                  <span>{selectedMeeting.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="size-4 text-slate-400" />
                  <span>{selectedMeeting.startTime} - {selectedMeeting.endTime} ({selectedMeeting.timezone})</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {selectedMeeting.type === "online" ? <Video className="size-4 text-slate-400" /> : <MapPin className="size-4 text-slate-400" />}
                  <span>{selectedMeeting.type === "online" ? (isAr ? "عن بعد" : "Online") : (isAr ? "حضوري" : "Offline")}</span>
                </div>
                {selectedMeeting.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="size-4 text-slate-400" />
                    <span>{selectedMeeting.location}</span>
                  </div>
                )}
                {selectedMeeting.link && (
                  <div className="flex items-center gap-2 text-sm">
                    <Video className="size-4 text-slate-400" />
                    <a href={selectedMeeting.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{selectedMeeting.link}</a>
                  </div>
                )}

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-3">{isAr ? "الحضور" : "Attendees"} ({selectedMeeting.attendees.length})</h4>
                  <div className="space-y-2">
                    {selectedMeeting.attendees.map((a) => (
                      <div key={a.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="size-8">
                            <AvatarFallback className="text-xs">{a.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{a.name}</p>
                            <p className="text-xs text-slate-500">{a.email}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={`text-xs ${
                          a.status === "accepted" ? "text-green-600 border-green-200" :
                          a.status === "declined" ? "text-red-600 border-red-200" :
                          "text-yellow-600 border-yellow-200"
                        }`}>
                          {a.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-2">{isAr ? "الملاحظات" : "Notes"}</h4>
                  <Textarea placeholder={isAr ? "أضف ملاحظات..." : "Add notes..."} className="text-sm" />
                  <Button size="sm" className="mt-2">
                    <MessageSquare className="size-3 mr-1" />
                    {isAr ? "حفظ" : "Save Notes"}
                  </Button>
                </div>

                <div className="flex gap-2 pt-4">
                  {selectedMeeting.status !== "cancelled" && (
                    <>
                      <Button variant="outline" size="sm">
                        <Edit3 className="size-3 mr-1" />
                        {isAr ? "تعديل" : "Edit"}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleCancel(selectedMeeting.id)}>
                        <XCircle className="size-3 mr-1" />
                        {isAr ? "إلغاء" : "Cancel"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isAr ? "اجتماع جديد" : "Schedule Meeting"}</DialogTitle>
            <DialogDescription>
              {isAr ? "أدخل تفاصيل الاجتماع" : "Enter meeting details"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{isAr ? "عنوان الاجتماع" : "Title"}</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={isAr ? "عنوان الاجتماع" : "Meeting title"} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isAr ? "التاريخ" : "Date"}</Label>
                <Input value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} type="date" />
              </div>
              <div className="space-y-2">
                <Label>{isAr ? "المنطقة الزمنية" : "Timezone"}</Label>
                <Select value={meetingTz} onValueChange={setMeetingTz}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Riyadh">Asia/Riyadh (UTC+3)</SelectItem>
                    <SelectItem value="Asia/Dubai">Asia/Dubai (UTC+4)</SelectItem>
                    <SelectItem value="Asia/Karachi">Asia/Karachi (UTC+5)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isAr ? "وقت البدء" : "Start Time"}</Label>
                <Input value={startTime} onChange={(e) => setStartTime(e.target.value)} type="time" />
              </div>
              <div className="space-y-2">
                <Label>{isAr ? "وقت الانتهاء" : "End Time"}</Label>
                <Input value={endTime} onChange={(e) => setEndTime(e.target.value)} type="time" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "النوع" : "Type"}</Label>
              <Select value={meetingType} onValueChange={(v) => setMeetingType(v as MeetingType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">{isAr ? "عن بعد" : "Online"}</SelectItem>
                  <SelectItem value="offline">{isAr ? "حضوري" : "Offline"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {meetingType === "offline" ? (
              <div className="space-y-2">
                <Label>{isAr ? "الموقع" : "Location"}</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder={isAr ? "موقع الاجتماع" : "Meeting location"} />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>{isAr ? "رابط الاجتماع" : "Meeting Link"}</Label>
                <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://meet.google.com/..." />
              </div>
            )}
            <div className="space-y-2">
              <Label>{isAr ? "الحضور" : "Attendees"}</Label>
              <Select value={selectedAttendees[selectedAttendees.length - 1] || ""} onValueChange={(v) => setSelectedAttendees([...selectedAttendees, v])}>
                <SelectTrigger>
                  <SelectValue placeholder={isAr ? "اختر الحضور" : "Select attendees"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="u1">Ahmed</SelectItem>
                  <SelectItem value="u2">Sarah</SelectItem>
                  <SelectItem value="u3">Khalid</SelectItem>
                </SelectContent>
              </Select>
              {selectedAttendees.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedAttendees.map((id) => (
                    <Badge key={id} variant="secondary" className="cursor-pointer" onClick={() => setSelectedAttendees(selectedAttendees.filter((a) => a !== id))}>
                      {id === "u1" ? "Ahmed" : id === "u2" ? "Sarah" : "Khalid"} &times;
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>{isAr ? "إلغاء" : "Cancel"}</Button>
            <Button onClick={handleCreate} disabled={!title || !meetingDate || createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
              {isAr ? "جدولة" : "Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
