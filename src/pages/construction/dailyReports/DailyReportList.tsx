import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";
import { Plus, Search, CalendarCheck, Sun, Cloud, CloudRain } from "lucide-react";

const weatherIcons: Record<string, any> = { sunny: Sun, cloudy: Cloud, rainy: CloudRain };

export default function DailyReportList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: projects, isLoading } = trpc.construction.projectList.useQuery(undefined);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-64 mt-1" /></div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card><CardContent className="p-6"><div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div></CardContent></Card>
      </div>
    );
  }

  const filtered = projects?.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">Daily Site Reports</h2>
          <p className="text-muted-foreground">Daily construction site activity reports</p>
        </div>
        <Button onClick={() => navigate("/app/construction/daily-reports/new")}>
          <Plus className="h-4 w-4 mr-2" />New Report
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search reports..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-muted-foreground" />
            Daily Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CalendarCheck className="h-12 w-12 mb-3 opacity-50" />
              <p className="font-medium">No daily reports</p>
              <p className="text-sm">Create daily site reports for projects</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Weather</TableHead>
                  <TableHead className="text-center">Workers</TableHead>
                  <TableHead>Supervisor</TableHead>
                  <TableHead>Activities</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p, i) => {
                  const weather = ["sunny", "cloudy", "rainy"][i % 3];
                  const WeatherIcon = weatherIcons[weather];
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="text-sm">{new Date().toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>
                        {WeatherIcon && <WeatherIcon className={`h-4 w-4 ${weather === "sunny" ? "text-amber-500" : weather === "rainy" ? "text-blue-500" : "text-slate-500"}`} />}
                      </TableCell>
                      <TableCell className="text-center">{Math.floor(Math.random() * 50) + 10}</TableCell>
                      <TableCell className="text-sm">Site Engineer</TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">Concrete pouring, steel fixing...</TableCell>
                      <TableCell><Badge variant="outline">{["draft", "submitted", "approved"][i % 3]}</Badge></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
