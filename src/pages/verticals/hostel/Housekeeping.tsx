import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLanguage } from "@/providers/language";
import { Wrench, CheckCircle, Clock, AlertTriangle } from "lucide-react";

type TaskStatus = "Pending" | "In Progress" | "Completed" | "Skipped";

interface Task {
  id: string;
  room: string;
  type: string;
  assignedTo: string;
  scheduled: string;
  status: TaskStatus;
  notes?: string;
}

const initial: Task[] = [
  { id: "HSK-001", room: "101", type: "Full Cleaning", assignedTo: "Ali", scheduled: "2026-07-08", status: "Completed" },
  { id: "HSK-002", room: "102", type: "Full Cleaning", assignedTo: "Ali", scheduled: "2026-07-08", status: "Completed" },
  { id: "HSK-003", room: "103", type: "Deep Clean", assignedTo: "Hassan", scheduled: "2026-07-08", status: "In Progress" },
  { id: "HSK-004", room: "104", type: "Maintenance Check", assignedTo: "Engineer", scheduled: "2026-07-08", status: "Pending" },
  { id: "HSK-005", room: "201", type: "Full Cleaning", assignedTo: "Ali", scheduled: "2026-07-09", status: "Pending" },
  { id: "HSK-006", room: "202", type: "Linen Change", assignedTo: "Hassan", scheduled: "2026-07-09", status: "Pending" },
  { id: "HSK-007", room: "Checkout - 407", type: "Turnover Clean", assignedTo: "Ali", scheduled: "2026-07-07", status: "Completed" },
];

const statusColor: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700 border-amber-200",
  "In Progress": "bg-blue-100 text-blue-700 border-blue-200",
  Completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Skipped: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function HostelHousekeeping() {
  const { language } = useLanguage();
  const rtl = language === "ar";
  const [tasks, setTasks] = useState(initial);

  const updateStatus = (id: string, status: TaskStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  const stats = {
    pending: tasks.filter((t) => t.status === "Pending").length,
    inProgress: tasks.filter((t) => t.status === "In Progress").length,
    completed: tasks.filter((t) => t.status === "Completed").length,
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      <h1 className="text-2xl font-bold">{rtl ? "خدمة التنظيف" : "Housekeeping"}</h1>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="size-8 text-amber-600" />
            <div>
              <p className="text-xs text-amber-700">{rtl ? "معلق" : "Pending"}</p>
              <p className="text-2xl font-bold text-amber-800">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 flex items-center gap-3">
            <Wrench className="size-8 text-blue-600" />
            <div>
              <p className="text-xs text-blue-700">{rtl ? "قيد التنفيذ" : "In Progress"}</p>
              <p className="text-2xl font-bold text-blue-800">{stats.inProgress}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="size-8 text-emerald-600" />
            <div>
              <p className="text-xs text-emerald-700">{rtl ? "مكتمل" : "Completed"}</p>
              <p className="text-2xl font-bold text-emerald-800">{stats.completed}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{rtl ? "المهمة" : "Task"}</TableHead>
                <TableHead>{rtl ? "الغرفة" : "Room"}</TableHead>
                <TableHead>{rtl ? "النوع" : "Type"}</TableHead>
                <TableHead>{rtl ? "الموظف" : "Staff"}</TableHead>
                <TableHead>{rtl ? "التاريخ" : "Date"}</TableHead>
                <TableHead>{rtl ? "الحالة" : "Status"}</TableHead>
                <TableHead>{rtl ? "إجراءات" : "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.id}</TableCell>
                  <TableCell>{t.room}</TableCell>
                  <TableCell>{t.type}</TableCell>
                  <TableCell>{t.assignedTo}</TableCell>
                  <TableCell>{t.scheduled}</TableCell>
                  <TableCell>
                    <Badge className={statusColor[t.status]}>{t.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {t.status === "Pending" && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(t.id, "In Progress")}>
                          {rtl ? "بدء" : "Start"}
                        </Button>
                      )}
                      {t.status === "In Progress" && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(t.id, "Completed")}>
                          {rtl ? "إكمال" : "Complete"}
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
