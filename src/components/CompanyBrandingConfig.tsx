import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Save, Stamp, PenTool, Image } from 'lucide-react';

interface CompanyBrandingConfigProps {
  company: {
    nameAr: string;
    nameEn: string;
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    vatNumber: string;
    crNumber: string;
    address: string;
    phone: string;
    email?: string;
    website?: string;
    footerText?: string;
    footerTextAr?: string;
    bankName?: string;
    bankIban?: string;
    signature?: string;
    stamp?: string;
  };
  onSave: (branding: Record<string, unknown>) => void;
}

export const CompanyBrandingConfig: React.FC<CompanyBrandingConfigProps> = ({ company, onSave }) => {
  const [form, setForm] = useState(company);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company Branding</CardTitle>
          <CardDescription>Configure how your company appears on all documents and invoices</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Company Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Company Name (English)</Label>
              <Input value={form.nameEn} onChange={e => setForm({...form, nameEn: e.target.value})} placeholder="ABC Construction Co." />
            </div>
            <div className="space-y-2">
              <Label>Company Name (Arabic)</Label>
              <Input value={form.nameAr} onChange={e => setForm({...form, nameAr: e.target.value})} placeholder="شركة أ ب ج للإنشاءات" dir="rtl" />
            </div>
          </div>

          <Separator />

          {/* Logo */}
          <div className="space-y-2">
            <Label>Company Logo</Label>
            <div className="flex items-center gap-4">
              {form.logo ? (
                <img src={form.logo} alt="Logo" className="h-20 w-20 object-contain border rounded-lg p-1" />
              ) : (
                <div className="h-20 w-20 border-2 border-dashed rounded-lg flex items-center justify-center text-slate-400">
                  <Image className="size-8" />
                </div>
              )}
              <div className="flex-1">
                <Input value={form.logo || ''} onChange={e => setForm({...form, logo: e.target.value})} placeholder="Logo URL or base64" />
                <p className="text-xs text-slate-500 mt-1">Paste logo URL or use base64. Recommended: 300x300px PNG with transparent background.</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Tax Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>VAT Number</Label>
              <Input value={form.vatNumber} onChange={e => setForm({...form, vatNumber: e.target.value})} placeholder="310123456700003" />
            </div>
            <div className="space-y-2">
              <Label>CR Number</Label>
              <Input value={form.crNumber} onChange={e => setForm({...form, crNumber: e.target.value})} placeholder="1012345678" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
          </div>

          <Separator />

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Invoice Header Color</Label>
              <div className="flex items-center gap-3">
                <input type="color" value={form.primaryColor} onChange={e => setForm({...form, primaryColor: e.target.value})} className="w-12 h-10 p-1 rounded border" />
                <span className="text-sm text-muted-foreground">{form.primaryColor}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Secondary Color</Label>
              <div className="flex items-center gap-3">
                <input type="color" value={form.secondaryColor} onChange={e => setForm({...form, secondaryColor: e.target.value})} className="w-12 h-10 p-1 rounded border" />
                <span className="text-sm text-muted-foreground">{form.secondaryColor}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Footer Text */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Invoice Footer (English)</Label>
              <Input value={form.footerText || ''} onChange={e => setForm({...form, footerText: e.target.value})} placeholder="Thank you for your business!" />
            </div>
            <div className="space-y-2">
              <Label>Invoice Footer (Arabic)</Label>
              <Input value={form.footerTextAr || ''} onChange={e => setForm({...form, footerTextAr: e.target.value})} placeholder="شكراً لتعاملكم معنا" dir="rtl" />
            </div>
          </div>

          <Separator />

          {/* Signature & Stamp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Manager Signature</Label>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" type="button"><PenTool className="size-3.5 mr-1" /> Upload</Button>
                {form.signature && <span className="text-xs text-green-600">Uploaded</span>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Company Stamp</Label>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" type="button"><Stamp className="size-3.5 mr-1" /> Upload</Button>
                {form.stamp && <span className="text-xs text-green-600">Uploaded</span>}
              </div>
            </div>
          </div>

          <Separator />

          {/* Bank Details */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Bank Details (shown on invoices)</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bank Name</Label>
                <Input value={form.bankName || ''} onChange={e => setForm({...form, bankName: e.target.value})} placeholder="Saudi National Bank" />
              </div>
              <div className="space-y-2">
                <Label>IBAN</Label>
                <Input value={form.bankIban || ''} onChange={e => setForm({...form, bankIban: e.target.value})} placeholder="SA03 8000 0000 6080 1016 7519" className="font-mono" />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave}>
              <Save className="size-4 mr-2" />
              {saved ? 'Saved!' : 'Save Branding'}
            </Button>
          </div>

          <p className="text-xs text-slate-500 text-center">
            White-label: ERP vendor name only appears in tiny footer. All prominent branding belongs to this company.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
