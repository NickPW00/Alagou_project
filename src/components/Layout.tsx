import {
  BarChart3,
  BookOpen,
  CloudRain,
  History,
  Home,
  Info,
  Map,
  Menu,
  Plus,
  Shield,
  User,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { isDemo } from '../data';
import { Disclaimer } from './ui';

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <img src={`${import.meta.env.BASE_URL}alagou-icon.svg`} alt="" width={compact ? 32 : 40} height={compact ? 32 : 40} />
      <span className="leading-tight">
        <span className={`block font-black tracking-tight ${compact ? 'text-xl' : 'text-2xl'}`}>Alag@u</span>
        {!compact && <span className="block text-xs font-medium text-sky-50/90">Alagou? Avisou!</span>}
      </span>
    </span>
  );
}

export function DemoBanner() {
  if (!isDemo) return null;
  return (
    <div role="note" className="bg-attention px-4 py-1.5 text-center text-sm font-bold text-ink">
      MODO DEMONSTRAÇÃO — dados fictícios, não representam ocorrências reais.
    </div>
  );
}

const PRIMARY = [
  { to: '/', label: 'Início', icon: Home },
  { to: '/mapa', label: 'Mapa', icon: Map },
  { to: '/avisar', label: 'Avisar', icon: Plus, highlight: true },
  { to: '/alertas', label: 'Alertas', icon: CloudRain },
];

export const SECONDARY = [
  { to: '/memoria', label: 'Mapa da Memória', icon: History },
  { to: '/aprenda', label: 'Aprenda e Previna', icon: BookOpen },
  { to: '/dados', label: 'Duque de Caxias em Dados', icon: BarChart3 },
  { to: '/participacao', label: 'Minha Participação', icon: User },
  { to: '/sobre', label: 'Sobre, privacidade e termos', icon: Info },
  { to: '/admin', label: 'Painel administrativo', icon: Shield },
];

function MoreMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const first = ref.current?.querySelector<HTMLElement>('a,button');
    first?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end bg-black/40 lg:hidden" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label="Mais opções"
        className="w-full rounded-t-3xl bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center justify-between">
          <p className="text-lg font-bold text-navy">Mais opções</p>
          <button type="button" onClick={onClose} aria-label="Fechar menu" className="grid h-11 w-11 place-items-center rounded-full hover:bg-gray-100">
            <X aria-hidden="true" />
          </button>
        </div>
        <ul>
          {SECONDARY.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link to={to} onClick={onClose} className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-base font-medium text-ink hover:bg-sky-50">
                <Icon size={20} aria-hidden="true" className="text-navy" /> {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const { pathname } = useLocation();
  const fullBleed = pathname === '/mapa';

  useEffect(() => setMoreOpen(false), [pathname]);

  return (
    <div className={`flex flex-col ${fullBleed ? 'h-full' : 'min-h-full'}`}>
      <a href="#conteudo" className="sr-only-focusable absolute left-2 top-2 z-[70] rounded bg-white px-3 py-2 font-semibold text-navy">
        Pular para o conteúdo
      </a>
      <DemoBanner />
      <header className="bg-navy text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2">
          <Link to="/" title="Página inicial">
            <Brand compact={fullBleed} />
          </Link>
          <nav aria-label="Navegação principal" className="hidden lg:block">
            <ul className="flex flex-wrap items-center gap-1 text-sm">
              {[...PRIMARY, ...SECONDARY].map(({ to, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) =>
                      `rounded-full px-3 py-2 font-medium ${isActive ? 'bg-white text-navy' : 'text-white hover:bg-white/10'}`
                    }
                  >
                    {label === 'Avisar' ? 'Avisar alagamento' : label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="conteudo" tabIndex={-1} className={`flex-1 ${fullBleed ? 'relative min-h-0' : ''}`}>
        {fullBleed ? (
          children
        ) : (
          <div className="mx-auto max-w-3xl px-4 pb-28 pt-4 lg:max-w-5xl lg:pb-10">
            {children}
            <footer className="mt-10 border-t border-navy/10 pt-4">
              <Disclaimer />
              <p className="mt-2 text-xs text-muted">Uma iniciativa do projeto Meninas pelo Clima — LabPENSo/UERJ.</p>
            </footer>
          </div>
        )}
      </main>

      <nav
        aria-label="Navegação inferior"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <ul className="grid grid-cols-5">
          {PRIMARY.map(({ to, label, icon: Icon, highlight }) => (
            <li key={to} className="flex justify-center">
              <NavLink
                to={to}
                end={to === '/'}
                aria-label={highlight ? 'Avisar alagamento' : undefined}
                className={({ isActive }) =>
                  highlight
                    ? '-mt-5 flex h-16 w-16 flex-col items-center justify-center rounded-full bg-sky text-navy shadow-lg ring-4 ring-white'
                    : `flex min-h-14 w-full flex-col items-center justify-center text-xs font-medium ${isActive ? 'text-navy' : 'text-gray-600'}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={highlight ? 28 : 22} aria-hidden="true" strokeWidth={isActive || highlight ? 2.6 : 2} />
                    <span className={highlight ? 'text-[11px] font-bold' : ''}>{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
          <li className="flex justify-center">
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={moreOpen}
              className="flex min-h-14 w-full flex-col items-center justify-center text-xs font-medium text-gray-600"
            >
              <Menu size={22} aria-hidden="true" />
              Mais
            </button>
          </li>
        </ul>
      </nav>
      <MoreMenu open={moreOpen} onClose={() => setMoreOpen(false)} />
    </div>
  );
}
