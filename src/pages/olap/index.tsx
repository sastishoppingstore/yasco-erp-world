import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Box, Layers, FunctionSquare, Database, BarChart3, RefreshCw } from "lucide-react";

export default function OlapDashboardPage() {
  const { data: dashboard, isLoading } = trpc.olap.olapDashboard.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-6 h-6 text-orange-500" />
        <div><h2 className="text-2xl font-bold">OLAP & Data Warehouse</h2><p className="text-sm text-muted-foreground">Multidimensional analysis and reporting</p></div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30"><Box className="w-6 h-6 text-blue-500" /></div>
          <div><p className="text-sm text-muted-foreground">Cubes</p><p className="text-3xl font-bold">{dashboard?.cubeCount ?? 0}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30"><Layers className="w-6 h-6 text-purple-500" /></div>
          <div><p className="text-sm text-muted-foreground">Dimensions</p><p className="text-3xl font-bold">{dashboard?.dimensionCount ?? 0}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30"><FunctionSquare className="w-6 h-6 text-green-500" /></div>
          <div><p className="text-sm text-muted-foreground">Measures</p><p className="text-3xl font-bold">{dashboard?.measureCount ?? 0}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-900/30"><Database className="w-6 h-6 text-rose-500" /></div>
          <div><p className="text-sm text-muted-foreground">Fact Tables</p><p className="text-3xl font-bold">{dashboard?.factTableCount ?? 0}</p></div>
        </CardContent></Card>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Link to="/app/olap/cubes"><Button><Box className="w-4 h-4 mr-2" />Cubes</Button></Link>
        <Link to="/app/olap/dimensions"><Button variant="outline"><Layers className="w-4 h-4 mr-2" />Dimensions</Button></Link>
        <Link to="/app/olap/facts"><Button variant="outline"><Database className="w-4 h-4 mr-2" />Fact Tables</Button></Link>
        <Link to="/app/olap/queries"><Button variant="outline"><FunctionSquare className="w-4 h-4 mr-2" />Query Builder</Button></Link>
      </div>
    </div>
  );
}
