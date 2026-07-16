import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/providers/trpc";
import { Palette, Image, Stamp, Percent, Upload, CheckCircle2, Save, FileText } from "lucide-react";

const THEME_PREVIEWS: Record<string, { bg: string; text: string; accent: string; label: string }> = {
  "classic-box": { bg: "bg-blue-900", text: "text-white", accent: "bg-blue-600", label: "Classic Box" },
  "modern-clean": { bg: "bg-slate-900", text: "text-white", accent: "bg-slate-600", label: "Modern Clean" },
  "3d-color": { bg: "bg-gradient-to-br from-purple-600 to-pink-500", text: "text-white", accent: "bg-purple-500", label: "3D Color" },
  "elegant-gold": { bg: "bg-gray-900", text: "text-yellow-400", accent: "bg-yellow-600", label: "Elegant Gold" },
  "minimal-light": { bg: "bg-gray-100", text: "text-gray-900", accent: "bg-blue-500", label: "Minimal Light" },
};

export default function InvoiceSettingsPage() {
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState("themes");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const stampInputRef = useRef<HTMLInputElement>(null);

  const { data: themes } = trpc.invoiceTheme.list.useQuery();
  const { data: defaults } = trpc.invoiceTheme.getDefaults.useQuery();
  const saveThemeMutation = trpc.invoiceTheme.save.useMutation({ onSuccess: () => utils.invoiceTheme.list.invalidate() });
  const setDefaultMutation = trpc.invoiceTheme.setDefault.useMutation({ onSuccess: () => utils.invoiceTheme.list.invalidate() });

  const { data: stamps } = trpc.invoiceTheme.stamps.list.useQuery();
  const { data: activeStamps } = trpc.invoiceTheme.stamps.getActive.useQuery();
  const uploadStampMutation = trpc.invoiceTheme.stamps.upload.useMutation({ onSuccess: () => { utils.invoiceTheme.stamps.list.invalidate(); utils.invoiceTheme.stamps.getActive.invalidate(); } });

  const { data: taxSettings } = trpc.invoiceTheme.taxSettings.get.useQuery();
  const saveTaxMutation = trpc.invoiceTheme.taxSettings.save.useMutation({ onSuccess: () => utils.invoiceTheme.taxSettings.get.invalidate() });

  const [taxForm, setTaxForm] = useState<any>(null);

  const handleImageUpload = async (type: "logo" | "stamp") => {
    const input = type === "logo" ? logoInputRef.current : stampInputRef.current;
    const file = input?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result as string;
      uploadStampMutation.mutate({ type, imageData: data, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveTheme = (themeKey: string, name: string, nameAr: string, config: any) => {
    saveThemeMutation.mutate({ themeKey, name, nameAr, config, isDefault: false });
  };

  const handleSaveTax = () => {
    if (taxForm) saveTaxMutation.mutate(taxForm);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Invoice Settings</h2>
        <p className="text-sm text-slate-500">Customize invoice themes, upload logo/stamp, and configure tax</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="themes"><Palette className="w-4 h-4 mr-2" />Themes</TabsTrigger>
          <TabsTrigger value="branding"><Image className="w-4 h-4 mr-2" />Logo & Stamp</TabsTrigger>
          <TabsTrigger value="tax"><Percent className="w-4 h-4 mr-2" />Tax Settings</TabsTrigger>
        </TabsList>

        {/* THEMES TAB */}
        <TabsContent value="themes">
          <Card>
            <CardHeader><CardTitle>Invoice Themes</CardTitle><CardDescription>Choose from 5 available invoice themes</CardDescription></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(defaults || []).map((theme: any) => {
                  const preview = THEME_PREVIEWS[theme.themeKey] || THEME_PREVIEWS["classic-box"];
                  const isActive = themes?.find((t: any) => t.themeKey === theme.themeKey)?.isDefault || false;
                  const tenantTheme = themes?.find((t: any) => t.themeKey === theme.themeKey);
                  return (
                    <Card key={theme.themeKey} className={`relative overflow-hidden cursor-pointer transition-all hover:shadow-lg ${isActive ? "ring-2 ring-emerald-500" : ""}`}
                      onClick={() => {
                        if (tenantTheme) setDefaultMutation.mutate({ themeId: tenantTheme.id });
                        else handleSaveTheme(theme.themeKey, theme.name, theme.nameAr || "", theme.config);
                      }}>
                      <div className={`h-24 ${preview.bg} flex items-center justify-center`}>
                        <FileText className={`w-10 h-10 ${preview.text} opacity-50`} />
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{theme.name}</p>
                            <p className="text-xs text-slate-500">{theme.nameAr || ""}</p>
                          </div>
                          {isActive && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                        </div>
                        <div className="flex gap-1 mt-2">
                          {["border", "bg", "text"].map((_, i) => (
                            <div key={i} className={`w-4 h-4 rounded-full ${preview.accent}`} />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BRANDING TAB */}
        <TabsContent value="branding">
          <Card>
            <CardHeader><CardTitle>Company Logo & Official Stamp</CardTitle><CardDescription>Upload your company branding for invoices</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label>Company Logo</Label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors">
                    {activeStamps?.logo ? (
                      <div className="space-y-2">
                        <img src={activeStamps.logo.imageData} alt="Logo" className="max-h-24 mx-auto" />
                        <p className="text-xs text-slate-500">Current logo</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Image className="w-12 h-12 mx-auto text-slate-300" />
                        <p className="text-sm text-slate-500">No logo uploaded</p>
                      </div>
                    )}
                    <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={() => handleImageUpload("logo")} />
                    <Button size="sm" variant="outline" className="mt-3" onClick={() => logoInputRef.current?.click()} disabled={uploadStampMutation.isPending}>
                      <Upload className="w-4 h-4 mr-2" />Upload Logo
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Official Stamp</Label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors">
                    {activeStamps?.stamp ? (
                      <div className="space-y-2">
                        <img src={activeStamps.stamp.imageData} alt="Stamp" className="max-h-24 mx-auto opacity-80" />
                        <p className="text-xs text-slate-500">Current stamp</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Stamp className="w-12 h-12 mx-auto text-slate-300" />
                        <p className="text-sm text-slate-500">No stamp uploaded</p>
                      </div>
                    )}
                    <input ref={stampInputRef} type="file" accept="image/*" className="hidden" onChange={() => handleImageUpload("stamp")} />
                    <Button size="sm" variant="outline" className="mt-3" onClick={() => stampInputRef.current?.click()} disabled={uploadStampMutation.isPending}>
                      <Upload className="w-4 h-4 mr-2" />Upload Stamp
                    </Button>
                  </div>
                </div>
              </div>

              {stamps && stamps.length > 0 && (
                <div>
                  <Label className="text-sm text-slate-500">Upload History</Label>
                  <div className="mt-2 space-y-2">
                    {stamps.map((s: any) => (
                      <div key={s.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded text-sm">
                        {s.type === "logo" ? <Image className="w-4 h-4" /> : <Stamp className="w-4 h-4" />}
                        <span>{s.type}</span>
                        <Badge variant="outline" className={s.isActive ? "bg-green-100 text-green-800" : "bg-gray-100"}>
                          {s.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <span className="text-xs text-slate-400">{new Date(s.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAX TAB */}
        <TabsContent value="tax">
          <Card>
            <CardHeader><CardTitle>Invoice Tax Settings</CardTitle><CardDescription>Configure how tax appears on your invoices</CardDescription></CardHeader>
            <CardContent>
              {taxSettings && !taxForm && setTaxForm(taxSettings)}
              {taxSettings && (
                <div className="space-y-6 max-w-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tax Label (English)</Label>
                      <Input value={taxForm?.taxLabel || taxSettings.taxLabel} onChange={e => setTaxForm((f: any) => ({ ...f, taxLabel: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Tax Label (Arabic)</Label>
                      <Input value={taxForm?.taxLabelAr || taxSettings.taxLabelAr} onChange={e => setTaxForm((f: any) => ({ ...f, taxLabelAr: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tax Rate (%)</Label>
                      <Input type="number" step="0.01" value={taxForm?.taxPercent || taxSettings.taxPercent} onChange={e => setTaxForm((f: any) => ({ ...f, taxPercent: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>&nbsp;</Label>
                      <div className="flex items-center gap-2 pt-2">
                        <Switch checked={taxForm?.taxInclusive ?? taxSettings.taxInclusive} onCheckedChange={v => setTaxForm((f: any) => ({ ...f, taxInclusive: v }))} />
                        <Label className="text-sm">Tax Inclusive Pricing</Label>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Visibility Options</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: "showTax", label: "Show Tax" },
                        { key: "showTaxNumber", label: "Show Tax Number" },
                        { key: "showStamp", label: "Show Stamp" },
                        { key: "showLogo", label: "Show Logo" },
                        { key: "showFooter", label: "Show Footer" },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-2">
                          <Switch checked={(taxForm as any)?.[key] ?? (taxSettings as any)[key]} onCheckedChange={v => setTaxForm((f: any) => ({ ...f, [key]: v }))} />
                          <Label className="text-sm">{label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Footer Text (English)</Label>
                    <Textarea value={taxForm?.footerText ?? taxSettings.footerText} onChange={e => setTaxForm((f: any) => ({ ...f, footerText: e.target.value }))} rows={2} />
                  </div>
                  <div className="space-y-2">
                    <Label>Footer Text (Arabic)</Label>
                    <Textarea value={taxForm?.footerTextAr ?? taxSettings.footerTextAr} onChange={e => setTaxForm((f: any) => ({ ...f, footerTextAr: e.target.value }))} rows={2} />
                  </div>

                  <Button onClick={handleSaveTax} disabled={saveTaxMutation.isPending}>
                    <Save className="w-4 h-4 mr-2" />Save Tax Settings
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
