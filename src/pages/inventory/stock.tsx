import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Package } from "lucide-react";

export default function StockLevelsPage() {
  const { data: warehouses } = trpc.inventory.warehouseList.useQuery(undefined);
  const [warehouseId, setWarehouseId] = useState<number | undefined>();
  const { data: inventory } = trpc.inventory.inventoryList.useQuery({ warehouseId });
  const lowStock = inventory?.filter(i => Number(i.quantity) <= Number(i.reorderLevel || 10)) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Stock Levels</h2><p className="text-slate-500">Real-time inventory across all warehouses</p></div>
        <Select onValueChange={v => setWarehouseId(v === "all" ? undefined : Number(v))}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All Warehouses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Warehouses</SelectItem>
            {warehouses?.map(w => <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg"><Package className="w-5 h-5 text-blue-600" /></div>
          <div><p className="text-sm text-slate-500">Total SKUs</p><p className="text-2xl font-bold">{inventory?.length || 0}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-lg"><Package className="w-5 h-5 text-emerald-600" /></div>
          <div><p className="text-sm text-slate-500">Total Value</p><p className="text-2xl font-bold">{inventory?.reduce((s, i) => s + Number(i.totalValue), 0).toLocaleString()} SAR</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 bg-amber-100 rounded-lg"><AlertTriangle className="w-5 h-5 text-amber-600" /></div>
          <div><p className="text-sm text-slate-500">Low Stock</p><p className="text-2xl font-bold">{lowStock.length}</p></div>
        </CardContent></Card>
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <Card className="border-amber-300 bg-amber-50">
          <CardHeader className="pb-2"><CardTitle className="text-amber-800 text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Low Stock Alerts</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStock.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="font-medium">{item.productName}</span>
                  <span className="text-amber-700">{item.quantity} units (Reorder: {item.reorderLevel || 10})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Warehouse</TableHead><TableHead className="text-right">Qty</TableHead><TableHead className="text-right">Reserved</TableHead><TableHead className="text-right">Avg Cost</TableHead><TableHead className="text-right">Total Value</TableHead></TableRow></TableHeader>
            <TableBody>
              {inventory?.map(item => (
                <TableRow key={item.id} className={Number(item.quantity) <= Number(item.reorderLevel || 10) ? "bg-amber-50" : ""}>
                  <TableCell><div className="font-medium">{item.productName}</div><div className="text-xs text-slate-500">{item.productSku}</div></TableCell>
                  <TableCell>{item.warehouseName}</TableCell>
                  <TableCell className="text-right font-mono font-medium">{item.quantity}</TableCell>
                  <TableCell className="text-right font-mono text-amber-600">{item.reservedQuantity}</TableCell>
                  <TableCell className="text-right font-mono">{Number(item.avgCost).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{Number(item.totalValue).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
