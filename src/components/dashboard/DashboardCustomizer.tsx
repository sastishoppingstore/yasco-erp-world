import { useState } from "react";
import { Settings, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import type { DashboardPreset } from "@/hooks/useDashboardLayout";
import { useLanguage } from "@/providers/language";

const presets: { key: DashboardPreset; en: string; ar: string }[] = [
  { key: "default", en: "Default", ar: "افتراضي" },
  { key: "minimal", en: "Minimal", ar: "بسيط" },
  { key: "executive", en: "Executive", ar: "تنفيذي" },
  { key: "operational", en: "Operational", ar: "تشغيلي" },
];

export default function DashboardCustomizer() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const { layout, setPreset, toggleWidget, allWidgets } = useDashboardLayout();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="size-4" />
          <span className="hidden sm:inline">{isAr ? "تخصيص" : "Customize"}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side={isAr ? "right" : "left"}>
        <SheetHeader>
          <SheetTitle>{isAr ? "تخصيص لوحة التحكم" : "Customize Dashboard"}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">{isAr ? "النمط" : "Preset Layouts"}</h4>
            <div className="flex flex-wrap gap-2">
              {presets.map(p => (
                <Badge
                  key={p.key}
                  variant={layout.preset === p.key ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setPreset(p.key)}
                >
                  {isAr ? p.ar : p.en}
                </Badge>
              ))}
            </div>
          </div>
          <Separator />
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">{isAr ? "العناصر" : "Widgets"}</h4>
            {allWidgets.map(key => {
              const visible = layout.widgets.includes(key);
              return (
                <div key={key} className="flex items-center justify-between p-2 rounded-lg border bg-slate-50">
                  <span className="text-sm">{key}</span>
                  <Switch checked={visible} onCheckedChange={() => { toggleWidget(key); setOpen(false); setTimeout(() => window.location.reload(), 100); }} />
                </div>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
