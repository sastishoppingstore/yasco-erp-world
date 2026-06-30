import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, FileText, Wallet, TrendingUp, DollarSign, ShoppingBag } from "lucide-react";

export default function VendorPortalDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("portal_token_vendor");

  useEffect(() => {
    if (!token) return;
    fetch("/api/trpc/portalVendor.dashboard", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).then(r => r.json()).then(j => setData(j.result?.data || null)).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="flex justify-center py-20 text-slate-400">Loading dashboard...</div>;
  if (!data) return <div className="flex justify-center py-20 text-slate-400">Please log in</div>;

  const { stats, totalPaid } = data;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Welcome, {data.supplier?.name || "Vendor"}</h2>
        <p className="text-slate-500">Your account overview and recent activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><ShoppingBag className="w-5 h-5 text-blue-600" /></div><div><p className="text-sm text-slate-500">Total POs</p><p className="text-xl font-bold">{stats?.total || 0}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-amber-100 rounded-lg"><Package className="w-5 h-5 text-amber-600" /></div><div><p className="text-sm text-slate-500">Pending</p><p className="text-xl font-bold">{stats?.pending || 0}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-emerald-100 rounded-lg"><TrendingUp className="w-5 h-5 text-emerald-600" /></div><div><p className="text-sm text-slate-500">Completed</p><p className="text-xl font-bold">{stats?.completed || 0}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-green-100 rounded-lg"><DollarSign className="w-5 h-5 text-green-600" /></div><div><p className="text-sm text-slate-500">Total Paid</p><p className="text-xl font-bold">{Number(totalPaid).toLocaleString()} SAR</p></div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Package className="w-4 h-4" />Recent Purchase Orders</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>PO #</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.recentPOs?.map((po: any) => (
                  <TableRow key={po.id}>
                    <TableCell className="font-mono text-sm">{po.poNumber}</TableCell>
                    <TableCell className="text-sm">{new Date(po.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right font-mono font-semibold">{Number(po.totalAmount).toLocaleString()}</TableCell>
                    <TableCell><span className="text-xs px-2 py-1 rounded-full bg-slate-100">{po.status}</span></TableCell>
                  </TableRow>
                ))}
                {(!data.recentPOs || data.recentPOs.length === 0) && <TableRow><TableCell colSpan={4} className="text-center text-slate-400 py-4">No POs yet</TableCell></TableRow>}
              </TableBody>
            </Table>
            <div className="p-3 border-t"><Link to="/portal/vendor/purchase-orders"><Button variant="link" size="sm">View All POs</Button></Link></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Wallet className="w-4 h-4" />Recent Payments</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Payment #</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Method</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.recentPayments?.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-sm">{p.paymentNumber}</TableCell>
                    <TableCell className="text-sm">{new Date(p.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right font-mono font-semibold text-emerald-600">{Number(p.amount).toLocaleString()}</TableCell>
                    <TableCell className="text-sm capitalize">{p.paymentMethod.replace("_", " ")}</TableCell>
                  </TableRow>
                ))}
                {(!data.recentPayments || data.recentPayments.length === 0) && <TableRow><TableCell colSpan={4} className="text-center text-slate-400 py-4">No payments yet</TableCell></TableRow>}
              </TableBody>
            </Table>
            <div className="p-3 border-t"><Link to="/portal/vendor/payments"><Button variant="link" size="sm">View All Payments</Button></Link></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
