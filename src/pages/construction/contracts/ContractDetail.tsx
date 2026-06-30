import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Building2, MapPin, Calendar, HardHat, DollarSign } from "lucide-react";

const statusColors: Record<string, string> = {
  planning: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  tendering: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  on_hold: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function ContractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: projects, isLoading } = trpc.construction.projectList.useQuery(undefined);
  const { data: billing } = trpc.construction.progressBillingList.useQuery(undefined);
  const { data: retentions } = trpc.construction.retentionList.useQuery(undefined);

  const project = projects?.find(p => p.id === Number(id));
  const projectBillings = billing?.filter(b => b.projectId === Number(id)) || [];
  const projectRetentions = retentions?.filter(r => r.projectId === Number(id)) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/construction/contracts")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Card><CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Building2 className="h-12 w-12 mb-3 opacity-50" />
          <p className="font-medium">Contract not found</p>
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/construction/contracts")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{project.name}</h2>
            <Badge className={statusColors[project.status]}>{project.status.replace("_", " ")}</Badge>
          </div>
          <p className="text-muted-foreground font-mono">{project.projectCode} &middot; {project.projectType.replace("_", " ")}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><DollarSign className="h-4 w-4" />Contract Value</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{Number(project.contractValue).toLocaleString()} SAR</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><DollarSign className="h-4 w-4" />Budget</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{Number(project.budget).toLocaleString()} SAR</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><HardHat className="h-4 w-4" />Actual Cost</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{Number(project.actualCost).toLocaleString()} SAR</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><HardHat className="h-4 w-4" />Progress</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{project.progress}%</p>
            <Progress value={project.progress || 0} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Project Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Location:</span> {project.location || "—"}</div>
            <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Start:</span> {project.startDate || "—"}</div>
            <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">End:</span> {project.endDate || "—"}</div>
            {project.description && <div className="text-sm pt-2">{project.description}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Progress Billing</CardTitle></CardHeader>
          <CardContent>
            {projectBillings.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No billing records</p>
            ) : (
              <div className="space-y-2">
                {projectBillings.map(b => (
                  <div key={b.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                    <div>
                      <p className="font-medium">{b.milestoneName || b.invoiceNumber}</p>
                      <p className="text-muted-foreground">{b.billingPeriod || ""}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono">{Number(b.billedAmount).toLocaleString()} SAR</p>
                      <Badge variant="outline" className="text-xs">{b.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
