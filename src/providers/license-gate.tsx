import { useEffect, useState, ReactNode } from "react";
import { trpc } from "@/providers/trpc";

interface LicenseGateProps {
  children: ReactNode;
}

export function LicenseGate({ children }: LicenseGateProps) {
  const { data, isLoading, isError } = trpc.license.status.useQuery(undefined, {
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  // Non-desktop mode: always pass through
  if (!isLoading && data && !data.desktopMode) {
    return <>{children}</>;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <img src="/logo-40.png" alt="YASCO" className="mx-auto mb-4 h-16 w-16 rounded-2xl object-contain" />
          <div className="h-1 w-48 overflow-hidden rounded-full bg-slate-700 mx-auto">
            <div className="h-full animate-pulse rounded-full bg-emerald-500" style={{ width: "60%" }} />
          </div>
          <p className="mt-4 text-sm text-slate-400">Verifying license…</p>
        </div>
      </div>
    );
  }

  // Error or network failure: pass through (offline graceful degradation)
  if (isError) {
    return <>{children}</>;
  }

  // Desktop mode not activated
  if (data?.desktopMode && !data?.activated) {
    return <LicenseActivationScreen />;
  }

  // Desktop mode activated — check expiry
  if (data?.desktopMode && data?.activated && data?.license) {
    const expiresAt = new Date(data.license.expiresAt);
    const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 0) {
      return <LicenseExpiredScreen expiresAt={data.license.expiresAt} />;
    }
  }

  return <>{children}</>;
}

// ── Activation Screen ─────────────────────────────────────────────
function LicenseActivationScreen() {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const activate = trpc.license.activate.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => window.location.reload(), 1500);
    },
    onError: (e) => setError(e.message),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          {/* Logo */}
          <div className="mb-6 flex items-center gap-3">
            <img src="/logo-40.png" alt="YASCO" className="h-12 w-12 rounded-xl object-contain" />
            <div>
              <p className="text-lg font-bold text-white">YASCO ERP</p>
              <p className="text-xs text-emerald-400">Desktop Edition</p>
            </div>
          </div>

          <h1 className="mb-1 text-2xl font-bold text-white">Activate License</h1>
          <p className="mb-6 text-sm text-slate-400">
            Enter your license key to unlock the full ERP system.
            <br />
            <span className="text-xs text-slate-500">Contact your reseller or admin for a key.</span>
          </p>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                License Key
              </label>
              <input
                type="text"
                value={key}
                onChange={(e) => { setKey(e.target.value); setError(""); }}
                placeholder="YASCO-XXXX-XXXX-XXXX"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-white placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                onKeyDown={(e) => e.key === "Enter" && activate.mutate({ key })}
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                ⚠ {error}
              </div>
            )}
            {success && (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                ✓ License activated! Reloading…
              </div>
            )}

            <button
              onClick={() => activate.mutate({ key })}
              disabled={!key.trim() || activate.isPending}
              className="w-full rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-900/40 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {activate.isPending ? "Activating…" : "Activate License"}
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-slate-600">
            Need help?{" "}
            <a href="mailto:support@yasco.com" className="text-emerald-500 hover:underline">
              support@yasco.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Expired Screen ────────────────────────────────────────────────
function LicenseExpiredScreen({ expiresAt }: { expiresAt: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-red-950 to-slate-950 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600 mx-auto shadow-lg shadow-red-900/50">
          <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-white">License Expired</h1>
        <p className="mb-2 text-sm text-slate-400">
          Your license expired on{" "}
          <span className="font-medium text-red-400">{new Date(expiresAt).toLocaleDateString()}</span>.
        </p>
        <p className="mb-6 text-sm text-slate-500">
          Contact your reseller or admin to renew your license key.
        </p>
        <a
          href="mailto:sales@yasco.com"
          className="inline-block rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-500 transition"
        >
          Contact Sales
        </a>
      </div>
    </div>
  );
}
