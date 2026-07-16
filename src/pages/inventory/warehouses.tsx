import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Warehouse, MapPin, Phone, User } from "lucide-react";

export default function WarehousesPage() {
  const { data: warehouses, refetch } = trpc.inventory.warehouseList.useQuery();
  const createWarehouse = trpc.inventory.warehouseCreate.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", address: "", managerName: "", phone: "", isPrimary: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Warehouses</h2><p className="text-slate-500">Multi-warehouse management</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Warehouse</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Warehouse</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createWarehouse.mutate(form); setOpen(false); setForm({ code: "", name: "", address: "", managerName: "", phone: "", isPrimary: false }); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Code</Label><Input value={form.code} onChange={e => setForm({...form, code: e.target.value})} required /></div>
                <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              </div>
              <div><Label>Address</Label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Manager</Label><Input value={form.managerName} onChange={e => setForm({...form, managerName: e.target.value})} /></div>
                <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isPrimary} onChange={e => setForm({...form, isPrimary: e.target.checked})} />
                Primary Warehouse
              </label>
              <Button type="submit" className="w-full">Create Warehouse</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {warehouses?.map(w => (
          <Card key={w.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Warehouse className="w-5 h-5 text-blue-600" />
                  <span className="font-mono text-xs text-slate-500">{w.code}</span>
                </div>
                {w.isPrimary && <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">Primary</span>}
              </div>
              <h3 className="font-semibold text-lg mb-1">{w.name}</h3>
              {w.address && <p className="text-sm text-slate-500 flex items-center gap-1 mb-2"><MapPin className="w-3 h-3" />{w.address}</p>}
              <div className="flex items-center gap-4 text-xs text-slate-500 border-t pt-3 mt-3">
                {w.managerName && <span className="flex items-center gap-1"><User className="w-3 h-3" />{w.managerName}</span>}
                {w.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{w.phone}</span>}
              </div>
              <div className="mt-2">
                {w.isActive ? (
                  <span className="text-xs text-emerald-600 font-medium">Active</span>
                ) : (
                  <span className="text-xs text-slate-400">Inactive</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
