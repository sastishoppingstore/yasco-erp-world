import { Link, useParams } from "react-router";
import { ArrowLeft, CheckCircle2, Clock, FileCheck2, ShieldCheck, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { solutionScreens } from "./solutions-data";

const workflowSteps = [
  "Capture request or transaction",
  "Validate master data and policy rules",
  "Route approval by role, amount, branch, and owner",
  "Post impact to connected modules",
  "Track exceptions, audit trail, and follow-up actions",
];

export default function SolutionPage() {
  const { slug } = useParams();
  const screen = solutionScreens.find((item) => item.slug === slug) ?? solutionScreens[0];
  const Icon = screen.icon;
  const baseScore = 78 + (screen.slug.length % 18);
  const records = Array.from({ length: 6 }).map((_, index) => ({
    code: `${screen.area.slice(0, 3).toUpperCase()}-${String(index + 1).padStart(4, "0")}`,
    owner: ["Admin", "Finance", "Operations", "Manager", "Supervisor", "Auditor"][index],
    status: ["Ready", "In review", "Approved", "Exception", "Posted", "Closed"][index],
    score: Math.min(99, baseScore + index),
  }));
  const metrics = [
    { label: "Automation", value: baseScore, icon: Zap },
    { label: "Control", value: baseScore + 4, icon: ShieldCheck },
    { label: "Audit", value: baseScore + 7, icon: FileCheck2 },
    { label: "SLA", value: baseScore + 2, icon: Clock },
  ];

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" className="px-0">
        <Link to="/app/platform/solutions">
          <ArrowLeft className="size-4" />
          Back to solution library
        </Link>
      </Button>

      <section className="rounded-lg border bg-slate-950 p-5 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge className="bg-blue-500 text-white hover:bg-blue-500">{screen.area}</Badge>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">{screen.title}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{screen.summary}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <Icon className="size-8 text-blue-300" />
            <p className="mt-3 text-xs uppercase tracking-wide text-slate-400">Business impact</p>
            <p className="text-lg font-semibold">{screen.impact}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-4">
              <metric.icon className="size-5 text-blue-600" />
              <p className="mt-3 text-sm text-slate-500">{metric.label}</p>
              <p className="text-2xl font-bold">{metric.value}%</p>
              <Progress value={metric.value} className="mt-3 [&>div]:bg-blue-600" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Workflow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {workflowSteps.map((step, index) => (
              <div key={step} className="flex gap-3 rounded-lg border p-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium">{step}</p>
                  <p className="mt-1 text-xs text-slate-500">{screen.title} applies this step with owner visibility and audit tracking.</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Operational Records</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Health</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.code}>
                    <TableCell className="font-mono text-sm">{record.code}</TableCell>
                    <TableCell>{record.owner}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                        <CheckCircle2 className="size-3" />
                        {record.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{record.score}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
