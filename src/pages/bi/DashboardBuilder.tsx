import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/providers/trpc";
import {
  LayoutDashboard, Plus, Save, Eye, Settings, Trash2, GripVertical,
  BarChart3, PieChart, LineChart, Table2, Activity, Gauge,
  Loader2, Copy, Download, Share2,
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
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart as RPieChart, Pie, Cell, Legend,
  LineChart as RLineChart, Line,
} from "recharts";
import { useLanguage } from "@/providers/language";

const WIDGET_ICONS: Record<string, any> = {
  line_chart: LineChart, bar_chart: BarChart3, pie_chart: PieChart,
  table: Table2, kpi_card: Activity, gauge: Gauge,
};

const WIDGET_NAMES: Record<string, { en: string; ar: string }> = {
  line_chart: { en: "Line Chart", ar: "رسم بياني خطي" },
  bar_chart: { en: "Bar Chart", ar: "رسم بياني شريطي" },
  pie_chart: { en: "Pie Chart", ar: "رسم دائري" },
  table: { en: "Table", ar: "جدول" },
  kpi_card: { en: "KPI Card", ar: "بطاقة مؤشر" },
  gauge: { en: "Gauge", ar: "مقياس" },
};

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function DashboardBuilderPage() {
  const { language, dir } = useLanguage();
  const rtl = language === "ar";
  const [selectedDashboard, setSelectedDashboard] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTemplate, setNewTemplate] = useState("");
  const [showAddWidget, setShowAddWidget] = useState(false);

  const dashboards = trpc.dashboardBuilder.list.useQuery(undefined);
  const dashboardDetail = trpc.dashboardBuilder.getById.useQuery(
    { id: selectedDashboard! },
    { enabled: !!selectedDashboard },
  );
  const createDash = trpc.dashboardBuilder.create.useMutation();
  const deleteDash = trpc.dashboardBuilder.delete.useMutation();
  const addWidget = trpc.dashboardBuilder.addWidget.useMutation();
  const deleteWidget = trpc.dashboardBuilder.deleteWidget.useMutation();
  const duplicateDash = trpc.dashboardBuilder.duplicate.useMutation();
  const updateDash = trpc.dashboardBuilder.update.useMutation();
  const executeWidget = trpc.dashboardBuilder.executeWidget.useMutation();

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return;
    const result = await createDash.mutateAsync({
      name: newName,
      templateKey: newTemplate || undefined,
    });
    if (result.id) {
      setSelectedDashboard(result.id);
      setShowNewDialog(false);
      setNewName("");
      dashboards.refetch();
    }
  }, [newName, newTemplate]);

  const handleAddWidget = useCallback(async (widgetType: string) => {
    if (!selectedDashboard) return;
    await addWidget.mutateAsync({
      dashboardId: selectedDashboard,
      widgetType: widgetType as any,
      title: rtl ? WIDGET_NAMES[widgetType]?.ar || widgetType : WIDGET_NAMES[widgetType]?.en || widgetType,
      dataSource: { metricKey: "total_revenue" },
      positionX: 0, positionY: (dashboardDetail.data?.widgets?.length || 0) * 3,
      width: 4, height: 3,
    });
    dashboardDetail.refetch();
    setShowAddWidget(false);
  }, [selectedDashboard, dashboardDetail.data]);

  const renderWidget = (widget: any) => {
    return (
      <div
        key={widget.id}
        className="border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow relative group"
        style={{ gridColumn: `span ${widget.width}`, gridRow: `span ${widget.height}` }}
      >
        <div className="flex items-center justify-between p-2 border-b bg-slate-50 rounded-t-lg">
          <span className="text-sm font-medium truncate">{widget.title}</span>
          {editMode && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => deleteWidget.mutateAsync({ id: widget.id }).then(() => dashboardDetail.refetch())}>
                <Trash2 className="size-3 text-red-500" />
              </Button>
            </div>
          )}
        </div>
        <div className="p-2" style={{ height: widget.height * 80 - 40 }}>
          {widget.widgetType === "kpi_card" && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">--</p>
                <p className="text-xs text-slate-500 mt-1">{widget.title}</p>
              </div>
            </div>
          )}
          {widget.widgetType === "bar_chart" && (
            <div className="flex items-center justify-center h-full text-slate-400">
              <BarChart3 className="size-8 mr-2 opacity-40" />
              <span className="text-sm">Bar chart — connect a data source</span>
            </div>
          )}
          {widget.widgetType === "line_chart" && (
            <div className="flex items-center justify-center h-full text-slate-400">
              <LineChart className="size-8 mr-2 opacity-40" />
              <span className="text-sm">Line chart — connect a data source</span>
            </div>
          )}
          {widget.widgetType === "pie_chart" && (
            <div className="flex items-center justify-center h-full text-slate-400">
              <PieChartIcon className="size-8 mr-2 opacity-40" />
              <span className="text-sm">Pie chart — connect a data source</span>
            </div>
          )}
          {widget.widgetType === "table" && (
            <div className="text-sm text-slate-400 flex items-center justify-center h-full">
              <Table2 className="size-8 mr-2 opacity-30" />
              {rtl ? "بيانات الجدول" : "Table Data"}
            </div>
          )}
          {widget.widgetType === "gauge" && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl mb-1">🎯</div>
                <p className="text-xs text-slate-500">{widget.title}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6" dir={dir}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <LayoutDashboard className="size-6 text-blue-600" />
            {rtl ? "منشئ لوحات القيادة" : "Dashboard Builder"}
          </h2>
        </div>
        <div className="flex gap-2">
          <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
            <DialogTrigger asChild>
              <Button><Plus className="size-4 mr-2" />{rtl ? "لوحة جديدة" : "New Dashboard"}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{rtl ? "إنشاء لوحة قيادة جديدة" : "Create New Dashboard"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>{rtl ? "الاسم" : "Name"}</Label>
                  <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder={rtl ? "اسم لوحة القيادة" : "Dashboard name"} />
                </div>
                <div>
                  <Label>{rtl ? "قالب" : "Template"}</Label>
                  <Select value={newTemplate} onValueChange={setNewTemplate}>
                    <SelectTrigger><SelectValue placeholder={rtl ? "اختر قالباً" : "Choose a template"} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{rtl ? "فارغ" : "Blank"}</SelectItem>
                      <SelectItem value="executive">{rtl ? "تنفيذي" : "Executive"}</SelectItem>
                      <SelectItem value="sales">{rtl ? "مبيعات" : "Sales"}</SelectItem>
                      <SelectItem value="finance">{rtl ? "مالية" : "Finance"}</SelectItem>
                      <SelectItem value="inventory">{rtl ? "مخزون" : "Inventory"}</SelectItem>
                      <SelectItem value="hr">{rtl ? "موارد بشرية" : "HR"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreate} className="w-full" disabled={!newName.trim()}>
                  <Save className="size-4 mr-2" />{rtl ? "إنشاء" : "Create"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="w-64 shrink-0 space-y-2">
          <p className="text-sm font-medium text-slate-500 mb-2">{rtl ? "لوحات القيادة" : "Dashboards"}</p>
          <div className="space-y-1">
            {dashboards.data?.map((d: any) => (
              <div
                key={d.id}
                className={`p-3 rounded-lg cursor-pointer border transition-colors ${selectedDashboard === d.id ? "bg-blue-50 border-blue-200" : "hover:bg-slate-50"}`}
                onClick={() => setSelectedDashboard(d.id)}
              >
                <p className="text-sm font-medium truncate">{d.name}</p>
                <div className="flex gap-1 mt-1">
                  {d.isDefault && <Badge variant="secondary" className="text-[10px]">{rtl ? "افتراضي" : "Default"}</Badge>}
                  {d.templateKey && <Badge variant="outline" className="text-[10px]">{d.templateKey}</Badge>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1">
          {!selectedDashboard ? (
            <Card>
              <CardContent className="p-12 text-center text-slate-400">
                <LayoutDashboard className="size-12 mx-auto mb-3 opacity-30" />
                <p className="text-lg font-medium">{rtl ? "اختر لوحة قيادة أو أنشئ واحدة" : "Select or create a dashboard"}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{dashboardDetail.data?.name}</h3>
                  {dashboardDetail.data?.description && <p className="text-sm text-slate-500">{dashboardDetail.data.description}</p>}
                </div>
                <div className="flex gap-2">
                  <Button variant={editMode ? "default" : "outline"} size="sm" onClick={() => setEditMode(!editMode)}>
                    <Settings className="size-4 mr-1" />{editMode ? (rtl ? "عرض" : "View") : (rtl ? "تعديل" : "Edit")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => duplicateDash.mutateAsync({ id: selectedDashboard!, newName: `${dashboardDetail.data?.name} (Copy)` })}>
                    <Copy className="size-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => deleteDash.mutateAsync({ id: selectedDashboard! }).then(() => { setSelectedDashboard(null); dashboards.refetch(); })}>
                    <Trash2 className="size-4 text-red-500" />
                  </Button>
                </div>
              </div>

              {editMode && (
                <Dialog open={showAddWidget} onOpenChange={setShowAddWidget}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full border-dashed"><Plus className="size-4 mr-2" />{rtl ? "إضافة عنصر" : "Add Widget"}</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{rtl ? "إضافة عنصر" : "Add Widget"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-3 gap-3">
                      {Object.entries(WIDGET_NAMES).map(([key, name]) => {
                        const Icon = WIDGET_ICONS[key];
                        return (
                          <Button key={key} variant="outline" className="flex-col h-24 gap-1" onClick={() => handleAddWidget(key)}>
                            <Icon className="size-6" />
                            <span className="text-xs">{rtl ? name.ar : name.en}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              <div className="grid grid-cols-12 gap-3 auto-rows-[80px]">
                {dashboardDetail.data?.widgets?.map(renderWidget)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
