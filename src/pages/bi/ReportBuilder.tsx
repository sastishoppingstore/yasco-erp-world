import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import {
  FileText, Plus, Save, Play, Download, Settings,
  Trash2, GripVertical, Filter, SortAsc, Group,
  BarChart3, Table2, Loader2, Clock, Mail,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useLanguage } from "@/providers/language";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportBuilderPage() {
  const { language, dir } = useLanguage();
  const rtl = language === "ar";
  const [selectedModule, setSelectedModule] = useState("sales");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [filters, setFilters] = useState<any[]>([]);
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [groupField, setGroupField] = useState("");
  const [reportName, setReportName] = useState("");
  const [results, setResults] = useState<{ columns: string[]; rows: any[][] } | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);

  const modules = trpc.reportBuilder.modules.useQuery(undefined);
  const execute = trpc.reportBuilder.execute.useMutation();
  const saveRpt = trpc.reportBuilder.save.useMutation();
  const savedReports = trpc.reportBuilder.list.useQuery(undefined);
  const deleteRpt = trpc.reportBuilder.delete.useMutation();

  const moduleData = modules.data?.find(m => m.key === selectedModule);

  const toggleColumn = (field: string) => {
    setSelectedColumns(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field],
    );
  };

  const handleExecute = useCallback(async () => {
    const result = await execute.mutateAsync({
      module: selectedModule,
      columnsConfig: selectedColumns.map(f => ({
        field: f,
        label: moduleData?.columns.find(c => c.field === f)?.label || f,
      })),
      filtersConfig: filters,
      sortConfig: sortField ? { field: sortField, direction: sortDirection } : undefined,
      groupConfig: groupField ? { field: groupField } : undefined,
    });
    setResults(result);
  }, [selectedModule, selectedColumns, filters, sortField, sortDirection, groupField]);

  const handleSave = useCallback(async () => {
    if (!reportName.trim() || !results) return;
    await saveRpt.mutateAsync({
      name: reportName,
      module: selectedModule,
      columnsConfig: selectedColumns.map(f => ({
        field: f,
        label: moduleData?.columns.find(c => c.field === f)?.label || f,
      })),
      filtersConfig: filters,
      sortConfig: sortField ? { field: sortField, direction: sortDirection } : undefined,
      groupConfig: groupField ? { field: groupField } : undefined,
    });
    setReportName("");
    savedReports.refetch();
  }, [reportName, selectedModule, selectedColumns, filters, sortField, sortDirection, groupField, results]);

  const exportPDF = useCallback(() => {
    if (!results) return;
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(16);
    doc.text(reportName || "Report", 14, 20);
    autoTable(doc, {
      head: [results.columns],
      body: results.rows,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
    });
    doc.save("report.pdf");
  }, [results, reportName]);

  const exportExcel = useCallback(() => {
    if (!results) return;
    const wb = XLSX.utils.book_new();
    const data = [results.columns, ...results.rows];
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    saveAs(new Blob([buf]), "report.xlsx");
  }, [results]);

  return (
    <div className="space-y-6" dir={dir}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="size-6 text-blue-600" />
            {rtl ? "منشئ التقارير" : "Report Builder"}
          </h2>
          <p className="text-slate-500">{rtl ? "تصميم تقارير مخصصة بالسحب والإفلات" : "Design custom reports with drag-and-drop"}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{rtl ? "الوحدة" : "Module"}</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedModule} onValueChange={(v) => { setSelectedModule(v); setSelectedColumns([]); setResults(null); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {modules.data?.map((m: any) => (
                    <SelectItem key={m.key} value={m.key}>{m.key}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Table2 className="size-4" />
                {rtl ? "الأعمدة" : "Columns"}
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-64 overflow-y-auto space-y-1">
              {moduleData?.columns.map((col: any) => (
                <div
                  key={col.field}
                  className={`p-2 rounded text-sm cursor-pointer transition-colors ${selectedColumns.includes(col.field) ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100"}`}
                  onClick={() => toggleColumn(col.field)}
                >
                  {col.label}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Filter className="size-4" />
                {rtl ? "عوامل التصفية" : "Filters"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {moduleData?.columns.slice(0, 3).map((col: any) => (
                <div key={col.field} className="flex gap-2 text-sm">
                  <Select>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={col.label} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eq">=</SelectItem>
                      <SelectItem value="gt">&gt;</SelectItem>
                      <SelectItem value="lt">&lt;</SelectItem>
                      <SelectItem value="contains">{rtl ? "يحتوي" : "Contains"}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input className="h-8 text-xs w-20" placeholder={rtl ? "قيمة" : "Value"} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <SortAsc className="size-4" />
                {rtl ? "الترتيب" : "Sort"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Select value={sortField} onValueChange={setSortField}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder={rtl ? "حقل الترتيب" : "Sort field"} />
                </SelectTrigger>
                <SelectContent>
                  {moduleData?.columns.map((col: any) => (
                    <SelectItem key={col.field} value={col.field}>{col.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {sortField && (
                <Select value={sortDirection} onValueChange={(v: any) => setSortDirection(v)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">{rtl ? "تصاعدي" : "Ascending"} ↑</SelectItem>
                    <SelectItem value="desc">{rtl ? "تنازلي" : "Descending"} ↓</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          <Button className="w-full" onClick={handleExecute} disabled={selectedColumns.length === 0 || execute.isPending}>
            {execute.isPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Play className="size-4 mr-2" />}
            {rtl ? "تشغيل التقرير" : "Run Report"}
          </Button>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{rtl ? "معاينة النتائج" : "Preview Results"}</CardTitle>
                {results && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={exportPDF}>
                      <Download className="size-3 mr-1" />PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportExcel}>
                      <Download className="size-3 mr-1" />Excel
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {execute.isPending ? (
                <div className="p-12 text-center">
                  <Loader2 className="size-6 mx-auto animate-spin text-slate-400" />
                </div>
              ) : results ? (
                <div className="overflow-x-auto border rounded-lg max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        {results.columns.map((h, i) => <TableHead key={i} className="font-semibold whitespace-nowrap text-xs">{h}</TableHead>)}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.rows.slice(0, 100).map((row, ri) => (
                        <TableRow key={ri}>
                          {row.map((cell, ci) => <TableCell key={ci} className="whitespace-nowrap text-xs">{String(cell ?? "")}</TableCell>)}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {results.rows.length > 100 && (
                    <p className="p-2 text-xs text-center text-slate-400">
                      {rtl ? `عرض أول 100 من ${results.rows.length} صف` : `Showing first 100 of ${results.rows.length} rows`}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400">
                  <Table2 className="size-12 mx-auto mb-3 opacity-30" />
                  <p>{rtl ? "اختر الأعمدة واضغط تشغيل" : "Select columns and run report"}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Input
              value={reportName}
              onChange={e => setReportName(e.target.value)}
              placeholder={rtl ? "اسم التقرير" : "Report name"}
              className="max-w-xs"
            />
            <Button onClick={handleSave} disabled={!reportName.trim() || !results}>
              <Save className="size-4 mr-2" />{rtl ? "حفظ" : "Save"}
            </Button>
          </div>

          {savedReports.data && savedReports.data.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{rtl ? "التقارير المحفوظة" : "Saved Reports"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {savedReports.data.map((rpt: any) => (
                  <div key={rpt.id} className="flex items-center justify-between p-2 rounded hover:bg-slate-50 text-sm">
                    <span>{rpt.name}</span>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-[10px]">{rpt.module}</Badge>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => deleteRpt.mutateAsync({ id: rpt.id }).then(() => savedReports.refetch())}>
                        <Trash2 className="size-3 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
