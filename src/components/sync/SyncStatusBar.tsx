import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

type SyncState = 'online-synced' | 'online-syncing' | 'offline' | 'conflict';

function getSyncState(): SyncState {
  if (!navigator.onLine) return 'offline';
  const pending = parseInt(localStorage.getItem('sync_pending_count') || '0', 10);
  if (pending > 0) return 'online-syncing';
  return 'online-synced';
}

function timeAgo(date: Date | null): string {
  if (!date) return 'Never';
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  return `${Math.floor(mins / 60)} hr ago`;
}

export function SyncStatusBar() {
  const [state, setState] = useState<SyncState>('online-synced');
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const update = () => {
      setState(getSyncState());
      setPendingCount(parseInt(localStorage.getItem('sync_pending_count') || '0', 10));
      const ls = localStorage.getItem('last_sync_at');
      if (ls) setLastSync(new Date(ls));
    };

    update();
    const iv = setInterval(update, 5_000);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);

    return () => {
      clearInterval(iv);
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  function handleSync() {
    if (!navigator.onLine) return;
    setSyncing(true);
    // Simulate sync — replace with real API call
    setTimeout(() => {
      setSyncing(false);
      const now = new Date().toISOString();
      localStorage.setItem('last_sync_at', now);
      localStorage.setItem('sync_pending_count', '0');
      setState('online-synced');
      setPendingCount(0);
      setLastSync(new Date());
    }, 2000);
  }

  const cfg: Record<SyncState, {
    dot: string; text: string; textAr: string; Icon: React.ElementType;
  }> = {
    'online-synced': {
      dot: 'bg-emerald-500',
      text: 'Online',
      textAr: 'متصل',
      Icon: CheckCircle2,
    },
    'online-syncing': {
      dot: 'bg-amber-400 animate-pulse',
      text: 'Syncing…',
      textAr: 'جاري المزامنة',
      Icon: RefreshCw,
    },
    'offline': {
      dot: 'bg-red-500',
      text: 'Offline',
      textAr: 'غير متصل',
      Icon: WifiOff,
    },
    'conflict': {
      dot: 'bg-orange-500 animate-pulse',
      text: 'Conflicts',
      textAr: 'تعارضات',
      Icon: AlertTriangle,
    },
  };

  const { dot, text, textAr, Icon } = cfg[state];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2 px-3 text-muted-foreground hover:text-foreground"
        >
          {/* Status dot */}
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />

          {/* Icon */}
          <Icon className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />

          {/* Label */}
          <span className="text-xs font-medium hidden sm:inline">{text}</span>

          {/* Pending badge */}
          {pendingCount > 0 && (
            <Badge className="h-4 min-w-4 px-1 text-[10px] bg-amber-500 hover:bg-amber-500">
              {pendingCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-72 p-4" align="end" sideOffset={8}>
        <div className="space-y-3">
          {/* Heading */}
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full flex-shrink-0 ${dot}`} />
            <span className="font-semibold text-sm">
              {state === 'offline'
                ? 'Working Offline — وضع عدم الاتصال'
                : 'Connected to Cloud — متصل بالسحابة'}
            </span>
          </div>

          {/* Details */}
          <div className="text-xs text-muted-foreground space-y-1.5 bg-muted/30 rounded-lg p-3">
            <div className="flex justify-between">
              <span>Last sync</span>
              <span className="font-medium">{timeAgo(lastSync)}</span>
            </div>
            <div className="flex justify-between">
              <span>Pending operations</span>
              <span className={`font-medium ${pendingCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {pendingCount}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Mode</span>
              <span className={state === 'offline' ? 'text-red-600 font-medium' : 'text-emerald-600 font-medium'}>
                {state === 'offline' ? 'Local only' : 'Cloud sync'}
              </span>
            </div>
          </div>

          {/* Offline notice */}
          {state === 'offline' && (
            <div className="text-xs bg-amber-50 dark:bg-amber-950 border border-amber-200 rounded-lg p-3 text-amber-700 dark:text-amber-300">
              <p className="font-medium mb-1">⚠️ Offline Mode Active</p>
              <p>All changes are saved locally on your device and will automatically sync when the connection is restored.</p>
              <p className="mt-1">جميع التغييرات محفوظة محلياً وستتم المزامنة تلقائياً عند استعادة الاتصال.</p>
            </div>
          )}

          {/* ZATCA notice when offline */}
          {state === 'offline' && (
            <div className="text-xs bg-blue-50 dark:bg-blue-950 border border-blue-200 rounded-lg p-2 text-blue-700 dark:text-blue-300">
              📋 ZATCA e-invoices will be queued and submitted when online.
            </div>
          )}

          {/* Sync button */}
          <Button
            size="sm"
            className="w-full"
            onClick={handleSync}
            disabled={state === 'offline' || syncing}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing…' : 'Sync Now — مزامنة الآن'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
