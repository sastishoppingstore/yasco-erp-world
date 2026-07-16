import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Download, Eye, Search, FileCode2 } from "lucide-react";

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700", sent: "bg-blue-100 text-blue-700",
  paid: "bg-emerald-100 text-emerald-700", partial: "bg-amber-100 text-amber-700",
  overdue: "bg-red-100 text-red-700", cancelled: "bg-gray-100 text-gray-700",
};

export default function CustomerInvoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewInvoice, setViewInvoice] = useState<any>(null);
  const token = localStorage.getItem("portal_token_customer");

  useEffect(() => {
    if (!token) return;
    fetch("/api/trpc/portalCustomer.invoiceList", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).then(r => r.json()).then(j => setInvoices(j.result?.data || [])).finally(() => setLoading(false));
  }, [token]);

  const filtered = invoices.filter(i => {
    if (statusFilter && i.status !== statusFilter) return false;
    if (search && !i.invoiceNumber.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleView = async (id: number) => {
    const res = await fetch("/api/trpc/portalCustomer.invoiceGet", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, id }),
    });
    const json = await res.json();
    setViewInvoice(json.result?.data || null);
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  if (loading) return <div className="flex justify-center py-20 text-slate-400">Loading invoices...</div>;

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">My Invoices</h2><p className="text-slate-500">View and download your invoices</p></div>

      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search invoice #..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setStatusFilter("")} className={!statusFilter ? "bg-slate-100" : ""}>All</Button>
          {["sent", "paid", "partial", "overdue"].map(s => (
            <Button key={s} variant="outline" size="sm" onClick={() => setStatusFilter(s)} className={statusFilter === s ? "bg-slate-100 capitalize" : "capitalize"}>{s}</Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Invoice #</TableHead><TableHead>Date</TableHead><TableHead>Due Date</TableHead><TableHead className="text-right">Subtotal</TableHead><TableHead className="text-right">Tax</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="text-right">Paid</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map(inv => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono font-medium">{inv.invoiceNumber}</TableCell>
                  <TableCell className="text-sm">{new Date(inv.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-sm">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}</TableCell>
                  <TableCell className="text-right font-mono">{Number(inv.subTotal).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{Number(inv.taxAmount).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{Number(inv.totalAmount).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono text-emerald-600">{Number(inv.paidAmount).toLocaleString()}</TableCell>
                  <TableCell><span className={`text-xs px-2 py-1 rounded-full ${statusColors[inv.status] || ""}`}>{inv.status}</span></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleView(inv.id)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={handleDownloadPdf}><Download className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={9} className="text-center text-slate-400 py-8">No invoices found</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!viewInvoice} onOpenChange={next => !next && setViewInvoice(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Invoice {viewInvoice?.invoice?.invoiceNumber}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleDownloadPdf}><FileCode2 className="mr-2 h-4 w-4" />PDF</Button>
                <Button size="sm" variant="outline" onClick={handleDownloadPdf}><Download className="mr-2 h-4 w-4" />Download XML</Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          {viewInvoice?.invoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-slate-50">
                <div>
                  <p className="text-xs text-slate-500">Company</p>
                  <p className="font-medium">{viewInvoice.company?.companyName || "YASCO ERP"}</p>
                  <p className="text-sm text-slate-500">{viewInvoice.company?.address}</p>
                  <p className="text-sm text-slate-500">VAT: {viewInvoice.company?.taxNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Invoice Details</p>
                  <p className="font-medium">{viewInvoice.invoice.invoiceNumber}</p>
                  <p className="text-sm text-slate-500">Date: {new Date(viewInvoice.invoice.date).toLocaleDateString()}</p>
                  <p className="text-sm text-slate-500">Status: <span className="capitalize">{viewInvoice.invoice.status}</span></p>
                </div>
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>Description</TableHead><TableHead className="text-right">Qty</TableHead><TableHead className="text-right">Price</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
                <TableBody>
                  {viewInvoice.items?.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right font-mono">{Number(item.unitPrice).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{Number(item.totalAmount).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end">
                <div className="w-64 space-y-1">
                  <div className="flex justify-between text-sm"><span>Subtotal</span><span className="font-mono">{Number(viewInvoice.invoice.subTotal).toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm"><span>VAT ({viewInvoice.invoice.taxPercent}%)</span><span className="font-mono">{Number(viewInvoice.invoice.taxAmount).toLocaleString()}</span></div>
                  <div className="flex justify-between font-bold text-base border-t pt-1"><span>Total</span><span className="font-mono">{Number(viewInvoice.invoice.totalAmount).toLocaleString()}</span></div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
