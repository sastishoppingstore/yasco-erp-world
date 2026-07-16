import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Link } from "react-router";
import { Factory, ClipboardList, Package } from "lucide-react";

export default function ManufacturingPage() {
  const modules = [
    { title: "Bill of Materials", desc: "Product recipes & components", icon: Factory, path: "/app/manufacturing/bom", color: "bg-blue-600" },
    { title: "Work Orders", desc: "Production planning & execution", icon: ClipboardList, path: "/app/manufacturing/work-orders", color: "bg-emerald-600" },
    { title: "Production", desc: "Production order management", icon: Package, path: "/app/manufacturing/production", color: "bg-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Manufacturing</h2><p className="text-slate-500">Production planning and execution</p></div>
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
