import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, Briefcase, MapPin, Building2, Save } from "lucide-react";
import { toast } from "sonner";

export default function EmployeeProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ phone: "", mobile: "", address: "", emergencyContact: "", emergencyPhone: "" });
  const token = localStorage.getItem("portal_token_employee");

  useEffect(() => {
    if (!token) return;
    fetch("/api/trpc/portalEmployee.profile", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).then(r => r.json()).then(j => {
      const data = j.result?.data;
      setProfile(data);
      if (data?.employee) {
        setForm({
          phone: data.employee.phone || "",
          mobile: data.employee.mobile || "",
          address: data.employee.address || "",
          emergencyContact: data.employee.emergencyContact || "",
          emergencyPhone: data.employee.emergencyPhone || "",
        });
      }
    }).finally(() => setLoading(false));
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/trpc/portalEmployee.profileUpdate", {
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
      <div><h2 className="text-2xl font-bold">My Profile</h2><p className="text-slate-500">View and update your personal information</p></div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5" />
            {profile?.employee?.firstName} {profile?.employee?.lastName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile?.employee && (
            <div className="grid grid-cols-2 gap-3 text-sm mb-4 p-4 rounded-lg bg-slate-50">
              <div><span className="text-slate-500">Employee Code:</span> <span className="font-medium">{profile.employee.employeeCode}</span></div>
              <div><span className="text-slate-500">Department:</span> <span className="font-medium">{profile.department?.name || "N/A"}</span></div>
              <div><span className="text-slate-500">Designation:</span> <span className="font-medium">{profile.designation?.name || "N/A"}</span></div>
              <div><span className="text-slate-500">Status:</span> <span className="font-medium capitalize">{profile.employee.status}</span></div>
              <div><span className="text-slate-500">Hire Date:</span> <span className="font-medium">{profile.employee.hireDate ? new Date(profile.employee.hireDate).toLocaleDateString() : "N/A"}</span></div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
            <div><Label>Mobile</Label><Input value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} /></div>
          </div>
          <div><Label>Address</Label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Emergency Contact</Label><Input value={form.emergencyContact} onChange={e => setForm({...form, emergencyContact: e.target.value})} /></div>
            <div><Label>Emergency Phone</Label><Input value={form.emergencyPhone} onChange={e => setForm({...form, emergencyPhone: e.target.value})} /></div>
          </div>
          <Button onClick={handleSave} disabled={saving}><Save className="w-4 h-4 mr-2" />{saving ? "Saving..." : "Save Changes"}</Button>
        </CardContent>
      </Card>

      {profile?.employee && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Contact</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" />{profile.employee.email || "N/A"}</div>
            <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" />{profile.employee.phone || "N/A"}</div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" />{profile.employee.address || "N/A"}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
