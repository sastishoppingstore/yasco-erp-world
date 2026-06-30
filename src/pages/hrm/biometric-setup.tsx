import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/providers/trpc";
import {
  Fingerprint, ScanFace, MapPin, Shield, FileText,
  CheckCircle2, AlertCircle, Trash2, ClipboardList,
} from "lucide-react";

export default function BiometricSetupPage() {
  const { data: employees } = trpc.hrm.employeeList.useQuery();
  const { data: templates, refetch: refetchTemplates } = trpc.biometric.listTemplates.useQuery();
  const { data: accessLogs, refetch: refetchLogs } = trpc.biometric.accessLogs.useQuery();
  const { data: requests, refetch: refetchReqs } = trpc.biometric.listRequests.useQuery();
  const recordConsent = trpc.biometric.recordConsent.useMutation({ onSuccess: () => refetchTemplates() });
  const enrollTemplate = trpc.biometric.enroll.useMutation({ onSuccess: () => refetchTemplates() });
  const deleteTemplate = trpc.biometric.deleteTemplate.useMutation({ onSuccess: () => refetchTemplates() });
  const submitRequest = trpc.biometric.submitRequest.useMutation({ onSuccess: () => refetchReqs() });

  const [consentForm, setConsentForm] = useState({ employeeId: 0, consentType: "all" as const });
  const [enrollForm, setEnrollForm] = useState({ employeeId: 0, templateType: "face" as const, templateData: "simulated-template-hash-" + Date.now() });
  const [requestForm, setRequestForm] = useState({ employeeId: 0, requestType: "erasure" as const, requestDetails: "" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-600" /> Biometric & PDPL Compliance
          </h2>
          <p className="text-slate-500">Face · Fingerprint · GPS geofencing · PDPL (SDAIA) consent management</p>
        </div>
        <Badge variant="outline" className="text-sm px-4 py-2">
          <Shield className="w-4 h-4 mr-2" /> PDPL Compliant – AES-256-GCM
        </Badge>
      </div>

      <Tabs defaultValue="consent">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="consent"><FileText className="w-4 h-4 mr-2" />Consent & Enrollment</TabsTrigger>
          <TabsTrigger value="templates"><Fingerprint className="w-4 h-4 mr-2" />Templates</TabsTrigger>
          <TabsTrigger value="pdpl"><Shield className="w-4 h-4 mr-2" />PDPL Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="consent" className="space-y-4 mt-6">
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-purple-600" /> PDPL Consent Screen</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-purple-700 mb-4">
                Under Saudi PDPL (SDAIA), explicit, separately-recorded consent must be obtained before any biometric data processing.
                This consent is stored independently and can be revoked at any time.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Employee</Label>
                  <Select onValueChange={v => setConsentForm({...consentForm, employeeId: Number(v)})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{employees?.map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Consent Type</Label>
                  <Select value={consentForm.consentType} onValueChange={v => setConsentForm({...consentForm, consentType: v as any})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Biometrics</SelectItem>
                      <SelectItem value="face">Face Recognition</SelectItem>
                      <SelectItem value="fingerprint">Fingerprint</SelectItem>
                      <SelectItem value="gps_location">GPS Location</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={() => recordConsent.mutate(consentForm)} className="w-full">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Record Consent
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Enroll Biometric Template</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Employee</Label>
                  <Select onValueChange={v => setEnrollForm({...enrollForm, employeeId: Number(v)})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{employees?.map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Biometric Type</Label>
                  <Select value={enrollForm.templateType} onValueChange={v => setEnrollForm({...enrollForm, templateType: v as any})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="face"><ScanFace className="w-4 h-4 inline mr-2" />Face</SelectItem>
                      <SelectItem value="fingerprint"><Fingerprint className="w-4 h-4 inline mr-2" />Fingerprint</SelectItem>
                      <SelectItem value="voice">Voice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={() => enrollTemplate.mutate(enrollForm)} className="w-full">
                    <Fingerprint className="w-4 h-4 mr-2" /> Enroll
                  </Button>
                </div>
              </div>
              <p className="text-xs text-slate-400">Only mathematical template hashes are stored – never raw biometric images (PDPL data minimization)</p>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-700">GPS Geo-fencing for Field Staff</p>
                <p className="text-sm text-amber-600">Mobile GPS attendance with configurable geo-fence radius (soft/hard mode). Falls back to PIN, QR badge scan, or manual manager approval when offline.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Enrolled Biometric Templates</CardTitle>
              <Button size="sm" variant="destructive" onClick={() => {
                if (enrollForm.employeeId) deleteTemplate.mutate({ employeeId: enrollForm.employeeId });
              }}><Trash2 className="w-4 h-4 mr-2" /> Delete Employee Data</Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead><TableHead>Type</TableHead><TableHead>Device</TableHead>
                    <TableHead>Enrolled At</TableHead><TableHead>Last Used</TableHead><TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates?.map((t: any) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.employeeName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {t.templateType === "face" ? <ScanFace className="w-3 h-3 inline mr-1" /> : <Fingerprint className="w-3 h-3 inline mr-1" />}
                          {t.templateType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono">{t.deviceId || "N/A"}</TableCell>
                      <TableCell className="text-xs">{t.enrolledAt ? new Date(t.enrolledAt).toLocaleDateString() : "-"}</TableCell>
                      <TableCell className="text-xs">{t.lastUsedAt ? new Date(t.lastUsedAt).toLocaleDateString() : "-"}</TableCell>
                      <TableCell><Badge className="bg-emerald-100 text-emerald-700">Active</Badge></TableCell>
                    </TableRow>
                  ))}
                  {(!templates || templates.length === 0) && (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-400"><AlertCircle className="w-6 h-6 mx-auto mb-2" />No templates enrolled</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader><CardTitle>Biometric Access Log (Audit Trail)</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead><TableHead>Employee</TableHead><TableHead>Accessed By</TableHead>
                    <TableHead>Allowed</TableHead><TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accessLogs?.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell><Badge variant="outline">{log.action}</Badge></TableCell>
                      <TableCell>{log.employeeId ? `#${log.employeeId}` : "-"}</TableCell>
                      <TableCell>#{log.accessedBy}</TableCell>
                      <TableCell>{log.isAllowed ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}</TableCell>
                      <TableCell className="text-xs">{new Date(log.createdAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pdpl" className="space-y-4 mt-6">
          <Card>
            <CardHeader><CardTitle>Data Subject Rights Requests (PDPL Article 17-23)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Employee</Label>
                  <Select onValueChange={v => setRequestForm({...requestForm, employeeId: Number(v)})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{employees?.map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Request Type</Label>
                  <Select value={requestForm.requestType} onValueChange={v => setRequestForm({...requestForm, requestType: v as any})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="access">Access My Data</SelectItem>
                      <SelectItem value="rectification">Rectify Data</SelectItem>
                      <SelectItem value="erasure">Erasure (Right to be Forgotten)</SelectItem>
                      <SelectItem value="restrict">Restrict Processing</SelectItem>
                      <SelectItem value="portability">Data Portability</SelectItem>
                      <SelectItem value="objection">Object to Processing</SelectItem>
                      <SelectItem value="withdraw_consent">Withdraw Consent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={() => submitRequest.mutate(requestForm)} className="w-full">
                    <ClipboardList className="w-4 h-4 mr-2" /> Submit Request
                  </Button>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead><TableHead>Request Type</TableHead>
                    <TableHead>Status</TableHead><TableHead>Submitted</TableHead><TableHead>Completed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests?.map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell>#{r.employeeId}</TableCell>
                      <TableCell><Badge variant="outline">{r.requestType}</Badge></TableCell>
                      <TableCell><Badge variant={r.status === "completed" ? "default" : r.status === "in_progress" ? "secondary" : "outline"}>{r.status}</Badge></TableCell>
                      <TableCell className="text-xs">{new Date(r.submittedAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-xs">{r.completedAt ? new Date(r.completedAt).toLocaleDateString() : "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
