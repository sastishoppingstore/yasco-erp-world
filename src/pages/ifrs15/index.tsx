import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import { FileSpreadsheet, DollarSign, CalendarCheck, TrendingUp, Building2 } from "lucide-react";

export default function IFRS15Dashboard() {
  const { data } = trpc.ifrs15.revenueDashboard.useQuery(undefined);
  const stats = [
    { title: "Performance Obligations", value: data?.totalObligations || 0, icon: FileSpreadsheet, color: "bg-blue-600", path: "/app/ifrs15/obligations" },
    { title: "Contract Assets", value: `${Number(data?.totalContractAssets || 0).toLocaleString()} SAR`, icon: DollarSign, color: "bg-emerald-600", path: "/app/ifrs15/contracts/assets" },
    { title: "Deferred Revenue", value: `${Number(data?.totalDeferred || 0).toLocaleString()} SAR`, icon: Building2, color: "bg-amber-600", path: "/app/ifrs15/contracts/liabilities" },
    { title: "Recognized Revenue", value: `${Number(data?.totalRecognized || 0).toLocaleString()} SAR`, icon: TrendingUp, color: "bg-purple-600", path: "/app/ifrs15/schedules" },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">IFRS 15 - Revenue Recognition</h2>
        <p className="text-slate-500">Five-step revenue recognition model</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Link key={s.title} to={s.path} className="block">
            <Card className="hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center`}>
                    <s.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{s.title}</p>
                    <p className="text-xl font-bold">{s.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Revenue Backlog</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span>Satisfied Obligations</span><span className="font-semibold">{data?.satisfiedObligations || 0}</span></div>
              <div className="flex justify-between text-sm"><span>Pending Schedules</span><span className="font-semibold">{data?.pendingSchedules || 0}</span></div>
              <div className="flex justify-between text-sm"><span>Total Obligations</span><span className="font-semibold">{data?.totalObligations || 0}</span></div>
              <div className="mt-4">
                <Link to="/app/ifrs15/schedules"><Button variant="outline" size="sm"><CalendarCheck className="w-4 h-4 mr-2" />View Schedule</Button></Link>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Link to="/app/ifrs15/obligations/new" className="block"><Button className="w-full"><FileSpreadsheet className="w-4 h-4 mr-2" />New Obligation</Button></Link>
            <Link to="/app/ifrs15/contracts/assets" className="block"><Button variant="outline" className="w-full"><DollarSign className="w-4 h-4 mr-2" />Contract Assets</Button></Link>
            <Link to="/app/ifrs15/contracts/liabilities" className="block"><Button variant="outline" className="w-full"><Building2 className="w-4 h-4 mr-2" />Contract Liabilities</Button></Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
