import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Link } from "react-router";
import { Users, CalendarCheck, Landmark, BarChart3, Briefcase } from "lucide-react";

export default function HRMPage() {
  const modules = [
    { title: "Employees", desc: "Employee records & management", icon: Users, path: "/app/hrm/employees", color: "bg-blue-600" },
    { title: "Attendance", desc: "Time tracking & attendance", icon: CalendarCheck, path: "/app/hrm/attendance", color: "bg-emerald-600" },
    { title: "Leave", desc: "Leave requests & approvals", icon: Briefcase, path: "/app/hrm/leave", color: "bg-purple-600" },
    { title: "Payroll", desc: "Salary processing & slips", icon: Landmark, path: "/app/hrm/payroll", color: "bg-orange-600" },
    { title: "Performance", desc: "Reviews & evaluations", icon: BarChart3, path: "/app/hrm/performance", color: "bg-cyan-600" },
  ];

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Human Resource Management</h2><p className="text-slate-500">Employee lifecycle management</p></div>
      <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
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
