// A7 — Previsão de chuva por distrito (Open-Meteo). NÃO é aviso oficial.
import type { District } from '../domain/types';

/** Pontos de referência dos distritos (os mesmos usados para validar os limites no A4). */
export const DISTRICT_POINTS: { district: District; lat: number; lng: number }[] = [
  { district: 'Duque de Caxias', lat: -22.786, lng: -43.311 },
  { district: 'Campos Elíseos', lat: -22.708, lng: -43.268 },
  { district: 'Imbariê', lat: -22.632, lng: -43.212 },
  { district: 'Xerém', lat: -22.574, lng: -43.302 },
];

export const OPEN_METEO_URL: string = import.meta.env.VITE_OPEN_METEO_URL || 'https://api.open-meteo.com/v1/forecast';
export const OPEN_METEO_SITE = 'https://open-meteo.com/';

export function forecastUrl(base = OPEN_METEO_URL): string {
  const p = new URLSearchParams({
    latitude: DISTRICT_POINTS.map((d) => d.lat).join(','),
    longitude: DISTRICT_POINTS.map((d) => d.lng).join(','),
    hourly: 'precipitation,precipitation_probability',
    timezone: 'America/Sao_Paulo',
    forecast_days: '2',
  });
  return `${base}?${p}`;
}

export type Hour = { iso: string; mm: number; prob: number | null };
export type DistrictForecast = { district: District; hours: Hour[] };

type ApiItem = { utc_offset_seconds?: number; hourly?: { time: string[]; precipitation: (number | null)[]; precipitation_probability?: (number | null)[] } };

/** Converte a resposta (lista com um item por ponto) em previsões por distrito, com horários em UTC. */
export function parseForecast(json: ApiItem | ApiItem[]): DistrictForecast[] {
  const items = Array.isArray(json) ? json : [json];
  return items.map((it, i) => {
    const off = it.utc_offset_seconds ?? -3 * 3600;
    const h = it.hourly ?? { time: [], precipitation: [] };
    return {
      district: DISTRICT_POINTS[i]?.district ?? DISTRICT_POINTS[0].district,
      hours: h.time.map((t, k) => ({
        // "2026-11-02T20:00" no fuso local → instante UTC.
        iso: new Date(Date.parse(`${t}:00Z`) - off * 1000).toISOString(),
        mm: Math.max(0, h.precipitation[k] ?? 0),
        prob: h.precipitation_probability?.[k] ?? null,
      })),
    };
  });
}

/** Próximas 24 horas a partir da hora atual (inclui a hora corrente). */
export function next24(hours: Hour[], now: Date = new Date()): Hour[] {
  const start = now.getTime() - 3600 * 1000;
  return hours.filter((h) => Date.parse(h.iso) > start).slice(0, 24);
}

export function summarize(hours: Hour[]): { totalMm: number; peak: Hour | null; maxProb: number | null } {
  const totalMm = Math.round(hours.reduce((s, h) => s + h.mm, 0) * 10) / 10;
  const peak = hours.reduce<Hour | null>((b, h) => (h.mm > 0 && (!b || h.mm > b.mm) ? h : b), null);
  const probs = hours.map((h) => h.prob).filter((p): p is number => p !== null);
  return { totalMm, peak, maxProb: probs.length ? Math.max(...probs) : null };
}

const CACHE_KEY = 'alagou:previsao:v1';
export type Cached = { fetchedAt: string; data: DistrictForecast[] };

export function saveCached(c: Cached) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(c));
  } catch {
    /* armazenamento indisponível */
  }
}
export function loadCached(): Cached | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Cached) : null;
  } catch {
    return null;
  }
}

export async function fetchForecast(signal?: AbortSignal): Promise<Cached> {
  const res = await fetch(forecastUrl(), { signal });
  if (!res.ok) throw new Error(`Previsão indisponível (${res.status}).`);
  const c = { fetchedAt: new Date().toISOString(), data: parseForecast(await res.json()) };
  saveCached(c);
  return c;
}
