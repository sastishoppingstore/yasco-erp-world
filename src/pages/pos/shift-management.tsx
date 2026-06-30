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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  DollarSign, Clock, History, Wallet, ArrowUpCircle, ArrowDownCircle,
  Receipt, CheckCircle2, XCircle, AlertCircle,
} from "lucide-react";

export default function ShiftManagementPage() {
  const { language, dir } = useLanguage();
  const rtl = language === "ar";

  const [activeTab, setActiveTab] = useState("current");
  const [currentShift, setCurrentShift] = useState<any>(null);
  const [openModal, setOpenModal] = useState(false);
  const [closeModal, setCloseModal] = useState(false);
  const [cashInOutModal, setCashInOutModal] = useState(false);
  const [cashInOutType, setCashInOutType] = useState<"cash_in" | "cash_out">("cash_in");
  const [openingBalance, setOpeningBalance] = useState("0");
  const [closingActual, setClosingActual] = useState("");
  const [cashAmount, setCashAmount] = useState("");
  const [cashDescription, setCashDescription] = useState("");
  const [shiftHistory, setShiftHistory] = useState<any[]>([]);
  const [drawerLog, setDrawerLog] = useState<any[]>([]);
  const [selectedShiftId, setSelectedShiftId] = useState<number | null>(null);

  const trpcUtils = trpc.useUtils();

  const loadCurrentShift = useCallback(async () => {
    const shift = await trpcUtils.posShared.shiftCurrent.fetch();
    setCurrentShift(shift || null);
  }, [trpcUtils]);

  const loadHistory = useCallback(async () => {
    const data = await trpcUtils.posShared.shiftHistory.fetch({});
    setShiftHistory(data || []);
  }, [trpcUtils]);

  useEffect(() => {
    loadCurrentShift();
    loadHistory();
  }, [loadCurrentShift, loadHistory]);

  const handleOpenShift = useCallback(async () => {
    try {
      await trpcUtils.posShared.shiftOpen.mutate({ openingBalance });
      toast.success(rtl ? "تم فتح الوردية" : "Shift opened");
      setOpenModal(false);
      loadCurrentShift();
    } catch (e: any) {
      toast.error(e.message);
    }
  }, [openingBalance, trpcUtils, loadCurrentShift, rtl]);

  const handleCloseShift = useCallback(async () => {
    if (!currentShift) return;
    try {
      await trpcUtils.posShared.shiftClose.mutate({ id: currentShift.id, closingActual });
      toast.success(rtl ? "تم إغلاق الوردية" : "Shift closed");
      setCloseModal(false);
      setCurrentShift(null);
      loadHistory();
    } catch (e: any) {
      toast.error(e.message);
    }
  }, [currentShift, closingActual, trpcUtils, loadHistory, rtl]);

  const handleCashInOut = useCallback(async () => {
    if (!currentShift) return;
    try {
      if (cashInOutType === "cash_in") {
        await trpcUtils.posShared.shiftCashIn.mutate({ shiftId: currentShift.id, amount: cashAmount, description: cashDescription });
      } else {
        await trpcUtils.posShared.shiftCashOut.mutate({ shiftId: currentShift.id, amount: cashAmount, description: cashDescription });
      }
      toast.success(rtl ? "تمت العملية" : "Transaction completed");
      setCashInOutModal(false);
      setCashAmount("");
      setCashDescription("");
      loadCurrentShift();
    } catch (e: any) {
      toast.error(e.message);
    }
  }, [currentShift, cashInOutType, cashAmount, cashDescription, trpcUtils, loadCurrentShift, rtl]);

  const loadDrawerLog = useCallback(async (shiftId: number) => {
    setSelectedShiftId(shiftId);
    const data = await trpcUtils.posShared.cashDrawerLog.fetch({ shiftId });
    setDrawerLog(data || []);
  }, [trpcUtils]);

  const formatCurrency = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const drawerBalance = currentShift
    ? Number(currentShift.openingBalance) + Number(currentShift.cashSales || 0) + Number(currentShift.cashIn || 0) - Number(currentShift.cashOut || 0)
    : 0;

  return (
    <div dir={dir} className="h-full flex flex-col bg-gray-50">
      <div className="bg-[#123c2e] text-white px-4 py-3 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-lg px-3 py-1.5 text-sm font-bold flex items-center gap-2">
            <Wallet className="size-4" /> {rtl ? "إدارة الورديات" : "Shift & Till"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-white/30 text-white text-xs">
            <Clock className="size-3 mr-1" /> {new Date().toLocaleTimeString()}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className="bg-white border-b px-4 shrink-0">
          <TabsList>
            <TabsTrigger value="current"><DollarSign className="size-4 mr-2" /> {rtl ? "الوردية الحالية" : "Current Shift"}</TabsTrigger>
            <TabsTrigger value="history"><History className="size-4 mr-2" /> {rtl ? "السجل" : "History"}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="current" className="flex-1 p-4 m-0 overflow-auto">
          {!currentShift ? (
            <div className="max-w-md mx-auto text-center py-12">
              <Wallet className="size-20 mx-auto mb-4 opacity-30 text-gray-300" />
              <p className="text-lg font-medium text-gray-500 mb-4">{rtl ? "لا توجد وردية مفتوحة" : "No open shift"}</p>
              <Button onClick={() => setOpenModal(true)}>
                <DollarSign className="size-4 mr-2" /> {rtl ? "فتح وردية" : "Open Shift"}
              </Button>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-4">
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{rtl ? "الوردية" : "Shift"} #{currentShift.shiftNumber}</span>
                    <Badge className="bg-green-600">{rtl ? "مفتوحة" : "Open"}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">{rtl ? "فتحت في" : "Opened at"}</p>
                      <p className="font-medium">{new Date(currentShift.openedAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">{rtl ? "الرصيد الافتتاحي" : "Opening Balance"}</p>
                      <p className="font-medium">{formatCurrency(Number(currentShift.openingBalance))}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">{rtl ? "مبيعات نقدية" : "Cash Sales"}</p>
                      <p className="font-medium">{formatCurrency(Number(currentShift.cashSales))}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">{rtl ? "مبيعات بطاقة" : "Card Sales"}</p>
                      <p className="font-medium">{formatCurrency(Number(currentShift.cardSales))}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">{rtl ? "إيداع نقدي" : "Cash In"}</p>
                      <p className="font-medium text-green-600">+{formatCurrency(Number(currentShift.cashIn || 0))}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">{rtl ? "سحب نقدي" : "Cash Out"}</p>
                      <p className="font-medium text-red-600">-{formatCurrency(Number(currentShift.cashOut || 0))}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg">{rtl ? "الرصيد الحالي في الدرج" : "Current Drawer Balance"}</span>
                    <span className="font-bold text-lg text-green-700">{formatCurrency(drawerBalance)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => { setCashInOutType("cash_in"); setCashInOutModal(true); }}>
                      <ArrowUpCircle className="size-4 mr-1 text-green-600" /> {rtl ? "إيداع" : "Cash In"}
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => { setCashInOutType("cash_out"); setCashInOutModal(true); }}>
                      <ArrowDownCircle className="size-4 mr-1 text-red-600" /> {rtl ? "سحب" : "Cash Out"}
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => { setClosingActual(String(drawerBalance)); setCloseModal(true); }}>
                      <CheckCircle2 className="size-4 mr-1" /> {rtl ? "إغلاق" : "Close"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm">{rtl ? "حركات الدرج" : "Drawer Movements"}</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <Button variant="ghost" size="sm" onClick={() => loadDrawerLog(currentShift.id)}>
                    <Receipt className="size-4 mr-1" /> {rtl ? "عرض الحركات" : "View Movements"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="flex-1 p-4 m-0 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-3">
            {shiftHistory.map(shift => (
              <Card key={shift.id} className="cursor-pointer hover:border-green-500 transition-all" onClick={() => loadDrawerLog(shift.id)}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">#{shift.shiftNumber}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(shift.openedAt).toLocaleString()} {shift.closedAt && `→ ${new Date(shift.closedAt).toLocaleString()}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {rtl ? "متوقع" : "Expected"}: {formatCurrency(Number(shift.closingExpected))} · {rtl ? "فعلي" : "Actual"}: {formatCurrency(Number(shift.closingActual))}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={shift.status === "closed" ? "bg-gray-500" : "bg-green-600"}>{shift.status}</Badge>
                    {shift.difference && Number(shift.difference) !== 0 && (
                      <p className={`text-xs font-bold mt-1 ${Number(shift.difference) > 0 ? "text-green-600" : "text-red-600"}`}>
                        {Number(shift.difference) > 0 ? "+" : ""}{formatCurrency(Number(shift.difference))}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Drawer Log Modal */}
      <Dialog open={!!selectedShiftId && drawerLog.length > 0} onOpenChange={(open) => { if (!open) setSelectedShiftId(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{rtl ? "حركات الدرج" : "Drawer Movements"}</DialogTitle>
          </DialogHeader>
          <div className="max-h-80 overflow-y-auto">
            {drawerLog.map(log => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b text-sm">
                <div>
                  <Badge variant="outline" className="text-[10px]">{log.action}</Badge>
                  <p className="text-xs text-gray-500 mt-1">{new Date(log.createdAt).toLocaleString()}</p>
                  {log.description && <p className="text-xs text-gray-400">{log.description}</p>}
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(Number(log.amount))}</p>
                  <p className="text-xs text-gray-500">{rtl ? "الرصيد" : "Bal"}: {formatCurrency(Number(log.balanceAfter))}</p>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedShiftId(null)}>{rtl ? "إغلاق" : "Close"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Open Shift Modal */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{rtl ? "فتح وردية جديدة" : "Open New Shift"}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <label className="text-sm text-gray-500">{rtl ? "الرصيد الافتتاحي" : "Opening Balance"}</label>
            <Input type="number" value={openingBalance} onChange={e => setOpeningBalance(e.target.value)} className="text-lg h-12" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenModal(false)}>{rtl ? "إلغاء" : "Cancel"}</Button>
            <Button className="bg-green-700" onClick={handleOpenShift}>{rtl ? "فتح" : "Open"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Shift Modal */}
      <Dialog open={closeModal} onOpenChange={setCloseModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{rtl ? "إغلاق الوردية" : "Close Shift"}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <label className="text-sm text-gray-500">{rtl ? "الرصيد الفعلي" : "Actual Cash in Drawer"}</label>
            <Input type="number" value={closingActual} onChange={e => setClosingActual(e.target.value)} className="text-lg h-12" />
            {currentShift && (
              <p className="text-xs text-gray-400">
                {rtl ? "الرصيد المتوقع" : "Expected"}: {formatCurrency(drawerBalance)}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseModal(false)}>{rtl ? "إلغاء" : "Cancel"}</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleCloseShift}>{rtl ? "إغلاق" : "Close"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cash In/Out Modal */}
      <Dialog open={cashInOutModal} onOpenChange={setCashInOutModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {cashInOutType === "cash_in"
                ? (rtl ? "إيداع نقدي" : "Cash In")
                : (rtl ? "سحب نقدي" : "Cash Out")}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <label className="text-sm text-gray-500">{rtl ? "المبلغ" : "Amount"}</label>
            <Input type="number" value={cashAmount} onChange={e => setCashAmount(e.target.value)} className="text-lg h-12" />
            <label className="text-sm text-gray-500">{rtl ? "السبب" : "Reason"}</label>
            <Input value={cashDescription} onChange={e => setCashDescription(e.target.value)} placeholder={rtl ? "وصف..." : "Description..."} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCashInOutModal(false)}>{rtl ? "إلغاء" : "Cancel"}</Button>
            <Button className={cashInOutType === "cash_in" ? "bg-green-700" : "bg-red-600"} onClick={handleCashInOut}>
              {rtl ? "تأكيد" : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
