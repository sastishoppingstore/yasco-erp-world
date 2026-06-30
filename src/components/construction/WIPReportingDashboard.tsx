import React, { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { WIPData, CostCategory, WIPVarianceAnalysis } from "@/api/lib/wip/wipCalculationEngine";

interface WIPReportingDashboardProps {
  wipData: WIPData;
  costCategories: CostCategory[];
  varianceAnalysis: WIPVarianceAnalysis;
  onExportPDF?: () => void;
  onExportExcel?: () => void;
}

export const WIPReportingDashboard: React.FC<WIPReportingDashboardProps> = ({
  wipData,
  costCategories,
  varianceAnalysis,
  onExportPDF,
  onExportExcel,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Determine health status
  const getHealthStatus = () => {
    if (wipData.losses > 0) return { status: "critical", color: "text-red-600", bg: "bg-red-50" };
    if (wipData.projectedMargin < 5) return { status: "warning", color: "text-yellow-600", bg: "bg-yellow-50" };
    return { status: "healthy", color: "text-green-600", bg: "bg-green-50" };
  };

  const health = getHealthStatus();

  // Prepare chart data
  const costCategoryData = costCategories.map(cat => ({
    name: cat.categoryName,
    budgeted: cat.budgetedAmount,
    incurred: cat.incurredAmount,
    variance: cat.variance,
  }));

  const revenueData = [
    { name: "Gross Contract", value: wipData.grossContractValue },
    { name: "Variations", value: wipData.totalVariations },
    { name: "Claims", value: wipData.totalClaims },
  ];

  const wipTrendData = [
    { period: "Period 1", wip: wipData.wipAmount * 0.4, revenue: wipData.recognizableRevenue * 0.4 },
    { period: "Period 2", wip: wipData.wipAmount * 0.7, revenue: wipData.recognizableRevenue * 0.65 },
    { period: "Period 3", wip: wipData.wipAmount, revenue: wipData.recognizableRevenue },
  ];

  const costBreakdown = [
    { name: "Labor", value: wipData.costsByCategory.labor || 0 },
    { name: "Materials", value: wipData.costsByCategory.materials || 0 },
    { name: "Equipment", value: wipData.costsByCategory.equipment || 0 },
    { name: "Subcontractors", value: wipData.costsByCategory.subcontractors || 0 },
    { name: "Overhead", value: wipData.costsByCategory.overhead || 0 },
  ].filter(item => item.value > 0);

  const COLORS = ["#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6"];

  return (
    <div className="w-full space-y-6">
      {/* Header Summary */}
      <Card className={health.bg}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className={health.color}>
              WIP Report - {format(wipData.reportingDate, "MMMM yyyy")}
            </CardTitle>
            <div className="flex gap-2">
              {onExportPDF && (
                <button
                  onClick={onExportPDF}
                  className="px-3 py-1 text-sm bg-white rounded border hover:bg-slate-50"
                >
                  Export PDF
                </button>
              )}
              {onExportExcel && (
                <button
                  onClick={onExportExcel}
                  className="px-3 py-1 text-sm bg-white rounded border hover:bg-slate-50"
                >
                  Export Excel
                </button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Recognizable Revenue</p>
            <p className="text-2xl font-bold text-blue-600">
              ${wipData.recognizableRevenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-slate-500 mt-2">+${wipData.currentPeriodRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Total Costs Incurred</p>
            <p className="text-2xl font-bold text-slate-700">
              ${wipData.totalCostsIncurred.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {(wipData.totalCostsIncurred / wipData.recognizableRevenue * 100).toFixed(1)}% of revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">WIP Amount</p>
            <p className="text-2xl font-bold text-green-600">
              ${wipData.wipAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-slate-500 mt-2">{wipData.completionPercentage.toFixed(1)}% complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Estimated Profit</p>
            <p className={`text-2xl font-bold ${wipData.estimatedProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${wipData.estimatedProfit.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-slate-500 mt-2">{wipData.projectedMargin.toFixed(1)}% margin</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Est. Cost to Complete</p>
            <p className="text-2xl font-bold text-orange-600">
              ${wipData.estimatedCostToComplete.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-slate-500 mt-2">Remaining work</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="costs">Costs by Category</TabsTrigger>
          <TabsTrigger value="variance">Variance Analysis</TabsTrigger>
          <TabsTrigger value="forecast">Forecasting</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Recognition</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={costBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: $${(value / 1000).toFixed(0)}k`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {costBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>WIP & Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={wipTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="wip" stroke="#10b981" name="WIP Amount" />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Recognized Revenue" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Costs by Category Tab */}
        <TabsContent value="costs">
          <Card>
            <CardHeader>
              <CardTitle>Cost Performance by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={costCategoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="budgeted" fill="#3b82f6" name="Budgeted" />
                  <Bar dataKey="incurred" fill="#ef4444" name="Incurred" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 space-y-2">
                {costCategories.map(cat => (
                  <div key={cat.categoryId} className="flex items-center justify-between p-3 rounded border">
                    <div className="flex-1">
                      <p className="font-medium">{cat.categoryName}</p>
                      <p className="text-sm text-slate-600">
                        ${cat.incurredAmount.toLocaleString()} / ${cat.budgetedAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${cat.variance > 0 ? "text-red-600" : "text-green-600"}`}>
                        {cat.variance > 0 ? "+" : ""}{cat.variance.toLocaleString()}
                      </p>
                      <p className="text-sm text-slate-600">{cat.percentageComplete}% complete</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Variance Analysis Tab */}
        <TabsContent value="variance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  Variance Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">WIP Variance</span>
                  <span className={`font-bold ${varianceAnalysis.wipVariance > 0 ? "text-red-600" : "text-green-600"}`}>
                    {varianceAnalysis.wipVariance > 0 ? "+" : ""}{varianceAnalysis.wipVariance.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Cost Variance</span>
                  <span className={`font-bold ${varianceAnalysis.costVariance > 0 ? "text-red-600" : "text-green-600"}`}>
                    {varianceAnalysis.costVariance > 0 ? "+" : ""}{varianceAnalysis.costVariance.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Schedule Variance</span>
                  <span className={`font-bold ${varianceAnalysis.scheduleVariance > 0 ? "text-red-600" : "text-green-600"}`}>
                    {varianceAnalysis.scheduleVariance > 0 ? "+" : ""}{varianceAnalysis.scheduleVariance.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Revenue Variance</span>
                  <span className={`font-bold ${varianceAnalysis.revenueVariance > 0 ? "text-green-600" : "text-red-600"}`}>
                    {varianceAnalysis.revenueVariance > 0 ? "+" : ""}{varianceAnalysis.revenueVariance.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Variance Explanations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {varianceAnalysis.explanations.length > 0 ? (
                    varianceAnalysis.explanations.map((explanation, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-blue-600 font-bold mt-1">•</span>
                        <span>{explanation}</span>
                      </li>
                    ))
                  ) : (
                    <p className="text-slate-500 text-sm">No significant variances identified</p>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Forecasting Tab */}
        <TabsContent value="forecast">
          <Card>
            <CardHeader>
              <CardTitle>Project Forecast</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded border">
                  <p className="text-sm text-slate-600">Est. Total Cost</p>
                  <p className="text-2xl font-bold">
                    ${wipData.estimatedTotalCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="p-4 rounded border">
                  <p className="text-sm text-slate-600">Est. Total Profit</p>
                  <p className={`text-2xl font-bold ${wipData.estimatedProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                    ${wipData.estimatedProfit.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="p-4 rounded border">
                  <p className="text-sm text-slate-600">Projected Margin</p>
                  <p className={`text-2xl font-bold ${wipData.projectedMargin >= 10 ? "text-green-600" : "text-yellow-600"}`}>
                    {wipData.projectedMargin.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded border">
                <h4 className="font-semibold mb-2">Forecast Summary</h4>
                <ul className="text-sm space-y-1 text-slate-700">
                  <li>• Budget Variance: {wipData.budgetVariance > 0 ? "+" : ""}{wipData.budgetVariance.toFixed(1)}%</li>
                  <li>• Schedule Variance: {wipData.scheduleVariance > 0 ? "+" : ""}{wipData.scheduleVariance.toFixed(1)}%</li>
                  <li>• Cost to Complete: ${wipData.estimatedCostToComplete.toLocaleString()}</li>
                  {wipData.losses > 0 && (
                    <li className="text-red-600">• Loss Provision: ${wipData.losses.toLocaleString()}</li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WIPReportingDashboard;
