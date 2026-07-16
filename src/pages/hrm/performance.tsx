import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Star, TrendingUp } from "lucide-react";

export default function PerformancePage() {
  const { data: reviews, refetch } = trpc.hrm.performanceReviewList.useQuery();
  const { data: employees } = trpc.hrm.employeeList.useQuery();
  const createReview = trpc.hrm.performanceReviewCreate.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    employeeId: 0, reviewPeriod: "", reviewDate: "", overallRating: 0,
    goalsAchieved: 0, skillsRating: 0, attendanceRating: 0, teamworkRating: 0,
    comments: "", goals: "", reviewedBy: 0,
  });

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-emerald-600";
    if (rating >= 3) return "text-blue-600";
    if (rating >= 2) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Performance Reviews</h2><p className="text-slate-500">Employee evaluation and goal tracking</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Review</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>New Performance Review</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createReview.mutate(form); setOpen(false); setForm({ employeeId: 0, reviewPeriod: "", reviewDate: "", overallRating: 0, goalsAchieved: 0, skillsRating: 0, attendanceRating: 0, teamworkRating: 0, comments: "", goals: "", reviewedBy: 0 }); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Employee</Label>
                  <Select onValueChange={v => setForm({...form, employeeId: Number(v)})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{employees?.map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Review Date</Label><Input type="date" value={form.reviewDate} onChange={e => setForm({...form, reviewDate: e.target.value})} required /></div>
              </div>
              <div><Label>Review Period</Label><Input value={form.reviewPeriod} onChange={e => setForm({...form, reviewPeriod: e.target.value})} placeholder="e.g. Q1 2026" required /></div>
              <div className="grid grid-cols-4 gap-3">
                <div><Label className="text-xs">Overall</Label><Input type="number" min="1" max="5" value={form.overallRating || ""} onChange={e => setForm({...form, overallRating: Number(e.target.value)})} /></div>
                <div><Label className="text-xs">Skills</Label><Input type="number" min="1" max="5" value={form.skillsRating || ""} onChange={e => setForm({...form, skillsRating: Number(e.target.value)})} /></div>
                <div><Label className="text-xs">Attendance</Label><Input type="number" min="1" max="5" value={form.attendanceRating || ""} onChange={e => setForm({...form, attendanceRating: Number(e.target.value)})} /></div>
                <div><Label className="text-xs">Teamwork</Label><Input type="number" min="1" max="5" value={form.teamworkRating || ""} onChange={e => setForm({...form, teamworkRating: Number(e.target.value)})} /></div>
              </div>
              <div><Label>Goals Achieved</Label><Input type="number" value={form.goalsAchieved || ""} onChange={e => setForm({...form, goalsAchieved: Number(e.target.value)})} /></div>
              <div><Label>Goals</Label><Textarea value={form.goals} onChange={e => setForm({...form, goals: e.target.value})} /></div>
              <div><Label>Comments</Label><Textarea value={form.comments} onChange={e => setForm({...form, comments: e.target.value})} /></div>
              <Button type="submit" className="w-full">Create Review</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-center">Overall</TableHead>
                <TableHead className="text-center">Skills</TableHead>
                <TableHead className="text-center">Attendance</TableHead>
                <TableHead className="text-center">Teamwork</TableHead>
                <TableHead>Goals</TableHead>
                <TableHead>Comments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews?.map(r => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="font-medium text-sm">{employees?.find(e => e.id === r.employeeId)?.firstName} {employees?.find(e => e.id === r.employeeId)?.lastName || `Emp #${r.employeeId}`}</div>
                  </TableCell>
                  <TableCell className="text-sm font-medium">{r.reviewPeriod}</TableCell>
                  <TableCell className="text-sm">{new Date(r.reviewDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-center">
                    <span className={`text-lg font-bold ${getRatingColor(r.overallRating || 0)}`}>
                      {r.overallRating || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-mono">{r.skillsRating || "—"}</TableCell>
                  <TableCell className="text-center font-mono">{r.attendanceRating || "—"}</TableCell>
                  <TableCell className="text-center font-mono">{r.teamworkRating || "—"}</TableCell>
                  <TableCell className="max-w-xs truncate text-sm">{r.goals || "—"}</TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-slate-500">{r.comments || "—"}</TableCell>
                </TableRow>
              ))}
              {(!reviews || reviews.length === 0) && (
                <TableRow><TableCell colSpan={9} className="text-center text-slate-400 py-8">No performance reviews yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
