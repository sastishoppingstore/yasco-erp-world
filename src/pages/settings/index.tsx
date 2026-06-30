import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/providers/trpc";
import { Building2, Receipt, Palette, Shield, Bot, Eye, EyeOff } from "lucide-react";

import { TaxComplianceSettings } from "./TaxComplianceSettings";
import ThemeSelector from "@/components/ThemeSelector";

export default function SettingsPage() {
  const { data: settings, refetch } = trpc.settings.companySettingsGet.useQuery();
  const updateSettings = trpc.settings.companySettingsUpdate.useMutation({ onSuccess: () => refetch() });
  const { data: taxRates } = trpc.settings.taxRateList.useQuery();
  const { data: currencies } = trpc.settings.currencyList.useQuery();

  const [form, setForm] = useState({
    companyName: "", companyNameAr: "", tradeName: "", email: "", phone: "", mobile: "", website: "",
    address: "", city: "", country: "Saudi Arabia", zipCode: "",
    taxNumber: "", crNumber: "", vatRate: "15", defaultCurrency: "SAR", invoiceTerms: "",
    logo: "", theme: "light",
    primaryColor: "#2563eb", secondaryColor: "#64748b", zatcaEnabled: false, zatcaSandbox: true,
  });

  useEffect(() => {
    if (settings) {
      setForm(prev => ({
        ...prev,
        companyName: settings.companyName ?? "",
        companyNameAr: settings.companyNameAr ?? "",
        tradeName: settings.tradeName ?? "",
        email: settings.email ?? "",
        phone: settings.phone ?? "",
        mobile: settings.mobile ?? "",
        website: settings.website ?? "",
        address: settings.address ?? "",
        city: settings.city ?? "",
        country: settings.country ?? "Saudi Arabia",
        zipCode: settings.zipCode ?? "",
        taxNumber: settings.taxNumber ?? "",
        crNumber: settings.crNumber ?? "",
        vatRate: settings.vatRate ?? "15",
        defaultCurrency: settings.defaultCurrency ?? "SAR",
        invoiceTerms: settings.invoiceTerms ?? "",
        logo: settings.logo ?? "",
        theme: settings.theme ?? "light",
        primaryColor: settings.primaryColor ?? "#2563eb",
        secondaryColor: settings.secondaryColor ?? "#64748b",
        zatcaEnabled: settings.zatcaEnabled ?? false,
        zatcaSandbox: settings.zatcaSandbox ?? true,
      }));
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate(form);
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Settings</h2><p className="text-slate-500">Configure your company and system preferences</p></div>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto">
          <TabsTrigger value="company"><Building2 className="w-4 h-4 mr-2 hidden sm:inline" />Company</TabsTrigger>
          <TabsTrigger value="finance"><Receipt className="w-4 h-4 mr-2 hidden sm:inline" />Finance</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="w-4 h-4 mr-2 hidden sm:inline" />Appearance</TabsTrigger>
          <TabsTrigger value="ai"><Bot className="w-4 h-4 mr-2 hidden sm:inline" />AI</TabsTrigger>
          <TabsTrigger value="compliance"><Shield className="w-4 h-4 mr-2 hidden sm:inline" />Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Company Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Company Name</Label><Input value={form.companyName} placeholder="Al Watan Trading Co." onChange={e => setForm({...form, companyName: e.target.value})} /></div>
                <div><Label>Company Name (Arabic)</Label><Input value={form.companyNameAr} placeholder="شركة الوطن للتجارة" onChange={e => setForm({...form, companyNameAr: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Trade Name</Label><Input value={form.tradeName} placeholder="Retail / Branch Name" onChange={e => setForm({...form, tradeName: e.target.value})} /></div>
                <div><Label>Logo URL or Base64</Label><Input value={form.logo} placeholder="https://.../logo.png" onChange={e => setForm({...form, logo: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Email</Label><Input value={form.email} placeholder="info@company.sa" onChange={e => setForm({...form, email: e.target.value})} /></div>
                <div><Label>Phone</Label><Input value={form.phone} placeholder="+966-11-454-0000" onChange={e => setForm({...form, phone: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Mobile / WhatsApp</Label><Input value={form.mobile} placeholder="+966-5x-xxx-xxxx" onChange={e => setForm({...form, mobile: e.target.value})} /></div>
                <div><Label>Website</Label><Input value={form.website} placeholder="https://company.sa" onChange={e => setForm({...form, website: e.target.value})} /></div>
              </div>
              <div><Label>Address</Label><Input value={form.address} placeholder="King Fahd Road, Riyadh" onChange={e => setForm({...form, address: e.target.value})} /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>City</Label><Input value={form.city} placeholder="Riyadh" onChange={e => setForm({...form, city: e.target.value})} /></div>
                <div><Label>Country</Label><Input value={form.country} placeholder="Saudi Arabia" onChange={e => setForm({...form, country: e.target.value})} /></div>
                <div><Label>Zip / Postal Code</Label><Input value={form.zipCode} placeholder="12211" onChange={e => setForm({...form, zipCode: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>VAT Number / Tax Number</Label><Input value={form.taxNumber} placeholder="300000000000003" onChange={e => setForm({...form, taxNumber: e.target.value})} /></div>
                <div><Label>CR Number</Label><Input value={form.crNumber} placeholder="1010123456" onChange={e => setForm({...form, crNumber: e.target.value})} /></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finance" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Financial Settings</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div><Label>Default VAT Rate (%)</Label><Input value={form.vatRate} onChange={e => setForm({...form, vatRate: e.target.value})} /></div>
                <div><Label>Default Currency</Label><Input value={form.defaultCurrency} onChange={e => setForm({...form, defaultCurrency: e.target.value})} /></div>
              </div>
              <div className="mb-6"><Label>Invoice Terms</Label><Input value={form.invoiceTerms} placeholder="Payment due on receipt. Goods sold are subject to VAT rules." onChange={e => setForm({...form, invoiceTerms: e.target.value})} /></div>
              <div className="mb-6 flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label>Enable Saudi ZATCA Invoice Readiness</Label>
                  <p className="text-xs text-slate-500">Adds Saudi VAT 15%, QR payload, XML archive fields, and ZATCA status to invoices.</p>
                </div>
                <Switch checked={form.zatcaEnabled} onCheckedChange={(v) => setForm({...form, zatcaEnabled: v})} />
              </div>
              <h4 className="font-medium mb-3">Tax Rates</h4>
              <div className="space-y-2">
                {taxRates?.map(tax => (
                  <div key={tax.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div><span className="font-medium">{tax.name}</span><span className="text-xs text-slate-500 ml-2">({tax.type})</span></div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono">{tax.rate}%</span>
                      {tax.isDefault && <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">Default</span>}
                    </div>
                  </div>
                ))}
              </div>
              <h4 className="font-medium mb-3 mt-6">Currencies</h4>
              <div className="space-y-2">
                {currencies?.map(curr => (
                  <div key={curr.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div><span className="font-medium">{curr.code}</span><span className="text-sm text-slate-500 ml-2">{curr.name}</span></div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono">{curr.symbol} {curr.exchangeRate}</span>
                      {curr.isBase && <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">Base</span>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

         <TabsContent value="appearance" className="space-y-4">
           <Card>
             <CardHeader><CardTitle>Theme Presets</CardTitle></CardHeader>
             <CardContent>
               <ThemeSelector />
             </CardContent>
           </Card>
           <Card>
             <CardHeader><CardTitle>Custom Colors</CardTitle></CardHeader>
             <CardContent className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div><Label>Primary Color</Label><div className="flex items-center gap-2"><Input type="color" value={form.primaryColor} onChange={e => setForm({...form, primaryColor: e.target.value})} className="w-16 h-10 p-1" /><span className="text-sm text-slate-500">{form.primaryColor}</span></div></div>
                 <div><Label>Secondary Color</Label><div className="flex items-center gap-2"><Input type="color" value={form.secondaryColor} onChange={e => setForm({...form, secondaryColor: e.target.value})} className="w-16 h-10 p-1" /><span className="text-sm text-slate-500">{form.secondaryColor}</span></div></div>
               </div>
               <div><Label>Invoice Prefix</Label><Input defaultValue="INV-" /></div>
               <div><Label>PO Prefix</Label><Input defaultValue="PO-" /></div>
               <div><Label>Date Format</Label><Input defaultValue="DD/MM/YYYY" /></div>
             </CardContent>
           </Card>
         </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <AiSettingsTab />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <TaxComplianceSettings />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Reset</Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
}

function AiSettingsTab() {
  const { data: aiSettings, refetch } = trpc.settings.aiSettingsGet.useQuery();
  const updateAi = trpc.settings.aiSettingsUpdate.useMutation({ onSuccess: () => refetch() });
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gemini-2.0-flash");
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (aiSettings) {
      setModel(aiSettings.aiModel || "gemini-2.0-flash");
    }
  }, [aiSettings]);

  const handleSave = () => {
    updateAi.mutate(
      { aiApiKey: apiKey || undefined, aiModel: model },
      { onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 3000); } },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-emerald-500" />
          AI Assistant Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Gemini API Key</Label>
          <div className="flex gap-2 mt-1">
            <div className="relative flex-1">
              <Input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder={aiSettings?.aiApiKeySet ? "**** (key already set, leave blank to keep)" : "Enter Gemini API key..."}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {aiSettings?.aiApiKeySet && !apiKey && (
            <p className="text-xs text-emerald-400 mt-1">✓ API key is configured. Enter a new value to change it.</p>
          )}
          <p className="text-xs text-slate-500 mt-1">Get your free API key at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" className="text-emerald-400 underline">aistudio.google.com/apikey</a></p>
        </div>

        <div>
          <Label>AI Model</Label>
          <select
            value={model}
            onChange={e => setModel(e.target.value)}
            className="w-full mt-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
          >
            <option value="gemini-2.0-flash">Gemini 2.0 Flash (fast, default)</option>
            <option value="gemini-2.5-flash">Gemini 2.5 Flash (latest)</option>
            <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
            <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite</option>
          </select>
          <p className="text-xs text-slate-500 mt-1">Choose which Gemini model to use for AI responses</p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} disabled={updateAi.isPending}>
            {updateAi.isPending ? "Saving..." : "Save AI Settings"}
          </Button>
          {saved && (
            <span className="flex items-center gap-1 text-sm text-emerald-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Saved
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
