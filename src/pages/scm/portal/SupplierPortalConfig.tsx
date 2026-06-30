import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/providers/trpc";

export default function SupplierPortalConfig() {
  const { data: users, refetch } = trpc.scm.portalUserList.useQuery();
  const { data: suppliers } = trpc.purchase.supplierList.useQuery();
  const { data: consignment } = trpc.scm.consignmentList.useQuery();
  const [form, setForm] = useState({ supplierId: 0, email: "", name: "", phone: "", passwordHash: "changeme123" });
  const create = trpc.scm.portalUserCreate.useMutation({ onSuccess: () => { refetch(); setForm({ supplierId: 0, email: "", name: "", phone: "", passwordHash: "changeme123" }); } });
  return (
    <div className="space-y-4">
      <div><h2 className="text-2xl font-bold">Supplier Portal Configuration</h2></div>
      <Card><CardHeader><CardTitle>Create Portal User</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Supplier</Label><Select onValueChange={(v) => setForm({...form, supplierId: Number(v)})}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{suppliers?.map((s: any) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
          <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
        </div>
        <Button onClick={() => create.mutate(form)} disabled={create.isPending}>Create User</Button>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Portal Users</CardTitle></CardHeader><CardContent>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left"><th className="pb-2 font-medium">Supplier</th><th className="pb-2 font-medium">Name</th><th className="pb-2 font-medium">Email</th><th className="pb-2 font-medium">Active</th><th className="pb-2 font-medium">Last Login</th></tr></thead>
          <tbody>
            {users?.map((u: any) => (
              <tr key={u.id} className="border-b last:border-0"><td className="py-2">{u.supplierId}</td><td className="py-2">{u.name}</td><td className="py-2">{u.email}</td><td className="py-2">{u.isActive ? 'Yes' : 'No'}</td><td className="py-2">{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : '-'}</td></tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Consignment Inventory</CardTitle></CardHeader><CardContent>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left"><th className="pb-2 font-medium">Supplier</th><th className="pb-2 font-medium">Product</th><th className="pb-2 font-medium">Quantity</th><th className="pb-2 font-medium">Min Level</th><th className="pb-2 font-medium">Max Level</th><th className="pb-2 font-medium">Unit Cost</th><th className="pb-2 font-medium">Status</th></tr></thead>
          <tbody>
            {consignment?.map((c: any) => (
              <tr key={c.id} className="border-b last:border-0"><td className="py-2">{c.supplierId}</td><td className="py-2">{c.productId}</td><td className="py-2">{c.quantity}</td><td className="py-2">{c.agreedMinLevel}</td><td className="py-2">{c.agreedMaxLevel}</td><td className="py-2">{c.unitCost}</td><td className="py-2">{c.status}</td></tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
    </div>
  );
}
