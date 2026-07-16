import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLanguage } from "@/providers/language";
import { Package, Search, AlertTriangle, FileWarning, CheckCircle } from "lucide-react";

interface Medication {
  id: string;
  name: string;
  batch: string;
  category: string;
  stock: number;
  unit: string;
  expiry: string;
  price: number;
}

const meds: Medication[] = [
  { id: "MED-001", name: "Amoxicillin 500mg", batch: "BATCH-0234", category: "Antibiotic", stock: 15, unit: "capsules", expiry: "2026-09-15", price: 15 },
  { id: "MED-002", name: "Paracetamol 500mg", batch: "BATCH-0456", category: "Analgesic", stock: 200, unit: "tablets", expiry: "2026-12-20", price: 5 },
  { id: "MED-003", name: "Omeprazole 20mg", batch: "BATCH-0789", category: "GI", stock: 8, unit: "capsules", expiry: "2026-08-10", price: 25 },
  { id: "MED-004", name: "Atorvastatin 10mg", batch: "BATCH-0123", category: "Cardiovascular", stock: 45, unit: "tablets", expiry: "2027-01-05", price: 35 },
  { id: "MED-005", name: "Metformin 500mg", batch: "BATCH-0567", category: "Diabetes", stock: 12, unit: "tablets", expiry: "2026-10-30", price: 12 },
  { id: "MED-006", name: "Lisinopril 5mg", batch: "BATCH-0890", category: "Cardiovascular", stock: 60, unit: "tablets", expiry: "2026-11-15", price: 28 },
  { id: "MED-007", name: "Azithromycin 250mg", batch: "BATCH-0345", category: "Antibiotic", stock: 90, unit: "tablets", expiry: "2026-08-25", price: 22 },
  { id: "MED-008", name: "Insulin Glargine", batch: "BATCH-0678", category: "Diabetes", stock: 5, unit: "vials", expiry: "2026-07-20", price: 120 },
];

export default function PharmacyStock() {
  const { language } = useLanguage();
  const rtl = language === "ar";
  const [search, setSearch] = useState("");

  const filtered = meds.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.batch.toLowerCase().includes(search.toLowerCase())
  );

  const isLowStock = (m: Medication) => m.stock < 20;
  const isExpiring = (m: Medication) => {
    const days = (new Date(m.expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return days < 30;
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{rtl ? "مخزون الأدوية" : "Medication Stock"}</h1>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 flex items-center gap-3">
            <Package className="size-8 text-blue-600" />
            <div>
              <p className="text-xs text-blue-700">{rtl ? "إجمالي الأصناف" : "Total Items"}</p>
              <p className="text-2xl font-bold text-blue-800">{meds.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="size-8 text-amber-600" />
            <div>
              <p className="text-xs text-amber-700">{rtl ? "مخزون منخفض" : "Low Stock"}</p>
              <p className="text-2xl font-bold text-amber-800">{meds.filter(isLowStock).length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200">
          <CardContent className="p-4 flex items-center gap-3">
            <FileWarning className="size-8 text-rose-600" />
            <div>
              <p className="text-xs text-rose-700">{rtl ? "قريب الصلاحية" : "Expiring Soon"}</p>
              <p className="text-2xl font-bold text-rose-800">{meds.filter(isExpiring).length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        <Input
          placeholder={rtl ? "بحث باسم أو دفعة..." : "Search by name or batch..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{rtl ? "الدواء" : "Medication"}</TableHead>
                <TableHead>{rtl ? "الدفعة" : "Batch"}</TableHead>
                <TableHead>{rtl ? "الفئة" : "Category"}</TableHead>
                <TableHead>{rtl ? "المخزون" : "Stock"}</TableHead>
                <TableHead>{rtl ? "الصلاحية" : "Expiry"}</TableHead>
                <TableHead>{rtl ? "السعر" : "Price"}</TableHead>
                <TableHead>{rtl ? "التنبيه" : "Alert"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell className="text-xs">{m.batch}</TableCell>
                  <TableCell>{m.category}</TableCell>
                  <TableCell className={isLowStock(m) ? "text-rose-600 font-medium" : ""}>{m.stock} {m.unit}</TableCell>
                  <TableCell className={isExpiring(m) ? "text-rose-600 font-medium" : ""}>{m.expiry}</TableCell>
                  <TableCell>{m.price} SAR</TableCell>
                  <TableCell>
                    {isLowStock(m) && isExpiring(m) ? (
                      <Badge className="bg-rose-100 text-rose-700 border-rose-200 flex items-center gap-1">
                        <FileWarning className="size-3" /> {rtl ? "مخزون + صلاحية" : "Stock & Expiry"}
                      </Badge>
                    ) : isLowStock(m) ? (
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200 flex items-center gap-1">
                        <AlertTriangle className="size-3" /> {rtl ? "مخزون منخفض" : "Low Stock"}
                      </Badge>
                    ) : isExpiring(m) ? (
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200 flex items-center gap-1">
                        <FileWarning className="size-3" /> {rtl ? "صلاحية قريبة" : "Near Expiry"}
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 flex items-center gap-1">
                        <CheckCircle className="size-3" /> {rtl ? "سليم" : "OK"}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
