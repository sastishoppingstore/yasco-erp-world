import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/providers/trpc";
import {
  Building2, Plus, Search, FileText, CheckCircle2, XCircle,
  Clock, AlertTriangle, Calendar, Download,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

const permitTypes = [
  { value: "building", label: "Building Permit" },
  { value: "commercial", label: "Commercial License" },
  { value: "industrial", label: "Industrial Permit" },
  { value: "road_work", label: "Road Work Permit" },
  { value: "renovation", label: "Renovation Permit" },
  { value: "demolition", label: "Demolition Permit" },
  { value: "advertising", label: "Advertising License" },
  { value: "event", label: "Event Permit" },
];

const statusConfig: Record<string, { color: string; icon: any }> = {
  pending: { color: "bg-amber-100 text-amber-700", icon: Clock },
  in_review: { color: "bg-blue-100 text-blue-700", icon: Search },
  inspection_scheduled: { color: "bg-purple-100 text-purple-700", icon: Calendar },
  approved: { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  rejected: { color: "bg-red-100 text-red-700", icon: XCircle },
  expired: { color: "bg-slate-100 text-slate-700", icon: Clock },
};

export default function BaladyPermitsPage() {
  const [tab, setTab] = useState("permits");
  const [search, setSearch] = useState("");
  const [showNewPermit, setShowNewPermit] = useState(false);
  const [newPermit, setNewPermit] = useState({ projectName: "", permitType: "", scope: "", applicationDate: new Date().toISOString().split("T")[0] });

  const { data: dashboard } = trpc.balady.getPermitsDashboard.useQuery({ projectId: 1 });
  const submitApplication = trpc.balady.createPermitApplication.useMutation();

  const handleCreate = () => {
    submitApplication.mutate({
      projectId: 1,
      permitType: newPermit.permitType,
      applicationDate: new Date(newPermit.applicationDate),
      scope: newPermit.scope,
    });
    setShowNewPermit(false);
    setNewPermit({ projectName: "", permitType: "", scope: "", applicationDate: new Date().toISOString().split("T")[0] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="size-6 text-blue-600" />
            Balady Permits
          </h2>
          <p className="text-sm text-slate-500">Municipality permit management and compliance tracking</p>
        </div>
        <Dialog open={showNewPermit} onOpenChange={setShowNewPermit}>
          <DialogTrigger asChild>
            <Button><Plus className="size-4 mr-2" />New Application</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Permit Application</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Project Name</Label><Input value={newPermit.projectName} onChange={(e) => setNewPermit(f => ({ ...f, projectName: e.target.value }))} /></div>
              <div><Label>Permit Type</Label>
                <Select value={newPermit.permitType} onValueChange={(v) => setNewPermit(f => ({ ...f, permitType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {permitTypes.map((pt) => (
                      <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Scope of Work</Label><Input value={newPermit.scope} onChange={(e) => setNewPermit(f => ({ ...f, scope: e.target.value }))} /></div>
              <div><Label>Application Date</Label><Input type="date" value={newPermit.applicationDate} onChange={(e) => setNewPermit(f => ({ ...f, applicationDate: e.target.value }))} /></div>
              <Button className="w-full" onClick={handleCreate} disabled={!newPermit.projectName || !newPermit.permitType}>
                <FileText className="size-4 mr-2" />Submit Application
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="permits"><FileText className="size-4 mr-2" />All Permits</TabsTrigger>
          <TabsTrigger value="active"><CheckCircle2 className="size-4 mr-2" />Active</TabsTrigger>
          <TabsTrigger value="pending"><Clock className="size-4 mr-2" />Pending Review</TabsTrigger>
          <TabsTrigger value="inspections"><Search className="size-4 mr-2" />Inspections</TabsTrigger>
        </TabsList>

        <TabsContent value="permits" className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input className="pl-9" placeholder="Search by project or permit number..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-slate-500">Total Permits</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">{dashboard?.dashboard?.totalPermits ?? 0}</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-slate-500">Active</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold text-green-600">{dashboard?.dashboard?.activePermits ?? 0}</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-slate-500">Pending Review</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold text-amber-600">{dashboard?.dashboard?.pendingPermits ?? 0}</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-slate-500">Expiring Soon</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold text-red-600">{dashboard?.dashboard?.expiringIn30Days ?? 0}</p></CardContent></Card>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Project</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-slate-400 py-8">
                      <Building2 className="size-8 mx-auto mb-2 opacity-30" />
                      <p>Permit records will appear here once applications are submitted.</p>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card><CardContent className="py-12 text-center text-slate-500"><CheckCircle2 className="size-12 mx-auto mb-3 text-green-400" /><p>No active permits</p></CardContent></Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card><CardContent className="py-12 text-center text-slate-500"><Clock className="size-12 mx-auto mb-3 text-amber-400" /><p>No pending reviews</p></CardContent></Card>
        </TabsContent>

        <TabsContent value="inspections" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Schedule Inspection</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Permit Type</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="initial">Initial Inspection</SelectItem>
                      <SelectItem value="follow_up">Follow-up Inspection</SelectItem>
                      <SelectItem value="renewal">Renewal Inspection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Scheduled Date</Label><Input type="date" /></div>
              </div>
              <Button><Calendar className="size-4 mr-2" />Schedule</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
