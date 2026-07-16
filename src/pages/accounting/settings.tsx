import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";
import { toast } from "sonner";

export default function AccountingSettingsPage() {
  const [settings, setSettings] = useState({
    fiscalYearStart: "2026-01-01",
    fiscalYearEnd: "2026-12-31",
    defaultCurrency: "SAR",
    accountingMethod: "accrual",
    taxRate: "15",
    taxLabel: "VAT",
    decimalPlaces: "2",
    thousandSeparator: ",",
    decimalSeparator: ".",
    enableCostCenters: true,
    autoApproveJournals: false,
    requireJournalApproval: true,
    enableBudgetControl: false,
  });

  const handleSave = () => {
    toast.success("Accounting settings saved");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold">Accounting Settings</h2>
        <p className="text-slate-500">Configure fiscal year, defaults, and accounting preferences</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Fiscal Year</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Fiscal Year Start</Label>
            <Input type="date" value={settings.fiscalYearStart} onChange={(e) => setSettings({...settings, fiscalYearStart: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Fiscal Year End</Label>
            <Input type="date" value={settings.fiscalYearEnd} onChange={(e) => setSettings({...settings, fiscalYearEnd: e.target.value})} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Defaults</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Default Currency</Label>
            <Select value={settings.defaultCurrency} onValueChange={(v) => setSettings({...settings, defaultCurrency: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SAR">SAR - Saudi Riyal</SelectItem>
                <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="GBP">GBP - British Pound</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Accounting Method</Label>
            <Select value={settings.accountingMethod} onValueChange={(v) => setSettings({...settings, accountingMethod: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="accrual">Accrual Basis</SelectItem>
                <SelectItem value="cash">Cash Basis</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Default Tax Rate (%)</Label>
            <Input type="number" value={settings.taxRate} onChange={(e) => setSettings({...settings, taxRate: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Tax Name</Label>
            <Input value={settings.taxLabel} onChange={(e) => setSettings({...settings, taxLabel: e.target.value})} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Format</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Decimal Places</Label>
            <Select value={settings.decimalPlaces} onValueChange={(v) => setSettings({...settings, decimalPlaces: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Thousand Separator</Label>
            <Input value={settings.thousandSeparator} maxLength={1} onChange={(e) => setSettings({...settings, thousandSeparator: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Decimal Separator</Label>
            <Input value={settings.decimalSeparator} maxLength={1} onChange={(e) => setSettings({...settings, decimalSeparator: e.target.value})} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Preferences</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Enable Cost Centers", key: "enableCostCenters" as const },
            { label: "Require Journal Approval", key: "requireJournalApproval" as const },
            { label: "Auto-Approve Journal Entries", key: "autoApproveJournals" as const },
            { label: "Enable Budget Control", key: "enableBudgetControl" as const },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <Label className="cursor-pointer">{item.label}</Label>
              <Switch checked={settings[item.key]} onCheckedChange={(v) => setSettings({...settings, [item.key]: v})} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="gap-2">
        <Save className="h-4 w-4" />
        Save Settings
      </Button>
    </div>
  );
}
