import { AlertTriangle, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import { EMERGENCY } from '../config/settings';
import { CONDITION_INFO, DISCLAIMER, OUTDATED_COLOR, SAFETY_MESSAGES, TREND_INFO } from '../domain/labels';
import { FRESHNESS_LABELS, type Freshness } from '../domain/time';
import type { StreetCondition, WaterTrend } from '../domain/types';

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <header className="mb-4">
      <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
      {children}
    </header>
  );
}

export function ConditionSwatch({ condition, outdated, size = 14 }: { condition: StreetCondition; outdated?: boolean; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0 rounded-full border-2 border-white shadow"
      style={{ width: size, height: size, background: outdated ? OUTDATED_COLOR : CONDITION_INFO[condition].color }}
    />
  );
}

export function ConditionBadge({ condition, freshness }: { condition: StreetCondition; freshness?: Freshness }) {
  const info = CONDITION_INFO[condition];
  const outdated = freshness === 'outdated';
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-semibold"
      style={{ background: outdated ? '#E5E7EB' : info.color, color: outdated ? '#374151' : info.textOnColor }}
    >
      {info.label}
      {outdated && <span className="font-normal">(desatualizado)</span>}
    </span>
  );
}

export function TrendBadge({ trend }: { trend: WaterTrend }) {
  const t = TREND_INFO[trend];
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-navy/20 bg-white px-2.5 py-1 text-sm font-medium text-navy">
      <span aria-hidden="true" className="text-base font-bold leading-none">
        {t.arrow}
      </span>
      {t.label}
    </span>
  );
}

export function FreshnessTag({ freshness }: { freshness: Freshness }) {
  const cls =
    freshness === 'recent'
      ? 'bg-sky-50 text-navy'
      : freshness === 'stale'
        ? 'bg-amber-100 text-amber-900'
        : 'bg-gray-200 text-gray-800';
  return <span className={`rounded px-2 py-0.5 text-xs font-semibold ${cls}`}>{FRESHNESS_LABELS[freshness]}</span>;
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div role="status" className="rounded-2xl border border-dashed border-navy/30 bg-white p-6 text-center">
      <p className="font-semibold text-navy">{title}</p>
      {children && <div className="mt-2 text-sm text-muted">{children}</div>}
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 ${className}`}>{children}</section>;
}

export function SafetyBox({ compact = false }: { compact?: boolean }) {
  return (
    <aside aria-label="Orientações de segurança" className="rounded-2xl border-l-4 border-severe bg-red-50 p-4 text-sm">
      <p className="mb-2 flex items-center gap-2 font-bold text-severe">
        <AlertTriangle size={18} aria-hidden="true" /> Sua segurança vem primeiro
      </p>
      <ul className="list-disc space-y-1 pl-5 text-ink">
        {(compact ? SAFETY_MESSAGES.slice(0, 2) : SAFETY_MESSAGES).map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        <a href={`tel:${EMERGENCY.civilDefense}`} className="inline-flex min-h-11 items-center gap-1 rounded-full bg-severe px-4 font-bold text-white">
          <Phone size={16} aria-hidden="true" /> Defesa Civil {EMERGENCY.civilDefense}
        </a>
        <a href={`tel:${EMERGENCY.firefighters}`} className="inline-flex min-h-11 items-center gap-1 rounded-full bg-severe px-4 font-bold text-white">
          <Phone size={16} aria-hidden="true" /> Bombeiros {EMERGENCY.firefighters}
        </a>
      </div>
    </aside>
  );
}

export function Disclaimer() {
  return <p className="text-xs leading-relaxed text-muted">{DISCLAIMER}</p>;
}

export function StatusPill({ status }: { status: 'planejado' | 'em desenvolvimento' | 'implementado' | 'pendente' }) {
  return (
    <span className="rounded-full bg-navy/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-navy">{status}</span>
  );
}

/** Selo para dados fictícios de demonstração. */
export function ExampleTag({ show = true }: { show?: boolean }) {
  if (!show) return null;
  return (
    <span className="ml-1.5 inline-block rounded border border-ink/20 bg-attention px-1.5 py-px align-middle text-[11px] font-black tracking-wide text-ink">
      EXEMPLO<span className="sr-only"> — dado fictício de demonstração</span>
    </span>
  );
}
