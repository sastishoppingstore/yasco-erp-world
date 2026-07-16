import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Link } from "react-router";
import { FolderKanban, ClipboardList, Clock } from "lucide-react";

export default function ProjectsLandingPage() {
  const modules = [
    { title: "Projects", desc: "Project management & tracking", icon: FolderKanban, path: "/app/projects/list", color: "bg-blue-600" },
    { title: "Tasks", desc: "Task assignments & Kanban", icon: ClipboardList, path: "/app/projects/tasks", color: "bg-emerald-600" },
    { title: "Timesheets", desc: "Time tracking & billing", icon: Clock, path: "/app/projects/timesheets", color: "bg-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Project Management</h2><p className="text-slate-500">Projects, tasks, Kanban, and Gantt charts</p></div>
      <div className="grid md:grid-cols-3 gap-4">
        {modules.map((mod) => (
          <Link key={mod.path} to={mod.path} className="block">
            <Card className="hover:shadow-lg transition-all cursor-pointer group h-full">
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-xl ${mod.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <mod.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg mb-1">{mod.title}</CardTitle>
                <p className="text-sm text-slate-500">{mod.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
