import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLanguage } from "@/providers/language";
import { FileWarning, Search, AlertTriangle, CheckCircle, Trash2 } from "lucide-react";

interface ExpiryItem {
  id: string;
  name: string;
  batch: string;
  stock: number;
  expiry: string;
  daysLeft: number;
  status: "Critical" | "Warning" | "Expired" | "Good";
}

const items: ExpiryItem[] = [
  { id: "EXP-001", name: "Omeprazole 20mg", batch: "BATCH-0789", stock: 8, expiry: "2026-08-10", daysLeft: 33, status: "Warning" },
  { id: "EXP-002", name: "Azithromycin 250mg", batch: "BATCH-0345", stock: 90, expiry: "2026-08-25", daysLeft: 48, status: "Warning" },
  { id: "EXP-003", name: "Insulin Glargine", batch: "BATCH-0678", stock: 5, expiry: "2026-07-20", daysLeft: 12, status: "Critical" },
  { id: "EXP-004", name: "Amoxicillin 500mg", batch: "BATCH-0234", stock: 15, expiry: "2026-09-15", daysLeft: 69, status: "Warning" },
  { id: "EXP-005", name: "Metformin 500mg", batch: "BATCH-0567", stock: 12, expiry: "2026-10-30", daysLeft: 114, status: "Good" },
];

const statusColor: Record<string, string> = {
  Critical: "bg-rose-100 text-rose-700 border-rose-200",
  Warning: "bg-amber-100 text-amber-700 border-amber-200",
  Expired: "bg-red-100 text-red-700 border-red-200",
  Good: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export default function PharmacyExpiry() {
  const { language } = useLanguage();
  const rtl = language === "ar";
  const [search, setSearch] = useState("");

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) || i.batch.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 p-4 md:p-6">
      <h1 className="text-2xl font-bold">{rtl ? "تنبيهات انتهاء الصلاحية" : "Expiry Alerts"}</h1>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="size-8 text-rose-600" />
            <div>
              <p className="text-xs text-rose-700">{rtl ? "حرج (أقل من 30 يوم)" : "Critical (<30 days)"}</p>
              <p className="text-2xl font-bold text-rose-800">{items.filter((i) => i.status === "Critical").length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4 flex items-center gap-3">
            <FileWarning className="size-8 text-amber-600" />
            <div>
              <p className="text-xs text-amber-700">{rtl ? "تحذير (30-90 يوم)" : "Warning (30-90 days)"}</p>
              <p className="text-2xl font-bold text-amber-800">{items.filter((i) => i.status === "Warning").length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="size-8 text-emerald-600" />
            <div>
              <p className="text-xs text-emerald-700">{rtl ? "سليم" : "Good"} </p>
              <p className="text-2xl font-bold text-emerald-800">{items.filter((i) => i.status === "Good").length}</p>
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
                <TableHead>{rtl ? "المخزون" : "Stock"}</TableHead>
                <TableHead>{rtl ? "تاريخ الصلاحية" : "Expiry"}</TableHead>
                <TableHead>{rtl ? "الأيام المتبقية" : "Days Left"}</TableHead>
                <TableHead>{rtl ? "الحالة" : "Status"}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-xs">{item.batch}</TableCell>
                  <TableCell>{item.stock}</TableCell>
                  <TableCell className={item.daysLeft < 30 ? "text-rose-600 font-medium" : ""}>
                    {item.expiry}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={item.daysLeft < 30 ? "bg-rose-50 text-rose-700 border-rose-200" : ""}>
                      {item.daysLeft} {rtl ? "يوم" : "days"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColor[item.status]}>{item.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="text-rose-600">
                      <Trash2 className="size-4" />
                    </Button>
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
