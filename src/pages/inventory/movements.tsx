import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowUpDown } from "lucide-react";

export default function StockMovementsPage() {
  const { data: movements } = trpc.inventory.movementList.useQuery();
  const { data: products } = trpc.inventory.productList.useQuery();
  const { data: warehouses } = trpc.inventory.warehouseList.useQuery();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const movementTypeColors: Record<string, string> = {
    purchase: "bg-emerald-100 text-emerald-700",
    sale: "bg-red-100 text-red-700",
    adjustment: "bg-amber-100 text-amber-700",
    transfer_in: "bg-blue-100 text-blue-700",
    transfer_out: "bg-purple-100 text-purple-700",
    return_in: "bg-teal-100 text-teal-700",
    return_out: "bg-orange-100 text-orange-700",
    production_in: "bg-green-100 text-green-700",
    production_out: "bg-rose-100 text-rose-700",
    opening: "bg-slate-100 text-slate-700",
  };

  const filtered = movements?.filter(m =>
    (!typeFilter || m.movementType === typeFilter) &&
    (!search || m.notes?.toLowerCase().includes(search.toLowerCase()))
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Stock Movements</h2><p className="text-slate-500">Track all inventory transactions</p></div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search movements..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={typeFilter || "all"} onValueChange={v => setTypeFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="purchase">Purchase</SelectItem>
            <SelectItem value="sale">Sale</SelectItem>
            <SelectItem value="adjustment">Adjustment</SelectItem>
            <SelectItem value="transfer_in">Transfer In</SelectItem>
            <SelectItem value="transfer_out">Transfer Out</SelectItem>
            <SelectItem value="return_in">Return In</SelectItem>
            <SelectItem value="return_out">Return Out</SelectItem>
            <SelectItem value="production_in">Production In</SelectItem>
            <SelectItem value="production_out">Production Out</SelectItem>
            <SelectItem value="opening">Opening</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit Cost</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(m => (
                <TableRow key={m.id}>
                  <TableCell className="text-sm">{new Date(m.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full ${movementTypeColors[m.movementType] || "bg-slate-100"}`}>
                      {m.movementType.replace("_", " ")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">{products?.find(p => p.id === m.productId)?.name || `Product #${m.productId}`}</div>
                    <div className="text-xs text-slate-500">{products?.find(p => p.id === m.productId)?.sku}</div>
                  </TableCell>
                  <TableCell className="text-sm">{warehouses?.find(w => w.id === m.warehouseId)?.name || `WH #${m.warehouseId}`}</TableCell>
                  <TableCell className={`text-right font-mono font-medium ${m.quantity > 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">{Number(m.unitCost).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{Number(m.totalCost).toLocaleString()}</TableCell>
                  <TableCell className="text-xs text-slate-500">{m.reference || "—"}</TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-slate-500">{m.notes || "—"}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={9} className="text-center text-slate-400 py-8">No movements recorded</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
