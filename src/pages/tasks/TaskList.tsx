import { useState } from "react";
import {
  Plus, List, Columns3, Calendar, Search, Filter, MoreHorizontal,
  Clock, User, Tag, MessageSquare, Paperclip, Edit3, Trash2,
  ChevronLeft, ChevronRight, Loader2,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

type ViewMode = "list" | "kanban" | "calendar";
type Priority = "low" | "medium" | "high" | "urgent";
type Status = "todo" | "in_progress" | "review" | "done";

const priorityColors: Record<Priority, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-blue-100 text-blue-600",
  high: "bg-orange-100 text-orange-600",
  urgent: "bg-red-100 text-red-600",
};

const statusColors: Record<Status, string> = {
  todo: "bg-slate-100 text-slate-600",
  in_progress: "bg-blue-100 text-blue-600",
  review: "bg-purple-100 text-purple-600",
  done: "bg-green-100 text-green-600",
};

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  assignee?: { id: string; name: string };
  dueDate?: string;
  tags?: string[];
  createdAt?: string;
}

const columns: { key: Status; labelEn: string; labelAr: string }[] = [
  { key: "todo", labelEn: "To Do", labelAr: "مهام" },
  { key: "in_progress", labelEn: "In Progress", labelAr: "قيد التنفيذ" },
  { key: "review", labelEn: "Review", labelAr: "مراجعة" },
  { key: "done", labelEn: "Done", labelAr: "مكتمل" },
];

export default function TaskList() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [view, setView] = useState<ViewMode>("list");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskPriority, setTaskPriority] = useState<Priority>("medium");
  const [taskStatus, setTaskStatus] = useState<Status>("todo");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskTags, setTaskTags] = useState("");

  const createMutation = trpc.tasks.create.useMutation({
    onSuccess: () => { setShowCreate(false); resetForm(); },
  });

  const updateMutation = trpc.tasks.update.useMutation();

  const deleteMutation = trpc.tasks.delete.useMutation();

  const [tasks, setTasks] = useState<Task[]>([]);

  const filtered = tasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    return true;
  });

  const resetForm = () => {
    setTaskTitle(""); setTaskDesc(""); setTaskPriority("medium");
    setTaskStatus("todo"); setTaskAssignee(""); setTaskDueDate(""); setTaskTags("");
  };

  const handleCreate = () => {
    createMutation.mutate({
      title: taskTitle, description: taskDesc, priority: taskPriority,
      status: taskStatus, assigneeId: taskAssignee || undefined,
      dueDate: taskDueDate || undefined, tags: taskTags ? taskTags.split(",").map((t) => t.trim()) : undefined,
    } as any);
  };

  const handleStatusChange = (taskId: string, newStatus: Status) => {
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: newStatus } : t));
    updateMutation.mutate({ id: taskId, status: newStatus } as any);
  };

  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDay = (month: number, year: number) => new Date(year, month, 1).getDay();

  const renderListView = () => (
    <div className="rounded-lg border bg-white">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-slate-50">
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">{isAr ? "المهمة" : "Task"}</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">{isAr ? "الأولوية" : "Priority"}</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">{isAr ? "الحالة" : "Status"}</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">{isAr ? "المسؤول" : "Assignee"}</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">{isAr ? "تاريخ التسليم" : "Due Date"}</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan={6} className="p-12 text-center text-slate-500">{isAr ? "لا توجد مهام" : "No tasks found"}</td></tr>
          ) : filtered.map((task) => (
            <tr key={task.id} className="border-b last:border-0 hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedTask(task)}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{task.title}</span>
                  {task.tags?.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3">
                <Badge className={priorityColors[task.priority]}>
                  {task.priority}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <Badge className={statusColors[task.status]}>
                  {task.status.replace("_", " ")}
                </Badge>
              </td>
              <td className="px-4 py-3">
                {task.assignee && (
                  <div className="flex items-center gap-2">
                    <Avatar className="size-6">
                      <AvatarFallback className="text-xs">{task.assignee.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{task.assignee.name}</span>
                  </div>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-slate-500">{task.dueDate}</td>
              <td className="px-4 py-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm"><MoreHorizontal className="size-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleStatusChange(task.id, "todo")}>{isAr ? "مهام" : "To Do"}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(task.id, "in_progress")}>{isAr ? "قيد التنفيذ" : "In Progress"}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(task.id, "review")}>{isAr ? "مراجعة" : "Review"}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(task.id, "done")}>{isAr ? "مكتمل" : "Done"}</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600" onClick={() => deleteMutation.mutate({ id: task.id } as any)}>
                      {isAr ? "حذف" : "Delete"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderKanbanView = () => (
    filtered.length === 0 ? (
      <Card><CardContent className="py-12 text-center text-slate-500">{isAr ? "لا توجد مهام" : "No tasks found"}</CardContent></Card>
    ) : (
    <div className="grid grid-cols-4 gap-4">
      {columns.map((col) => (
        <div key={col.key} className="rounded-lg border bg-white p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">{isAr ? col.labelAr : col.labelEn}</h3>
            <Badge variant="secondary">{filtered.filter((t) => t.status === col.key).length}</Badge>
          </div>
          <div className="space-y-2 min-h-[200px]">
            {filtered.filter((t) => t.status === col.key).map((task) => (
              <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedTask(task)}>
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium">{task.title}</p>
                    <Badge className={`${priorityColors[task.priority]} text-[10px] px-1.5 py-0`}>
                      {task.priority}
                    </Badge>
                  </div>
                  {task.dueDate && (
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="size-3" />
                      {task.dueDate}
                    </div>
                  )}
                  {task.assignee && (
                    <div className="flex items-center gap-1">
                      <Avatar className="size-5">
                        <AvatarFallback className="text-[10px]">{task.assignee.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-slate-500">{task.assignee.name}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
    )
  );

  const renderCalendarView = () => {
    const daysInMonth = getDaysInMonth(calendarMonth, calendarYear);
    const firstDay = getFirstDay(calendarMonth, calendarYear);
    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

    return (
      filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-slate-500">{isAr ? "لا توجد مهام" : "No tasks found"}</CardContent></Card>
      ) : (
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
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayTasks = filtered.filter((t) => t.dueDate === dateStr);
              return (
                <div key={day} className="min-h-[80px] rounded-lg border p-1 hover:bg-slate-50 cursor-pointer">
                  <span className="text-xs font-medium">{day}</span>
                  {dayTasks.map((t) => (
                    <div key={t.id} className="mt-1 rounded bg-blue-100 px-1 py-0.5 text-[10px] text-blue-700 truncate" onClick={() => setSelectedTask(t)}>
                      {t.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{isAr ? "المهام" : "Tasks"}</h1>
          <p className="text-sm text-muted-foreground">{isAr ? "إدارة ومتابعة المهام" : "Manage and track tasks"}</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="size-4 mr-2" />
          {isAr ? "مهمة جديدة" : "New Task"}
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input className="pl-10" placeholder={isAr ? "بحث..." : "Search tasks..."} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]">
            <Filter className="size-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isAr ? "الكل" : "All"}</SelectItem>
            <SelectItem value="todo">{isAr ? "مهام" : "To Do"}</SelectItem>
            <SelectItem value="in_progress">{isAr ? "قيد التنفيذ" : "In Progress"}</SelectItem>
            <SelectItem value="review">{isAr ? "مراجعة" : "Review"}</SelectItem>
            <SelectItem value="done">{isAr ? "مكتمل" : "Done"}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={isAr ? "الأولوية" : "Priority"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isAr ? "الكل" : "All"}</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as ViewMode)}>
        <TabsList>
          <TabsTrigger value="list"><List className="size-4 mr-2" />{isAr ? "قائمة" : "List"}</TabsTrigger>
          <TabsTrigger value="kanban"><Columns3 className="size-4 mr-2" />Kanban</TabsTrigger>
          <TabsTrigger value="calendar"><Calendar className="size-4 mr-2" />{isAr ? "تقويم" : "Calendar"}</TabsTrigger>
        </TabsList>
      </Tabs>

      {view === "list" && renderListView()}
      {view === "kanban" && renderKanbanView()}
      {view === "calendar" && renderCalendarView()}

      <Sheet open={!!selectedTask} onOpenChange={(v) => { if (!v) setSelectedTask(null); }}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          {selectedTask && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedTask.title}</SheetTitle>
                <SheetDescription>
                  <div className="flex gap-2 mt-2">
                    <Badge className={priorityColors[selectedTask.priority]}>{selectedTask.priority}</Badge>
                    <Badge className={statusColors[selectedTask.status]}>{selectedTask.status.replace("_", " ")}</Badge>
                  </div>
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                {selectedTask.description && (
                  <div>
                    <Label className="text-xs text-muted-foreground">{isAr ? "الوصف" : "Description"}</Label>
                    <p className="text-sm mt-1">{selectedTask.description}</p>
                  </div>
                )}
                {selectedTask.assignee && (
                  <div className="flex items-center gap-2">
                    <User className="size-4 text-slate-400" />
                    <span className="text-sm">{selectedTask.assignee.name}</span>
                  </div>
                )}
                {selectedTask.dueDate && (
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-slate-400" />
                    <span className="text-sm">{selectedTask.dueDate}</span>
                  </div>
                )}
                {selectedTask.tags && selectedTask.tags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Tag className="size-4 text-slate-400" />
                    <div className="flex gap-1">
                      {selectedTask.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="size-4 text-slate-400" />
                    <h4 className="text-sm font-medium">{isAr ? "التعليقات" : "Comments"}</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="size-6"><AvatarFallback className="text-xs">A</AvatarFallback></Avatar>
                        <span className="text-xs font-medium">Ahmed</span>
                        <span className="text-xs text-slate-400">2h ago</span>
                      </div>
                      <p className="text-sm">Working on this task now.</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Input placeholder={isAr ? "أضف تعليق..." : "Add a comment..."} className="text-sm" />
                    <Button size="sm">{isAr ? "إرسال" : "Send"}</Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Paperclip className="size-4 text-slate-400" />
                    <h4 className="text-sm font-medium">{isAr ? "المرفقات" : "Attachments"}</h4>
                  </div>
                  <Button variant="outline" size="sm">
                    <Paperclip className="size-3 mr-2" />
                    {isAr ? "إضافة مرفق" : "Add Attachment"}
                  </Button>
                </div>

                <div className="flex gap-2 pt-4">
                  <Select value={selectedTask.status} onValueChange={(v) => handleStatusChange(selectedTask.id, v as Status)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">{isAr ? "مهام" : "To Do"}</SelectItem>
                      <SelectItem value="in_progress">{isAr ? "قيد التنفيذ" : "In Progress"}</SelectItem>
                      <SelectItem value="review">{isAr ? "مراجعة" : "Review"}</SelectItem>
                      <SelectItem value="done">{isAr ? "مكتمل" : "Done"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isAr ? "مهمة جديدة" : "New Task"}</DialogTitle>
            <DialogDescription>
              {isAr ? "أدخل تفاصيل المهمة الجديدة" : "Enter the details for the new task"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{isAr ? "عنوان المهمة" : "Title"}</Label>
              <Input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder={isAr ? "عنوان المهمة" : "Task title"} />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "الوصف" : "Description"}</Label>
              <Textarea value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} placeholder={isAr ? "وصف المهمة" : "Task description"} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isAr ? "الأولوية" : "Priority"}</Label>
                <Select value={taskPriority} onValueChange={(v) => setTaskPriority(v as Priority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{isAr ? "الحالة" : "Status"}</Label>
                <Select value={taskStatus} onValueChange={(v) => setTaskStatus(v as Status)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">{isAr ? "مهام" : "To Do"}</SelectItem>
                    <SelectItem value="in_progress">{isAr ? "قيد التنفيذ" : "In Progress"}</SelectItem>
                    <SelectItem value="review">{isAr ? "مراجعة" : "Review"}</SelectItem>
                    <SelectItem value="done">{isAr ? "مكتمل" : "Done"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isAr ? "المسؤول" : "Assignee"}</Label>
                <Select value={taskAssignee} onValueChange={setTaskAssignee}>
                  <SelectTrigger>
                    <SelectValue placeholder={isAr ? "اختر" : "Select"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="u1">Ahmed</SelectItem>
                    <SelectItem value="u2">Sarah</SelectItem>
                    <SelectItem value="u3">Khalid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{isAr ? "تاريخ التسليم" : "Due Date"}</Label>
                <Input value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} type="date" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "الوسوم" : "Tags"}</Label>
              <Input value={taskTags} onChange={(e) => setTaskTags(e.target.value)} placeholder={isAr ? "وسوم مفصولة بفواصل" : "Comma separated tags"} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>{isAr ? "إلغاء" : "Cancel"}</Button>
            <Button onClick={handleCreate} disabled={!taskTitle || createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
              {isAr ? "إنشاء" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
