import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Mail, Phone, MapPin, Save } from "lucide-react";
import { toast } from "sonner";

export default function VendorProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", city: "" });
  const token = localStorage.getItem("portal_token_vendor");

  useEffect(() => {
    if (!token) return;
    fetch("/api/trpc/portalVendor.profile", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).then(r => r.json()).then(j => {
      const data = j.result?.data;
      setProfile(data);
      if (data?.supplier) {
        setForm({ name: data.supplier.name || "", phone: data.supplier.phone || "", email: data.supplier.email || "", address: data.supplier.address || "", city: data.supplier.city || "" });
      }
    }).finally(() => setLoading(false));
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/trpc/portalVendor.profileUpdate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, ...form }),
    });
    const json = await res.json();
    if (json.result?.data?.success) {
      toast.success("Profile updated");
    } else {
      toast.error("Update failed");
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20 text-slate-400">Loading profile...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-2xl font-bold">Company Profile</h2><p className="text-slate-500">Update your company information</p></div>

      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Building2 className="w-5 h-5" />Company Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Company Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
            <div><Label>City</Label><Input value={form.city} onChange={e => setForm({...form, city: e.target.value})} /></div>
          </div>
          <div><Label>Address</Label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
          <Button onClick={handleSave} disabled={saving}><Save className="w-4 h-4 mr-2" />{saving ? "Saving..." : "Save Changes"}</Button>
        </CardContent>
      </Card>

      {profile?.supplier && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Account Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" />{profile.supplier.email || "N/A"}</div>
            <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" />{profile.supplier.phone || "N/A"}</div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" />{profile.supplier.address || "N/A"}</div>
            <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-slate-400" />Balance: {Number(profile.supplier.currentBalance).toLocaleString()} SAR</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
