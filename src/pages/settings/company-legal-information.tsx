import { useEffect, useState } from "react";
import { Building2, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/providers/trpc";

const emptyForm = {
  legalNameEn: "",
  legalNameAr: "",
  vatNumber: "",
  crNumber: "",
  taxRegistrationNumber: "",
  businessActivity: "",
  companyAddress: "",
  buildingNumber: "",
  streetName: "",
  district: "",
  city: "",
  postalCode: "",
  country: "Saudi Arabia",
  contactPerson: "",
  phoneNumber: "",
  emailAddress: "",
  companyLogo: "",
};

export default function CompanyLegalInformationPage() {
  const { data, refetch } = trpc.zatca.companyLegalGet.useQuery();
  const save = trpc.zatca.companyLegalSave.useMutation({
    onSuccess: () => {
      toast.success("Company legal information saved");
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (data) setForm({ ...emptyForm, ...data });
  }, [data]);

  const set = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Company Legal Information</h2>
          <p className="text-slate-500">Saudi seller identity used on ZATCA invoices, QR codes, XML, and tax documents.</p>
        </div>
        <Button onClick={() => save.mutate(form)} disabled={save.isPending}>
          <Save className="mr-2 h-4 w-4" /> Save Legal Profile
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Legal Entity</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div><Label>Company Legal Name (English)</Label><Input value={form.legalNameEn} onChange={(e) => set("legalNameEn", e.target.value)} /></div>
          <div><Label>Company Legal Name (Arabic)</Label><Input dir="rtl" value={form.legalNameAr} onChange={(e) => set("legalNameAr", e.target.value)} /></div>
          <div><Label>VAT Number (15 digits)</Label><Input value={form.vatNumber} maxLength={15} placeholder="300000000000003" onChange={(e) => set("vatNumber", e.target.value.replace(/\D/g, ""))} /></div>
          <div><Label>Commercial Registration (CR Number)</Label><Input value={form.crNumber} onChange={(e) => set("crNumber", e.target.value)} /></div>
          <div><Label>Tax Registration Number</Label><Input value={form.taxRegistrationNumber} onChange={(e) => set("taxRegistrationNumber", e.target.value)} /></div>
          <div><Label>Business Activity</Label><Input value={form.businessActivity} onChange={(e) => set("businessActivity", e.target.value)} /></div>
          <div><Label>Contact Person</Label><Input value={form.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} /></div>
          <div><Label>Company Logo</Label><Input value={form.companyLogo} placeholder="https://... or base64 data URL" onChange={(e) => set("companyLogo", e.target.value)} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> National Address & Contact</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2"><Label>Company Address</Label><Textarea value={form.companyAddress} onChange={(e) => set("companyAddress", e.target.value)} /></div>
          <div><Label>Building Number</Label><Input value={form.buildingNumber} onChange={(e) => set("buildingNumber", e.target.value)} /></div>
          <div><Label>Street Name</Label><Input value={form.streetName} onChange={(e) => set("streetName", e.target.value)} /></div>
          <div><Label>District</Label><Input value={form.district} onChange={(e) => set("district", e.target.value)} /></div>
          <div><Label>City</Label><Input value={form.city} onChange={(e) => set("city", e.target.value)} /></div>
          <div><Label>Postal Code</Label><Input value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} /></div>
          <div><Label>Country</Label><Input value={form.country} onChange={(e) => set("country", e.target.value)} /></div>
          <div><Label>Phone Number</Label><Input value={form.phoneNumber} onChange={(e) => set("phoneNumber", e.target.value)} /></div>
          <div><Label>Email Address</Label><Input value={form.emailAddress} onChange={(e) => set("emailAddress", e.target.value)} /></div>
        </CardContent>
      </Card>
    </div>
  );
}
