import { useState } from "react";
import { useLanguage } from "@/providers/language";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  DollarSign, ArrowUpRight, ArrowDownLeft, TrendingUp, TrendingDown,
  Wallet, History, Plus, X, Search, Download, FileText, Calendar,
  CheckCircle2, AlertCircle, Building2,
} from "lucide-react";

export default function CashboxPage() {
  const { language, dir } = useLanguage();
  const rtl = language === "ar";

  const [activeTab, setActiveTab] = useState("overview");
  const [cashInModal, setCashInModal] = useState(false);
  const [cashOutModal, setCashOutModal] = useState(false);
  const [expenseModal, setExpenseModal] = useState(false);
  const [cancelModal, setCancelModal] = useState<{ id: number; txNumber: string } | null>(null);

  // Forms
  const [cashInAmount, setCashInAmount] = useState("");
  const [cashInDesc, setCashInDesc] = useState("");
  const [cashInNotes, setCashInNotes] = useState("");
  const [cashOutAmount, setCashOutAmount] = useState("");
  const [cashOutDesc, setCashOutDesc] = useState("");
  const [cashOutNotes, setCashOutNotes] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseNotes, setExpenseNotes] = useState("");
  const [search, setSearch] = useState("");

  const balanceQ = trpc.cashbox.currentBalance.useQuery(undefined, { refetchInterval: 10000 });
  const summaryQ = trpc.cashbox.todaySummary.useQuery(undefined, { refetchInterval: 30000 });
  const txListQ = trpc.cashbox.transactionList.useQuery({ search, limit: 50 }, { refetchInterval: 15000 });
  const cashInMut = trpc.cashbox.cashIn.useMutation();
  const cashOutMut = trpc.cashbox.cashOut.useMutation();
  const expenseMut = trpc.cashbox.addExpense.useMutation();
  const cancelTxMut = trpc.cashbox.cancelTransaction.useMutation();

  const formatCurrency = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleCashIn = async () => {
    if (!cashInAmount || !cashInDesc) { toast.error(rtl ? "املأ جميع الحقول" : "Fill all fields"); return; }
    try {
      await cashInMut.mutateAsync({ amount: cashInAmount, description: cashInDesc, notes: cashInNotes });
      toast.success(rtl ? "تم إيداع المبلغ" : "Cash in recorded");
      setCashInModal(false); setCashInAmount(""); setCashInDesc(""); setCashInNotes("");
      balanceQ.refetch(); summaryQ.refetch(); txListQ.refetch();
    } catch (e: any) { toast.error(e.message || "Failed"); }
  };

  const handleCashOut = async () => {
    if (!cashOutAmount || !cashOutDesc) { toast.error(rtl ? "املأ جميع الحقول" : "Fill all fields"); return; }
    try {
      await cashOutMut.mutateAsync({ amount: cashOutAmount, description: cashOutDesc, notes: cashOutNotes });
      toast.success(rtl ? "تم السحب" : "Cash out recorded");
      setCashOutModal(false); setCashOutAmount(""); setCashOutDesc(""); setCashOutNotes("");
      balanceQ.refetch(); summaryQ.refetch(); txListQ.refetch();
    } catch (e: any) { toast.error(e.message || "Failed"); }
  };

  const handleExpense = async () => {
    if (!expenseAmount || !expenseDesc) { toast.error(rtl ? "املأ جميع الحقول" : "Fill all fields"); return; }
    try {
      await expenseMut.mutateAsync({ amount: expenseAmount, description: expenseDesc, notes: expenseNotes });
      toast.success(rtl ? "تم تسجيل المصروف" : "Expense recorded");
      setExpenseModal(false); setExpenseAmount(""); setExpenseDesc(""); setExpenseNotes("");
      balanceQ.refetch(); summaryQ.refetch(); txListQ.refetch();
    } catch (e: any) { toast.error(e.message || "Failed"); }
  };

  const handleCancel = async () => {
    if (!cancelModal) return;
    try {
      await cancelTxMut.mutateAsync({ id: cancelModal.id });
      toast.success(rtl ? "تم إلغاء المعاملة" : "Transaction cancelled");
      setCancelModal(null);
      balanceQ.refetch(); summaryQ.refetch(); txListQ.refetch();
    } catch (e: any) { toast.error(e.message || "Failed"); }
  };

  return (
    <div dir={dir} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{rtl ? "الصندوق" : "Cashbox"}</h1>
          <p className="text-sm text-gray-500">{rtl ? "إدارة النقد والمصروفات" : "Manage cash and expenses"}</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-green-700 hover:bg-green-800" onClick={() => setCashInModal(true)}>
            <ArrowUpRight className="size-4 mr-2" />
            {rtl ? "إيداع" : "Cash In"}
          </Button>
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setCashOutModal(true)}>
            <ArrowDownLeft className="size-4 mr-2" />
            {rtl ? "سحب" : "Cash Out"}
          </Button>
          <Button variant="outline" onClick={() => setExpenseModal(true)}>
            <TrendingDown className="size-4 mr-2" />
            {rtl ? "مصروف" : "Expense"}
          </Button>
        </div>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-green-800 to-green-950 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm">{rtl ? "الرصيد الحالي" : "Current Balance"}</p>
              <p className="text-4xl font-bold mt-1">
                {balanceQ.isLoading ? "..." : formatCurrency(balanceQ.data?.balance || 0)}
              </p>
            </div>
            <Wallet className="size-16 opacity-30" />
          </div>
        </CardContent>
      </Card>

      {/* Today Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <TrendingUp className="size-5 text-green-700" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{rtl ? "مبيعات اليوم" : "Today's Sales"}</p>
                <p className="text-lg font-bold">{formatCurrency(summaryQ.data?.sales?.total || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <ArrowUpRight className="size-5 text-blue-700" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{rtl ? "إيداع اليوم" : "Today's Cash In"}</p>
                <p className="text-lg font-bold">{formatCurrency(summaryQ.data?.cashIn?.total || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <ArrowDownLeft className="size-5 text-red-700" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{rtl ? "سحب اليوم" : "Today's Cash Out"}</p>
                <p className="text-lg font-bold">{formatCurrency(summaryQ.data?.cashOut?.total || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <TrendingDown className="size-5 text-orange-700" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{rtl ? "مصروفات اليوم" : "Today's Expenses"}</p>
                <p className="text-lg font-bold">{formatCurrency(summaryQ.data?.expenses?.total || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{rtl ? "المعاملات" : "Transactions"}</CardTitle>
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
          <div className="space-y-2">
            {txListQ.data?.data?.length === 0 && (
              <p className="text-center text-gray-400 py-8">{rtl ? "لا توجد معاملات" : "No transactions yet"}</p>
            )}
            {txListQ.data?.data?.map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-lg shrink-0 ${
                    ["cash_in", "sale", "customer_payment", "income"].includes(tx.transactionType)
                      ? "bg-green-100"
                      : ["cash_out", "expense"].includes(tx.transactionType)
                      ? "bg-red-100"
                      : "bg-blue-100"
                  }`}>
                    {["cash_in", "sale", "customer_payment", "income"].includes(tx.transactionType) ? (
                      <TrendingUp className="size-4 text-green-700" />
                    ) : (
                      <TrendingDown className="size-4 text-red-700" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{tx.description || tx.transactionType}</p>
                    <p className="text-xs text-gray-500">
                      {tx.transactionNumber} &middot; {new Date(tx.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-bold ${["cash_in", "sale", "customer_payment", "income"].includes(tx.transactionType) ? "text-green-700" : "text-red-600"}`}>
                    {["cash_in", "sale", "customer_payment", "income"].includes(tx.transactionType) ? "+" : "-"}
                    {formatCurrency(Number(tx.amount))}
                  </p>
                  <div className="flex items-center gap-1 justify-end">
                    <Badge variant="outline" className="text-[10px]">{tx.paymentMethod}</Badge>
                    {tx.status === "cancelled" && <Badge variant="destructive" className="text-[10px]">{rtl ? "ملغي" : "Cancelled"}</Badge>}
                  </div>
                </div>
                {tx.status !== "cancelled" && (
                  <Button variant="ghost" size="icon" className="size-6 shrink-0 ml-2"
                    onClick={() => setCancelModal({ id: tx.id, txNumber: tx.transactionNumber })}>
                    <X className="size-3 text-gray-400" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cash In Modal */}
      <Dialog open={cashInModal} onOpenChange={setCashInModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpRight className="size-5 text-green-700" />
              {rtl ? "إيداع نقدي" : "Cash In"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">{rtl ? "المبلغ" : "Amount"}</label>
              <Input type="number" value={cashInAmount} onChange={e => setCashInAmount(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="text-sm font-medium">{rtl ? "الوصف" : "Description"}</label>
              <Input value={cashInDesc} onChange={e => setCashInDesc(e.target.value)}
                placeholder={rtl ? "سبب الإيداع..." : "Reason for cash in..."} />
            </div>
            <div>
              <label className="text-sm font-medium">{rtl ? "ملاحظات" : "Notes"}</label>
              <Input value={cashInNotes} onChange={e => setCashInNotes(e.target.value)} placeholder="..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCashInModal(false)}>{rtl ? "إلغاء" : "Cancel"}</Button>
            <Button className="bg-green-700 hover:bg-green-800" onClick={handleCashIn} disabled={cashInMut.isPending}>
              {rtl ? "تأكيد الإيداع" : "Confirm Cash In"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cash Out Modal */}
      <Dialog open={cashOutModal} onOpenChange={setCashOutModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowDownLeft className="size-5 text-red-600" />
              {rtl ? "سحب نقدي" : "Cash Out"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">{rtl ? "المبلغ" : "Amount"}</label>
              <Input type="number" value={cashOutAmount} onChange={e => setCashOutAmount(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="text-sm font-medium">{rtl ? "الوصف" : "Description"}</label>
              <Input value={cashOutDesc} onChange={e => setCashOutDesc(e.target.value)}
                placeholder={rtl ? "سبب السحب..." : "Reason for cash out..."} />
            </div>
            <div>
              <label className="text-sm font-medium">{rtl ? "ملاحظات" : "Notes"}</label>
              <Input value={cashOutNotes} onChange={e => setCashOutNotes(e.target.value)} placeholder="..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCashOutModal(false)}>{rtl ? "إلغاء" : "Cancel"}</Button>
            <Button variant="destructive" onClick={handleCashOut} disabled={cashOutMut.isPending}>
              {rtl ? "تأكيد السحب" : "Confirm Cash Out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expense Modal */}
      <Dialog open={expenseModal} onOpenChange={setExpenseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingDown className="size-5 text-orange-600" />
              {rtl ? "تسجيل مصروف" : "Record Expense"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">{rtl ? "المبلغ" : "Amount"}</label>
              <Input type="number" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="text-sm font-medium">{rtl ? "الوصف" : "Description"}</label>
              <Input value={expenseDesc} onChange={e => setExpenseDesc(e.target.value)}
                placeholder={rtl ? "وصف المصروف..." : "Expense description..."} />
            </div>
            <div>
              <label className="text-sm font-medium">{rtl ? "ملاحظات" : "Notes"}</label>
              <Input value={expenseNotes} onChange={e => setExpenseNotes(e.target.value)} placeholder="..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExpenseModal(false)}>{rtl ? "إلغاء" : "Cancel"}</Button>
            <Button variant="default" onClick={handleExpense} disabled={expenseMut.isPending}>
              {rtl ? "تسجيل" : "Record Expense"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Modal */}
      <Dialog open={!!cancelModal} onOpenChange={() => setCancelModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{rtl ? "إلغاء المعاملة" : "Cancel Transaction"}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            {rtl ? "هل أنت متأكد من إلغاء المعاملة" : "Are you sure you want to cancel transaction"}: {cancelModal?.txNumber}?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelModal(null)}>{rtl ? "تراجع" : "Back"}</Button>
            <Button variant="destructive" onClick={handleCancel}>{rtl ? "تأكيد الإلغاء" : "Confirm Cancel"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
