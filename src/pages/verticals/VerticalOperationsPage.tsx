import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/providers/language";
import { CheckCircle2, ClipboardList, FileText, Plus, Search, ShieldCheck } from "lucide-react";

export interface VerticalKpi {
  label: string;
  value: string;
  tone?: "blue" | "emerald" | "amber" | "rose" | "slate";
}

export interface VerticalTask {
  code: string;
  title: string;
  owner: string;
  status: string;
  due: string;
  amount?: string;
}

export interface VerticalOperationsPageProps {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  badge: string;
  kpis: VerticalKpi[];
  workflows: string[];
  tasks: VerticalTask[];
  compliance: string[];
  primaryAction: string;
  primaryActionAr: string;
}

const toneClasses: Record<NonNullable<VerticalKpi["tone"]>, string> = {
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  rose: "border-rose-200 bg-rose-50 text-rose-700",
  slate: "border-slate-200 bg-slate-50 text-slate-700",
};

export default function VerticalOperationsPage({
  title,
  titleAr,
  description,
  descriptionAr,
  badge,
  kpis,
  workflows,
  tasks,
  compliance,
  primaryAction,
  primaryActionAr,
}: VerticalOperationsPageProps) {
  const { language, dir } = useLanguage();
  const isAr = language === "ar";

  return (
    <div className="space-y-5" dir={dir}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="outline" className="bg-white">{badge}</Badge>
            <Badge className="bg-emerald-100 text-emerald-700">{isAr ? "إعداد سعودي" : "Saudi preset"}</Badge>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">{isAr ? titleAr : title}</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">{isAr ? descriptionAr : description}</p>
        </div>
        <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
          <Plus className="me-2 size-4" />
          {isAr ? primaryActionAr : primaryAction}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className={toneClasses[kpi.tone || "slate"]}>
            <CardContent className="p-4">
              <p className="text-xs font-medium opacity-80">{kpi.label}</p>
              <p className="mt-2 text-2xl font-bold">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_0.9fr]">
        <Card>
          <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardList className="size-4 text-emerald-600" />
                {isAr ? "سجل العمليات" : "Operations Register"}
              </CardTitle>
              <CardDescription>{isAr ? "متابعة الطلبات والملفات حسب سير العمل" : "Track active records against the configured workflow"}</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input className="ps-8" placeholder={isAr ? "بحث..." : "Search..."} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-600">
                    <th className="p-3 text-start">{isAr ? "الكود" : "Code"}</th>
                    <th className="p-3 text-start">{isAr ? "العملية" : "Record"}</th>
                    <th className="p-3 text-start">{isAr ? "المسؤول" : "Owner"}</th>
                    <th className="p-3 text-start">{isAr ? "الحالة" : "Status"}</th>
                    <th className="p-3 text-start">{isAr ? "الموعد" : "Due"}</th>
                    <th className="p-3 text-end">{isAr ? "القيمة" : "Amount"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {tasks.map((task) => (
                    <tr key={task.code} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-xs">{task.code}</td>
                      <td className="p-3 font-medium">{task.title}</td>
                      <td className="p-3">{task.owner}</td>
                      <td className="p-3"><Badge variant="outline">{task.status}</Badge></td>
                      <td className="p-3 text-slate-500">{task.due}</td>
                      <td className="p-3 text-end font-mono">{task.amount || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="size-4 text-blue-600" />
                {isAr ? "خطوات سير العمل" : "Workflow Steps"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {workflows.map((step, index) => (
                <div key={step} className="flex items-center gap-2 rounded-lg border bg-white p-2 text-sm">
                  <span className="flex size-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold">{index + 1}</span>
                  <span>{step}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="size-4 text-emerald-600" />
                {isAr ? "الامتثال والوثائق" : "Compliance & Documents"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {compliance.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
