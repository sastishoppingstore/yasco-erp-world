import { Link } from "react-router";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { solutionScreens } from "./solutions-data";
import { useState } from "react";

export default function SolutionLibraryPage() {
  const [search, setSearch] = useState("");
  const filtered = solutionScreens.filter((screen) =>
    `${screen.title} ${screen.area} ${screen.summary}`.toLowerCase().includes(search.toLowerCase()),
  );
  const areas = Array.from(new Set(filtered.map((screen) => screen.area)));

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-slate-950 p-5 text-white">
        <Badge className="bg-blue-500 text-white hover:bg-blue-500">
          <Sparkles className="size-3" />
          100+ screen ERP suite
        </Badge>
        <h2 className="mt-4 max-w-3xl text-2xl font-semibold tracking-tight sm:text-3xl">
          Working business screens for every department, not coming-soon cards.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Open any solution to view KPIs, workflows, controls, exception queues, and operational records.
        </p>
      </section>

      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="pl-9"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search screens by module, workflow, or impact..."
        />
      </div>

      {areas.map((area) => (
        <section key={area} className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{area}</h3>
            <Badge variant="outline">{filtered.filter((screen) => screen.area === area).length} screens</Badge>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.filter((screen) => screen.area === area).map((screen) => (
              <Link key={screen.slug} to={`/platform/solutions/${screen.slug}`}>
                <Card className="h-full transition hover:border-blue-200 hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                        <screen.icon className="size-5" />
                      </div>
                      <ArrowRight className="size-4 text-slate-400" />
                    </div>
                    <h4 className="mt-4 font-semibold">{screen.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{screen.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge variant="outline">{screen.impact}</Badge>
                      <Badge variant="secondary">{screen.owner}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
