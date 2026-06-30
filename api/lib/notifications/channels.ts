import { getDb } from "../../queries/connection";
import * as schema from "@db/schema";
import { eq, and } from "drizzle-orm";
import { sendEmail } from "../smtp";
import { env } from "../env";

export type ChannelType = "email" | "sms" | "whatsapp" | "push" | "voice";

export interface ChannelMessage {
  to: string;
  subject?: string;
  body: string;
  bodyAr?: string;
  attachments?: { filename: string; content: string }[];
}

export interface ChannelResult {
  success: boolean;
  channel: ChannelType;
  messageId?: string;
  error?: string;
}

interface ChannelConfig {
  whatsappApiKey?: string;
  whatsappPhoneNumberId?: string;
  smsProvider?: "twilio" | "local_saudi";
  smsApiKey?: string;
  smsSenderId?: string;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioFrom?: string;
  voiceProvider?: string;
  voiceApiKey?: string;
}

async function getChannelConfig(tenantId: number): Promise<ChannelConfig> {
  const db = getDb();
  const settings = await db.query.companySettings.findFirst({
    where: eq(schema.companySettings.tenantId, tenantId),
  });
  return {
    whatsappApiKey: process.env.WHATSAPP_API_KEY,
    whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    smsProvider: (process.env.SMS_PROVIDER as any) ?? "twilio",
    smsApiKey: process.env.SMS_API_KEY,
    smsSenderId: process.env.SMS_SENDER_ID ?? "YASCO",
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
    twilioFrom: process.env.TWILIO_FROM,
    voiceProvider: process.env.VOICE_PROVIDER,
    voiceApiKey: process.env.VOICE_API_KEY,
  };
}

async function getUserChannelPreferences(tenantId: number, userId: number): Promise<{
  emailEnabled: boolean; smsEnabled: boolean; whatsappEnabled: boolean; pushEnabled: boolean;
}> {
  const db = getDb();
  const prefs = await db.query.notificationTemplates.findFirst({
    where: and(eq(schema.notificationTemplates.tenantId, tenantId)),
  });
  const vars = prefs?.variables as any;
  return {
    emailEnabled: vars?.emailEnabled ?? true,
    smsEnabled: vars?.smsEnabled ?? false,
    whatsappEnabled: vars?.whatsappEnabled ?? false,
    pushEnabled: vars?.pushEnabled ?? true,
  };
}

export class EmailChannel {
  async send(message: ChannelMessage, _tenantId: number): Promise<ChannelResult> {
    try {
      const result = await sendEmail(message.to, message.subject ?? "", message.body);
      return { success: result.sent, channel: "email", messageId: `email_${Date.now()}` };
    } catch (err: any) {
      return { success: false, channel: "email", error: err.message };
    }
  }
}

export class SmsChannel {
  async send(message: ChannelMessage, tenantId: number): Promise<ChannelResult> {
    try {
      const config = await getChannelConfig(tenantId);
      if (!config.smsApiKey) throw new Error("SMS not configured");
      if (config.smsProvider === "twilio") {
        const accountSid = config.twilioAccountSid;
        const authToken = config.twilioAuthToken;
        if (accountSid && authToken) {
          const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
          const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
          const formData = new URLSearchParams({
            To: message.to, From: config.twilioFrom ?? "YASCO",
            Body: message.body.substring(0, 1600),
          });
          const resp = await fetch(twilioUrl, {
            method: "POST",
            headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
            body: formData.toString(),
          });
          const data = await resp.json() as any;
          return { success: resp.ok, channel: "sms", messageId: data.sid, error: data.message };
        }
      }
      return { success: false, channel: "sms", error: "SMS provider not configured" };
    } catch (err: any) {
      return { success: false, channel: "sms", error: err.message };
    }
  }
}

export class WhatsAppChannel {
  async send(message: ChannelMessage, tenantId: number): Promise<ChannelResult> {
    try {
      const config = await getChannelConfig(tenantId);
      if (!config.whatsappApiKey || !config.whatsappPhoneNumberId) {
        throw new Error("WhatsApp Business API not configured");
      }
      const resp = await fetch(
        `https://graph.facebook.com/v21.0/${config.whatsappPhoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.whatsappApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: message.to.replace(/[^0-9]/g, ""),
            type: "text",
            text: { body: message.body.substring(0, 4096) },
          }),
        },
      );
      const data = await resp.json() as any;
      return { success: resp.ok, channel: "whatsapp", messageId: data?.messages?.[0]?.id, error: data?.error?.message };
    } catch (err: any) {
      return { success: false, channel: "whatsapp", error: err.message };
    }
  }
}

export class VoiceChannel {
  async send(message: ChannelMessage, tenantId: number): Promise<ChannelResult> {
    try {
      const config = await getChannelConfig(tenantId);
      if (!config.voiceApiKey) throw new Error("Voice channel not configured");
      return { success: false, channel: "voice", error: "Voice call delivery requires Twilio Voice or local Saudi provider integration. Placeholder for future implementation." };
    } catch (err: any) {
      return { success: false, channel: "voice", error: err.message };
    }
  }
}

export class NotificationDispatcher {
  private email = new EmailChannel();
  private sms = new SmsChannel();
  private whatsapp = new WhatsAppChannel();
  private voice = new VoiceChannel();

  async dispatch(tenantId: number, userId: number, channels: ChannelType[], message: ChannelMessage): Promise<ChannelResult[]> {
    const prefs = await getUserChannelPreferences(tenantId, userId);
    const results: ChannelResult[] = [];

    const channelMap: Record<ChannelType, { enabled: boolean; sender: any }> = {
      email: { enabled: prefs.emailEnabled, sender: this.email },
      sms: { enabled: prefs.smsEnabled, sender: this.sms },
      whatsapp: { enabled: prefs.whatsappEnabled, sender: this.whatsapp },
      push: { enabled: prefs.pushEnabled, sender: null },
      voice: { enabled: false, sender: this.voice },
    };

    for (const ch of channels) {
      const cfg = channelMap[ch];
      if (!cfg?.enabled) {
        results.push({ success: false, channel: ch, error: "Channel not enabled for user" });
        continue;
      }
      if (!cfg.sender) {
        results.push({ success: false, channel: ch, error: "Push notifications require WebSocket/SSE integration" });
        continue;
      }
      const result = await cfg.sender.send(message, tenantId);
      results.push(result);
    }
    return results;
  }
}

export const notificationDispatcher = new NotificationDispatcher();
