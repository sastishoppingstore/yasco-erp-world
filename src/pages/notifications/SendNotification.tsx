import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/providers/trpc";
import { Send, Mail, MessageSquare, MessageCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function SendNotificationPage() {
  const [tab, setTab] = useState("manual");
  const [channel, setChannel] = useState("email");
  const sendMutation = trpc.notifications2.send.useMutation();
  const sendTemplateMutation = trpc.notifications2.sendTemplate.useMutation();
  const { data: templates } = trpc.notifications2.listTemplates.useQuery();

  const [manualForm, setManualForm] = useState({ to: "", subject: "", body: "", bodyAr: "" });
  const [templateForm, setTemplateForm] = useState({ templateKey: "", to: "", language: "en" as const, variables: "" });
  const [results, setResults] = useState<any[]>([]);

  const handleManualSend = () => {
    sendMutation.mutate({ channel: channel as any, to: manualForm.to, subject: manualForm.subject, body: manualForm.body, bodyAr: manualForm.bodyAr || undefined }, {
      onSuccess: (data) => setResults(data),
    });
  };

  const handleTemplateSend = () => {
    let vars: Record<string, any> = {};
    try { vars = JSON.parse(templateForm.variables || "{}"); } catch { }
    sendTemplateMutation.mutate({
      templateKey: templateForm.templateKey, channel: channel as any,
      to: templateForm.to, variables: vars, language: templateForm.language,
    }, {
      onSuccess: (data) => setResults(data),
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div><h2 className="text-2xl font-bold">Send Notification</h2><p className="text-sm text-slate-500">Manually send notifications via any channel</p></div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="manual">Manual</TabsTrigger>
          <TabsTrigger value="template">From Template</TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <Card>
            <CardHeader><CardTitle>Manual Notification</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Channel</Label>
                <div className="flex gap-2 mt-1">
                  {[["email", "Email", Mail], ["sms", "SMS", MessageSquare], ["whatsapp", "WhatsApp", MessageCircle]].map(([k, n, Icon]) => (
                    <Button key={k} variant={channel === k ? "default" : "outline"} onClick={() => setChannel(k)} className="flex-1">
                      <Icon className="w-4 h-4 mr-2" />{n}
                    </Button>
                  ))}
                </div>
              </div>
              <div><Label>To</Label><Input value={manualForm.to} onChange={e => setManualForm(f => ({ ...f, to: e.target.value }))} placeholder="email@example.com or +9665xxxxxxxx" /></div>
              {channel === "email" && <div><Label>Subject</Label><Input value={manualForm.subject} onChange={e => setManualForm(f => ({ ...f, subject: e.target.value }))} placeholder="Notification subject" /></div>}
              <div><Label>Body</Label><Textarea rows={5} value={manualForm.body} onChange={e => setManualForm(f => ({ ...f, body: e.target.value }))} placeholder="Message content" /></div>
              <div><Label>Body (Arabic - optional)</Label><Textarea rows={3} value={manualForm.bodyAr} onChange={e => setManualForm(f => ({ ...f, bodyAr: e.target.value }))} placeholder="محتوى الرسالة بالعربية" dir="rtl" /></div>
              <div className="flex justify-end">
                <Button onClick={handleManualSend} disabled={!manualForm.to || !manualForm.body || sendMutation.isPending}>
                  {sendMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="template">
          <Card>
            <CardHeader><CardTitle>Send from Template</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Channel</Label>
                <div className="flex gap-2 mt-1">
                  {[["email", "Email", Mail], ["sms", "SMS", MessageSquare], ["whatsapp", "WhatsApp", MessageCircle]].map(([k, n, Icon]) => (
                    <Button key={k} variant={channel === k ? "default" : "outline"} onClick={() => setChannel(k)} className="flex-1">
                      <Icon className="w-4 h-4 mr-2" />{n}
                    </Button>
                  ))}
                </div>
              </div>
              <div><Label>Template</Label>
                <select value={templateForm.templateKey} onChange={e => setTemplateForm(f => ({ ...f, templateKey: e.target.value }))} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                  <option value="">Select template...</option>
                  {templates?.map(t => <option key={t.templateKey} value={t.templateKey}>{t.name}</option>)}
                </select>
              </div>
              <div><Label>To</Label><Input value={templateForm.to} onChange={e => setTemplateForm(f => ({ ...f, to: e.target.value }))} placeholder="Recipient address" /></div>
              <div><Label>Language</Label>
                <select value={templateForm.language} onChange={e => setTemplateForm(f => ({ ...f, language: e.target.value as any }))} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </select>
              </div>
              <div><Label>Variables (JSON)</Label><Textarea rows={4} value={templateForm.variables} onChange={e => setTemplateForm(f => ({ ...f, variables: e.target.value }))} placeholder='{"customer_name": "Ahmed", "invoice_number": "INV-001"}' /></div>
              <div className="flex justify-end">
                <Button onClick={handleTemplateSend} disabled={!templateForm.templateKey || !templateForm.to || sendTemplateMutation.isPending}>
                  {sendTemplateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {results.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Delivery Results</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {results.map((r, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${r.success ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
                {r.success ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <span className="w-4 h-4 text-red-500">✗</span>}
                <div>
                  <p className="text-sm font-medium capitalize">{r.channel}</p>
                  <p className="text-xs text-slate-500">{r.error ?? `Sent: ${r.messageId ?? "OK"}`}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
