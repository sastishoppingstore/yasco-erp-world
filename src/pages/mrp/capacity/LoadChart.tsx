import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { BarChart3, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function LoadChart() {
  const { data, isLoading } = trpc.mrp.capacityLoadChart.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Capacity Load Chart</h2>
        <Card><CardContent className="p-12 text-center text-muted-foreground"><BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No capacity data available</p></CardContent></Card>
      </div>
    );
  }

  const chartData = data.plans.map((p: any) => {
    const res = data.resources.find((r: any) => r.id === p.resourceId);
    return {
      name: res?.resourceCode || p.resourceId,
      nameFull: res?.resourceName || "",
      available: Number(p.availableCapacity),
      required: Number(p.requiredCapacity),
      overload: Number(p.requiredCapacity) > Number(p.availableCapacity),
    };
  });

  const totalAvailable = chartData.reduce((s: number, d: any) => s + d.available, 0);
  const totalRequired = chartData.reduce((s: number, d: any) => s + d.required, 0);
  const overloaded = chartData.filter((d: any) => d.overload).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-emerald-500" />
          <h2 className="text-2xl font-bold">Capacity Load Chart</h2>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" />{chartData.length} Resources</Badge>
          {overloaded > 0 && <Badge variant="destructive" className="gap-1"><AlertTriangle className="w-3 h-3" />{overloaded} Overloaded</Badge>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Available</p><p className="text-xl font-bold">{totalAvailable.toFixed(1)} hrs</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Required</p><p className="text-xl font-bold">{totalRequired.toFixed(1)} hrs</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Utilization</p><p className="text-xl font-bold">{totalAvailable > 0 ? ((totalRequired / totalAvailable) * 100).toFixed(1) : 0}%</p></CardContent></Card>
      </div>

      <Card><CardHeader><CardTitle>Available vs Required Capacity</CardTitle></CardHeader><CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 12 }} />
            <YAxis label={{ value: "Hours", angle: -90, position: "insideLeft", style: { fontSize: 12 } }} />
            <Tooltip formatter={(value: number) => `${value.toFixed(1)} hrs`} />
            <Legend />
            <Bar dataKey="available" fill="#22c55e" name="Available Capacity" radius={[4, 4, 0, 0]} />
            <Bar dataKey="required" fill="#ef4444" name="Required Capacity" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent></Card>
    </div>
  );
}
