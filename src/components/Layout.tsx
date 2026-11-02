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
import { OfflineBanner, UpdatePrompt } from './AppStatus';
import { FooterCredits } from './Institutional';
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
    <div role="note" className="bg-attention px-4 py-1.5 text-center text-sm font-bold text-ink short:py-0.5 short:text-xs">
      <span className="hidden min-[360px]:inline short:hidden">MODO DEMONSTRAÇÃO — dados fictícios, não representam ocorrências reais.</span>
      <span className="min-[360px]:hidden short:inline">DEMONSTRAÇÃO · dados fictícios</span>
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
        className="max-h-[90dvh] w-full overflow-y-auto rounded-t-3xl bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:mx-auto md:mb-4 md:max-w-md md:rounded-3xl"
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

/** Menu "Mais" do topo (desktop 1024–1599 px). */
function DesktopMore() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onClick = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onClick);
    };
  }, [open]);
  const active = SECONDARY.some((i) => i.to === pathname);
  return (
    <li ref={ref} className="relative min-[1600px]:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="menu-mais-desktop"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 rounded-full px-3 py-2 font-medium ${active ? 'bg-white text-navy' : 'text-white hover:bg-white/10'}`}
      >
        <Menu size={16} aria-hidden="true" /> Mais
      </button>
      {open && (
        <ul id="menu-mais-desktop" className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl bg-white p-2 text-ink shadow-xl ring-1 ring-black/10">
          {SECONDARY.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink to={to} className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-xl px-3 font-medium hover:bg-sky-50 ${isActive ? 'bg-sky-50 text-navy' : ''}`}>
                <Icon size={18} aria-hidden="true" className="text-navy" /> {label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/** Item da navegação principal (barra inferior e trilho lateral). */
function PrimaryItem({ to, label, icon: Icon, highlight }: (typeof PRIMARY)[number]) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      aria-label={highlight ? 'Avisar alagamento' : undefined}
      className={({ isActive }) =>
        highlight
          ? '-mt-5 flex h-16 w-16 flex-col items-center justify-center rounded-full bg-sky text-navy shadow-lg ring-4 ring-white md:mt-0 md:h-14 md:w-14 md:ring-2'
          : `flex min-h-14 w-full flex-col items-center justify-center text-xs font-medium md:min-h-12 ${isActive ? 'text-navy' : 'text-gray-600'}`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={highlight ? 28 : 22} aria-hidden="true" strokeWidth={isActive || highlight ? 2.6 : 2} />
          <span className={highlight ? 'text-[11px] font-bold' : ''}>{label}</span>
        </>
      )}
    </NavLink>
  );
}

function MoreButton({ open, onOpen }: { open: boolean; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      aria-expanded={open}
      className="flex min-h-14 w-full flex-col items-center justify-center text-xs font-medium text-gray-600 md:min-h-12"
    >
      <Menu size={22} aria-hidden="true" />
      Mais
    </button>
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
      <OfflineBanner />
      <header className="bg-navy text-white short:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2">
          <Link to="/" title="Página inicial" className="shrink-0" data-testid="brand">
            <Brand compact={fullBleed} />
          </Link>
          <nav aria-label="Navegação principal" className="hidden min-w-0 lg:block">
            <ul className="flex flex-nowrap items-center gap-1 whitespace-nowrap text-sm">
              {PRIMARY.map(({ to, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) => `rounded-full px-3 py-2 font-medium ${isActive ? 'bg-white text-navy' : 'text-white hover:bg-white/10'}`}
                  >
                    {label === 'Avisar' ? 'Avisar alagamento' : label}
                  </NavLink>
                </li>
              ))}
              {SECONDARY.map(({ to, label }) => (
                <li key={to} className="hidden min-[1600px]:block">
                  <NavLink
                    to={to}
                    className={({ isActive }) => `rounded-full px-3 py-2 font-medium ${isActive ? 'bg-white text-navy' : 'text-white hover:bg-white/10'}`}
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
              <DesktopMore />
            </ul>
          </nav>
        </div>
      </header>

      <div className={`flex flex-1 ${fullBleed ? 'min-h-0' : ''}`}>
        <nav
          aria-label="Navegação lateral"
          className="z-50 hidden w-20 shrink-0 border-r border-black/10 bg-white md:block lg:hidden"
        >
          <div className="sticky top-0 flex flex-col items-center gap-1 py-2">
          <Link to="/" title="Página inicial" className="mb-1 hidden h-12 w-12 place-items-center short:grid" data-testid="brand-rail">
            <img src={`${import.meta.env.BASE_URL}alagou-icon.svg`} alt="Alag@u" width={36} height={36} />
          </Link>
          <ul className="flex w-full flex-col items-center gap-1">
            {PRIMARY.map((item) => (
              <li key={item.to} className="flex w-full justify-center">
                <PrimaryItem {...item} />
              </li>
            ))}
            <li className="flex w-full justify-center">
              <MoreButton open={moreOpen} onOpen={() => setMoreOpen(true)} />
            </li>
          </ul>
          </div>
        </nav>

        <main id="conteudo" tabIndex={-1} className={`min-w-0 flex-1 ${fullBleed ? 'relative min-h-0' : ''}`}>
          {fullBleed ? (
            children
          ) : (
            <div className="mx-auto max-w-3xl px-4 pb-28 pt-4 md:pb-10 lg:max-w-5xl">
              {children}
              <footer className="mt-10 border-t border-navy/10 pt-4">
                <Disclaimer />
                <FooterCredits />
              </footer>
            </div>
          )}
        </main>
      </div>

      <nav
        aria-label="Navegação inferior"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="grid grid-cols-5">
          {PRIMARY.map((item) => (
            <li key={item.to} className="flex justify-center">
              <PrimaryItem {...item} />
            </li>
          ))}
          <li className="flex justify-center">
            <MoreButton open={moreOpen} onOpen={() => setMoreOpen(true)} />
          </li>
        </ul>
      </nav>
      <MoreMenu open={moreOpen} onClose={() => setMoreOpen(false)} />
      <UpdatePrompt />
    </div>
  );
}
