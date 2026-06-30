import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

/**
 * NITAQAT DASHBOARD - Phase 1 Sprint 5
 * Saudi Saudization compliance tracking
 */

const categoryColors = {
  platinum: "#2563eb", // Blue
  gold: "#eab308", // Yellow
  silver: "#a1a1a1", // Gray
  bronze: "#b45309", // Brown
};

const complianceColors = {
  compliant: "#10b981",
  warning: "#f59e0b",
  non_compliant: "#ef4444",
};

export function NitaqatDashboard() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Query Nitaqat data
  const { data: dashboard, isLoading, refetch } = useQuery({
    queryKey: ["nitaqatDashboard", selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return null;
      const result = await trpc.hseSafety.getNitaqatDashboard.query({
        projectId: selectedProjectId,
      });
      return result;
    },
    enabled: !!selectedProjectId,
  });

  // Query alerts
  const { data: alerts } = useQuery({
    queryKey: ["complianceAlerts", selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return [];
      const result = await trpc.hseSafety.getComplianceAlerts.query({
        projectId: selectedProjectId,
        onlyUnacknowledged: true,
      });
      return result.alerts;
    },
    enabled: !!selectedProjectId,
  });

  // Acknowledge alert mutation
  const { mutate: acknowledgeAlert } = useMutation({
    mutationFn: async (alertId: number) => {
      await trpc.hseSafety.acknowledgeAlert.mutate({ alertId });
    },
    onSuccess: () => {
      toast.success("Alert acknowledged");
      refetch();
    },
  });

  const getComplianceBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      compliant: "default",
      warning: "outline",
      non_compliant: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getCategoryBadge = (category: string) => {
    return <Badge variant="secondary">{category.toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Nitaqat Compliance Dashboard</CardTitle>
          <CardDescription>
            Saudi Saudization requirements tracking
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Project Selection */}
      <Card>
        <CardContent className="pt-6">
          <input
            type="number"
            placeholder="Enter Project ID"
            onChange={(e) => setSelectedProjectId(parseInt(e.target.value))}
            className="px-3 py-2 border rounded-md w-full max-w-xs"
          />
        </CardContent>
      </Card>

      {dashboard && !isLoading && dashboard.current && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Saudization % */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {dashboard.current.nitaqatPercentage}%
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Saudization Rate
                  </p>
                  <Progress
                    value={parseFloat(dashboard.current.nitaqatPercentage)}
                    max={100}
                    className="mb-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    {dashboard.current.saudiCount} Saudis / {dashboard.current.totalWorkforce} Total
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Category */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="mb-4">
                    {getCategoryBadge(dashboard.current.category)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Nitaqat Category
                  </p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>Platinum: ≥90%</p>
                    <p>Gold: ≥75%</p>
                    <p>Silver: ≥50%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compliance Status */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="mb-4 flex justify-center">
                    {dashboard.current.compliance === "compliant" ? (
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-12 h-12 text-red-600" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Compliance Status
                  </p>
                  {getComplianceBadge(dashboard.current.compliance)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Workforce Breakdown */}
          {dashboard.categoryBreakdown && (
            <Card>
              <CardHeader>
                <CardTitle>Workforce Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-8">
                  <ResponsiveContainer width="40%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Saudis",
                            value: dashboard.categoryBreakdown.saudis,
                            fill: "#10b981",
                          },
                          {
                            name: "Non-Saudis",
                            value: dashboard.categoryBreakdown.nonSaudis,
                            fill: "#6b7280",
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) =>
                          `${name}: ${value}`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#6b7280" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold mb-1">Total Workforce</p>
                      <p className="text-2xl font-bold">
                        {dashboard.categoryBreakdown.saudis +
                          dashboard.categoryBreakdown.nonSaudis}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-1 text-green-600">
                        Saudi Employees
                      </p>
                      <p className="text-2xl font-bold">
                        {dashboard.categoryBreakdown.saudis}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-1 text-gray-600">
                        Non-Saudi Employees
                      </p>
                      <p className="text-2xl font-bold">
                        {dashboard.categoryBreakdown.nonSaudis}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Compliance Alerts */}
          {alerts && alerts.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-700">
                  Compliance Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.map((alert: any) => (
                  <Alert
                    key={alert.id}
                    className={
                      alert.severity === "critical"
                        ? "border-red-600 bg-red-50"
                        : "border-yellow-600 bg-yellow-50"
                    }
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-semibold">{alert.message}</div>
                      <div className="text-sm mt-1">
                        Type:{" "}
                        <Badge variant="outline" className="ml-1">
                          {alert.alertType}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        Acknowledge
                      </Button>
                    </AlertDescription>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Compliance Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Nitaqat Compliance Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="font-semibold text-blue-700">Platinum</p>
                  <p className="text-sm text-muted-foreground">≥90% Saudization</p>
                  <p className="text-xs text-green-600 mt-1">✓ Highest compliance</p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <p className="font-semibold text-yellow-700">Gold</p>
                  <p className="text-sm text-muted-foreground">75-89% Saudization</p>
                  <p className="text-xs text-green-600 mt-1">✓ Good compliance</p>
                </div>
                <div className="border-l-4 border-gray-500 pl-4">
                  <p className="font-semibold text-gray-700">Silver</p>
                  <p className="text-sm text-muted-foreground">50-74% Saudization</p>
                  <p className="text-xs text-orange-600 mt-1">⚠ Warning level</p>
                </div>
                <div className="border-l-4 border-red-500 pl-4">
                  <p className="font-semibold text-red-700">Bronze</p>
                  <p className="text-sm text-muted-foreground">&lt;50% Saudization</p>
                  <p className="text-xs text-red-600 mt-1">✗ Non-compliant</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default NitaqatDashboard;
