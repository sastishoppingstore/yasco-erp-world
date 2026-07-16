import { EventEmitter } from "events";

type PresenceInfo = {
  tenantId: number;
  userId: number;
  status: string;
  currentModule?: string;
  customStatus?: string;
};

class WSEventBus extends EventEmitter {
  private presence: Map<string, PresenceInfo> = new Map();

  broadcast(tenantId: number, event: string, data: any) {
    this.emit(`tenant:${tenantId}:${event}`, data);
  }

  sendToUser(tenantId: number, userId: number, event: string, data: any) {
    this.emit(`user:${tenantId}:${userId}:${event}`, data);
  }

  setPresence(key: string, info: PresenceInfo) {
    this.presence.set(key, info);
    this.broadcast(info.tenantId, "presence", {
      type: "presence_change",
      userId: info.userId,
      status: info.status,
    });
  }

  removePresence(key: string) {
    const info = this.presence.get(key);
    if (info) {
      this.presence.delete(key);
      this.broadcast(info.tenantId, "presence", {
        type: "presence_offline",
        userId: info.userId,
        status: "offline",
      });
    }
  }

  getOnlineUsers(tenantId: number) {
    return Array.from(this.presence.values()).filter(
      (p) => p.tenantId === tenantId && p.status !== "offline",
    );
  }

  sendNotification(tenantId: number, userId: number, notification: any) {
    this.sendToUser(tenantId, userId, "notification", notification);
  }
}

export const wsBus = new WSEventBus();
