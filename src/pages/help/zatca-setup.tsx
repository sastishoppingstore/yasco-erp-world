import { ArrowRight, CheckCircle2, ExternalLink, FileKey2, Landmark, QrCode, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  { title: "Obtain VAT Registration", text: "Register the Saudi business with the Saudi Tax Authority and confirm the 15-digit VAT number.", icon: Landmark },
  { title: "Obtain Commercial Registration", text: "Keep the CR number, legal Arabic/English names, national address, and business activity ready.", icon: ShieldCheck },
  { title: "Generate CSR", text: "Generate a CSR for the EGS device and keep the private key secure inside the ERP tenant vault.", icon: FileKey2 },
  { title: "Request Compliance Certificate", text: "Use the ZATCA/FATOORA onboarding process and save the Compliance CSID in Settings.", icon: CheckCircle2 },
  { title: "Obtain Production Certificate", text: "After passing compliance checks, copy the Production CSID and tokens into the tenant ZATCA Integration page.", icon: QrCode },
  { title: "Copy Credentials into ERP", text: "Each company enters its own credentials. The platform never shares one ZATCA account across tenants.", icon: ArrowRight },
];

const links = [
  ["Official ZATCA Portal", "https://zatca.gov.sa"],
  ["Developer Portal", "https://zatca.gov.sa/en/E-Invoicing/SystemsDevelopers"],
  ["E-Invoicing Guidelines", "https://zatca.gov.sa/en/E-Invoicing"],
  ["SDK & Technical Documentation", "https://zatca1.discourse.group"],
];

export default function ZatcaSetupHelpPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-emerald-300">Saudi Arabia FATOORA Phase 2</p>
          <h1 className="text-4xl font-bold tracking-tight">ZATCA Setup Guide</h1>
          <p className="mt-4 text-slate-300">Follow these steps to connect your company’s own Saudi ZATCA credentials, generate UBL XML, sign invoices, create QR codes, and submit invoices for clearance or reporting.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={step.title} className="border-white/10 bg-white/5 text-white">
              <CardHeader>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                  <step.icon className="h-5 w-5 text-emerald-300" />
                </div>
                <CardTitle>Step {index + 1}: {step.title}</CardTitle>
              </CardHeader>
              <CardContent><p className="text-sm text-slate-300">{step.text}</p></CardContent>
            </Card>
          ))}
        </div>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader><CardTitle>Setup Wizard Preview</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {["Company Information", "VAT Details", "CR Details", "ZATCA Credentials", "Compliance Test", "Production Activation", "Success Confirmation"].map((label, index) => (
                <div key={label} className="flex items-center justify-between rounded-lg border border-white/10 p-3">
                  <span className="text-sm">Step {index + 1}: {label}</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                </div>
              ))}
              <Button asChild className="mt-3 bg-emerald-500 text-slate-950 hover:bg-emerald-400">
                <a href="/app/settings/zatca-integration">Open ZATCA Integration</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader><CardTitle>Official Resources</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {links.map(([label, url]) => (
                <a key={url} href={url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-lg border border-white/10 p-3 text-sm hover:bg-white/10">
                  <span>{label}</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              ))}
            </CardContent>
          </Card>
        </section>
      </section>
    </main>
  );
}
