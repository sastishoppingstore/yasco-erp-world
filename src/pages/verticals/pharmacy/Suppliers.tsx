import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLanguage } from "@/providers/language";
import { ShoppingBag, Search, Plus, Phone, Mail, MapPin } from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  city: string;
  status: "Active" | "Inactive";
  pendingOrders: number;
}

const suppliers: Supplier[] = [
  { id: "SUP-001", name: "Saudi Pharmaceutical Industries", contact: "Mohammed Al-Anazi", phone: "+966 55 123 4567", email: "info@spi.com.sa", city: "Riyadh", status: "Active", pendingOrders: 2 },
  { id: "SUP-002", name: "Tabuk Pharmaceuticals", contact: "Khalid Al-Shammari", phone: "+966 50 234 5678", email: "orders@tabukpharma.com", city: "Tabuk", status: "Active", pendingOrders: 1 },
  { id: "SUP-003", name: "Jamjoom Pharma", contact: "Ali Jamjoom", phone: "+966 55 345 6789", email: "supply@jamjoompharma.com", city: "Jeddah", status: "Active", pendingOrders: 0 },
  { id: "SUP-004", name: "SPIMACO", contact: "Abdullah Al-Qahtani", phone: "+966 54 456 7890", email: "sales@spimaco.com.sa", city: "Riyadh", status: "Active", pendingOrders: 3 },
];

export default function PharmacySuppliers() {
  const { language } = useLanguage();
  const rtl = language === "ar";
  const [search, setSearch] = useState("");

  const filtered = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{rtl ? "موردو الأدوية" : "Supplier Orders"}</h1>
        <Button>
          <Plus className="size-4 ml-2" />
          {rtl ? "طلب شراء" : "New Order"}
        </Button>
      </div>

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        <Input
          placeholder={rtl ? "بحث..." : "Search..."}
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
                <TableHead>{rtl ? "المورد" : "Supplier"}</TableHead>
                <TableHead>{rtl ? "جهة الاتصال" : "Contact"}</TableHead>
                <TableHead>{rtl ? "الهاتف" : "Phone"}</TableHead>
                <TableHead>{rtl ? "البريد" : "Email"}</TableHead>
                <TableHead>{rtl ? "المدينة" : "City"}</TableHead>
                <TableHead>{rtl ? "الطلبات المعلقة" : "Pending Orders"}</TableHead>
                <TableHead>{rtl ? "الحالة" : "Status"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.contact}</TableCell>
                  <TableCell dir="ltr" className="text-xs">{s.phone}</TableCell>
                  <TableCell className="text-xs">{s.email}</TableCell>
                  <TableCell>{s.city}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={s.pendingOrders > 0 ? "bg-amber-50 text-amber-700" : ""}>
                      {s.pendingOrders}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={s.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}>
                      {s.status}
                    </Badge>
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
