import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Mail, Phone } from "lucide-react";

export default function CustomersPage() {
  const { data: customers, refetch } = trpc.sales.customerList.useQuery(undefined);
  const createCustomer = trpc.sales.customerCreate.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "", creditLimit: "0", paymentTerms: 30 });

  const filtered = customers?.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email?.includes(search)) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Customers</h2><p className="text-slate-500">Manage customer relationships and credit</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Customer</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Customer</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createCustomer.mutate({ ...form }); setOpen(false); }} className="space-y-3">
              <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              </div>
              <div><Label>Address</Label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>City</Label><Input value={form.city} onChange={e => setForm({...form, city: e.target.value})} /></div>
                <div><Label>Credit Limit</Label><Input type="number" value={form.creditLimit} onChange={e => setForm({...form, creditLimit: e.target.value})} /></div>
              </div>
              <Button type="submit" className="w-full">Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader className="pb-2"><div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input placeholder="Search customers..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} /></div></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Customer</TableHead><TableHead>Contact</TableHead><TableHead>City</TableHead><TableHead className="text-right">Credit Limit</TableHead><TableHead className="text-right">Balance</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-sm">{c.code}</TableCell>
                  <TableCell><div className="font-medium">{c.name}</div>{c.nameAr && <div className="text-xs text-slate-500">{c.nameAr}</div>}</TableCell>
                  <TableCell><div className="text-sm flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" />{c.email || "N/A"}</div><div className="text-xs flex items-center gap-1 text-slate-500"><Phone className="w-3 h-3" />{c.phone || "N/A"}</div></TableCell>
                  <TableCell>{c.city || "N/A"}</TableCell>
                  <TableCell className="text-right font-mono">{Number(c.creditLimit).toLocaleString()}</TableCell>
                  <TableCell className={`text-right font-mono font-semibold ${Number(c.currentBalance) > 0 ? "text-amber-600" : ""}`}>{Number(c.currentBalance).toLocaleString()}</TableCell>
                  <TableCell>{c.isActive ? <span className="text-xs text-emerald-600 font-medium">Active</span> : <span className="text-xs text-slate-400">Inactive</span>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
