import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, GitBranch, HardHat, MapPin, Calendar } from "lucide-react";

export default function WBSDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: projects, isLoading } = trpc.construction.projectList.useQuery(undefined);
  const project = projects?.find(p => p.id === Number(id));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-64 mt-1" /></div>
        </div>
        <Card><CardContent className="p-6"><div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-8 w-full" />)}</div></CardContent></Card>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/construction/wbs")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <GitBranch className="h-12 w-12 mb-3 opacity-50" />
            <p className="font-medium">Project not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/construction/wbs")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">WBS: {project.name}</h2>
          <p className="text-muted-foreground font-mono">{project.projectCode}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle></CardHeader>
          <CardContent>
            <Badge variant="outline" className="capitalize text-sm px-3 py-1">{project.status.replace("_", " ")}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Contract Value</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{Number(project.contractValue).toLocaleString()} SAR</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Progress</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{project.progress}%</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Location</CardTitle></CardHeader>
          <CardContent><p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" />{project.location || "—"}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-muted-foreground" />
            WBS Tree Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="rounded-lg border p-4 bg-accent/30">
              <div className="flex items-center gap-2 mb-2">
                <HardHat className="h-5 w-5 text-primary" />
                <span className="font-semibold">{project.name}</span>
                <Badge variant="outline" className="ml-2">Level 0</Badge>
              </div>
              <p className="text-sm text-muted-foreground ml-7">Project root — {project.projectCode}</p>
            </div>
            {[1,2,3].map(i => (
              <div key={i} className="ml-8 rounded-lg border p-3 hover:bg-accent/30 transition-colors">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{project.projectCode}.{i}</span>
                  <span className="text-sm text-muted-foreground">Work Package {i}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">Planned</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
