import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Eye } from "lucide-react";

export default function JournalEntriesPage() {
  const { data: entries, refetch } = trpc.accounting.journalEntryList.useQuery(undefined);
  const createJE = trpc.accounting.journalEntryCreate.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);
  const [viewEntry, setViewEntry] = useState<number | null>(null);
  const { data: entryDetail } = trpc.accounting.journalEntryGet.useQuery(
    { id: viewEntry! }, { enabled: !!viewEntry }
  );

  const [form, setForm] = useState({
    entryNumber: "", date: "", description: "",
    referenceType: "other" as const,
    lines: [{ accountId: 1, debit: "0", credit: "0", description: "" }],
  });

  const addLine = () => setForm({...form, lines: [...form.lines, { accountId: 1, debit: "0", credit: "0", description: "" }]});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createJE.mutate({ ...form, reference: form.entryNumber });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Journal Entries</h2>
          <p className="text-slate-500">Double-entry bookkeeping - every debit has a matching credit</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />New Entry</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>New Journal Entry</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Entry Number</Label><Input value={form.entryNumber} onChange={e => setForm({...form, entryNumber: e.target.value})} required /></div>
                <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required /></div>
              </div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} required /></div>
              <div className="space-y-2">
                <Label>Entry Lines</Label>
                {form.lines.map((line, i) => (
                  <div key={i} className="grid grid-cols-4 gap-2">
                    <Input placeholder="Account ID" type="number" value={line.accountId} onChange={e => {
                      const newLines = [...form.lines];
                      newLines[i].accountId = Number(e.target.value);
                      setForm({...form, lines: newLines});
                    }} />
                    <Input placeholder="Debit" type="number" value={line.debit} onChange={e => {
                      const newLines = [...form.lines]; newLines[i].debit = e.target.value; setForm({...form, lines: newLines});
                    }} />
                    <Input placeholder="Credit" type="number" value={line.credit} onChange={e => {
                      const newLines = [...form.lines]; newLines[i].credit = e.target.value; setForm({...form, lines: newLines});
                    }} />
                    <Input placeholder="Description" value={line.description} onChange={e => {
                      const newLines = [...form.lines]; newLines[i].description = e.target.value; setForm({...form, lines: newLines});
                    }} />
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addLine} size="sm">+ Add Line</Button>
              </div>
              <Button type="submit" className="w-full">Post Entry</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!viewEntry} onOpenChange={() => setViewEntry(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Journal Entry #{entryDetail?.entry?.entryNumber}</DialogTitle></DialogHeader>
          {entryDetail && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">{entryDetail.entry?.description}</p>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Account</TableHead><TableHead className="text-right">Debit</TableHead><TableHead className="text-right">Credit</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {entryDetail.lines?.map((line, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm">Account #{line.accountId}</TableCell>
                      <TableCell className="text-right font-mono text-emerald-600">{Number(line.debit) > 0 ? Number(line.debit).toLocaleString() : "-"}</TableCell>
                      <TableCell className="text-right font-mono text-red-600">{Number(line.credit) > 0 ? Number(line.credit).toLocaleString() : "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entry #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Ref Type</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries?.map((je) => (
                <TableRow key={je.id}>
                  <TableCell className="font-mono text-sm font-medium">{je.entryNumber}</TableCell>
                  <TableCell>{new Date(je.date).toLocaleDateString()}</TableCell>
                  <TableCell className="max-w-xs truncate">{je.description}</TableCell>
                  <TableCell><span className="text-xs px-2 py-1 bg-slate-100 rounded-full">{je.referenceType}</span></TableCell>
                  <TableCell className="text-right font-mono">{Number(je.totalDebit).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{Number(je.totalCredit).toLocaleString()}</TableCell>
                  <TableCell>{je.isPosted ? <span className="text-xs text-emerald-600 font-medium">Posted</span> : <span className="text-xs text-amber-600">Draft</span>}</TableCell>
                  <TableCell><Button variant="ghost" size="sm" onClick={() => setViewEntry(je.id)}><Eye className="w-4 h-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
