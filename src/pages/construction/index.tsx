import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Building2, HardHat, FileText, AlertTriangle, Plus, ArrowRight } from "lucide-react";

const statusColors = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#6b7280"];

export default function ConstructionDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = trpc.construction.constructionStats.useQuery(undefined);
  const { data: projects, isLoading: projectsLoading } = trpc.construction.projectList.useQuery(undefined);

  const projectStatusCounts = projects?.reduce((acc, p) => {
    const status = p.status || "unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const pieData = Object.entries(projectStatusCounts).map(([name, value]) => ({
    name: name.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase()),
    value,
  }));

  const activeProjects = projects?.filter(p => p.status === "active") || [];
  const totalContractValue = projects?.reduce((sum, p) => sum + Number(p.contractValue), 0) || 0;

  const quickActions = [
    { label: "New Project", path: "/app/construction/contracts/new", icon: Building2, color: "bg-blue-600" },
    { label: "New BOQ", path: "/app/construction/boq/new", icon: FileText, color: "bg-emerald-600" },
    { label: "New Contract", path: "/app/construction/contracts/new", icon: HardHat, color: "bg-purple-600" },
    { label: "Daily Report", path: "/app/construction/daily-reports/new", icon: AlertTriangle, color: "bg-orange-600" },
  ];

  const statsCards = [
    { title: "Active Projects", value: stats?.activeProjects ?? activeProjects.length, icon: Building2, color: "text-blue-600" },
    { title: "Total Contract Value", value: `${(stats?.totalContractValue ?? totalContractValue).toLocaleString()} SAR`, icon: FileText, color: "text-emerald-600" },
    { title: "Active Contracts", value: projects?.length ?? 0, icon: HardHat, color: "text-purple-600" },
    { title: "Subcontractors", value: stats?.totalSubcontractors ?? 0, icon: AlertTriangle, color: "text-orange-600" },
  ];

  if (statsLoading || projectsLoading) {
    return (
      <div className="space-y-6">
        <div><Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-96 mt-1" /></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Construction Dashboard</h2>
          <p className="text-muted-foreground">Overview of construction operations and projects</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                </div>
                <card.icon className={`h-8 w-8 ${card.color} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">No projects data</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => <Cell key={i} fill={statusColors[i % statusColors.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map(action => (
              <Button key={action.path} variant="outline" className="w-full justify-start gap-3 h-12" onClick={() => navigate(action.path)}>
                <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                  <action.icon className="h-4 w-4 text-white" />
                </div>
                <span className="flex-1 text-left">{action.label}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {activeProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Building2 className="h-12 w-12 mb-3 opacity-50" />
              <p className="font-medium">No active projects</p>
              <p className="text-sm">Create a project to get started</p>
              <Button className="mt-4" onClick={() => navigate("/app/construction/contracts/new")}>
                <Plus className="h-4 w-4 mr-2" />New Project
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {activeProjects.slice(0, 6).map(p => (
                <div key={p.id} className="rounded-lg border p-4 hover:bg-accent/50 cursor-pointer transition-colors" onClick={() => navigate(`/app/construction/contracts/${p.id}`)}>
                  <div className="flex items-center gap-2 mb-2">
                    <HardHat className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium truncate">{p.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">{p.projectCode}</p>
                  <p className="text-sm mt-2">{Number(p.contractValue).toLocaleString()} SAR</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
