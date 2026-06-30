import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2 } from "lucide-react";

export default function PropertiesPage() {
  const { data: properties, refetch } = trpc.realEstate.propertyList.useQuery(undefined);
  const createProperty = trpc.realEstate.propertyCreate.useMutation({ onSuccess: () => { refetch(); setOpen(false); } });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ propertyCode: "", name: "", propertyType: "residential" as const, city: "", district: "", areaSize: "", purchaseCost: "0", currentValue: "0" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Properties</h2><p className="text-slate-500">Manage real estate properties</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Property</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Property</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createProperty.mutate(form); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Property Code</Label><Input value={form.propertyCode} onChange={e => setForm({...form, propertyCode: e.target.value})} required /></div>
                <div><Label>Type</Label><Select value={form.propertyType} onValueChange={(v: any) => setForm({...form, propertyType: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="residential">Residential</SelectItem><SelectItem value="commercial">Commercial</SelectItem><SelectItem value="industrial">Industrial</SelectItem><SelectItem value="land">Land</SelectItem><SelectItem value="mixed_use">Mixed Use</SelectItem></SelectContent></Select></div>
              </div>
              <div><Label>Property Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>City</Label><Input value={form.city} onChange={e => setForm({...form, city: e.target.value})} /></div>
                <div><Label>District</Label><Input value={form.district} onChange={e => setForm({...form, district: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Area Size</Label><Input type="number" value={form.areaSize} onChange={e => setForm({...form, areaSize: e.target.value})} /></div>
                <div><Label>Purchase Cost</Label><Input type="number" value={form.purchaseCost} onChange={e => setForm({...form, purchaseCost: e.target.value})} /></div>
                <div><Label>Current Value</Label><Input type="number" value={form.currentValue} onChange={e => setForm({...form, currentValue: e.target.value})} /></div>
              </div>
              <Button type="submit" className="w-full">Add Property</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Property Portfolio</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Property</TableHead><TableHead>Type</TableHead><TableHead>City</TableHead><TableHead className="text-right">Area</TableHead><TableHead className="text-right">Value</TableHead></TableRow></TableHeader>
            <TableBody>
              {properties?.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-sm">{p.propertyCode}</TableCell>
                  <TableCell><div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-slate-400" /><span className="font-medium">{p.name}</span></div></TableCell>
                  <TableCell className="capitalize">{p.propertyType.replace("_", " ")}</TableCell>
                  <TableCell>{p.city || "—"}</TableCell>
                  <TableCell className="text-right">{p.areaSize ? `${p.areaSize} ${p.areaUnit}` : "—"}</TableCell>
                  <TableCell className="text-right font-mono">{Number(p.currentValue).toLocaleString()} SAR</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
