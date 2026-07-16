import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/providers/trpc";
import {
  Activity, CheckCircle2, XCircle, Clock, AlertTriangle,
  Search, FileText, Shield,
  BarChart3, Plus,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export default function NPHIESDashboardPage() {
  const [tab, setTab] = useState("dashboard");
  const { data: dashboard } = trpc.nphies.getDashboard.useQuery();
  const { data: payers } = trpc.nphies.getPayerList.useQuery();
  const { data: serviceCodes } = trpc.nphies.getServiceCodes.useQuery();

  const [eligibilityForm, setEligibilityForm] = useState({
    memberId: "", providerId: "", payerId: "", serviceType: "", serviceDate: new Date().toISOString().split("T")[0],
  });
  const [eligibilityResult, setEligibilityResult] = useState<any>(null);
  const checkEligibility = trpc.nphies.checkEligibility.useQuery(eligibilityForm, { enabled: false });

  const handleEligibilityCheck = async () => {
    const result = await checkEligibility.refetch();
    if (result.data) setEligibilityResult(result.data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="size-6 text-blue-600" />
            NPHIES Compliance
          </h2>
          <p className="text-sm text-slate-500">Saudi National Platform for Health and Insurance Exchange Services</p>
        </div>
        <Badge variant="outline" className="bg-green-100 text-green-700">
          <Activity className="size-3 mr-1" />Connected
        </Badge>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="dashboard"><BarChart3 className="size-4 mr-2" />Dashboard</TabsTrigger>
          <TabsTrigger value="eligibility"><Search className="size-4 mr-2" />Eligibility</TabsTrigger>
          <TabsTrigger value="claims"><FileText className="size-4 mr-2" />Claims</TabsTrigger>
          <TabsTrigger value="codes"><Shield className="size-4 mr-2" />Service Codes</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-5 gap-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-slate-500">Submitted Claims</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">{dashboard?.submittedClaims ?? 0}</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-slate-500">Approved</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold text-green-600">{dashboard?.approvedClaims ?? 0}</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-slate-500">Denied</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold text-red-600">{dashboard?.deniedClaims ?? 0}</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-slate-500">Pending</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold text-amber-600">{dashboard?.pendingClaims ?? 0}</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-slate-500">Total Billed</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">{((dashboard?.totalBilled ?? 0) / 1000).toFixed(0)}K SAR</p></CardContent></Card>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Payer Distribution</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payer</TableHead>
                      <TableHead className="text-right">Claims</TableHead>
                      <TableHead className="text-right">Amount (SAR)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboard?.payerDistribution?.map((p: any) => (
                      <TableRow key={p.payer}>
                        <TableCell className="font-medium">{p.payer}</TableCell>
                        <TableCell className="text-right">{p.count}</TableCell>
                        <TableCell className="text-right">{p.amount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Recent Claims</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dashboard?.recentClaims?.map((claim: any) => (
                    <div key={claim.id} className="flex items-center justify-between p-2 rounded border text-sm">
                      <div>
                        <p className="font-medium">{claim.patientName}</p>
                        <p className="text-xs text-slate-400">{claim.payer}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={claim.status === "approved" ? "default" : claim.status === "denied" ? "destructive" : "secondary"}>
                          {claim.status}
                        </Badge>
                        <p className="text-xs mt-1">{claim.amount.toLocaleString()} SAR</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="eligibility" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Eligibility Verification</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Member ID</Label>
                  <Input value={eligibilityForm.memberId} onChange={(e) => setEligibilityForm(f => ({ ...f, memberId: e.target.value }))} placeholder="Insurance member ID" />
                </div>
                <div>
                  <Label>Provider ID</Label>
                  <Input value={eligibilityForm.providerId} onChange={(e) => setEligibilityForm(f => ({ ...f, providerId: e.target.value }))} placeholder="Provider/NPI number" />
                </div>
                <div>
                  <Label>Payer</Label>
                  <Select value={eligibilityForm.payerId} onValueChange={(v) => setEligibilityForm(f => ({ ...f, payerId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select payer" /></SelectTrigger>
                    <SelectContent>
                      {payers?.map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Service Type</Label>
                  <Select value={eligibilityForm.serviceType} onValueChange={(v) => setEligibilityForm(f => ({ ...f, serviceType: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="diagnostic">Diagnostic</SelectItem>
                      <SelectItem value="lab">Lab</SelectItem>
                      <SelectItem value="radiology">Radiology</SelectItem>
                      <SelectItem value="pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="inpatient">Inpatient</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleEligibilityCheck} disabled={!eligibilityForm.memberId || !eligibilityForm.payerId}>
                <Search className="size-4 mr-2" />Check Eligibility
              </Button>

              {eligibilityResult && (
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold flex items-center gap-2">
                      {eligibilityResult.eligible ? (
                        <CheckCircle2 className="size-5 text-green-500" />
                      ) : (
                        <XCircle className="size-5 text-red-500" />
                      )}
                      {eligibilityResult.eligible ? "Eligible" : "Not Eligible"}
                    </h4>
                    <Badge variant="outline">{eligibilityResult.coverageStatus}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div><span className="text-slate-500">Member:</span> {eligibilityResult.memberName}</div>
                    <div><span className="text-slate-500">Payer:</span> {eligibilityResult.payerName}</div>
                    <div><span className="text-slate-500">Plan:</span> {eligibilityResult.planType}</div>
                    <div><span className="text-slate-500">Copay:</span> {eligibilityResult.copayAmount} SAR</div>
                    <div><span className="text-slate-500">Deductible:</span> {eligibilityResult.deductibleRemaining} SAR</div>
                    <div><span className="text-slate-500">Max Benefit:</span> {eligibilityResult.maxBenefitRemaining.toLocaleString()} SAR</div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>Network: <Badge variant="outline" className="text-[10px]">{eligibilityResult.networkStatus}</Badge></span>
                    <span>Pre-auth required: {eligibilityResult.preAuthRequired ? "Yes" : "No"}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="claims" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Insurance Claims</CardTitle>
                <Button><Plus className="size-4 mr-2" />New Claim</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Claim ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Payer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboard?.recentClaims?.map((claim: any) => (
                    <TableRow key={claim.id}>
                      <TableCell className="font-mono text-xs">{claim.id}</TableCell>
                      <TableCell>{claim.patientName}</TableCell>
                      <TableCell>{claim.payer}</TableCell>
                      <TableCell>{claim.amount.toLocaleString()} SAR</TableCell>
                      <TableCell>
                        <Badge variant={claim.status === "approved" ? "default" : claim.status === "denied" ? "destructive" : "secondary"}>
                          {claim.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{new Date(claim.date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="codes" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Service Codes (CPT/HCPCS)</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Code</TableHead><TableHead>Description</TableHead><TableHead>Category</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {serviceCodes?.map((sc: any) => (
                      <TableRow key={sc.code}>
                        <TableCell className="font-mono text-xs">{sc.code}</TableCell>
                        <TableCell className="text-xs">{sc.description}</TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px]">{sc.category}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Diagnosis Codes (ICD-10)</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Code</TableHead><TableHead>Description</TableHead><TableHead>Category</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {trpc.nphies.getDiagnosisCodes.useQuery().data?.map((dc: any) => (
                      <TableRow key={dc.code}>
                        <TableCell className="font-mono text-xs">{dc.code}</TableCell>
                        <TableCell className="text-xs">{dc.description}</TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px]">{dc.category}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
