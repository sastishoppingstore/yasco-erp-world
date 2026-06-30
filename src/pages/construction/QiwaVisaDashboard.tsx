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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

/**
 * QIWA VISA DASHBOARD - Phase 1 Sprint 4
 * Visa quota tracking and worker visa status
 */

export function QiwaVisaDashboard() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Query visa quotas
  const { data: quotaData } = useQuery({
    queryKey: ["visaQuotas", selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return null;
      const result = await trpc.qiwa.getVisaQuotas.query({
        projectId: selectedProjectId,
      });
      return result;
    },
    enabled: !!selectedProjectId,
  });

  // Query visa expiry alerts
  const { data: alertsData } = useQuery({
    queryKey: ["visaExpiryAlerts", selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return [];
      const result = await trpc.qiwa.getVisaExpiryAlerts.query({
        projectId: selectedProjectId,
      });
      return result;
    },
    enabled: !!selectedProjectId,
  });

  // Query compliance status
  const { data: complianceData } = useQuery({
    queryKey: ["qiwaCompliance", selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return null;
      const result = await trpc.qiwa.checkComplianceStatus.query({
        projectId: selectedProjectId,
      });
      return result;
    },
    enabled: !!selectedProjectId,
  });

  // Acknowledge alert mutation
  const { mutate: acknowledgeAlert } = useMutation({
    mutationFn: async (alertId: number) => {
      await trpc.qiwa.acknowledgeVisaAlert.mutate({ alertId });
    },
    onSuccess: () => {
      toast.success("Alert acknowledged");
    },
  });

  const getExpiryBadge = (days: number) => {
    if (days <= 0) return <Badge variant="destructive">Expired</Badge>;
    if (days <= 7) return <Badge variant="destructive">Critical ({days} days)</Badge>;
    if (days <= 30) return <Badge variant="outline">Warning ({days} days)</Badge>;
    return <Badge variant="secondary">Valid ({days} days)</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Qiwa Visa Management</CardTitle>
          <CardDescription>
            Labor Ministry visa quota and worker status tracking
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
          <Button className="mt-2">Sync from Qiwa</Button>
        </CardContent>
      </Card>

      {selectedProjectId && complianceData && (
        <>
          {/* Compliance Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold">Overall Status</span>
                  {complianceData.status === "compliant" ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <Badge
                  variant={
                    complianceData.status === "compliant"
                      ? "default"
                      : "destructive"
                  }
                >
                  {complianceData.status.toUpperCase()}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-semibold mb-2">Expired Visas</p>
                <p className="text-2xl font-bold text-red-600">
                  {complianceData.expiredVisaCount}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-semibold mb-2">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-600">
                  {complianceData.expiringVisaCount}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  (30 days)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Visa Quota Chart */}
          {quotaData && quotaData.quotas && quotaData.quotas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Visa Quota Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={quotaData.quotas.map((q: any) => ({
                      category: q.skillCategory,
                      total: q.totalQuota,
                      used: q.usedQuota,
                      available: q.availableQuota,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="used" stackId="a" fill="#ef4444" name="Used" />
                    <Bar
                      dataKey="available"
                      stackId="a"
                      fill="#10b981"
                      name="Available"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Quota Table */}
          {quotaData && quotaData.quotas && (
            <Card>
              <CardHeader>
                <CardTitle>Quota by Skill Category</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Skill Category</TableHead>
                      <TableHead>Total Quota</TableHead>
                      <TableHead>Used</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Utilization %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotaData.quotas.map((quota: any) => {
                      const utilization = (
                        (quota.usedQuota / quota.totalQuota) *
                        100
                      ).toFixed(1);
                      return (
                        <TableRow key={quota.id}>
                          <TableCell className="font-medium">
                            {quota.skillCategory}
                          </TableCell>
                          <TableCell>{quota.totalQuota}</TableCell>
                          <TableCell
                            className={
                              quota.usedQuota > quota.totalQuota * 0.8
                                ? "text-red-600 font-semibold"
                                : ""
                            }
                          >
                            {quota.usedQuota}
                          </TableCell>
                          <TableCell
                            className={
                              quota.availableQuota < 5
                                ? "text-orange-600 font-semibold"
                                : ""
                            }
                          >
                            {quota.availableQuota}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                parseFloat(utilization) > 90
                                  ? "destructive"
                                  : parseFloat(utilization) > 75
                                  ? "outline"
                                  : "secondary"
                              }
                            >
                              {utilization}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Visa Expiry Alerts */}
          {alertsData && alertsData.alerts && alertsData.alerts.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-700">
                  Visa Expiry Alerts ({alertsData.alerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {alertsData.alerts.map((alert: any) => (
                  <Alert
                    key={alert.id}
                    className={
                      alert.daysUntilExpiry <= 7
                        ? "border-red-600 bg-red-50"
                        : "border-yellow-600 bg-yellow-50"
                    }
                  >
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-semibold">
                        Employee {alert.employeeId}
                      </div>
                      <div className="text-sm mt-1">
                        Visa expires in{" "}
                        <span className="font-bold">
                          {alert.daysUntilExpiry} days
                        </span>
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

          {/* Compliance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Total Workers</p>
                <p className="text-2xl font-bold">
                  {complianceData.totalWorkers}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Visas</p>
                <p className="text-2xl font-bold text-green-600">
                  {complianceData.totalWorkers -
                    complianceData.expiredVisaCount -
                    complianceData.expiringVisaCount}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Expiring (30d)</p>
                <p className="text-2xl font-bold text-orange-600">
                  {complianceData.expiringVisaCount}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold text-red-600">
                  {complianceData.expiredVisaCount}
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default QiwaVisaDashboard;
