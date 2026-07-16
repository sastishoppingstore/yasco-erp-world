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
import { Plus, Building } from "lucide-react";

export default function SuppliersPage() {
  const { data: suppliers, refetch } = trpc.travel.supplierList.useQuery(undefined);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Travel Suppliers</h2><p className="text-slate-500">Manage airlines, hotels, and tour operators</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Supplier</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Supplier</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); setOpen(false); refetch(); }} className="space-y-3">
              <div><Label>Company Name</Label><Input required /></div>
              <div><Label>Type</Label><Select><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="airline">Airline</SelectItem><SelectItem value="hotel">Hotel</SelectItem><SelectItem value="car_rental">Car Rental</SelectItem><SelectItem value="tour_operator">Tour Operator</SelectItem><SelectItem value="visa">Visa Service</SelectItem></SelectContent></Select></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Contact Person</Label><Input /></div>
                <div><Label>Commission %</Label><Input type="number" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Email</Label><Input type="email" /></div>
                <div><Label>Phone</Label><Input /></div>
              </div>
              <Button type="submit" className="w-full">Add Supplier</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle>Supplier Directory</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Contact</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead className="text-right">Commission</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {suppliers?.map(s => (
                <TableRow key={s.id}>
                  <TableCell><div className="flex items-center gap-2"><Building className="w-4 h-4 text-slate-400" /><span className="font-medium">{s.name}</span></div></TableCell>
                  <TableCell className="capitalize">{s.supplierType.replace("_", " ")}</TableCell>
                  <TableCell className="text-sm">{s.contactPerson || "—"}</TableCell>
                  <TableCell>{s.email || "—"}</TableCell>
                  <TableCell>{s.phone || "—"}</TableCell>
                  <TableCell className="text-right">{s.commissionPercent}%</TableCell>
                  <TableCell><Badge variant={s.isActive ? "default" : "secondary"}>{s.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
