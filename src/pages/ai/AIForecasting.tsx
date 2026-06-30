import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Area, ComposedChart, Bar,
} from "recharts";
import { trpc } from "@/providers/trpc";
import {
  TrendingUp, DollarSign, Package, RefreshCw, Loader2,
  TrendingDown, BarChart3, Calendar,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/providers/language";

const FORECAST_COLORS = { historical: "#2563eb", forecast: "#f59e0b", lower: "#fef3c7", upper: "#fef3c7" };

export default function AIForecastingPage() {
  const { language, dir } = useLanguage();
  const rtl = language === "ar";
  const [forecastType, setForecastType] = useState("sales");
  const [periods, setPeriods] = useState("6");

  const salesFc = trpc.aiForecasting.sales.useMutation();
  const demandFc = trpc.aiForecasting.demand.useMutation();
  const cashflowFc = trpc.aiForecasting.cashflow.useMutation();
  const reorderFc = trpc.aiForecasting.reorderPoints.useMutation();

  const runForecast = useCallback(async () => {
    switch (forecastType) {
      case "sales":
        await salesFc.mutateAsync({ forecastPeriods: parseInt(periods) });
        break;
      case "demand":
        await demandFc.mutateAsync({ forecastPeriods: parseInt(periods) });
        break;
      case "cashflow":
        await cashflowFc.mutateAsync({ forecastPeriods: parseInt(periods) });
        break;
      case "reorder":
        await reorderFc.mutateAsync({});
        break;
    }
  }, [forecastType, periods]);

  const currentMutation = forecastType === "sales" ? salesFc : forecastType === "demand" ? demandFc : forecastType === "cashflow" ? cashflowFc : reorderFc;
  const isRunning = currentMutation.isPending;

  const renderSalesChart = () => {
    const data = salesFc.data?.data;
    if (!data) return null;
    const combined: any[] = [];
    (data.historical || []).forEach((h: any) => combined.push({ month: h.month, historical: Number(h.total), forecast: null, lower: null, upper: null }));
    (data.forecast?.periods || []).forEach((p: string, i: number) => {
      combined.push({ month: p, historical: null, forecast: data.forecast.values[i], lower: data.forecast.lower[i], upper: data.forecast.upper[i] });
    });
    return (
      <div>
        <div className="flex gap-3 mb-4">
          <Badge variant="outline" className="text-blue-600 border-blue-200">Confidence: {(data.forecast?.confidence * 100).toFixed(0)}%</Badge>
          <Badge variant="outline" className="text-amber-600 border-amber-200">
            Seasonality: {data.seasonality?.periods?.length || 0} periods
          </Badge>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={combined}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="upper" fill="#fef3c7" stroke="none" />
            <Area type="monotone" dataKey="lower" fill="#fef3c7" stroke="none" />
            <Bar dataKey="historical" fill="#2563eb" radius={[2, 2, 0, 0]} name="Historical" />
            <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b" }} name="Forecast" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderCashflowChart = () => {
    const data = cashflowFc.data?.data;
    if (!data) return null;
    const combined: any[] = [];
    (data.historical || []).forEach((h: any) => combined.push({ month: h.month, inflow: h.inflow, outflow: h.outflow, net: h.net, forecast: null }));
    (data.forecast?.periods || []).forEach((p: string, i: number) => {
      combined.push({ month: p, inflow: null, outflow: null, net: null, forecast: data.forecast.netCashflow[i] });
    });
    return (
      <div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card><CardContent className="p-3 text-center"><p className="text-xs text-slate-500">{rtl ? "الرصيد الحالي" : "Current Balance"}</p><p className="text-lg font-bold text-green-600">{Number(data.currentCashBalance).toLocaleString()} SAR</p></CardContent></Card>
          <Card><CardContent className="p-3 text-center"><p className="text-xs text-slate-500">{rtl ? "الثقة" : "Confidence"}</p><p className="text-lg font-bold">{(data.forecast?.confidence * 100).toFixed(0)}%</p></CardContent></Card>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={combined}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="inflow" fill="#10b981" name="Inflow" />
            <Bar dataKey="outflow" fill="#ef4444" name="Outflow" />
            <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b" }} name="Forecast Net" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderDemandTable = () => {
    const data = demandFc.data?.data;
    if (!data || data.length === 0) return null;
    return (
      <div className="space-y-4">
        {data.map((product: any) => (
          <Card key={product.productId}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{product.productName}</CardTitle>
                <Badge variant="secondary">Confidence: {(product.forecast?.confidence * 100).toFixed(0)}%</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={[
                  ...(product.historical || []).map((h: any) => ({ month: h.month, actual: h.qty, forecast: null })),
                  ...(product.forecast?.periods || []).map((p: string, i: number) => ({ month: p, actual: null, forecast: product.forecast.qty[i] })),
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={2} name="Actual" dot={false} />
                  <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name="Forecast" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderReorderTable = () => {
    const data = reorderFc.data?.data;
    if (!data) return null;
    return (
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="p-2 text-left font-semibold">{rtl ? "المنتج" : "Product"}</th>
              <th className="p-2 text-left font-semibold">{rtl ? "المخزون" : "Stock"}</th>
              <th className="p-2 text-left font-semibold">{rtl ? "الطلب الشهري" : "Monthly Demand"}</th>
              <th className="p-2 text-left font-semibold">{rtl ? "نقطة إعادة الطلب" : "Reorder Point"}</th>
              <th className="p-2 text-left font-semibold">{rtl ? "أيام حتى نفاد المخزون" : "Days Until Stockout"}</th>
              <th className="p-2 text-left font-semibold">{rtl ? "الحالة" : "Status"}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: any) => (
              <tr key={item.productId} className="border-t hover:bg-slate-50">
                <td className="p-2 font-medium">{item.productName}</td>
                <td className="p-2">{item.currentQty}</td>
                <td className="p-2">{item.avgMonthlyDemand.toFixed(1)}</td>
                <td className="p-2 font-semibold">{item.suggestedReorderPoint}</td>
                <td className={`p-2 ${item.daysUntilStockout < 30 ? "text-red-600 font-semibold" : "text-slate-600"}`}>
                  {item.daysUntilStockout > 365 ? "365+" : item.daysUntilStockout}
                </td>
                <td className="p-2">
                  <Badge variant={item.currentQty <= item.suggestedReorderPoint ? "destructive" : "secondary"}>
                    {item.currentQty <= item.suggestedReorderPoint ? (rtl ? "طلب" : "Reorder") : (rtl ? "جيد" : "OK")}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6" dir={dir}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="size-6 text-blue-600" />
            {rtl ? "التنبؤات الذكية" : "AI Forecasting"}
          </h2>
          <p className="text-slate-500">{rtl ? "تحليل تنبؤي للمبيعات والمخزون والتدفقات النقدية" : "Predictive analytics for sales, inventory, and cash flow"}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="w-48">
              <Label>{rtl ? "نوع التنبؤ" : "Forecast Type"}</Label>
              <Select value={forecastType} onValueChange={setForecastType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales"><TrendingUp className="size-4 mr-2" />{rtl ? "تنبؤ المبيعات" : "Sales Forecast"}</SelectItem>
                  <SelectItem value="demand"><Package className="size-4 mr-2" />{rtl ? "تنبؤ الطلب" : "Demand Forecast"}</SelectItem>
                  <SelectItem value="cashflow"><DollarSign className="size-4 mr-2" />{rtl ? "التدفق النقدي" : "Cash Flow"}</SelectItem>
                  <SelectItem value="reorder"><RefreshCw className="size-4 mr-2" />{rtl ? "نقاط إعادة الطلب" : "Reorder Points"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {forecastType !== "reorder" && (
              <div className="w-32">
                <Label>{rtl ? "عدد الفترات" : "Periods"}</Label>
                <Select value={periods} onValueChange={setPeriods}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[3, 6, 12, 24].map(p => <SelectItem key={p} value={String(p)}>{p} {rtl ? "أشهر" : "months"}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button onClick={runForecast} disabled={isRunning}>
              {isRunning ? <Loader2 className="size-4 mr-2 animate-spin" /> : <BarChart3 className="size-4 mr-2" />}
              {rtl ? "تشغيل التنبؤ" : "Run Forecast"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {forecastType === "sales" && renderSalesChart()}
      {forecastType === "cashflow" && renderCashflowChart()}
      {forecastType === "demand" && renderDemandTable()}
      {forecastType === "reorder" && renderReorderTable()}

      {!currentMutation.data && !isRunning && (
        <Card>
          <CardContent className="p-12 text-center text-slate-400">
            <TrendingUp className="size-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">{rtl ? "اختر نوع التنبؤ واضغط تشغيل" : "Select forecast type and run"}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
