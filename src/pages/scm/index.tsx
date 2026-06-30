import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Link } from "react-router";
import { Scale, FileText, ClipboardList, BarChart3, Users } from "lucide-react";

export default function ScmPage() {
  const modules = [
    { title: "Supplier Evaluation", desc: "Scorecards & evaluations", icon: Scale, path: "/app/scm/suppliers", color: "bg-blue-600" },
    { title: "Contracts", desc: "Supplier contract management", icon: FileText, path: "/app/scm/contracts", color: "bg-emerald-600" },
    { title: "RFQs", desc: "Request for Quotations", icon: ClipboardList, path: "/app/scm/rfq", color: "bg-purple-600" },
    { title: "Bid Comparison", desc: "Weighted scoring matrix", icon: BarChart3, path: "/app/scm/bids", color: "bg-orange-600" },
    { title: "Supplier Portal", desc: "Portal configuration", icon: Users, path: "/app/scm/portal", color: "bg-rose-600" },
  ];
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Supply Chain Management</h2><p className="text-slate-500">Strategic sourcing, procurement, and supplier collaboration</p></div>
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
