import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { CheckCircle2, ShieldAlert, Server, FileCheck2, Globe2, XCircle } from "lucide-react";
import { useCountryDetection } from "@/providers/country-detection";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function TaxComplianceSettings() {
  const { taxProfile } = useCountryDetection();
  
  const [zatcaEnabled, setZatcaEnabled] = useState(false);
  const [zatcaSandbox, setZatcaSandbox] = useState(true);
  const [fbrEnabled, setFbrEnabled] = useState(false);
  const [fbrSandbox, setFbrSandbox] = useState(true);
  const [uaeVatEnabled, setUaeVatEnabled] = useState(false);

  // ZATCA Fields
  const [vatNumber, setVatNumber] = useState("");
  const [crNumber, setCrNumber] = useState("");
  const [waveNumber, setWaveNumber] = useState("");
  const [egsUnitName, setEgsUnitName] = useState("");
  const [invoiceMode, setInvoiceMode] = useState<"auto" | "standard" | "simplified">("auto");
  const [sandboxUrl, setSandboxUrl] = useState("https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal");
  const [endpointUrl, setEndpointUrl] = useState("https://gw-fatoora.zatca.gov.sa/e-invoicing/core");
  const [csr, setCsr] = useState("");
  const [ccsid, setCcsid] = useState("");
  const [pcsid, setPcsid] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [publicKey, setPublicKey] = useState("");
  
  // FBR Fields
  const [posCode, setPosCode] = useState("");
  const [ntn, setNtn] = useState("");
  const [strn, setStrn] = useState("");

  // UAE VAT Fields
  const [trn, setTrn] = useState("");

  const zatcaSettings = trpc.taxCompliance.zatcaSettings.useQuery();
  const zatcaPhase2 = trpc.taxCompliance.zatcaPhase2Profile.useQuery();
  const zatcaChecks = trpc.taxCompliance.zatcaComplianceChecks.useQuery();
  const fbrSettings = trpc.taxCompliance.fbrSettings.useQuery();
  const updateZatcaSettings = trpc.taxCompliance.updateZatcaSettings.useMutation({
    onSuccess: () => {
      zatcaSettings.refetch();
      toast.success("ZATCA company settings saved");
    },
    onError: (error) => toast.error(error.message),
  });
  const updateZatcaPhase2 = trpc.taxCompliance.updateZatcaPhase2Profile.useMutation({
    onSuccess: () => {
      zatcaPhase2.refetch();
      zatcaChecks.refetch();
      toast.success("ZATCA Phase 2 profile saved");
    },
    onError: (error) => toast.error(error.message),
  });

  useEffect(() => {
    if (zatcaSettings.data) {
      setZatcaEnabled(zatcaSettings.data.enabled);
      setZatcaSandbox(zatcaSettings.data.sandbox);
      setVatNumber(zatcaSettings.data.vatNumber);
      setCrNumber(zatcaSettings.data.crNumber);
    }
  }, [zatcaSettings.data]);

  useEffect(() => {
    if (!zatcaPhase2.data) return;
    setSandboxUrl(zatcaPhase2.data.sandboxUrl);
    setEndpointUrl(zatcaPhase2.data.endpointUrl);
    setWaveNumber(zatcaPhase2.data.waveNumber);
    setEgsUnitName(zatcaPhase2.data.egsUnitName);
    setInvoiceMode(zatcaPhase2.data.invoiceMode as "auto" | "standard" | "simplified");
  }, [zatcaPhase2.data]);

  useEffect(() => {
    if (fbrSettings.data) {
      setFbrEnabled(fbrSettings.data.enabled);
      setFbrSandbox(fbrSettings.data.sandbox);
      setPosCode(fbrSettings.data.posCode);
      setNtn(fbrSettings.data.businessIdentifier);
    }
  }, [fbrSettings.data]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Globe2 className="size-5 text-slate-500" />
        <h3 className="text-lg font-medium">Regional Tax Compliance</h3>
        <Badge variant="outline" className="ml-auto bg-emerald-50 text-emerald-600 border-emerald-200">
          Detected Profile: {taxProfile}
        </Badge>
      </div>

      {/* Saudi Arabia (ZATCA) */}
      <Card className={cn("transition-all duration-300", taxProfile === "SA" ? "border-emerald-500 ring-1 ring-emerald-500/20" : "")}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                🇸🇦 ZATCA E-Invoicing
                {zatcaEnabled && <Badge className="bg-emerald-500">Active</Badge>}
              </CardTitle>
              <CardDescription>Saudi Arabia Fatoora Phase 1 & 2 Integration</CardDescription>
            </div>
            <Switch checked={zatcaEnabled} onCheckedChange={setZatcaEnabled} />
          </div>
        </CardHeader>
        {zatcaEnabled && (
          <CardContent className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div>
                <Label className="text-sm font-semibold">Sandbox Mode (Testing)</Label>
                <p className="text-xs text-slate-500">Connect to ZATCA developer portal</p>
              </div>
              <Switch checked={zatcaSandbox} onCheckedChange={setZatcaSandbox} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>VAT Registration Number</Label>
                <Input value={vatNumber} onChange={e => setVatNumber(e.target.value)} placeholder="Starts with 3, 15 digits" />
              </div>
              <div className="space-y-2">
                <Label>Commercial Registration (CR)</Label>
                <Input value={crNumber} onChange={e => setCrNumber(e.target.value)} placeholder="e.g. 1010123456" />
              </div>
            </div>
            <div className="pt-2 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  zatcaChecks.refetch();
                  toast.info("ZATCA readiness checks refreshed");
                }}
              >
                <Server className="size-4" /> Test Connection
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => updateZatcaPhase2.mutate({
                  enabled: zatcaEnabled,
                  sandbox: zatcaSandbox,
                  endpointUrl,
                  sandboxUrl,
                  waveNumber,
                  egsUnitName,
                  invoiceMode,
                  csr: csr || undefined,
                  ccsid: ccsid || undefined,
                  pcsid: pcsid || undefined,
                  privateKey: privateKey || undefined,
                  publicKey: publicKey || undefined,
                })}
              >
                <FileCheck2 className="size-4" /> Save Phase 2 Profile
              </Button>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">ZATCA Phase 2 Control</h4>
                  <p className="text-xs text-slate-500">CSID, EGS, clearance/reporting readiness and 9-tag QR requirements.</p>
                </div>
                <Badge variant="outline" className={cn(
                  zatcaPhase2.data?.status === "production_ready" && "border-emerald-200 bg-emerald-50 text-emerald-700",
                  zatcaPhase2.data?.status === "sandbox_ready" && "border-amber-200 bg-amber-50 text-amber-700",
                  zatcaPhase2.data?.status === "setup_required" && "border-red-200 bg-red-50 text-red-700",
                )}>
                  {zatcaPhase2.data?.status || "setup_required"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>ZATCA Wave Number</Label>
                  <Input value={waveNumber} onChange={e => setWaveNumber(e.target.value)} placeholder="Wave 12 / Manual" />
                </div>
                <div className="space-y-2">
                  <Label>EGS Unit Name</Label>
                  <Input value={egsUnitName} onChange={e => setEgsUnitName(e.target.value)} placeholder="Main Riyadh POS" />
                </div>
                <div className="space-y-2">
                  <Label>Invoice Mode</Label>
                  <select
                    value={invoiceMode}
                    onChange={(e) => setInvoiceMode(e.target.value as typeof invoiceMode)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="auto">Auto B2B/B2C</option>
                    <option value="standard">Standard B2B Clearance</option>
                    <option value="simplified">Simplified B2C Reporting</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Sandbox URL</Label>
                  <Input value={sandboxUrl} onChange={e => setSandboxUrl(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Production URL</Label>
                  <Input value={endpointUrl} onChange={e => setEndpointUrl(e.target.value)} />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>CSR</Label>
                  <Input value={csr} onChange={e => setCsr(e.target.value)} placeholder="Paste CSR when generated" />
                </div>
                <div className="space-y-2">
                  <Label>CCSID</Label>
                  <Input value={ccsid} onChange={e => setCcsid(e.target.value)} placeholder="Compliance certificate token" />
                </div>
                <div className="space-y-2">
                  <Label>PCSID</Label>
                  <Input value={pcsid} onChange={e => setPcsid(e.target.value)} placeholder="Production certificate token" />
                </div>
                <div className="space-y-2">
                  <Label>Private Key</Label>
                  <Input value={privateKey} onChange={e => setPrivateKey(e.target.value)} placeholder="Encrypted on save" type="password" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Public Key</Label>
                  <Input value={publicKey} onChange={e => setPublicKey(e.target.value)} placeholder="Used for Phase 2 QR tag 8" />
                </div>
              </div>

              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {zatcaPhase2.data?.checks.map((check) => (
                  <div key={check.key} className="flex items-start gap-2 rounded-lg border bg-slate-50 p-2">
                    {check.ok ? <CheckCircle2 className="mt-0.5 size-4 text-emerald-600" /> : <XCircle className="mt-0.5 size-4 text-red-600" />}
                    <div>
                      <div className="text-sm font-medium">{check.label}</div>
                      <div className="text-xs text-slate-500">{check.detail}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                Live clearance/reporting stays locked until PCSID/private key are configured and certified. This avoids false legal claims before ZATCA production onboarding is complete.
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Pakistan (FBR) */}
      <Card className={cn("transition-all duration-300", taxProfile === "PK" ? "border-emerald-500 ring-1 ring-emerald-500/20" : "")}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                🇵🇰 FBR Integration
                {fbrEnabled && <Badge className="bg-blue-500">Active</Badge>}
              </CardTitle>
              <CardDescription>Pakistan Digital Invoicing & POS Readiness</CardDescription>
            </div>
            <Switch checked={fbrEnabled} onCheckedChange={setFbrEnabled} />
          </div>
        </CardHeader>
        {fbrEnabled && (
          <CardContent className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div>
                <Label className="text-sm font-semibold">Sandbox Mode (Testing)</Label>
                <p className="text-xs text-slate-500">Connect to PRAL test servers</p>
              </div>
              <Switch checked={fbrSandbox} onCheckedChange={setFbrSandbox} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>NTN / CNIC</Label>
                <Input value={ntn} onChange={e => setNtn(e.target.value)} placeholder="7-digit NTN or 13-digit CNIC" />
              </div>
              <div className="space-y-2">
                <Label>STRN (Sales Tax Reg)</Label>
                <Input value={strn} onChange={e => setStrn(e.target.value)} placeholder="e.g. 327787612345" />
              </div>
              <div className="space-y-2">
                <Label>POS ID (FBR)</Label>
                <Input value={posCode} onChange={e => setPosCode(e.target.value)} placeholder="e.g. 100239" />
              </div>
            </div>
            <div className="pt-2 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Server className="size-4" /> Verify Credentials
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <CheckCircle2 className="size-4" /> View Submission Logs
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* UAE (VAT) */}
      <Card className={cn("transition-all duration-300", taxProfile === "AE" ? "border-emerald-500 ring-1 ring-emerald-500/20" : "")}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                🇦🇪 UAE VAT Compliance
                {uaeVatEnabled && <Badge className="bg-amber-500">Active</Badge>}
              </CardTitle>
              <CardDescription>Federal Tax Authority (FTA) Requirements</CardDescription>
            </div>
            <Switch checked={uaeVatEnabled} onCheckedChange={setUaeVatEnabled} />
          </div>
        </CardHeader>
        {uaeVatEnabled && (
          <CardContent className="space-y-4 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>TRN (Tax Registration Number)</Label>
                <Input value={trn} onChange={e => setTrn(e.target.value)} placeholder="15-digit TRN" />
              </div>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 flex items-start gap-3 mt-4">
              <ShieldAlert className="size-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Reverse Charge & Zero Rating</p>
                <p>Ensure your product settings and customer profiles are correctly configured for VAT exemptions and reverse charge mechanisms.</p>
              </div>
            </div>
            <div className="pt-2 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <FileCheck2 className="size-4" /> Generate VAT Return Report
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
      
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline">Discard Changes</Button>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={() => {
            updateZatcaSettings.mutate({
              enabled: zatcaEnabled,
              sandbox: zatcaSandbox,
              vatNumber,
              crNumber,
              country: taxProfile === "SA" ? "Saudi Arabia" : undefined,
            });
            updateZatcaPhase2.mutate({
              enabled: zatcaEnabled,
              sandbox: zatcaSandbox,
              endpointUrl,
              sandboxUrl,
              waveNumber,
              egsUnitName,
              invoiceMode,
              csr: csr || undefined,
              ccsid: ccsid || undefined,
              pcsid: pcsid || undefined,
              privateKey: privateKey || undefined,
              publicKey: publicKey || undefined,
            });
          }}
        >
          Save Tax Settings
        </Button>
      </div>
    </div>
  );
}
