import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import { trpc } from "@/providers/trpc";
import {
  Bot, Send, History, Download, FileText, FileSpreadsheet,
  Loader2, Sparkles, MessageSquare, Trash2, Save,
} from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/providers/language";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#f97316"];

const SUGGESTED_QUERIES = [
  "Show top 10 selling products",
  "Sales summary for this month",
  "Customer aging report",
  "Inventory status",
  "Low stock items",
  "Profit analysis by month",
  "Expense breakdown",
];

export default function AIReportsPage() {
  const { language, dir } = useLanguage();
  const rtl = language === "ar";
  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [activeTab, setActiveTab] = useState("generate");

  const generate = trpc.aiReports.generate.useMutation();
  const savedQuery = trpc.aiReports.saved.useQuery(undefined);
  const deleteReport = trpc.aiReports.delete.useMutation();

  const handleGenerate = useCallback(async () => {
    if (!query.trim()) return;
    await generate.mutateAsync({ query, fromDate: fromDate || undefined, toDate: toDate || undefined, language });
  }, [query, fromDate, toDate, language]);

  const exportPDF = useCallback(() => {
    if (!generate.data?.data) return;
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(16);
    doc.text(`AI Report: ${generate.data.intent}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Query: ${query}`, 14, 28);
    const data = generate.data.data;
    if (Array.isArray(data) && data.length > 0) {
      const headers = Object.keys(data[0]);
      const rows = data.map((r: any) => headers.map((h) => String(r[h] || "")));
      autoTable(doc, { head: [headers], body: rows, startY: 35, styles: { fontSize: 8 }, headStyles: { fillColor: [37, 99, 235] } });
    }
    doc.save("ai-report.pdf");
  }, [generate.data, query]);

  const exportExcel = useCallback(() => {
    if (!generate.data?.data) return;
    const data = generate.data.data;
    if (!Array.isArray(data)) return;
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    saveAs(new Blob([buf]), "ai-report.xlsx");
  }, [generate.data]);

  const renderChart = () => {
    const data = generate.data;
    if (!data?.data || !Array.isArray(data.data) || data.data.length === 0) return null;
    const chartType = data.chartType || "table";
    const chartData = data.data;

    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey={Object.keys(chartData[0])[0]} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              {Object.keys(chartData[0]).filter(k => k !== Object.keys(chartData[0])[0]).map((key, i) => (
                <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" outerRadius={120} dataKey="total" nameKey={Object.keys(chartData[0])[0]} label>
                {chartData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      case "line":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey={Object.keys(chartData[0])[0]} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              {Object.keys(chartData[0]).filter(k => k !== Object.keys(chartData[0])[0]).map((key, i) => (
                <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={2} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  const renderTable = () => {
    const data = generate.data?.data;
    if (!data || !Array.isArray(data) || data.length === 0) return null;
    const headers = Object.keys(data[0]);
    return (
      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {headers.map((h, i) => (
                <TableHead key={i} className="font-semibold whitespace-nowrap">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row: any, ri: number) => (
              <TableRow key={ri}>
                {headers.map((h, ci) => (
                  <TableCell key={ci} className="whitespace-nowrap">{String(row[h] ?? "")}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-6" dir={dir}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="size-6 text-blue-600" />
            {rtl ? "التقارير الذكية" : "AI Reports"}
          </h2>
          <p className="text-slate-500">{rtl ? "إنشاء تقارير باللغة الطبيعية" : "Generate reports using natural language"}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="generate"><Bot className="size-4 mr-2" />{rtl ? "إنشاء" : "Generate"}</TabsTrigger>
          <TabsTrigger value="history"><History className="size-4 mr-2" />{rtl ? "السجل" : "History"}</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label>{rtl ? "أدخل استفسارك" : "Enter your query"}</Label>
                  <div className="flex gap-2 mt-1">
                    <Textarea
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder={rtl ? "مثال: اعرض أعلى 5 منتجات مبيعاً الشهر الماضي" : "e.g. Show top 5 selling products last month"}
                      className="min-h-[60px] flex-1"
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_QUERIES.map(sq => (
                    <Badge key={sq} variant="outline" className="cursor-pointer hover:bg-blue-50 hover:text-blue-700" onClick={() => setQuery(sq)}>
                      {sq}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3 items-end">
                  <div className="w-44">
                    <Label>{rtl ? "من تاريخ" : "From Date"}</Label>
                    <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="mt-1" />
                  </div>
                  <div className="w-44">
                    <Label>{rtl ? "إلى تاريخ" : "To Date"}</Label>
                    <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="mt-1" />
                  </div>
                  <Button onClick={handleGenerate} disabled={generate.isPending || !query.trim()}>
                    {generate.isPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Send className="size-4 mr-2" />}
                    {rtl ? "توليد التقرير" : "Generate Report"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {generate.isPending && (
            <Card>
              <CardContent className="p-12 text-center">
                <Loader2 className="size-8 mx-auto animate-spin text-blue-600 mb-3" />
                <p className="text-slate-500">{rtl ? "جاري تحليل الاستفسار وإنشاء التقرير..." : "Analyzing query and generating report..."}</p>
              </CardContent>
            </Card>
          )}

          {generate.data?.success === false && (
            <Card>
              <CardContent className="p-6">
                <p className="text-amber-600">{generate.data.message}</p>
                {generate.data.aiSuggestion && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg text-sm text-slate-600">
                    <p className="font-medium mb-1">{rtl ? "اقتراح AI:" : "AI Suggestion:"}</p>
                    <p>{generate.data.aiSuggestion}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {generate.data?.success && generate.data.data && (
            <>
              {generate.data.naturalResponse && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4 flex items-start gap-3">
                    <MessageSquare className="size-5 text-blue-600 mt-0.5" />
                    <p className="text-sm text-blue-800">{generate.data.naturalResponse}</p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="pb-2 flex-row items-center justify-between">
                  <CardTitle className="text-base capitalize">{generate.data.intent}</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={exportPDF}><FileText className="size-4 mr-1" />PDF</Button>
                    <Button variant="outline" size="sm" onClick={exportExcel}><FileSpreadsheet className="size-4 mr-1" />Excel</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {renderChart()}
                  <div className="mt-4">
                    {renderTable()}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardContent className="p-4">
              {savedQuery.isLoading ? (
                <div className="p-8 text-center"><Loader2 className="size-6 mx-auto animate-spin text-slate-400" /></div>
              ) : (savedQuery.data?.length || 0) === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <History className="size-12 mx-auto mb-3 opacity-30" />
                  <p>{rtl ? "لا توجد تقارير محفوظة" : "No saved reports yet"}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {savedQuery.data?.map((rpt: any) => (
                    <div key={rpt.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{rpt.naturalLanguageQuery}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">{rpt.parsedIntent}</Badge>
                          <span className="text-xs text-slate-400">{new Date(rpt.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteReport.mutate({ id: rpt.id })}>
                        <Trash2 className="size-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
