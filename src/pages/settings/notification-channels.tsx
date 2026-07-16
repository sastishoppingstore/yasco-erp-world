import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/providers/trpc";
import { Mail, MessageSquare, MessageCircle, Phone, Save, CheckCircle2 } from "lucide-react";

export default function NotificationChannelsPage() {
  const { data: config, refetch } = trpc.notifications2.getChannelConfig.useQuery();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Notification Channels</h2><p className="text-sm text-slate-500">Configure delivery channels for notifications</p></div>

      <Tabs defaultValue="email">
        <TabsList>
          <TabsTrigger value="email"><Mail className="w-4 h-4 mr-2" />Email</TabsTrigger>
          <TabsTrigger value="sms"><MessageSquare className="w-4 h-4 mr-2" />SMS</TabsTrigger>
          <TabsTrigger value="whatsapp"><MessageCircle className="w-4 h-4 mr-2" />WhatsApp</TabsTrigger>
          <TabsTrigger value="voice"><Phone className="w-4 h-4 mr-2" />Voice</TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <Card>
            <CardHeader><CardTitle>Email Settings</CardTitle><CardDescription>Configure SMTP for email notifications</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div><Label>Email Notifications Enabled</Label><p className="text-xs text-slate-500">Send notifications via email</p></div>
                <Switch defaultChecked={config?.emailEnabled} />
              </div>
              <p className="text-sm text-slate-500">Email is configured via <Link to="/app/admin/super-smtp" className="text-blue-500 underline">SMTP Settings</Link>.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sms">
          <Card>
            <CardHeader><CardTitle>SMS Settings</CardTitle><CardDescription>Configure SMS gateway</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div><Label>SMS Notifications</Label><p className="text-xs text-slate-500">Send SMS via Twilio or local providers</p></div>
                <Switch defaultChecked={config?.smsEnabled} />
              </div>
              <p className="text-sm text-slate-500">Provider: {config?.smsProvider ?? "Not configured"}</p>
              <p className="text-sm text-slate-500">Configure via environment variables: SMS_API_KEY, SMS_PROVIDER</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp">
          <Card>
            <CardHeader><CardTitle>WhatsApp Business API</CardTitle><CardDescription>WhatsApp integration for the Saudi market</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div><Label>WhatsApp Notifications</Label><p className="text-xs text-slate-500">Send via WhatsApp Business API</p></div>
                <Switch defaultChecked={config?.whatsappEnabled} />
              </div>
              <p className="text-sm text-slate-500">Phone Number ID: {config?.whatsappPhoneNumberId ?? "Not configured"}</p>
              <p className="text-xs text-slate-400">Configure via environment variables: WHATSAPP_API_KEY, WHATSAPP_PHONE_NUMBER_ID</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice">
          <Card>
            <CardHeader><CardTitle>Voice Call Settings</CardTitle><CardDescription>Voice call alerts for critical notifications</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-500">Voice call integration requires integration with a telephony provider (Twilio Voice, or local Saudi provider).</p>
              <p className="text-xs text-slate-400">This is a placeholder for future implementation. Configure via VOICE_API_KEY environment variable.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          {saved ? <><CheckCircle2 className="w-4 h-4 mr-2" />Saved</> : <><Save className="w-4 h-4 mr-2" />Save Changes</>}
        </Button>
      </div>
    </div>
  );
}
