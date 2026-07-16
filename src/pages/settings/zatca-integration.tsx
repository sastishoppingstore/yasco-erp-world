import { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, KeyRound, PlayCircle, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/providers/trpc";

const secretFields = {
  otpCode: "",
  csrInformation: "",
  zatcaCertificate: "",
  privateKey: "",
  publicKey: "",
  complianceCsid: "",
  productionCsid: "",
  accessToken: "",
  secretToken: "",
};

export default function ZatcaIntegrationPage() {
  const { data, refetch } = trpc.zatca.integrationGet.useQuery();
  const { data: wizard } = trpc.zatca.wizardState.useQuery();
  const { data: dashboard } = trpc.zatca.dashboard.useQuery();
  const { data: resources } = trpc.zatca.officialResources.useQuery();
  const save = trpc.zatca.integrationSave.useMutation({
    onSuccess: () => {
      toast.success("ZATCA credentials saved with encrypted storage");
      setSecrets(secretFields);
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });
  const complianceCheck = trpc.zatca.complianceCheck.useMutation({
    onSuccess: (result) => toast.success(result.liveSubmitted ? "Compliance request submitted to ZATCA" : "Readiness check logged"),
    onError: (error) => toast.error(error.message),
  });
  const [form, setForm] = useState({
    environment: "sandbox" as "sandbox" | "production",
    vatNumber: "",
    organizationIdentifier: "",
    egsSerialNumber: "",
    deviceUuid: "",
    certificateExpiresAt: "",
  });
  const [secrets, setSecrets] = useState(secretFields);

  useEffect(() => {
    if (data) {
      setForm((prev) => ({
        ...prev,
        environment: data.environment as "sandbox" | "production",
        vatNumber: data.vatNumber || "",
        organizationIdentifier: data.organizationIdentifier || "",
        egsSerialNumber: data.egsSerialNumber || "",
        deviceUuid: data.deviceUuid || "",
      }));
    }
  }, [data]);

  const saveCredentials = () => save.mutate({ ...form, ...secrets });
  const credentialFlags = [
    ["OTP", data?.hasOtp],
    ["CSR", data?.hasCsr],
    ["Certificate", data?.hasCertificate],
    ["Private Key", data?.hasPrivateKey],
    ["Public Key", data?.hasPublicKey],
    ["Compliance CSID", data?.hasComplianceCsid],
    ["Production CSID", data?.hasProductionCsid],
    ["Access Token", data?.hasAccessToken],
    ["Secret Token", data?.hasSecretToken],
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">ZATCA Integration</h2>
          <p className="text-slate-500">Each tenant connects its own FATOORA Phase 2 account. No shared Super Admin ZATCA account is used.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => complianceCheck.mutate({})} disabled={complianceCheck.isPending}>
            <PlayCircle className="mr-2 h-4 w-4" /> Compliance Check
          </Button>
          <Button onClick={saveCredentials} disabled={save.isPending}><Save className="mr-2 h-4 w-4" /> Save</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="p-4"><p className="text-sm text-slate-500">Total Invoices</p><p className="text-2xl font-bold">{dashboard?.totalInvoices ?? 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-slate-500">Cleared</p><p className="text-2xl font-bold text-emerald-600">{dashboard?.clearedInvoices ?? 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-slate-500">Pending</p><p className="text-2xl font-bold text-amber-600">{dashboard?.pendingInvoices ?? 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-slate-500">Failed</p><p className="text-2xl font-bold text-red-600">{dashboard?.failedInvoices ?? 0}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Setup Wizard</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-7">
          {wizard?.map((step) => (
            <div key={step.step} className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">Step {step.step}</span>
                {step.complete && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
              </div>
              <p className="mt-2 text-sm font-medium">{step.label}</p>
              <Badge variant={step.complete ? "default" : "secondary"} className="mt-2">{step.complete ? "Complete" : "Pending"}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader><CardTitle>Tenant ZATCA Credentials</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Environment</Label>
              <Select value={form.environment} onValueChange={(value: "sandbox" | "production") => setForm({ ...form, environment: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">Sandbox</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>VAT Number</Label><Input value={form.vatNumber} maxLength={15} onChange={(e) => setForm({ ...form, vatNumber: e.target.value.replace(/\D/g, "") })} /></div>
            <div><Label>Organization Identifier</Label><Input value={form.organizationIdentifier} onChange={(e) => setForm({ ...form, organizationIdentifier: e.target.value })} /></div>
            <div><Label>EGS Serial Number</Label><Input value={form.egsSerialNumber} onChange={(e) => setForm({ ...form, egsSerialNumber: e.target.value })} /></div>
            <div><Label>Device UUID</Label><Input value={form.deviceUuid} onChange={(e) => setForm({ ...form, deviceUuid: e.target.value })} /></div>
            <div><Label>Certificate Expiry</Label><Input type="date" value={form.certificateExpiresAt} onChange={(e) => setForm({ ...form, certificateExpiresAt: e.target.value })} /></div>
            <div><Label>OTP Code</Label><Input type="password" value={secrets.otpCode} onChange={(e) => setSecrets({ ...secrets, otpCode: e.target.value })} /></div>
            <div><Label>Access Token</Label><Input type="password" value={secrets.accessToken} onChange={(e) => setSecrets({ ...secrets, accessToken: e.target.value })} /></div>
            <div><Label>Secret Token</Label><Input type="password" value={secrets.secretToken} onChange={(e) => setSecrets({ ...secrets, secretToken: e.target.value })} /></div>
            <div><Label>Compliance CSID</Label><Input type="password" value={secrets.complianceCsid} onChange={(e) => setSecrets({ ...secrets, complianceCsid: e.target.value })} /></div>
            <div><Label>Production CSID</Label><Input type="password" value={secrets.productionCsid} onChange={(e) => setSecrets({ ...secrets, productionCsid: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>CSR Information</Label><Textarea value={secrets.csrInformation} onChange={(e) => setSecrets({ ...secrets, csrInformation: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>ZATCA Certificate</Label><Textarea value={secrets.zatcaCertificate} onChange={(e) => setSecrets({ ...secrets, zatcaCertificate: e.target.value })} /></div>
            <div><Label>Private Key</Label><Textarea value={secrets.privateKey} onChange={(e) => setSecrets({ ...secrets, privateKey: e.target.value })} /></div>
            <div><Label>Public Key</Label><Textarea value={secrets.publicKey} onChange={(e) => setSecrets({ ...secrets, publicKey: e.target.value })} /></div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" /> Secure Storage Status</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {credentialFlags.map(([label, ok]) => (
                <Badge key={String(label)} variant={ok ? "default" : "secondary"}>{String(label)}: {ok ? "Saved" : "Missing"}</Badge>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Official Resources</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {(resources || data?.officialResources || []).map((link) => (
                <a key={link.url} href={link.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-slate-50">
                  <span>{link.label}</span><ExternalLink className="h-4 w-4" />
                </a>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Certificate Warning</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-slate-600">{dashboard?.certificateExpiryWarning}</p></CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
