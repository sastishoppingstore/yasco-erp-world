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
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

/**
 * HSE KPI DASHBOARD - Phase 1 Sprint 5
 * Safety metrics: TRIFR, LTIFR, incident tracking
 */

export function HseSafetyDashboard() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Queries
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["hseDashboard", selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return null;
      const result = await trpc.hseSafety.getHseDashboard.query({
        projectId: selectedProjectId,
      });
      return result;
    },
    enabled: !!selectedProjectId,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>HSE Safety Dashboard</CardTitle>
          <CardDescription>
            Real-time safety metrics and incident tracking
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

      {dashboard && !isLoading && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-600">
                  {dashboard.latestKpi?.trifr || "0"}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  TRIFR
                </p>
                <p className="text-xs text-muted-foreground">
                  Total Recordable Incidents
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-orange-600">
                  {dashboard.latestKpi?.ltifr || "0"}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  LTIFR
                </p>
                <p className="text-xs text-muted-foreground">
                  Lost Time Incidents
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-red-600">
                  {dashboard.latestKpi?.totalIncidents || 0}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Total Incidents
                </p>
                <p className="text-xs text-muted-foreground">
                  This Period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-green-600">
                  {dashboard.latestKpi?.nearMisses || 0}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Near Misses
                </p>
                <p className="text-xs text-muted-foreground">
                  Preventive Measures
                </p>
              </CardContent>
            </Card>
          </div>

          {/* KPI Trend Chart */}
          {dashboard.historicalKpis && dashboard.historicalKpis.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Safety KPI Trends</CardTitle>
                <CardDescription>TRIFR and LTIFR over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={dashboard.historicalKpis.map((kpi: any) => ({
                      period: new Date(kpi.reportingPeriod).toLocaleDateString(),
                      trifr: parseFloat(kpi.trifr || "0"),
                      ltifr: parseFloat(kpi.ltifr || "0"),
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="trifr"
                      stroke="#3b82f6"
                      name="TRIFR"
                    />
                    <Line
                      type="monotone"
                      dataKey="ltifr"
                      stroke="#f97316"
                      name="LTIFR"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Recent Incidents */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Incidents</CardTitle>
              <CardDescription>Last 10 incidents reported</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboard.recentIncidents && dashboard.recentIncidents.length > 0 ? (
                    dashboard.recentIncidents.map((incident: any) => (
                      <TableRow key={incident.id}>
                        <TableCell>
                          {new Date(incident.incidentDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="capitalize">
                          {incident.incidentType.replace("_", " ")}
                        </TableCell>
                        <TableCell>{incident.location}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              incident.severity === "critical"
                                ? "destructive"
                                : incident.severity === "high"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {incident.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {incident.investigationStatus}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No incidents recorded
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default HseSafetyDashboard;
