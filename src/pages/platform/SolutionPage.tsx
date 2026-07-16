import { Link, useParams } from "react-router";
import { ArrowLeft, CheckCircle2, FileText, Users, Settings, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { solutionScreens } from "./solutions-data";

const workflowSteps = [
  "Capture request or transaction",
  "Validate master data and policy rules",
  "Route approval by role, amount, branch, and owner",
  "Post impact to connected modules",
  "Track exceptions, audit trail, and follow-up actions",
];

const capabilities = [
  { label: "Real-time dashboard", icon: Activity },
  { label: "Role-based access", icon: Users },
  { label: "Configurable workflows", icon: Settings },
  { label: "Audit trail", icon: FileText },
];

export default function SolutionPage() {
  const { slug } = useParams();
  const screen = solutionScreens.find((item) => item.slug === slug) ?? solutionScreens[0];
  const Icon = screen.icon;

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
        {capabilities.map((c) => {
          const CapIcon = c.icon;
          return (
            <Card key={c.label}>
              <CardContent className="p-4">
                <CapIcon className="size-5 text-blue-600" />
                <p className="mt-3 text-sm font-medium">{c.label}</p>
                <p className="text-xs text-slate-400 mt-1">Available in this solution</p>
              </CardContent>
            </Card>
          );
        })}
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
                  <p className="mt-1 text-xs text-slate-500">Configured with applicable rules and notifications.</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Operational Records</CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center text-slate-400">
            <CheckCircle2 className="size-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Records will appear here once the solution is in use.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
