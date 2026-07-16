import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Package, Search } from "lucide-react";

export default function ProductsPage() {
  const { data: products, refetch } = trpc.inventory.productList.useQuery(undefined);
  const { data: categories } = trpc.inventory.categoryList.useQuery(undefined);
  const createProduct = trpc.inventory.productCreate.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ sku: "", name: "", purchasePrice: "0", salePrice: "0", categoryId: undefined as number | undefined, costMethod: "fifo" as const, productType: "goods" as const });

  const filtered = products?.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.includes(search)) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Products</h2><p className="text-slate-500">Manage your product catalog</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Product</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Product</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createProduct.mutate({ ...form }); setOpen(false); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>SKU</Label><Input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} required /></div>
                <div><Label>Product Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Purchase Price</Label><Input type="number" value={form.purchasePrice} onChange={e => setForm({...form, purchasePrice: e.target.value})} /></div>
                <div><Label>Sale Price</Label><Input type="number" value={form.salePrice} onChange={e => setForm({...form, salePrice: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Category</Label>
                  <Select onValueChange={v => setForm({...form, categoryId: Number(v)})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{categories?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Cost Method</Label>
                  <Select value={form.costMethod} onValueChange={(v: any) => setForm({...form, costMethod: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fifo">FIFO</SelectItem>
                      <SelectItem value="lifo">LIFO</SelectItem>
                      <SelectItem value="weighted_average">Weighted Average</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full">Create Product</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader className="pb-2"><div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input placeholder="Search products..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} /></div></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>SKU</TableHead><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Cost Method</TableHead><TableHead className="text-right">Purchase</TableHead><TableHead className="text-right">Sale</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-sm">{p.sku}</TableCell>
                  <TableCell><div className="font-medium">{p.name}</div>{p.nameAr && <div className="text-xs text-slate-500">{p.nameAr}</div>}</TableCell>
                  <TableCell><span className="text-xs px-2 py-1 bg-slate-100 rounded-full">{p.productType}</span></TableCell>
                  <TableCell><span className="text-xs font-medium uppercase">{p.costMethod}</span></TableCell>
                  <TableCell className="text-right font-mono">{Number(p.purchasePrice).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{Number(p.salePrice).toLocaleString()}</TableCell>
                  <TableCell>{p.isActive ? <span className="text-xs text-emerald-600 font-medium">Active</span> : <span className="text-xs text-slate-400">Inactive</span>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
