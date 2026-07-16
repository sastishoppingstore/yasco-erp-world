import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Link } from "react-router";
import { Calendar, Factory, ClipboardList, Network, BarChart3 } from "lucide-react";

export default function MrpPage() {
  const modules = [
    { title: "MPS", desc: "Master Production Schedule", icon: Calendar, path: "/app/mrp/mps", color: "bg-blue-600" },
    { title: "Capacity", desc: "Resources & Rough Cut Plans", icon: Factory, path: "/app/mrp/capacity", color: "bg-emerald-600" },
    { title: "MRP Runs", desc: "Net requirements & planned orders", icon: ClipboardList, path: "/app/mrp/runs", color: "bg-purple-600" },
    { title: "Pegging", desc: "Demand tracing & pegging", icon: Network, path: "/app/mrp/pegging", color: "bg-orange-600" },
    { title: "Results", desc: "Planned orders & net requirements", icon: BarChart3, path: "/app/mrp/results", color: "bg-rose-600" },
  ];
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">MRP II</h2><p className="text-slate-500">Advanced Material Requirements Planning</p></div>
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
