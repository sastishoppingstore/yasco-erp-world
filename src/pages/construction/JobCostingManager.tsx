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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, TrendingUp, DollarSign } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

/**
 * JOB COSTING MANAGER - Critical Feature #2
 * Tracks actual vs budgeted costs with variance analysis
 */

const updateCostSchema = z.object({
  jobCostingDetailId: z.number().min(1),
  amountToAdd: z.string(),
  invoiceReference: z.string().optional(),
});

type UpdateCostInput = z.infer<typeof updateCostSchema>;

export function JobCostingManager() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "update" | "alerts">(
    "dashboard"
  );

  // Queries
  const { data: dashboard, isLoading: dashboardLoading, refetch } = useQuery({
    queryKey: ["jobCostingDashboard", selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return null;
      const result = await trpc.jobCosting.getJobCostingDashboard.query({
        projectId: selectedProjectId,
      });
      return result.dashboard;
    },
    enabled: !!selectedProjectId,
  });

  const { data: alerts } = useQuery({
    queryKey: ["varianceAlerts", selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return [];
      const result = await trpc.jobCosting.getVarianceAlerts.query({
        projectId: selectedProjectId,
        isResolved: false,
      });
      return result.alerts;
    },
    enabled: !!selectedProjectId,
  });

  // Mutations
  const { mutate: updateCost, isPending: isUpdating } = useMutation({
    mutationFn: async (data: UpdateCostInput) => {
      const result = await trpc.jobCosting.updateActualCost.mutate(data);
      return result;
    },
    onSuccess: (data) => {
      toast.success("Cost updated successfully");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const form = useForm<UpdateCostInput>({
    resolver: zodResolver(updateCostSchema),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on_track":
        return "text-green-600 bg-green-50";
      case "warning":
        return "text-orange-600 bg-orange-50";
      case "critical":
        return "text-red-600 bg-red-50";
      default:
        return "";
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      on_track: "default",
      warning: "outline",
      critical: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Job Costing Manager</CardTitle>
          <CardDescription>
            Track and analyze project costs with real-time variance monitoring
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Project Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Input
              placeholder="Enter Project ID"
              type="number"
              onChange={(e) => setSelectedProjectId(parseInt(e.target.value))}
              className="max-w-xs"
            />
            <span className="text-sm text-muted-foreground">
              {selectedProjectId && `Project: ${selectedProjectId}`}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      {dashboard && !dashboardLoading && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {dashboard.totalBudget.toFixed(0)}
              </div>
              <p className="text-sm text-muted-foreground">Total Budget</p>
              <p className="text-xs text-muted-foreground mt-1">SAR</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {dashboard.totalActual.toFixed(0)}
              </div>
              <p className="text-sm text-muted-foreground">Actual Spent</p>
              <p className="text-xs text-muted-foreground mt-1">SAR</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div
                className={`text-2xl font-bold ${
                  parseFloat(dashboard.totalVariancePercent) > 0
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {dashboard.totalVariancePercent}%
              </div>
              <p className="text-sm text-muted-foreground">Variance</p>
              <p className="text-xs text-muted-foreground mt-1">
                {dashboard.totalVariance > 0 ? "Over" : "Under"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">
                {dashboard.criticalCount}
              </div>
              <p className="text-sm text-muted-foreground">Critical Items</p>
              <p className="text-xs text-red-600 mt-1">>20% variance</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-600">
                {dashboard.warningCount}
              </div>
              <p className="text-sm text-muted-foreground">Warning Items</p>
              <p className="text-xs text-orange-600 mt-1">10-20% variance</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`px-4 py-2 font-medium ${
            activeTab === "dashboard"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab("update")}
          className={`px-4 py-2 font-medium ${
            activeTab === "update"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          }`}
        >
          Update Cost
        </button>
        <button
          onClick={() => setActiveTab("alerts")}
          className={`px-4 py-2 font-medium flex items-center gap-2 ${
            activeTab === "alerts"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          }`}
        >
          Alerts {alerts && alerts.length > 0 && <Badge>{alerts.length}</Badge>}
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && dashboard && !dashboardLoading && (
        <>
          {/* Cost Breakdown Table */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown by Category</CardTitle>
              <CardDescription>
                Detailed budget vs actual vs forecast analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Actual</TableHead>
                    <TableHead>Variance %</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboard.costings &&
                    dashboard.costings.map((cost: any) => (
                      <TableRow key={cost.id} className={getStatusColor(cost.status)}>
                        <TableCell className="font-medium">
                          {cost.costCategoryId}
                        </TableCell>
                        <TableCell>{cost.budgetAmount} SAR</TableCell>
                        <TableCell>{cost.actualAmount} SAR</TableCell>
                        <TableCell
                          className={
                            parseFloat(cost.variancePercent) > 0
                              ? "text-red-600 font-semibold"
                              : "text-green-600 font-semibold"
                          }
                        >
                          {cost.variancePercent}%
                        </TableCell>
                        <TableCell>{getStatusBadge(cost.status)}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Variance Chart */}
          {dashboard.costings && dashboard.costings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Cost Trend</CardTitle>
                <CardDescription>Budget vs Actual vs Forecast</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={dashboard.costings.map((c: any, idx: number) => ({
                      name: `Item ${idx + 1}`,
                      budget: parseFloat(c.budgetAmount),
                      actual: parseFloat(c.actualAmount),
                      forecast: parseFloat(c.forecastAmount),
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="budget"
                      stroke="#8884d8"
                      name="Budget"
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#82ca9d"
                      name="Actual"
                    />
                    <Line
                      type="monotone"
                      dataKey="forecast"
                      stroke="#ffc658"
                      name="Forecast"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Update Cost Tab */}
      {activeTab === "update" && (
        <Card>
          <CardHeader>
            <CardTitle>Update Cost from Invoice</CardTitle>
            <CardDescription>
              Add actual costs from subcontractor invoices - variance analysis runs automatically
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => updateCost(data))}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="jobCostingDetailId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Costing Item ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ID"
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amountToAdd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (SAR)</FormLabel>
                      <FormControl>
                        <Input placeholder="0.00" type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoiceReference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Reference (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="INV-2024-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    Variance analysis will run automatically. Alerts generated if variance
                    exceeds 10%.
                  </AlertDescription>
                </Alert>

                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Updating..." : "Update Cost"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Alerts Tab */}
      {activeTab === "alerts" && (
        <Card>
          <CardHeader>
            <CardTitle>Cost Variance Alerts</CardTitle>
            <CardDescription>
              Unresolved alerts requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            {alerts && alerts.length > 0 ? (
              <div className="space-y-4">
                {alerts.map((alert: any) => (
                  <Alert
                    key={alert.id}
                    className={
                      alert.alertSeverity === "critical" ? "border-red-600" : ""
                    }
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-semibold">{alert.message}</div>
                      <div className="text-sm mt-1">
                        Threshold: {alert.thresholdPercent}% | Severity:{" "}
                        <Badge
                          variant={
                            alert.alertSeverity === "critical"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {alert.alertSeverity}
                        </Badge>
                      </div>
                      {alert.varianceDetails && (
                        <div className="text-sm mt-2 text-muted-foreground">
                          Reference: {alert.varianceDetails.invoiceReference}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No active alerts. Cost is on track!
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default JobCostingManager;
