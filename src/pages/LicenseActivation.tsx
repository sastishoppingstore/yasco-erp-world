import { useState } from "react";
import { Shield, Key, Globe, Phone, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useLicense } from "@/hooks/useLicense";
import { useLanguage } from "@/providers/language";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export default function LicenseActivation() {
  const { activate, startTrial } = useLicense();
  const { language } = useLanguage();
  const isAr = language === "ar";
  const [licenseKey, setLicenseKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      setError(isAr ? "يرجى إدخال مفتاح الترخيص" : "Please enter a license key");
      return;
    }
    setLoading(true);
    setError("");
    await new Promise(r => setTimeout(r, 800));
    const result = activate(licenseKey);
    setLoading(false);
    if (result.success) {
      toast.success(result.message);
      window.location.href = "/company-onboarding";
    } else {
      setError(result.message);
    }
  };

  const handleTrial = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const result = startTrial();
    setLoading(false);
    if (result.success) {
      toast.success(result.message);
      window.location.href = "/company-onboarding";
    }
  };

  const handleOfflineActivation = () => {
    const offlineKey = `OFFLINE-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    setLicenseKey(offlineKey);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-indigo-950/20 to-slate-950/30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-lg"
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex size-12 items-center justify-center rounded-xl bg-blue-600 font-bold text-xl text-white">YA</div>
          <div>
            <p className="text-2xl font-bold text-white">YASCO</p>
            <p className="text-sm text-slate-400">Enterprise OS</p>
          </div>
        </div>

        <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
          <CardHeader className="text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-blue-600/20 mb-4">
              <Shield className="size-7 text-blue-400" />
            </div>
            <CardTitle className="text-white text-xl">
              {isAr ? "تفعيل الترخيص" : "License Activation"}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {isAr ? "أدخل مفتاح الترخيص لتفعيل النظام" : "Enter your license key to activate the system"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label className="text-slate-300">
                {isAr ? "مفتاح الترخيص" : "License Key"}
              </Label>
              <Input
                value={licenseKey}
                onChange={(e) => { setLicenseKey(e.target.value); setError(""); }}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className="font-mono text-lg tracking-wider bg-white/5 border-white/10 text-white placeholder:text-slate-500 text-center"
                autoFocus
              />
            </div>

            {error && (
              <Alert variant="destructive" className="border-red-500/30 bg-red-500/10">
                <AlertTriangle className="size-4" />
                <AlertDescription className="text-red-300">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleActivate}
              disabled={loading || !licenseKey.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11"
            >
              {loading ? (
                <Loader2 className="size-4 mr-2 animate-spin" />
              ) : (
                <Key className="size-4 mr-2" />
              )}
              {isAr ? "تفعيل الترخيص" : "Activate License"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-slate-900 px-3 text-slate-500">
                  {isAr ? "أو" : "OR"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleTrial}
                disabled={loading}
                className="border-white/10 bg-white/5 text-white hover:bg-white/10 h-11"
              >
                <CheckCircle2 className="size-4 mr-2 text-emerald-400" />
                {isAr ? "تجربة 14 يوم" : "14-Day Trial"}
              </Button>
              <Button
                variant="outline"
                onClick={handleOfflineActivation}
                disabled={loading}
                className="border-white/10 bg-white/5 text-white hover:bg-white/10 h-11"
              >
                <Phone className="size-4 mr-2 text-amber-400" />
                {isAr ? "تفعيل بدون نت" : "Offline"}
              </Button>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-2">
              <p className="text-xs font-medium text-slate-400">
                {isAr ? "طرق التفعيل المتاحة" : "Available Activation Methods"}
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-md bg-white/5 p-2">
                  <Globe className="size-4 text-blue-400 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-400">{isAr ? "الإنترنت" : "Online"}</p>
                </div>
                <div className="rounded-md bg-white/5 p-2">
                  <Phone className="size-4 text-emerald-400 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-400">{isAr ? "الهاتف" : "Phone"}</p>
                </div>
                <div className="rounded-md bg-white/5 p-2">
                  <Shield className="size-4 text-amber-400 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-400">{isAr ? " Trial" : "Trial"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
