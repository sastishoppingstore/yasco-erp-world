import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/providers/trpc";
import { Shield, Database, FileText, Users, Clock, Trash2, Download } from "lucide-react";

export default function DataProtectionPage() {
  const [tab, setTab] = useState("inventory");
  const [dsarForm, setDsarForm] = useState({ requestType: "access", subjectType: "customer", subjectId: "", subjectEmail: "", requestDetails: "" });
  const { data: dsars, refetch: refetchDsars } = trpc.compliance.listSubjectRequests.useQuery();

  const handleCreateDsar = () => {
    setDsarForm({ requestType: "access", subjectType: "customer", subjectId: "", subjectEmail: "", requestDetails: "" });
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Data Protection</h2><p className="text-sm text-slate-500">GDPR, Saudi PDPL, and data privacy compliance</p></div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="inventory"><Database className="w-4 h-4 mr-2" />Data Inventory</TabsTrigger>
          <TabsTrigger value="dsar"><Users className="w-4 h-4 mr-2" />Subject Requests</TabsTrigger>
          <TabsTrigger value="dpa"><FileText className="w-4 h-4 mr-2" />DPAs</TabsTrigger>
          <TabsTrigger value="retention"><Clock className="w-4 h-4 mr-2" />Retention</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <Card>
            <CardHeader><CardTitle>Personal Data Inventory</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">Track and classify personal data across the system. This inventory helps meet GDPR Art. 30 and Saudi PDPL record-keeping requirements.</p>
              <div className="mt-4 p-8 text-center text-slate-400 border-2 border-dashed rounded-lg">
                <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Data inventory records will be populated automatically as data is processed.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dsar" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Create Data Subject Request</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Request Type</Label>
                  <select value={dsarForm.requestType} onChange={e => setDsarForm(f => ({ ...f, requestType: e.target.value }))} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                    <option value="access">Right to Access</option>
                    <option value="rectification">Right to Rectification</option>
                    <option value="erasure">Right to Erasure (Delete)</option>
                    <option value="restrict">Right to Restrict</option>
                    <option value="portability">Right to Portability</option>
                    <option value="objection">Right to Object</option>
                  </select>
                </div>
                <div><Label>Subject Type</Label>
                  <select value={dsarForm.subjectType} onChange={e => setDsarForm(f => ({ ...f, subjectType: e.target.value }))} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                    <option value="customer">Customer</option>
                    <option value="employee">Employee</option>
                    <option value="supplier">Supplier</option>
                    <option value="user">User</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Subject ID</Label><Input value={dsarForm.subjectId} onChange={e => setDsarForm(f => ({ ...f, subjectId: e.target.value }))} placeholder="Record ID" /></div>
                <div><Label>Subject Email</Label><Input value={dsarForm.subjectEmail} onChange={e => setDsarForm(f => ({ ...f, subjectEmail: e.target.value }))} placeholder="email@example.com" /></div>
              </div>
              <div><Label>Request Details</Label><Textarea value={dsarForm.requestDetails} onChange={e => setDsarForm(f => ({ ...f, requestDetails: e.target.value }))} /></div>
              <Button onClick={handleCreateDsar}>Submit Request</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Recent Requests</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {!dsars?.length ? (
                <p className="text-sm text-slate-500 text-center py-4">No data subject requests yet.</p>
              ) : dsars.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium capitalize">{r.request_type} · {r.subject_type} #{r.subject_id}</p>
                    <p className="text-xs text-slate-500">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge variant="outline" className={
                    r.status === "completed" ? "bg-green-100 text-green-800" :
                    r.status === "rejected" ? "bg-red-100 text-red-800" :
                    r.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                    "bg-yellow-100 text-yellow-800"
                  }>{r.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dpa">
          <Card>
            <CardHeader><CardTitle>Data Processing Agreements</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">Manage DPAs with third-party data processors as required by GDPR Art. 28 and Saudi PDPL.</p>
              <div className="mt-4 p-8 text-center text-slate-400 border-2 border-dashed rounded-lg">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No DPAs created yet. DPAs can be generated via the API or compliance engine.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention">
          <Card>
            <CardHeader><CardTitle>Data Retention Policies</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">Configure data retention periods and automated cleanup actions per entity type.</p>
              <div className="mt-4 p-8 text-center text-slate-400 border-2 border-dashed rounded-lg">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Retention policies configured via the API. Personal data is automatically anonymized or deleted after the retention period.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
