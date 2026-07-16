import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Wallet, ShoppingCart, HeadphonesIcon, TrendingUp, DollarSign, AlertCircle, Package } from "lucide-react";

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700", sent: "bg-blue-100 text-blue-700",
  paid: "bg-emerald-100 text-emerald-700", partial: "bg-amber-100 text-amber-700",
  overdue: "bg-red-100 text-red-700", cancelled: "bg-gray-100 text-gray-700",
};

export default function CustomerPortalDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("portal_token_customer");

  useEffect(() => {
    if (!token) return;
    fetch("/api/trpc/portalCustomer.dashboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).then(r => r.json()).then(j => setData(j.result?.data || null)).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="flex justify-center py-20 text-slate-400">Loading dashboard...</div>;
  if (!data) return <div className="flex justify-center py-20 text-slate-400">Please log in to view your dashboard</div>;

  const { stats, recentInvoices, recentOrders, openTickets } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Welcome, {data.customer?.name || "Customer"}</h2>
          <p className="text-slate-500">Your account overview and recent activity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><FileText className="w-5 h-5 text-blue-600" /></div><div><p className="text-sm text-slate-500">Total Invoices</p><p className="text-xl font-bold">{stats?.total || 0}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-emerald-100 rounded-lg"><DollarSign className="w-5 h-5 text-emerald-600" /></div><div><p className="text-sm text-slate-500">Paid</p><p className="text-xl font-bold">{stats?.paid || 0}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-red-100 rounded-lg"><AlertCircle className="w-5 h-5 text-red-600" /></div><div><p className="text-sm text-slate-500">Overdue</p><p className="text-xl font-bold">{stats?.overdue || 0}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-purple-100 rounded-lg"><HeadphonesIcon className="w-5 h-5 text-purple-600" /></div><div><p className="text-sm text-slate-500">Open Tickets</p><p className="text-xl font-bold">{openTickets || 0}</p></div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4" />Recent Invoices</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {recentInvoices?.map((inv: any) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono text-sm">{inv.invoiceNumber}</TableCell>
                    <TableCell className="text-sm">{new Date(inv.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right font-mono font-semibold">{Number(inv.totalAmount).toLocaleString()}</TableCell>
                    <TableCell><span className={`text-xs px-2 py-1 rounded-full ${statusColors[inv.status] || ""}`}>{inv.status}</span></TableCell>
                  </TableRow>
                ))}
                {(!recentInvoices || recentInvoices.length === 0) && <TableRow><TableCell colSpan={4} className="text-center text-slate-400 py-4">No invoices yet</TableCell></TableRow>}
              </TableBody>
            </Table>
            <div className="p-3 border-t"><Link to="/portal/customer/invoices"><Button variant="link" size="sm">View All Invoices</Button></Link></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><ShoppingCart className="w-4 h-4" />Recent Orders</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Total</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {recentOrders?.map((o: any) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-sm">{o.orderNumber}</TableCell>
                    <TableCell className="text-sm">{new Date(o.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right font-mono">{Number(o.totalAmount).toLocaleString()}</TableCell>
                    <TableCell><span className={`text-xs px-2 py-1 rounded-full ${statusColors[o.status] || ""}`}>{o.status}</span></TableCell>
                  </TableRow>
                ))}
                {(!recentOrders || recentOrders.length === 0) && <TableRow><TableCell colSpan={4} className="text-center text-slate-400 py-4">No orders yet</TableCell></TableRow>}
              </TableBody>
            </Table>
            <div className="p-3 border-t"><Link to="/portal/customer/orders"><Button variant="link" size="sm">View All Orders</Button></Link></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
