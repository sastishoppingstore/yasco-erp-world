import { useState } from "react";
import { useLanguage } from "@/providers/language";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Calendar, DollarSign, User, CheckCircle2, AlertTriangle,
  Clock, Plus, Search, FileText, ArrowRight, CreditCard,
  Building2, Percent, TrendingUp, ListChecks,
} from "lucide-react";

export default function InstallmentsPage() {
  const { language, dir } = useLanguage();
  const rtl = language === "ar";

  const [activeTab, setActiveTab] = useState("active");
  const [createModal, setCreateModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState<{ id: number; paymentNumber: string; amount: string } | null>(null);
  const [detailModal, setDetailModal] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  // Create form
  const [customerSearch, setCustomerSearch] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [totalAmount, setTotalAmount] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [numInstallments, setNumInstallments] = useState("4");
  const [installmentType, setInstallmentType] = useState("monthly");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  // Payment form
  const [paidAmount, setPaidAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const listQ = trpc.installments.list.useQuery({ search, status: activeTab === "all" ? undefined : activeTab }, { refetchInterval: 15000 });
  const summaryQ = trpc.installments.summary.useQuery(undefined, { refetchInterval: 30000 });
  const overdueQ = trpc.installments.overdue.useQuery(undefined, { refetchInterval: 15000 });
  const createMut = trpc.installments.create.useMutation();
  const recordPaymentMut = trpc.installments.recordPayment.useMutation();
  const customerSearchMut = trpc.pos.customerSearch.useMutation();

  const formatCurrency = (n: number) => n.toLocaleString(undefined, { minimumFractionBits: 2, maximumFractionBits: 2 });

  const handleCustomerSearch = async (q: string) => {
    setCustomerSearch(q);
    if (q.length < 1) { setCustomers([]); return; }
    const result = await customerSearchMut.mutateAsync({ query: q });
    setCustomers(result || []);
  };

  const handleCreate = async () => {
    if (!selectedCustomer || !totalAmount || !numInstallments) {
      toast.error(rtl ? "املأ جميع الحقول" : "Fill all fields");
      return;
    }
    try {
      await createMut.mutateAsync({
        customerId: selectedCustomer.id,
        totalAmount,
        downPayment: downPayment || "0",
        numberOfInstallments: parseInt(numInstallments),
        installmentType: installmentType as any,
        startDate,
        notes,
      });
      toast.success(rtl ? "تم إنشاء خطة التقسيط" : "Installment plan created");
      setCreateModal(false);
      resetForm();
      listQ.refetch();
      summaryQ.refetch();
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
  };

  const resetForm = () => {
    setSelectedCustomer(null);
    setCustomerSearch("");
    setCustomers([]);
    setTotalAmount("");
    setDownPayment("");
    setNumInstallments("4");
    setInstallmentType("monthly");
    setStartDate(new Date().toISOString().split("T")[0]);
    setNotes("");
  };

  const handleRecordPayment = async () => {
    if (!paymentModal || !paidAmount) { toast.error(rtl ? "أدخل المبلغ" : "Enter amount"); return; }
    try {
      await recordPaymentMut.mutateAsync({
        installmentPaymentId: paymentModal.id,
        paidAmount,
        paymentMethod: paymentMethod as any,
      });
      toast.success(rtl ? "تم تسجيل الدفعة" : "Payment recorded");
      setPaymentModal(null);
      setPaidAmount("");
      listQ.refetch();
      summaryQ.refetch();
      overdueQ.refetch();
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "completed": return "secondary";
      case "defaulted": return "destructive";
      case "cancelled": return "outline";
      case "paid": return "secondary";
      case "pending": return "outline";
      case "overdue": return "destructive";
      default: return "outline";
    }
  };

  const statusLabel = (status: string) => {
    const labels: Record<string, Record<string, string>> = {
      active: { en: "Active", ar: "نشط" },
      completed: { en: "Completed", ar: "مكتمل" },
      defaulted: { en: "Defaulted", ar: "متأخر" },
      cancelled: { en: "Cancelled", ar: "ملغي" },
      paid: { en: "Paid", ar: "مدفوع" },
      pending: { en: "Pending", ar: "قيد الانتظار" },
      overdue: { en: "Overdue", ar: "متأخر" },
    };
    return labels[status]?.[language] || status;
  };

  return (
    <div dir={dir} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{rtl ? "التقسيط" : "Installments"}</h1>
          <p className="text-sm text-gray-500">{rtl ? "إدارة خطط التقسيط والدفعات" : "Manage installment plans and payments"}</p>
        </div>
        <Button className="bg-green-700 hover:bg-green-800" onClick={() => setCreateModal(true)}>
          <Plus className="size-4 mr-2" />
          {rtl ? "إنشاء خطة تقسيط" : "New Installment"}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <TrendingUp className="size-5 text-blue-700" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{rtl ? "المتبقي النشط" : "Active Receivable"}</p>
                <p className="text-lg font-bold">{formatCurrency(summaryQ.data?.activeTotal || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <ListChecks className="size-5 text-green-700" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{rtl ? "نشط" : "Active"} </p>
                <p className="text-lg font-bold">{summaryQ.data?.activeCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50">
                <CheckCircle2 className="size-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{rtl ? "مكتمل" : "Completed"}</p>
                <p className="text-lg font-bold">{summaryQ.data?.completedCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <AlertTriangle className="size-5 text-red-700" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{rtl ? "متأخر" : "Overdue"}</p>
                <p className="text-lg font-bold">{overdueQ.data?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Alert */}
      {overdueQ.data && overdueQ.data.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="size-6 text-red-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">
                {rtl ? "دفعات متأخرة" : "Overdue Payments"}: {overdueQ.data.length}
              </p>
              <p className="text-xs text-red-600">
                {rtl ? "يرجى متابعة التحصيل" : "Please follow up on collections"}
              </p>
            </div>
            <Button variant="outline" size="sm" className="ml-auto border-red-300" onClick={() => overdueQ.refetch()}>
              {rtl ? "تحديث" : "Refresh"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Installments List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {["active", "completed", "defaulted", "all"].map(tab => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab(tab)}
                  className={activeTab === tab ? "bg-green-700" : ""}
                >
                  {rtl
                    ? (tab === "active" ? "نشط" : tab === "completed" ? "مكتمل" : tab === "defaulted" ? "متأخر" : "الكل")
                    : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Button>
              ))}
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={rtl ? "بحث..." : "Search..."}
                className="pl-10 h-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {listQ.data?.data?.length === 0 && (
              <p className="text-center text-gray-400 py-8">{rtl ? "لا توجد خطط تقسيط" : "No installment plans"}</p>
            )}
            {listQ.data?.data?.map((inst: any) => {
              const progress = inst.totalAmount > 0
                ? Math.round((Number(inst.totalPaid) / Number(inst.totalAmount)) * 100)
                : 0;
              return (
                <div
                  key={inst.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setDetailModal(inst.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{inst.installmentNumber}</p>
                        <Badge variant={statusVariant(inst.status)}>{statusLabel(inst.status)}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{inst.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-700">{formatCurrency(Number(inst.remainingAmount))}</p>
                      <p className="text-xs text-gray-500">
                        {rtl ? "من" : "of"} {formatCurrency(Number(inst.totalAmount))}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{progress}% {rtl ? "مدفوع" : "paid"}</span>
                      <span>{inst.numberOfInstallments} {rtl ? "دفعة" : "installments"}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-700 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Dialog open={createModal} onOpenChange={setCreateModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="size-5 text-green-700" />
              {rtl ? "إنشاء خطة تقسيط" : "New Installment Plan"}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-4 py-4 pr-4">
              {/* Customer Search */}
              <div>
                <label className="text-sm font-medium mb-1 block">{rtl ? "العميل" : "Customer"}</label>
                <Input
                  value={customerSearch}
                  onChange={e => handleCustomerSearch(e.target.value)}
                  placeholder={rtl ? "ابحث عن عميل..." : "Search customer..."}
                />
                {customers.length > 0 && (
                  <div className="mt-2 border rounded-lg max-h-40 overflow-y-auto">
                    {customers.map(c => (
                      <div
                        key={c.id}
                        className={`p-2 text-sm cursor-pointer hover:bg-gray-100 ${selectedCustomer?.id === c.id ? "bg-green-50 font-medium" : ""}`}
                        onClick={() => { setSelectedCustomer(c); setCustomerSearch(""); setCustomers([]); }}
                      >
                        {c.name} {c.phone ? `- ${c.phone}` : ""}
                      </div>
                    ))}
                  </div>
                )}
                {selectedCustomer && (
                  <Badge variant="secondary" className="mt-2">
                    {selectedCustomer.name}
                    <Button variant="ghost" size="icon" className="size-4 ml-1" onClick={() => setSelectedCustomer(null)}>
                      <X className="size-3" />
                    </Button>
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">{rtl ? "المبلغ الإجمالي" : "Total Amount"}</label>
                  <Input type="number" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{rtl ? "الدفعة الأولى" : "Down Payment"}</label>
                  <Input type="number" value={downPayment} onChange={e => setDownPayment(e.target.value)} placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">{rtl ? "عدد الدفعات" : "Installments"}</label>
                  <Input type="number" value={numInstallments} onChange={e => setNumInstallments(e.target.value)} placeholder="4" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{rtl ? "نوع الدفعة" : "Interval"}</label>
                  <Select value={installmentType} onValueChange={setInstallmentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">{rtl ? "أسبوعي" : "Weekly"}</SelectItem>
                      <SelectItem value="biweekly">{rtl ? "نصف شهري" : "Bi-weekly"}</SelectItem>
                      <SelectItem value="monthly">{rtl ? "شهري" : "Monthly"}</SelectItem>
                      <SelectItem value="quarterly">{rtl ? "ربع سنوي" : "Quarterly"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{rtl ? "تاريخ البدء" : "Start Date"}</label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{rtl ? "ملاحظات" : "Notes"}</label>
                <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="..." />
              </div>
              {totalAmount && numInstallments && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">{rtl ? "ملخص الخطة" : "Plan Summary"}</p>
                  <p className="text-sm">
                    {rtl ? "المبلغ الممول" : "Financed"}: {formatCurrency(Math.max(0, Number(totalAmount) - Number(downPayment || 0)))}
                  </p>
                  <p className="text-sm">
                    {rtl ? "الدفعة الواحدة" : "Per Installment"}: {formatCurrency(Math.max(0, Number(totalAmount) - Number(downPayment || 0)) / parseInt(numInstallments))}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateModal(false); resetForm(); }}>{rtl ? "إلغاء" : "Cancel"}</Button>
            <Button className="bg-green-700 hover:bg-green-800" onClick={handleCreate} disabled={createMut.isPending}>
              {rtl ? "إنشاء" : "Create Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={!!paymentModal} onOpenChange={() => setPaymentModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="size-5 text-green-700" />
              {rtl ? "تسجيل دفعة" : "Record Payment"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">{rtl ? "الدفعة" : "Payment"}: {paymentModal?.paymentNumber}</p>
            <div>
              <label className="text-sm font-medium mb-1 block">{rtl ? "المبلغ المستحق" : "Due Amount"}</label>
              <p className="text-lg font-bold">{formatCurrency(Number(paymentModal?.amount || 0))}</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{rtl ? "المبلغ المدفوع" : "Paid Amount"}</label>
              <Input type="number" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} placeholder={paymentModal?.amount} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{rtl ? "طريقة الدفع" : "Payment Method"}</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">{rtl ? "نقدي" : "Cash"}</SelectItem>
                  <SelectItem value="card">{rtl ? "بطاقة" : "Card"}</SelectItem>
                  <SelectItem value="transfer">{rtl ? "تحويل" : "Transfer"}</SelectItem>
                  <SelectItem value="wallet">{rtl ? "محفظة" : "Wallet"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentModal(null)}>{rtl ? "إلغاء" : "Cancel"}</Button>
            <Button className="bg-green-700 hover:bg-green-800" onClick={handleRecordPayment} disabled={recordPaymentMut.isPending}>
              {rtl ? "تسجيل الدفعة" : "Record Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={!!detailModal} onOpenChange={() => setDetailModal(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{rtl ? "تفاصيل خطة التقسيط" : "Installment Details"}</DialogTitle>
          </DialogHeader>
          {/* We'll load detail via a separate query when needed */}
          <div className="py-4">
            <p className="text-sm text-gray-500">{rtl ? "جاري التحميل..." : "Loading..."}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailModal(null)}>{rtl ? "إغلاق" : "Close"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
