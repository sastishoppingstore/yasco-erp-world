import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/providers/trpc";
import { Building2, Receipt, Palette, Shield } from "lucide-react";

export default function SettingsPage() {
  const { data: settings, refetch } = trpc.settings.companySettingsGet.useQuery();
  const updateSettings = trpc.settings.companySettingsUpdate.useMutation({ onSuccess: () => refetch() });
  const { data: taxRates } = trpc.settings.taxRateList.useQuery();
  const { data: currencies } = trpc.settings.currencyList.useQuery();

  const [form, setForm] = useState({
    companyName: "", companyNameAr: "", email: "", phone: "", address: "", city: "", country: "",
    taxNumber: "", crNumber: "", vatRate: "15", defaultCurrency: "SAR", theme: "light",
    primaryColor: "#2563eb", secondaryColor: "#64748b", zatcaEnabled: false,
  });

  useEffect(() => {
    if (settings) {
      setForm(prev => ({
        ...prev,
        companyName: settings.companyName ?? "",
        companyNameAr: settings.companyNameAr ?? "",
        email: settings.email ?? "",
        phone: settings.phone ?? "",
        address: settings.address ?? "",
        city: settings.city ?? "",
        country: settings.country ?? "",
        taxNumber: settings.taxNumber ?? "",
        crNumber: settings.crNumber ?? "",
        vatRate: settings.vatRate ?? "15",
        defaultCurrency: settings.defaultCurrency ?? "SAR",
        theme: settings.theme ?? "light",
        primaryColor: settings.primaryColor ?? "#2563eb",
        secondaryColor: settings.secondaryColor ?? "#64748b",
        zatcaEnabled: settings.zatcaEnabled ?? false,
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
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="company"><Building2 className="w-4 h-4 mr-2 hidden sm:inline" />Company</TabsTrigger>
          <TabsTrigger value="finance"><Receipt className="w-4 h-4 mr-2 hidden sm:inline" />Finance</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="w-4 h-4 mr-2 hidden sm:inline" />Appearance</TabsTrigger>
          <TabsTrigger value="compliance"><Shield className="w-4 h-4 mr-2 hidden sm:inline" />Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Company Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Company Name</Label><Input placeholder="Al Watan Trading Co." onChange={e => setForm({...form, companyName: e.target.value})} /></div>
                <div><Label>Company Name (Arabic)</Label><Input placeholder="شركة الوطن للتجارة" onChange={e => setForm({...form, companyNameAr: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Email</Label><Input placeholder="info@company.sa" onChange={e => setForm({...form, email: e.target.value})} /></div>
                <div><Label>Phone</Label><Input placeholder="+966-11-454-0000" onChange={e => setForm({...form, phone: e.target.value})} /></div>
              </div>
              <div><Label>Address</Label><Input placeholder="King Fahd Road, Riyadh" onChange={e => setForm({...form, address: e.target.value})} /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>City</Label><Input placeholder="Riyadh" onChange={e => setForm({...form, city: e.target.value})} /></div>
                <div><Label>Country</Label><Input placeholder="Saudi Arabia" onChange={e => setForm({...form, country: e.target.value})} /></div>
                <div><Label>CR Number</Label><Input placeholder="1010123456" onChange={e => setForm({...form, crNumber: e.target.value})} /></div>
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
            <CardHeader><CardTitle>Theme Settings</CardTitle></CardHeader>
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

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>ZATCA E-Invoicing</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <h4 className="font-medium">Enable ZATCA Integration</h4>
                  <p className="text-sm text-slate-500">Connect with ZATCA for compliant e-invoicing</p>
                </div>
                <Switch checked={form.zatcaEnabled} onCheckedChange={v => setForm({...form, zatcaEnabled: v})} />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <h4 className="font-medium">Sandbox Mode</h4>
                  <p className="text-sm text-slate-500">Use ZATCA sandbox for testing</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div><Label>Tax Number</Label><Input placeholder="310123456700003" onChange={e => setForm({...form, taxNumber: e.target.value})} /></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Reset</Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
}
