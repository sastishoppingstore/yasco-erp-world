import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { Wrench, Clock, CheckCircle2, XCircle, MapPin, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  in_progress: "bg-blue-100 text-blue-700",
  quality_check: "bg-purple-100 text-purple-700",
  completed: "bg-emerald-100 text-emerald-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-slate-100 text-slate-700",
};

export default function MobileTechnicianJobs() {
  const technicianId = 1;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const { data: jobs, refetch } = trpc.workshop.jobCardList.useQuery({ technicianId, status: statusFilter, search: search || undefined });
  const updateJob = trpc.workshop.jobCardUpdate.useMutation({ onSuccess: () => refetch() });
  const [gpsStatus, setGpsStatus] = useState<{ lat?: number; lng?: number }>({});

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setGpsStatus({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setGpsStatus({}),
      );
    }
  }, []);

  const startJob = (id: number) => {
    updateJob.mutateAsync({ id, status: "in_progress" });
  };
  const sendToQC = (id: number) => {
    updateJob.mutateAsync({ id, status: "quality_check" });
  };
  const completeJob = (id: number) => {
    updateJob.mutateAsync({ id, status: "completed" });
  };

  const myJobs = jobs?.filter((j: any) => j.technicianId === technicianId || !j.technicianId) || [];

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Wrench className="size-5 text-blue-600" />
          My Jobs
        </h1>
        <Badge variant="outline" className="bg-blue-100 text-blue-800">
          {myJobs.filter((j: any) => j.status === "in_progress").length} Active
        </Badge>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Search job cards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="rounded-lg border bg-background px-3 py-2 text-sm"
          value={statusFilter || ""}
          onChange={(e) => setStatusFilter(e.target.value || undefined)}
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="quality_check">Quality Check</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="space-y-3">
        {!myJobs.length ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-500">
              <Wrench className="size-12 mx-auto mb-3 opacity-30" />
              <p>No job cards assigned</p>
            </CardContent>
          </Card>
        ) : myJobs.map((job: any) => {
          const statusLabel = job.status?.replace("_", " ") || "pending";
          return (
            <Card key={job.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[job.status] || "bg-slate-100"}>
                      {statusLabel}
                    </Badge>
                    <span className="text-xs font-mono text-slate-400">#{job.jobNumber}</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : ""}
                  </span>
                </div>

                <div>
                  <p className="font-medium">{job.serviceType}</p>
                  <p className="text-sm text-slate-500 line-clamp-2">{job.description}</p>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  {job.priority && (
                    <Badge variant="outline" className={job.priority === "urgent" ? "text-red-500 border-red-200" : job.priority === "express" ? "text-amber-500 border-amber-200" : ""}>
                      {job.priority}
                    </Badge>
                  )}
                  {job.estimatedHours && (
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />{job.estimatedHours}h
                    </span>
                  )}
                  {job.estimatedCost && (
                    <span className="font-medium">{job.estimatedCost}</span>
                  )}
                </div>

                {job.status === "pending" && (
                  <Button className="w-full" size="sm" onClick={() => startJob(job.id)}>
                    <Wrench className="size-4 mr-2" />Start Job
                  </Button>
                )}
                {job.status === "in_progress" && (
                  <div className="flex gap-2">
                    {gpsStatus.lat && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <MapPin className="size-3" />GPS Locked
                      </span>
                    )}
                    <Button className="flex-1" size="sm" variant="secondary" onClick={() => sendToQC(job.id)}>
                      <ChevronRight className="size-4 mr-2" />Send to QC
                    </Button>
                  </div>
                )}
                {job.status === "quality_check" && (
                  <Button className="w-full" size="sm" variant="secondary" onClick={() => completeJob(job.id)}>
                    <CheckCircle2 className="size-4 mr-2" />Mark Complete
                  </Button>
                )}
                {job.status === "completed" && (
                  <Badge className="w-full justify-center bg-emerald-100 text-emerald-800 py-2">
                    <CheckCircle2 className="size-4 mr-1" />Completed
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
