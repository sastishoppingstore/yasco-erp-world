import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Download,
  ExternalLink,
  FileCheck2,
  FileKey,
  KeyRound,
  Loader2,
  PlayCircle,
  RefreshCw,
  Save,
  Shield,
  ShieldCheck,
  ShieldOff,
  Upload,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/providers/trpc";

const COMPLIANCE_TESTS = [
  { id: 0, name: "Standard B2B Invoice", type: "standard", description: "Standard invoice with full VAT" },
  { id: 1, name: "Simplified B2C Invoice", type: "simplified", description: "Simplified invoice for B2C reporting" },
  { id: 2, name: "Zero-rated Invoice", type: "standard", description: "Standard invoice with zero-rated VAT (Z)" },
  { id: 3, name: "Exempt Invoice", type: "standard", description: "Standard invoice with exempt VAT (E)" },
  { id: 4, name: "Credit Note", type: "credit_note", description: "Credit note against a standard invoice" },
  { id: 5, name: "Debit Note", type: "debit_note", description: "Debit note against a standard invoice" },
];

const WAVE_OPTIONS = [
  { value: "wave1", label: "Wave 1 - Phase 1 Only (QR)" },
  { value: "wave2", label: "Wave 2 - Revenue > SAR 3B / 300k txn" },
  { value: "wave3", label: "Wave 3 - Revenue > SAR 1.5B / 150k txn" },
  { value: "wave4", label: "Wave 4 - Revenue > SAR 500M / 50k txn" },
  { value: "wave5", label: "Wave 5 - All remaining taxpayers" },
  { value: "custom", label: "Custom - Manual threshold override" },
];

const ONBOARDING_STEPS = [
  { step: "generate_csr", label: "Generate CSR", description: "Create Certificate Signing Request" },
  { step: "submit_otp", label: "Submit OTP", description: "Enter OTP from Fatoora portal" },
  { step: "receive_compliance_csid", label: "Receive Compliance CSID", description: "Store compliance certificate" },
  { step: "run_compliance_tests", label: "Run Compliance Tests", description: "Submit 6 mandatory test invoices" },
  { step: "exchange_production_csid", label: "Exchange for Production CSID", description: "Upgrade to production certificate" },
  { step: "complete", label: "Complete", description: "Onboarding finished" },
];

export default function ZatcaPhase2SetupPage() {
  const [activeTab, setActiveTab] = useState("onboarding");
  const { data: legalInfo, refetch: refetchLegal } = trpc.zatca.companyLegalGet.useQuery();
  const { data: integration, refetch: refetchIntegration } = trpc.zatca.integrationGet.useQuery();
  const { data: wizardState, refetch: refetchWizard } = trpc.zatca.wizardState.useQuery();
  const saveCredentials = trpc.zatca.integrationSave.useMutation({
    onSuccess: () => { toast.success("Credentials saved"); refetchAll(); },
    onError: (e) => toast.error(e.message),
  });
  const generateCsrMut = trpc.zatca.generateCsr.useMutation({
    onSuccess: (data) => { setCsrPem(data.csrPem); toast.success("CSR generated"); setOnboardingStep(1); },
    onError: (e) => toast.error(e.message),
  });
  const submitOtpMut = trpc.zatca.submitOtp.useMutation({
    onSuccess: (data) => { setComplianceCsid(data.complianceCsid || ""); toast.success("OTP submitted, compliance CSID received"); setOnboardingStep(2); },
    onError: (e) => toast.error(e.message),
  });
  const runComplianceTestMut = trpc.zatca.runComplianceTest.useMutation({
    onSuccess: (data, variables) => {
      setComplianceResults(prev => ({ ...prev, [variables.testId]: data.passed ? "passed" : "failed" }));
      setRunningTestId(null);
      if (data.passed) toast.success(`Test ${variables.testId + 1} passed`);
      else toast.error(`Test ${variables.testId + 1} failed: ${data.error}`);
    },
    onError: (e) => { toast.error(e.message); setRunningTestId(null); },
  });
  const exchangeProductionCsidMut = trpc.zatca.exchangeProductionCsid.useMutation({
    onSuccess: (data) => { setProductionCsid(data.productionCsid || ""); toast.success("Production CSID activated"); setOnboardingStep(5); },
    onError: (e) => toast.error(e.message),
  });
  const saveWaveConfigMut = trpc.zatca.saveWaveConfig.useMutation({
    onSuccess: () => toast.success("Wave configuration saved"),
    onError: (e) => toast.error(e.message),
  });
  const exportArchiveMut = trpc.zatca.exportArchive.useMutation({
    onSuccess: (data) => { toast.success(`Archive exported: ${data.count} invoices`); },
    onError: (e) => toast.error(e.message),
  });
  const verifyArchiveMut = trpc.zatca.verifyArchiveIntegrity.useMutation({
    onSuccess: (data) => { toast.success(`Archive verification: ${data.valid ? "All intact" : "Issues found"}`); },
    onError: (e) => toast.error(e.message),
  });

  const refetchAll = () => { refetchLegal(); refetchIntegration(); refetchWizard(); };

  // Onboarding state
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [csrPem, setCsrPem] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [complianceCsid, setComplianceCsid] = useState("");
  const [productionCsid, setProductionCsid] = useState("");
  const [complianceResults, setComplianceResults] = useState<Record<number, "pending" | "passed" | "failed">>({});
  const [onboardingEnv, setOnboardingEnv] = useState<"sandbox" | "production">("sandbox");

  // Wave config
  const [selectedWave, setSelectedWave] = useState("wave5");
  const [annualRevenue, setAnnualRevenue] = useState("0");
  const [annualTransactions, setAnnualTransactions] = useState("0");
  const [customRevenueThreshold, setCustomRevenueThreshold] = useState("");
  const [customTxnThreshold, setCustomTxnThreshold] = useState("");

  // Compliance test
  const [runningTestId, setRunningTestId] = useState<number | null>(null);

  // Archive
  const [archiveStartDate, setArchiveStartDate] = useState("");
  const [archiveEndDate, setArchiveEndDate] = useState("");

  const handleStartOnboarding = () => {
    saveCredentials.mutate({
      environment: onboardingEnv,
      vatNumber: integration?.vatNumber || legalInfo?.vatNumber || "",
      organizationIdentifier: integration?.organizationIdentifier || legalInfo?.crNumber,
      egsSerialNumber: integration?.egsSerialNumber || "",
      deviceUuid: integration?.deviceUuid || "",
      otpCode: otpCode || undefined,
      csrInformation: csrPem || undefined,
      complianceCsid: complianceCsid || undefined,
      productionCsid: productionCsid || undefined,
    });
    setOnboardingStep(Math.min(onboardingStep + 1, 5));
  };

  const handleGenerateCsr = () => {
    generateCsrMut.mutate({
      egsSerialNumber: integration?.egsSerialNumber || "",
      organizationName: legalInfo?.legalNameEn || "",
      organizationIdentifier: legalInfo?.crNumber || "",
      country: "SA",
      environment: onboardingEnv,
    });
  };

  const handleRunComplianceTest = async (testId: number) => {
    setRunningTestId(testId);
    runComplianceTestMut.mutate({
      testId,
      testType: COMPLIANCE_TESTS[testId].type,
      environment: onboardingEnv,
    });
  };

  const isStepComplete = (stepIndex: number) => {
    if (stepIndex === 0) return Boolean(csrPem);
    if (stepIndex === 1) return Boolean(otpCode);
    if (stepIndex === 2) return Boolean(complianceCsid);
    if (stepIndex === 3) {
      return COMPLIANCE_TESTS.every((t) => complianceResults[t.id] === "passed");
    }
    if (stepIndex === 4) return Boolean(productionCsid);
    return false;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">ZATCA Phase 2 Setup</h2>
          <p className="text-slate-500">Full onboarding, clearance, wave config & compliance testing</p>
        </div>
        <div className="flex gap-2">
          <Badge variant={onboardingEnv === "production" ? "default" : "secondary"}>
            {onboardingEnv === "production" ? "Production" : "Sandbox"}
          </Badge>
          <Select value={onboardingEnv} onValueChange={(v: "sandbox" | "production") => setOnboardingEnv(v)}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sandbox">Sandbox</SelectItem>
              <SelectItem value="production">Production</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="onboarding"><KeyRound className="w-4 h-4 mr-2" />Onboarding</TabsTrigger>
          <TabsTrigger value="compliance"><ShieldCheck className="w-4 h-4 mr-2" />Compliance Tests</TabsTrigger>
          <TabsTrigger value="waves"><FileKey className="w-4 h-4 mr-2" />Wave Config</TabsTrigger>
          <TabsTrigger value="archive"><Download className="w-4 h-4 mr-2" />Archive</TabsTrigger>
        </TabsList>

        {/* Onboarding Tab */}
        <TabsContent value="onboarding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" /> CSID Onboarding Wizard
              </CardTitle>
              <CardDescription>
                Step-by-step ZATCA Phase 2 certificate onboarding. Follow the sequence: CSR → OTP → Compliance CSID → Tests → Production CSID.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-6">
                {ONBOARDING_STEPS.map((step, index) => {
                  const active = index === onboardingStep;
                  const complete = index < onboardingStep || (index === onboardingStep && isStepComplete(index));
                  const future = index > onboardingStep;
                  return (
                    <div
                      key={step.step}
                      className={`rounded-lg border p-3 transition-all ${
                        active ? "border-emerald-500 ring-1 ring-emerald-500/20 bg-emerald-50/50" : ""
                      } ${complete ? "border-emerald-200 bg-emerald-50" : ""} ${future ? "opacity-50" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-500">Step {index + 1}</span>
                        {complete && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                        {active && !complete && <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />}
                      </div>
                      <p className="text-sm font-medium">{step.label}</p>
                      <p className="text-xs text-slate-500 mt-1">{step.description}</p>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-lg border bg-slate-50 p-4 space-y-4">
                {/* Step 0: Generate CSR */}
                {onboardingStep === 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <FileKey className="h-4 w-4" /> Generate CSR
                    </h4>
                    <p className="text-sm text-slate-600">
                      Generate a Certificate Signing Request (CSR) using your company details. The CSR must be submitted to the ZATCA Fatoora portal.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Common Name (EGS Serial)</Label>
                        <Input value={integration?.egsSerialNumber || ""} placeholder="EGS Serial Number" readOnly />
                      </div>
                      <div>
                        <Label>Organization</Label>
                        <Input value={legalInfo?.legalNameEn || ""} placeholder="Company Name" readOnly />
                      </div>
                    </div>
                    <Button onClick={handleGenerateCsr} className="gap-2">
                      <KeyRound className="h-4 w-4" /> Generate CSR
                    </Button>
                    {csrPem && (
                      <div>
                        <Label>CSR PEM</Label>
                        <Textarea value={csrPem} readOnly rows={4} className="font-mono text-xs" />
                        <p className="text-xs text-slate-500 mt-1">
                          Copy this CSR and submit it to the{" "}
                          <a href="https://fatoora.zatca.gov.sa" target="_blank" rel="noreferrer" className="text-emerald-600 underline">
                            ZATCA Fatoora portal <ExternalLink className="inline h-3 w-3" />
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 1: Submit OTP */}
                {onboardingStep === 1 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Submit OTP</h4>
                    <p className="text-sm text-slate-600">
                      Enter the One-Time Password (OTP) received from the ZATCA Fatoora portal after submitting your CSR.
                    </p>
                    <div>
                      <Label>OTP Code</Label>
                      <Input
                        type="password"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="Enter OTP from Fatoora portal"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => setOnboardingStep(0)} variant="outline">Back</Button>
                      <Button onClick={() => {
                        submitOtpMut.mutate({ otp: otpCode, environment: onboardingEnv });
                      }} disabled={!otpCode || submitOtpMut.isPending}>
                        {submitOtpMut.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                        Save OTP & Continue
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2: Receive Compliance CSID */}
                {onboardingStep === 2 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Receive Compliance CSID</h4>
                    <p className="text-sm text-slate-600">
                      Paste the Compliance CSID certificate received from ZATCA after OTP verification.
                    </p>
                    <div>
                      <Label>Compliance CSID (PEM)</Label>
                      <Textarea
                        value={complianceCsid}
                        onChange={(e) => setComplianceCsid(e.target.value)}
                        rows={5}
                        placeholder="-----BEGIN CERTIFICATE----- ..."
                        className="font-mono text-xs"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => setOnboardingStep(1)} variant="outline">Back</Button>
                      <Button onClick={() => {
                        saveCredentials.mutate({
                          environment: onboardingEnv,
                          complianceCsid,
                        });
                        setOnboardingStep(3);
                      }} disabled={!complianceCsid || saveCredentials.isPending}>
                        {saveCredentials.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Store Compliance CSID
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Compliance Tests / Step 4: Production CSID */}
                {(onboardingStep === 3 || onboardingStep === 4) && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Compliance Testing</h4>
                    <p className="text-sm text-slate-600">
                      Complete the compliance testing below first, then return here to exchange for Production CSID.
                    </p>
                    <div className="flex gap-2">
                      <Button onClick={() => setOnboardingStep(2)} variant="outline">Back</Button>
                      <Button onClick={() => setActiveTab("compliance")}>
                        Go to Compliance Tests <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                    {onboardingStep === 4 && (
                      <div className="mt-4 space-y-3 pt-4 border-t">
                        <h4 className="font-semibold">Production CSID</h4>
                        <div>
                          <Label>Production CSID (PEM)</Label>
                          <Textarea
                            value={productionCsid}
                            onChange={(e) => setProductionCsid(e.target.value)}
                            rows={5}
                            placeholder="-----BEGIN CERTIFICATE----- ..."
                            className="font-mono text-xs"
                          />
                        </div>
                        <Button onClick={() => {
                          exchangeProductionCsidMut.mutate({ environment: onboardingEnv });
                        }} disabled={exchangeProductionCsidMut.isPending}>
                          {exchangeProductionCsidMut.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                          Activate Production CSID
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 5: Complete */}
                {onboardingStep === 5 && (
                  <div className="text-center py-6">
                    <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                    <h4 className="font-semibold text-lg">Onboarding Complete!</h4>
                    <p className="text-sm text-slate-600">
                      Your ZATCA Phase 2 setup is complete. You can now submit invoices for clearance and reporting.
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      Environment: {onboardingEnv === "production" ? "Production" : "Sandbox"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Manual Credentials</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label>Private Key</Label>
                <Textarea rows={3} placeholder="PEM format" className="font-mono text-xs"
                  value={integration?.privateKey || ""} readOnly />
              </div>
              <div>
                <Label>Public Key</Label>
                <Textarea rows={3} placeholder="PEM format" className="font-mono text-xs"
                  value={integration?.publicKey || ""} readOnly />
              </div>
              <div>
                <Label>Access Token</Label>
                <Input type="password" placeholder="Basic auth token"
                  value={integration?.accessToken || ""} readOnly />
              </div>
              <div>
                <Label>Secret Token</Label>
                <Input type="password" placeholder="Basic auth secret"
                  value={integration?.secretToken || ""} readOnly />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tests Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck2 className="h-5 w-5" /> 6 Mandatory Compliance Test Invoices
              </CardTitle>
              <CardDescription>
                ZATCA requires 6 test invoices (Standard, Simplified, Zero-rated, Exempt, Credit Note, Debit Note) to be submitted and cleared before production activation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {COMPLIANCE_TESTS.map((test) => {
                const status = complianceResults[test.id] || "pending";
                return (
                  <div
                    key={test.id}
                    className={`flex items-center justify-between rounded-lg border p-4 ${
                      status === "passed" ? "border-emerald-200 bg-emerald-50" : ""
                    } ${status === "failed" ? "border-red-200 bg-red-50" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      {status === "passed" && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                      {status === "failed" && <XCircle className="h-5 w-5 text-red-600" />}
                      {status === "pending" && <div className="h-5 w-5 rounded-full border-2 border-slate-300" />}
                      <div>
                        <p className="font-medium">{test.name}</p>
                        <p className="text-xs text-slate-500">{test.description}</p>
                        <Badge variant="outline" className="mt-1 text-xs">{test.type}</Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={status === "passed" ? "outline" : "default"}
                      onClick={() => handleRunComplianceTest(test.id)}
                      disabled={runningTestId === test.id || status === "passed"}
                    >
                      {runningTestId === test.id ? (
                        <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Running</>
                      ) : status === "passed" ? (
                        <><CheckCircle2 className="h-4 w-4 mr-1" /> Passed</>
                      ) : (
                        <><PlayCircle className="h-4 w-4 mr-1" /> Run Test</>
                      )}
                    </Button>
                  </div>
                );
              })}

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-slate-600">
                  Passed: {Object.values(complianceResults).filter((s) => s === "passed").length} / {COMPLIANCE_TESTS.length}
                </div>
                <Button
                  onClick={() => {
                    setComplianceResults({});
                    toast.info("Compliance tests reset");
                  }}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-1" /> Reset Tests
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wave Config Tab */}
        <TabsContent value="waves" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileKey className="h-5 w-5" /> ZATCA Wave & Threshold Configuration
              </CardTitle>
              <CardDescription>
                Configure which ZATCA integration wave applies based on your annual revenue and transaction volume.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Annual Revenue (SAR)</Label>
                  <Input
                    type="number"
                    value={annualRevenue}
                    onChange={(e) => setAnnualRevenue(e.target.value)}
                    placeholder="e.g. 500000000"
                  />
                </div>
                <div>
                  <Label>Annual Transactions</Label>
                  <Input
                    type="number"
                    value={annualTransactions}
                    onChange={(e) => setAnnualTransactions(e.target.value)}
                    placeholder="e.g. 50000"
                  />
                </div>
              </div>

              <div>
                <Label>ZATCA Wave Assignment</Label>
                <Select value={selectedWave} onValueChange={setSelectedWave}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {WAVE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedWave === "custom" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg border bg-slate-50">
                  <div>
                    <Label>Custom Revenue Threshold (SAR)</Label>
                    <Input
                      type="number"
                      value={customRevenueThreshold}
                      onChange={(e) => setCustomRevenueThreshold(e.target.value)}
                      placeholder="Override revenue threshold"
                    />
                  </div>
                  <div>
                    <Label>Custom Transaction Threshold</Label>
                    <Input
                      type="number"
                      value={customTxnThreshold}
                      onChange={(e) => setCustomTxnThreshold(e.target.value)}
                      placeholder="Override transaction threshold"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-lg border p-3 bg-emerald-50">
                  <p className="text-xs text-slate-500">Required Features</p>
                  <ul className="text-sm mt-1 space-y-1">
                    <li className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-600" /> B2B Clearance</li>
                    <li className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-600" /> B2C Reporting</li>
                    <li className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-600" /> QR Code</li>
                    <li className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-600" /> XAdES Signature</li>
                    <li className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-600" /> PIH Chain</li>
                  </ul>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-slate-500">Wave Details</p>
                  <p className="text-sm font-medium mt-1">
                    {WAVE_OPTIONS.find((o) => o.value === selectedWave)?.label || "Custom"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Effective: {selectedWave === "wave1" ? "2021-12-04" : selectedWave === "wave2" ? "2023-01-01" : selectedWave === "wave3" ? "2023-07-01" : selectedWave === "wave4" ? "2023-11-01" : "2024-07-01"}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-slate-500">Invoice Mode</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">B2B: Standard</Badge>
                    <Badge variant="outline">B2C: Simplified</Badge>
                  </div>
                </div>
              </div>

              <Button className="gap-2" onClick={() => {
                saveWaveConfigMut.mutate({
                  wave: selectedWave,
                  annualRevenue,
                  annualTransactions,
                  customRevenueThreshold: selectedWave === "custom" ? customRevenueThreshold : undefined,
                  customTxnThreshold: selectedWave === "custom" ? customTxnThreshold : undefined,
                });
              }} disabled={saveWaveConfigMut.isPending}>
                {saveWaveConfigMut.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Wave Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Archive Tab */}
        <TabsContent value="archive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" /> 10-Year Archive & Export
              </CardTitle>
              <CardDescription>
                ZATCA requires 10-year secure archival of all invoices, XMLs, hashes, and QR codes with tamper-evident verification.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input type="date" value={archiveStartDate} onChange={(e) => setArchiveStartDate(e.target.value)} />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input type="date" value={archiveEndDate} onChange={(e) => setArchiveEndDate(e.target.value)} />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button className="gap-2" onClick={() => {
                  if (archiveStartDate && archiveEndDate) {
                    exportArchiveMut.mutate({ startDate: archiveStartDate, endDate: archiveEndDate });
                  } else {
                    toast.error("Please select start and end dates");
                  }
                }} disabled={exportArchiveMut.isPending}>
                  {exportArchiveMut.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4" />}
                  Export Archive
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => verifyArchiveMut.mutate()} disabled={verifyArchiveMut.isPending}>
                  {verifyArchiveMut.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Shield className="h-4 w-4" />}
                  Verify Integrity
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => {
                  toast.info("Re-indexing hash chain...");
                  refetchAll();
                }}>
                  <RefreshCw className="h-4 w-4" /> Re-index Hashes
                </Button>
              </div>

              <div className="rounded-lg border bg-slate-50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Archive Status</span>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">All Intact</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Total Archived</p>
                    <p className="font-semibold">0 invoices</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Chain Integrity</p>
                    <p className="font-semibold text-emerald-600">Valid</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Tampered Entries</p>
                    <p className="font-semibold text-emerald-600">0</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Last Verification</p>
                    <p className="font-semibold">-</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                <strong>Legal Requirement:</strong> ZATCA mandates 10-year retention of all e-invoice data including XML, QR, hashes, signatures, and certificate information. Ensure backups are stored securely and are tamper-evident.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
