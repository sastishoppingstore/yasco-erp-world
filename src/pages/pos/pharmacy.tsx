import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/providers/language";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Pill, ClipboardPen, FileText, Search, Plus, Trash2, DollarSign,
  Shield, AlertTriangle, ClipboardList, Building2, CreditCard,
  TestTube,
} from "lucide-react";

export default function PharmacyPOSPage() {
  const { language, dir } = useLanguage();
  const rtl = language === "ar";

  const [activeTab, setActiveTab] = useState("prescription");
  const [rxSearch, setRxSearch] = useState("");
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [selectedRx, setSelectedRx] = useState<any>(null);
  const [rxModal, setRxModal] = useState(false);
  const [interactionWarnings, setInteractionWarnings] = useState<any[]>([]);
  const [insuranceCompanies, setInsuranceCompanies] = useState<any[]>([]);
  const [claimModal, setClaimModal] = useState(false);
  const [controlledLog, setControlledLog] = useState<any[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const trpcUtils = trpc.useUtils();

  useEffect(() => {
    trpcUtils.posPharmacy.insuranceCompanyList.fetch().then(setInsuranceCompanies);
  }, []);

  const handleRxSearch = useCallback(async (q: string) => {
    setRxSearch(q);
    if (q.length < 2) return;
    const result = await trpcUtils.posPharmacy.prescriptionSearch.fetch({ query: q });
    setPrescriptions(result || []);
  }, [trpcUtils]);

  const handleRxSelect = useCallback(async (rx: any) => {
    const full = await trpcUtils.posPharmacy.prescriptionGet.fetch({ id: rx.id });
    setSelectedRx(full);
    // Check interactions
    if (full?.items?.length > 1) {
      const pids = full.items.map((i: any) => i.productId);
      const warnings = await trpcUtils.posPharmacy.drugInteractionCheck.fetch({ productIds: pids });
      setInteractionWarnings(warnings || []);
    }
    setRxModal(true);
  }, [trpcUtils]);

  const handleDispense = useCallback(async () => {
    if (!selectedRx) return;
    try {
      await trpcUtils.posPharmacy.prescriptionDispense.mutate({
        prescriptionId: selectedRx.id,
        items: selectedRx.items.map((i: any) => ({
          prescriptionItemId: i.id,
          productId: i.productId,
          quantityDispensed: i.quantityPrescribed - i.quantityDispensed,
        })),
      });
      toast.success("Dispensed successfully");
      setRxModal(false);
    } catch (e: any) {
      toast.error(e.message || "Dispense failed");
    }
  }, [selectedRx, trpcUtils]);

  const loadControlledLog = useCallback(async () => {
    const data = await trpcUtils.posPharmacy.controlledSubstanceLogList.fetch({ from: dateFrom || undefined, to: dateTo || undefined });
    setControlledLog(data || []);
  }, [trpcUtils, dateFrom, dateTo]);

  useEffect(() => { if (activeTab === "controlled") loadControlledLog(); }, [activeTab, loadControlledLog]);

  const formatCurrency = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div dir={dir} className="h-full flex flex-col bg-gray-50">
      <div className="bg-[#123c2e] text-white px-4 py-3 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-lg px-3 py-1.5 text-sm font-bold flex items-center gap-2">
            <Pill className="size-4" /> Pharmacy POS
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className="bg-white border-b px-4 shrink-0">
          <TabsList>
            <TabsTrigger value="prescription"><ClipboardPen className="size-4 mr-2" /> {rtl ? "وصفات طبية" : "Prescriptions"}</TabsTrigger>
            <TabsTrigger value="controlled"><Shield className="size-4 mr-2" /> {rtl ? "مواد مراقبة" : "Controlled"}</TabsTrigger>
            <TabsTrigger value="insurance"><Building2 className="size-4 mr-2" /> {rtl ? "تأمين" : "Insurance"}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="prescription" className="flex-1 flex flex-col min-h-0 p-4 m-0">
          <div className="max-w-4xl mx-auto w-full space-y-4">
            <Input
              value={rxSearch}
              onChange={e => handleRxSearch(e.target.value)}
              placeholder={rtl ? "ابحث برقم الوصفة أو اسم الطبيب..." : "Search by prescription # or doctor..."}
              className="h-12 text-lg"
            />
            <div className="grid gap-3">
              {prescriptions.map(rx => (
                <Card key={rx.id} className="cursor-pointer hover:border-green-500 transition-all" onClick={() => handleRxSelect(rx)}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold">{rx.prescriptionNumber}</p>
                      <p className="text-sm text-gray-500">{rx.doctorName} · {new Date(rx.dateIssued).toLocaleDateString()}</p>
                    </div>
                    <Badge>{rx.status}</Badge>
                  </CardContent>
                </Card>
              ))}
              {rxSearch && prescriptions.length === 0 && (
                <p className="text-center text-gray-400 py-8">{rtl ? "لا توجد نتائج" : "No results"}</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="controlled" className="flex-1 p-4 m-0 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex gap-3">
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} placeholder={rtl ? "من" : "From"} />
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} placeholder={rtl ? "إلى" : "To"} />
              <Button onClick={loadControlledLog}><Search className="size-4 mr-1" /> {rtl ? "بحث" : "Search"}</Button>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">{rtl ? "التاريخ" : "Date"}</th>
                    <th className="p-2 text-left">{rtl ? "المنتج" : "Product"}</th>
                    <th className="p-2 text-left">{rtl ? "المريض" : "Patient"}</th>
                    <th className="p-2 text-right">{rtl ? "الكمية" : "Qty"}</th>
                    <th className="p-2 text-right">{rtl ? "الرصيد قبل" : "Before"}</th>
                    <th className="p-2 text-right">{rtl ? "الرصيد بعد" : "After"}</th>
                    <th className="p-2 text-left">{rtl ? "الصيدلي" : "Pharmacist"}</th>
                  </tr>
                </thead>
                <tbody>
                  {controlledLog.map(log => (
                    <tr key={log.id} className="border-t">
                      <td className="p-2">{new Date(log.dispensedAt).toLocaleString()}</td>
                      <td className="p-2">{log.productId}</td>
                      <td className="p-2">{log.patientName}</td>
                      <td className="p-2 text-right font-bold">{log.quantityDispensed}</td>
                      <td className="p-2 text-right">{log.balanceBefore}</td>
                      <td className="p-2 text-right">{log.balanceAfter}</td>
                      <td className="p-2">{log.dispensedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="insurance" className="flex-1 p-4 m-0 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insuranceCompanies.map(ic => (
                <Card key={ic.id}>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm">{ic.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-xs text-gray-500">
                    <p>{rtl ? "كود" : "Code"}: {ic.code}</p>
                    <p>{rtl ? "تغطية" : "Coverage"}: {ic.coveragePercent}%</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button onClick={() => setClaimModal(true)}>
              <FileText className="size-4 mr-2" /> {rtl ? "مطالبة جديدة" : "New Claim"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Prescription Detail Modal */}
      <Dialog open={rxModal} onOpenChange={setRxModal}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardPen className="size-5" /> {selectedRx?.prescriptionNumber}
              <Badge>{selectedRx?.status}</Badge>
            </DialogTitle>
          </DialogHeader>
          {interactionWarnings.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm font-bold text-red-700 flex items-center gap-2">
                <AlertTriangle className="size-4" /> {rtl ? "تحذير تفاعل دوائي" : "Drug Interaction Warning"}
              </p>
              {interactionWarnings.map((w, i) => (
                <p key={i} className="text-xs text-red-600 mt-1">
                  {w.productAName} + {w.productBName}: {w.severity}
                </p>
              ))}
            </div>
          )}
          <div className="space-y-2 mt-3">
            <p className="text-sm"><strong>{rtl ? "الطبيب" : "Doctor"}:</strong> {selectedRx?.doctorName}</p>
            <p className="text-sm"><strong>{rtl ? "العيادة" : "Clinic"}:</strong> {selectedRx?.clinicName}</p>
            <Separator />
            {selectedRx?.items?.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between border rounded-lg p-3">
                <div>
                  <p className="font-medium text-sm">Product #{item.productId}</p>
                  <p className="text-xs text-gray-500">{item.dosage && `${item.dosage} · `}{item.frequency && `${item.frequency}`}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{item.quantityDispensed}/{item.quantityPrescribed}</p>
                  <p className="text-xs text-gray-500">{rtl ? "صرف" : "Dispensed"}</p>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRxModal(false)}>{rtl ? "إلغاء" : "Cancel"}</Button>
            <Button className="bg-green-700 hover:bg-green-800" onClick={handleDispense}>
              <TestTube className="size-4 mr-2" /> {rtl ? "صرف" : "Dispense"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
