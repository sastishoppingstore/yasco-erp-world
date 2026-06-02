import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, BadgePercent } from "lucide-react";

export default function CreditNotesPage() {
  const { data: creditNotes, refetch } = trpc.sales.creditNoteList.useQuery();
  const { data: customers } = trpc.sales.customerList.useQuery();
  const createCreditNote = trpc.sales.creditNoteCreate.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    creditNoteNumber: "", customerId: 0, invoiceId: 0, date: "", amount: "0", reason: "",
  });

  const statusColors: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700",
    applied: "bg-blue-100 text-blue-700",
    refunded: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Credit Notes</h2><p className="text-slate-500">Manage credit notes and returns</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Credit Note</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Credit Note</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createCreditNote.mutate(form); setOpen(false); setForm({ creditNoteNumber: "", customerId: 0, invoiceId: 0, date: "", amount: "0", reason: "" }); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Credit Note #</Label><Input value={form.creditNoteNumber} onChange={e => setForm({...form, creditNoteNumber: e.target.value})} required /></div>
                <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required /></div>
              </div>
              <div><Label>Customer</Label>
                <Select onValueChange={v => setForm({...form, customerId: Number(v)})}>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>{customers?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Invoice ID</Label><Input type="number" value={form.invoiceId || ""} onChange={e => setForm({...form, invoiceId: Number(e.target.value)})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Amount</Label><Input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required /></div>
              </div>
              <div><Label>Reason</Label><Textarea value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} /></div>
              <Button type="submit" className="w-full">Create Credit Note</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Credit Note #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {creditNotes?.map(cn => (
                <TableRow key={cn.id}>
                  <TableCell className="font-mono text-sm font-medium">{cn.creditNoteNumber}</TableCell>
                  <TableCell>{customers?.find(c => c.id === cn.customerId)?.name || `Customer #${cn.customerId}`}</TableCell>
                  <TableCell className="font-mono text-sm">{cn.invoiceId ? `INV-${cn.invoiceId}` : "—"}</TableCell>
                  <TableCell>{new Date(cn.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right font-mono font-semibold text-red-600">{Number(cn.amount).toLocaleString()}</TableCell>
                  <TableCell className="max-w-xs truncate text-sm">{cn.reason || "—"}</TableCell>
                  <TableCell><span className={`text-xs px-2 py-1 rounded-full ${statusColors[cn.status] || ""}`}>{cn.status}</span></TableCell>
                </TableRow>
              ))}
              {(!creditNotes || creditNotes.length === 0) && (
                <TableRow><TableCell colSpan={7} className="text-center text-slate-400 py-8">No credit notes yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
