import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar } from "lucide-react";

const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function ClassSchedulePage() {
  const { data: timetable, refetch } = trpc.education.classTimetableList.useQuery(undefined);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ subject: "", grade: "", section: "", dayOfWeek: "monday" as const, startTime: "", endTime: "", roomNumber: "", academicYear: "" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Class Schedule</h2><p className="text-slate-500">Manage timetables and class schedules</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Class</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Timetable Entry</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); refetch(); setOpen(false); }} className="space-y-3">
              <div><Label>Subject</Label><Input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Grade</Label><Input value={form.grade} onChange={e => setForm({...form, grade: e.target.value})} /></div>
                <div><Label>Section</Label><Input value={form.section} onChange={e => setForm({...form, section: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Day</Label><Select value={form.dayOfWeek} onValueChange={(v: any) => setForm({...form, dayOfWeek: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{days.map(d => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Room</Label><Input value={form.roomNumber} onChange={e => setForm({...form, roomNumber: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Start Time</Label><Input type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} required /></div>
                <div><Label>End Time</Label><Input type="time" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} required /></div>
              </div>
              <Button type="submit" className="w-full">Add to Schedule</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map(day => (
          <Card key={day}>
            <CardHeader className="pb-2 pt-3 px-3"><CardTitle className="text-sm capitalize">{day}</CardTitle></CardHeader>
            <CardContent className="px-3 pb-3 space-y-2">
              {timetable?.filter(t => t.dayOfWeek === day).map(t => (
                <div key={t.id} className="text-xs p-2 bg-blue-50 rounded border border-blue-200">
                  <div className="font-medium text-blue-800">{t.subject}</div>
                  <div className="text-blue-600">{t.startTime}-{t.endTime}</div>
                  {t.roomNumber && <div className="text-blue-500">Room {t.roomNumber}</div>}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
