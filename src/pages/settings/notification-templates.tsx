import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/providers/trpc";
import { Bell, Eye, Save, CheckCircle2 } from "lucide-react";

export default function NotificationTemplatesPage() {
  const { data: templates, refetch } = trpc.notifications2.listTemplates.useQuery();
  const saveTemplate = trpc.notifications2.saveTemplate.useMutation({ onSuccess: () => refetch() });
  const [selected, setSelected] = useState<string>("");
  const [previewVars, setPreviewVars] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  const template = templates?.find(t => t.templateKey === selected);

  const [form, setForm] = useState({ name: "", title: "", titleAr: "", message: "", messageAr: "" });

  const selectTemplate = (key: string) => {
    setSelected(key);
    const t = templates?.find(t => t.templateKey === key);
    if (t) {
      setForm({ name: t.name, title: t.title, titleAr: t.titleAr ?? "", message: t.message, messageAr: t.messageAr ?? "" });
      const vars: Record<string, string> = {};
      Object.keys(t.variables).forEach(k => { vars[k] = ""; });
      setPreviewVars(vars);
    }
  };

  const handlePreview = () => {
    const fullVars = { ...previewVars };
    trpc.notifications2.preview.query({ templateKey: selected, variables: fullVars, language: "en" }).then(setPreview);
  };

  const handleSave = () => {
    saveTemplate.mutate({ templateKey: selected, ...form });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Notification Templates</h2><p className="text-sm text-slate-500">Manage multi-language notification templates</p></div>

      <div className="grid grid-cols-4 gap-6">
        <Card className="col-span-1">
          <CardHeader><CardTitle className="text-sm">Templates</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {templates?.map(t => (
              <button key={t.templateKey} onClick={() => selectTemplate(t.templateKey)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selected === t.templateKey ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                <Bell className="w-3 h-3 inline mr-2" />{t.name}
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="col-span-3 space-y-4">
          {template && (
            <>
              <Card>
                <CardHeader><CardTitle>Edit Template: {template.name}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                    <div><Label>Name (Arabic)</Label><Input value={template.name} disabled className="opacity-50" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Title (English)</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
                    <div><Label>Title (Arabic)</Label><Input value={form.titleAr} onChange={e => setForm(f => ({ ...f, titleAr: e.target.value }))} /></div>
                  </div>
                  <div><Label>Message (English)</Label><Textarea rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} /></div>
                  <div><Label>Message (Arabic)</Label><Textarea rows={4} value={form.messageAr} onChange={e => setForm(f => ({ ...f, messageAr: e.target.value }))} dir="rtl" /></div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={handlePreview}><Eye className="w-4 h-4 mr-2" />Preview</Button>
                    <Button onClick={handleSave}>
                      {saved ? <><CheckCircle2 className="w-4 h-4 mr-2" />Saved</> : <><Save className="w-4 h-4 mr-2" />Save</>}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {preview && (
                <Card>
                  <CardHeader><CardTitle>Preview</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <p className="font-medium">{preview.subject}</p>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{preview.body}</p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader><CardTitle>Variables</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.keys(template.variables).map(key => (
                      <div key={key}>
                        <Label className="text-xs">{`{{${key}}}`}</Label>
                        <Input value={previewVars[key] ?? ""} onChange={e => setPreviewVars(v => ({ ...v, [key]: e.target.value }))} placeholder={key} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
