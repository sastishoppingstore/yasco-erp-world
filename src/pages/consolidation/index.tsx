import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import { Building2, GitCompare, ArrowLeftRight, BarChart3 } from "lucide-react";

export default function ConsolidationDashboard() {
  const { data } = trpc.consolidation.consolidationDashboard.useQuery(undefined);
  const stats = [
    { title: "Total Groups", value: data?.totalGroups || 0, icon: Building2, color: "bg-blue-600", path: "/app/consolidation/groups" },
    { title: "Pending Consolidations", value: data?.pendingConsolidations || 0, icon: GitCompare, color: "bg-amber-600", path: "/app/consolidation/groups" },
    { title: "Unmatched Interco", value: data?.unmatchedInterco || 0, icon: ArrowLeftRight, color: "bg-red-600", path: "/app/consolidation/intercompany" },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Multi-Company Consolidation</h2>
        <p className="text-slate-500">Consolidate financial statements across entities</p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
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
                    <p className="text-2xl font-bold">{s.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Recent Consolidation Groups</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left"><th className="pb-2 font-medium">Name</th><th className="pb-2 font-medium">Method</th><th className="pb-2 font-medium">Status</th></tr></thead>
            <tbody>
              {data?.recentGroups?.map(g => (
                <tr key={g.id} className="border-b last:border-0">
                  <td className="py-2"><Link to={`/app/consolidation/groups/${g.id}`} className="text-primary hover:underline">{g.name}</Link></td>
                  <td className="py-2 capitalize">{g.consolidationMethod}</td>
                  <td className="py-2">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      g.status === 'completed' ? 'bg-green-100 text-green-800' :
                      g.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>{g.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <div className="flex gap-4">
        <Link to="/app/consolidation/groups/new"><Button><Building2 className="w-4 h-4 mr-2" />New Group</Button></Link>
        <Link to="/app/consolidation/intercompany"><Button variant="outline"><ArrowLeftRight className="w-4 h-4 mr-2" />Intercompany Transactions</Button></Link>
      </div>
    </div>
  );
}
