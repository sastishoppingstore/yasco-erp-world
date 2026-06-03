import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { syncEngine, type SyncStatus } from "@/lib/sync/syncEngine";

const SyncContext = createContext<{
  status: SyncStatus;
  sync: () => void;
  retryAllFailed: () => void;
  getStats: () => Promise<any>;
} | null>(null);

export function SyncProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SyncStatus>(syncEngine.status);

  useEffect(() => {
    const unsub = syncEngine.onChange(setStatus);
    // Initial sync check
    syncEngine.sync();
    return unsub;
  }, []);

  return (
    <SyncContext.Provider value={{
      status,
      sync: () => syncEngine.sync(),
      retryAllFailed: () => syncEngine.retryAllFailed(),
      getStats: () => syncEngine.getStats(),
    }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error("useSync must be used within SyncProvider");
  return ctx;
}
