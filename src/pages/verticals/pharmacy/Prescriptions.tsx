import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/providers/language";
import { ClipboardList, Plus, Search } from "lucide-react";

type RxStatus = "Pending" | "In Progress" | "Dispensed" | "Cancelled";

interface Prescription {
  id: string;
  patient: string;
  doctor: string;
  medication: string;
  dosage: string;
  date: string;
  status: RxStatus;
}

const initial: Prescription[] = [
  { id: "RX-001", patient: "Ahmed Al-Otaibi", doctor: "Dr. Abdullah", medication: "Amoxicillin 500mg", dosage: "1x3 daily", date: "2026-07-08", status: "Pending" },
  { id: "RX-002", patient: "Sara Mohammed", doctor: "Dr. Fatima", medication: "Paracetamol 500mg", dosage: "1x4 daily", date: "2026-07-08", status: "In Progress" },
  { id: "RX-003", patient: "Khalid Al-Harbi", doctor: "Dr. Abdullah", medication: "Omeprazole 20mg", dosage: "1x1 daily", date: "2026-07-07", status: "Dispensed" },
  { id: "RX-004", patient: "Nora Al-Saud", doctor: "Dr. Layla", medication: "Atorvastatin 10mg", dosage: "1x1 nightly", date: "2026-07-07", status: "Dispensed" },
  { id: "RX-005", patient: "Mohammed Ali", doctor: "Dr. Ahmed", medication: "Metformin 500mg", dosage: "1x2 daily", date: "2026-07-06", status: "Cancelled" },
];

const statusColor: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700 border-amber-200",
  "In Progress": "bg-blue-100 text-blue-700 border-blue-200",
  Dispensed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Cancelled: "bg-rose-100 text-rose-700 border-rose-200",
};

export default function PharmacyPrescriptions() {
  const { language } = useLanguage();
  const rtl = language === "ar";
  const [search, setSearch] = useState("");
  const [rxList, setRxList] = useState(initial);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ patient: "", doctor: "", medication: "", dosage: "" });

  const filtered = rxList.filter((rx) =>
    rx.patient.toLowerCase().includes(search.toLowerCase()) || rx.id.includes(search)
  );

  const handleCreate = () => {
    setRxList((prev) => [
      ...prev,
      { id: `RX-${String(prev.length + 1).padStart(3, "0")}`, ...form, date: new Date().toISOString().split("T")[0], status: "Pending" as RxStatus },
    ]);
    setOpen(false);
    setForm({ patient: "", doctor: "", medication: "", dosage: "" });
  };

  const updateStatus = (id: string, status: RxStatus) => {
    setRxList((prev) => prev.map((rx) => (rx.id === id ? { ...rx, status } : rx)));
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{rtl ? "الوصفات الطبية" : "Prescriptions"}</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 ml-2" />
              {rtl ? "وصفة جديدة" : "New Prescription"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{rtl ? "وصفة جديدة" : "New Prescription"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{rtl ? "المريض" : "Patient"}</Label>
                <Input value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })} />
              </div>
              <div>
                <Label>{rtl ? "الطبيب" : "Doctor"}</Label>
                <Input value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })} />
              </div>
              <div>
                <Label>{rtl ? "الدواء" : "Medication"}</Label>
                <Input value={form.medication} onChange={(e) => setForm({ ...form, medication: e.target.value })} />
              </div>
              <div>
                <Label>{rtl ? "الجرعة" : "Dosage"}</Label>
                <Input value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} />
              </div>
              <Button onClick={handleCreate} className="w-full">{rtl ? "إنشاء الوصفة" : "Create Prescription"}</Button>
            </div>
          </DialogContent>
        </Dialog>
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
                <TableHead>{rtl ? "المعرف" : "ID"}</TableHead>
                <TableHead>{rtl ? "المريض" : "Patient"}</TableHead>
                <TableHead>{rtl ? "الطبيب" : "Doctor"}</TableHead>
                <TableHead>{rtl ? "الدواء" : "Medication"}</TableHead>
                <TableHead>{rtl ? "الجرعة" : "Dosage"}</TableHead>
                <TableHead>{rtl ? "التاريخ" : "Date"}</TableHead>
                <TableHead>{rtl ? "الحالة" : "Status"}</TableHead>
                <TableHead>{rtl ? "الإجراءات" : "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((rx) => (
                <TableRow key={rx.id}>
                  <TableCell className="font-medium">{rx.id}</TableCell>
                  <TableCell>{rx.patient}</TableCell>
                  <TableCell>{rx.doctor}</TableCell>
                  <TableCell>{rx.medication}</TableCell>
                  <TableCell>{rx.dosage}</TableCell>
                  <TableCell>{rx.date}</TableCell>
                  <TableCell>
                    <Badge className={statusColor[rx.status]}>{rx.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {rx.status === "Pending" && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(rx.id, "In Progress")}>
                          {rtl ? "بدء التحضير" : "Start"}
                        </Button>
                      )}
                      {rx.status === "In Progress" && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(rx.id, "Dispensed")}>
                          {rtl ? "صرف" : "Dispense"}
                        </Button>
                      )}
                      {rx.status === "Pending" && (
                        <Button size="sm" variant="outline" className="text-rose-600" onClick={() => updateStatus(rx.id, "Cancelled")}>
                          {rtl ? "إلغاء" : "Cancel"}
                        </Button>
                      )}
                    </div>
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
