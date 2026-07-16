import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { Camera, Receipt, MapPin, CheckCircle2, Plus, X } from "lucide-react";
import { useNavigate } from "react-router";

export default function MobileSiteExpense() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    projectName: "",
    category: "materials",
    amount: "",
    description: "",
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [gpsStatus, setGpsStatus] = useState<{ lat?: number; lng?: number }>({});
  const [submitted, setSubmitted] = useState(false);
  const submitExpense = trpc.mobile.submitSiteExpense.useMutation();
  const { data: recentExpenses } = trpc.mobile.getMySiteExpenses.useQuery({ limit: 5 });

  const captureReceipt = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setGpsStatus({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
    );
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setReceiptPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    await submitExpense.mutateAsync({
      projectName: form.projectName,
      category: form.category,
      amount: Number(form.amount),
      description: form.description,
      latitude: gpsStatus.lat,
      longitude: gpsStatus.lng,
      receiptImage: receiptPreview || undefined,
    });
    setSubmitted(true);
    setTimeout(() => navigate("/app/mobile"), 2000);
  };

  const categories = [
    { value: "materials", label: "Materials" },
    { value: "transport", label: "Transport" },
    { value: "accommodation", label: "Accommodation" },
    { value: "meals", label: "Meals" },
    { value: "tools", label: "Tools / Equipment" },
    { value: "fuel", label: "Fuel" },
    { value: "permits", label: "Permits / Fees" },
    { value: "other", label: "Other" },
  ];

  if (submitted) {
    return (
      <div className="p-4 space-y-4 max-w-lg mx-auto">
        <Card>
          <CardContent className="py-16 text-center">
            <CheckCircle2 className="size-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold">Expense Submitted</h2>
            <p className="text-sm text-slate-500 mt-2">Your expense has been recorded and sent for approval.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Receipt className="size-5 text-blue-600" />
          Site Expense
        </h1>
        <Badge variant="outline" className={gpsStatus.lat ? "bg-green-100 text-green-700" : "bg-slate-100"}>
          <MapPin className="size-3 mr-1" />
          {gpsStatus.lat ? "GPS Ready" : "No GPS"}
        </Badge>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div>
            <Label>Project / Site</Label>
            <Input
              placeholder="e.g. North Tower Project"
              value={form.projectName}
              onChange={(e) => setForm((f) => ({ ...f, projectName: e.target.value }))}
            />
          </div>

          <div>
            <Label>Category</Label>
            <select
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <Label>Amount (SAR)</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              placeholder="Describe the expense..."
              className="min-h-[80px]"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div>
            <Label>Receipt Photo</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
            {receiptPreview ? (
              <div className="relative mt-2">
                <img src={receiptPreview} alt="Receipt" className="w-full rounded-lg border max-h-48 object-cover" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 bg-white/80"
                  onClick={() => { setReceiptFile(null); setReceiptPreview(null); }}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ) : (
              <Button variant="outline" className="w-full mt-2" onClick={captureReceipt}>
                <Camera className="size-4 mr-2" />
                Capture Receipt
              </Button>
            )}
          </div>

          {gpsStatus.lat && (
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <MapPin className="size-3" />
              Location: {gpsStatus.lat.toFixed(6)}, {gpsStatus.lng?.toFixed(6)}
            </p>
          )}

          <Button
            className="w-full"
            size="lg"
            disabled={!form.projectName || !form.amount}
            onClick={handleSubmit}
          >
            <Plus className="size-4 mr-2" />
            Submit Expense
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {!recentExpenses?.length ? (
            <p className="text-xs text-slate-400 text-center py-4">No recent expenses</p>
          ) : recentExpenses.map((exp: any) => (
            <div key={exp.id} className="flex items-center justify-between p-2 rounded border text-sm">
              <div>
                <p className="font-medium text-xs">{exp.reference}</p>
                <p className="text-[10px] text-slate-400">{exp.date ? new Date(exp.date).toLocaleDateString() : ""}</p>
              </div>
              <span className="font-semibold text-xs">{Number(exp.totalDebit || 0).toFixed(0)} SAR</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
