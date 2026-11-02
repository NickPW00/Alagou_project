import { FRESHNESS, TIME_ZONE } from '../config/settings';

export type Freshness = 'recent' | 'stale' | 'outdated';

export function minutesSince(iso: string, now: Date = new Date()): number {
  return (now.getTime() - new Date(iso).getTime()) / 60000;
}

/**
 * Classifica a atualidade de uma observação. Um relato "desatualizado" NÃO significa
 * que o alagamento terminou — apenas que não há observação recente.
 */
export function freshnessOf(observedAt: string, now: Date = new Date(), cfg = FRESHNESS): Freshness {
  const m = minutesSince(observedAt, now);
  if (m <= cfg.recentMinutes) return 'recent';
  if (m <= cfg.staleMinutes) return 'stale';
  return 'outdated';
}

export const FRESHNESS_LABELS: Record<Freshness, string> = {
  recent: 'Relato recente',
  stale: 'Atualização recomendada',
  outdated: 'Relato desatualizado',
};

export function relativeTime(iso: string, now: Date = new Date()): string {
  const m = Math.max(0, Math.floor(minutesSince(iso, now)));
  if (m < 1) return 'agora mesmo';
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h} h${m % 60 ? ` ${m % 60} min` : ''}`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'há 1 dia' : `há ${d} dias`;
}

const dateTimeFmt = new Intl.DateTimeFormat('pt-BR', {
  timeZone: TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

/** Exibe um instante UTC no horário de Brasília. */
export function formatBrasilia(iso: string): string {
  return dateTimeFmt.format(new Date(iso));
}

/** Data (YYYY-MM-DD) e hora (HH:MM) atuais no horário de Brasília. */
export function nowInBrasilia(now: Date = new Date()): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${get('hour')}:${get('minute')}` };
}

/**
 * Converte data/hora locais de Brasília em ISO UTC.
 * Brasília está em UTC−03:00 sem horário de verão desde 2019.
 * (Na Fase 3 a conversão definitiva será validada também no servidor.)
 */
export function brasiliaToUtcIso(date: string, time: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  const d = new Date(`${date}T${time}:00-03:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
