// A3 — status do app instalável: offline, nova versão e instalação.
import { Download, RefreshCw, WifiOff } from 'lucide-react';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

// ---- Conexão ----
function subscribeOnline(cb: () => void) {
  window.addEventListener('online', cb);
  window.addEventListener('offline', cb);
  return () => {
    window.removeEventListener('online', cb);
    window.removeEventListener('offline', cb);
  };
}
export const useOnline = () => useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true);

export function OfflineBanner() {
  const online = useOnline();
  if (online) return null;
  return (
    <div role="status" className="flex items-center justify-center gap-2 bg-ink px-4 py-1.5 text-center text-sm font-semibold text-white short:py-0.5 short:text-xs">
      <WifiOff size={16} aria-hidden="true" /> Sem internet — mostrando informações salvas neste aparelho.
    </div>
  );
}

// ---- Nova versão ----
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({ immediate: true });
  if (!needRefresh) return null;
  return (
    <div role="alert" className="fixed inset-x-3 bottom-24 z-[65] mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-navy p-3 text-white shadow-xl md:bottom-4">
      <RefreshCw size={20} aria-hidden="true" className="shrink-0" />
      <p className="flex-1 text-sm">Nova versão do Alag@u disponível.</p>
      <button type="button" onClick={() => void updateServiceWorker(true)} className="min-h-11 rounded-xl bg-sky px-3 font-bold text-navy">
        Atualizar
      </button>
      <button type="button" onClick={() => setNeedRefresh(false)} className="min-h-11 rounded-xl px-2 text-sm underline">
        Depois
      </button>
    </div>
  );
}

// ---- Instalação (Chrome/Android oferecem o evento beforeinstallprompt) ----
type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };
let deferred: InstallEvent | null = null;
const listeners = new Set<() => void>();
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as InstallEvent;
    listeners.forEach((l) => l());
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    listeners.forEach((l) => l());
  });
}

export function InstallButton({ className = '' }: { className?: string }) {
  const [available, setAvailable] = useState(Boolean(deferred));
  useEffect(() => {
    const l = () => setAvailable(Boolean(deferred));
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  if (!available) return null;
  return (
    <button
      type="button"
      onClick={async () => {
        if (!deferred) return;
        await deferred.prompt();
        await deferred.userChoice;
        deferred = null;
        setAvailable(false);
      }}
      className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-white/70 px-4 font-bold text-white ${className}`}
    >
      <Download size={20} aria-hidden="true" /> Instalar o app
    </button>
  );
}
