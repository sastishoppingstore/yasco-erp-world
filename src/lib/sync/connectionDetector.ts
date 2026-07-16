type ConnectionCallback = (online: boolean) => void;

class ConnectionDetector {
  private online: boolean = navigator.onLine;
  private listeners: ConnectionCallback[] = [];

  constructor() {
    window.addEventListener("online", () => this.setOnline(true));
    window.addEventListener("offline", () => this.setOnline(false));
    // Periodic check
    setInterval(() => this.checkConnection(), 30000);
  }

  private async checkConnection() {
    try {
      const res = await fetch("/api/ping", { method: "HEAD", cache: "no-store" });
      this.setOnline(res.ok);
    } catch {
      this.setOnline(false);
    }
  }

  private setOnline(val: boolean) {
    if (this.online !== val) {
      this.online = val;
      this.listeners.forEach((l) => l(val));
    }
  }

  isOnline() {
    return this.online;
  }

  onChange(cb: ConnectionCallback) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }
}

export const connectionDetector = new ConnectionDetector();
