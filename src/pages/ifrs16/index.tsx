import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import { Building2, DollarSign, CreditCard, TrendingDown } from "lucide-react";

export default function IFRS16Dashboard() {
  const { data } = trpc.ifrs16.leaseDashboard.useQuery(undefined);
  const stats = [
    { title: "Total Leases", value: data?.totalLeases || 0, icon: Building2, color: "bg-blue-600" },
    { title: "Lease Liability", value: `${Number(data?.totalLiability || 0).toLocaleString()} SAR`, icon: DollarSign, color: "bg-red-600" },
    { title: "ROU Assets", value: `${Number(data?.totalRouAssets || 0).toLocaleString()} SAR`, icon: CreditCard, color: "bg-emerald-600" },
    { title: "Accum. Depreciation", value: `${Number(data?.totalDepreciation || 0).toLocaleString()} SAR`, icon: TrendingDown, color: "bg-purple-600" },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">IFRS 16 - Lease Accounting</h2>
        <p className="text-slate-500">Manage lease contracts, ROU assets, and payment schedules</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.title} className="hover:shadow-lg transition-all">
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
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Upcoming Payments</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left"><th className="pb-2 font-medium">Date</th><th className="pb-2 font-medium">Amount</th><th className="pb-2 font-medium">Status</th></tr></thead>
              <tbody>
                {data?.upcomingPayments?.map((p: any) => (
                  <tr key={p.lease_payment_schedules?.id || p.id} className="border-b last:border-0">
                    <td className="py-2">{p.lease_payment_schedules?.paymentDate || p.paymentDate}</td>
                    <td className="py-2">{p.lease_payment_schedules?.paymentAmount || p.paymentAmount}</td>
                    <td className="py-2"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">{p.lease_payment_schedules?.paymentStatus || p.paymentStatus}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Link to="/app/ifrs16/leases/new" className="block"><Button className="w-full"><Building2 className="w-4 h-4 mr-2" />New Lease Contract</Button></Link>
            <Link to="/app/ifrs16/payments" className="block"><Button variant="outline" className="w-full"><CreditCard className="w-4 h-4 mr-2" />Payment Schedule</Button></Link>
            <Link to="/app/ifrs16/assets" className="block"><Button variant="outline" className="w-full"><TrendingDown className="w-4 h-4 mr-2" />ROU Assets</Button></Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
