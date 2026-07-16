import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Link } from "react-router";
import { MapPin, Package, ArrowRight, ClipboardCheck, ClipboardList, LayoutDashboard } from "lucide-react";

export default function WmsPage() {
  const modules = [
    { title: "Zones", desc: "Warehouse zone management", icon: MapPin, path: "/app/wms/zones", color: "bg-blue-600" },
    { title: "Locations", desc: "Storage locations & bins", icon: Package, path: "/app/wms/locations", color: "bg-emerald-600" },
    { title: "Putaway", desc: "Putaway tasks & execution", icon: ArrowRight, path: "/app/wms/putaway", color: "bg-purple-600" },
    { title: "Picking", desc: "Picking tasks & wave picking", icon: ClipboardCheck, path: "/app/wms/picking", color: "bg-orange-600" },
    { title: "Cycle Count", desc: "Count schedules & variance", icon: ClipboardList, path: "/app/wms/cycle-count", color: "bg-rose-600" },
    { title: "Task Board", desc: "Kanban view of tasks", icon: LayoutDashboard, path: "/app/wms/tasks", color: "bg-cyan-600" },
  ];
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Warehouse Management</h2><p className="text-slate-500">WMS with zones, putaway, picking, and cycle counting</p></div>
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
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
