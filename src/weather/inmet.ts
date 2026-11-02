// A7 — Avisos meteorológicos OFICIAIS do INMET para Duque de Caxias.
// Fonte verificada em 02/11/2026 (docs/fontes/verificacao.json): JSON público, com CORS liberado.
// Licença declarada pelo INMET: reprodução permitida desde que citada a fonte.
import { MUNICIPIO_IBGE } from '../geo/pipeline';

export const INMET_AVISOS_URL: string = import.meta.env.VITE_INMET_AVISOS_URL || 'https://apiprevmet3.inmet.gov.br/avisos/ativos';
/** Página de avisos indicada pelo próprio INMET no feed RSS oficial. */
export const INMET_AVISOS_SITE = 'https://avisos.inmet.gov.br';

export type OfficialAlert = {
  id: string;
  code: string; // código CAP (urn:oid:…)
  title: string; // ex.: "Acumulado de Chuva"
  severity: string; // como emitido pelo INMET: "Perigo Potencial" | "Perigo" | "Grande Perigo"
  color: string;
  startIso: string;
  endIso: string;
  risks: string[];
  instructions: string[];
  when: 'hoje' | 'futuro';
};

type RawAlert = {
  id?: number;
  id_aviso?: number;
  codigo?: string;
  descricao?: string;
  severidade?: string;
  aviso_cor?: string;
  inicio?: string; // "2026-11-02 10:00" (horário de Brasília)
  fim?: string;
  riscos?: string[];
  instrucoes?: string[];
  geocodes?: string;
  encerrado?: boolean;
};

const brasilia = (s: string | undefined) => (s ? new Date(`${s.replace(' ', 'T')}:00-03:00`) : new Date(NaN));

/** Filtra os avisos que incluem Duque de Caxias (código IBGE), não encerrados e ainda válidos. */
export function parseAlerts(json: { hoje?: RawAlert[]; futuro?: RawAlert[] }, now: Date = new Date()): OfficialAlert[] {
  const out: OfficialAlert[] = [];
  for (const when of ['hoje', 'futuro'] as const) {
    for (const a of json[when] ?? []) {
      const codes = (a.geocodes ?? '').split(',').map((c) => c.trim());
      if (!codes.includes(MUNICIPIO_IBGE) || a.encerrado) continue;
      const start = brasilia(a.inicio);
      const end = brasilia(a.fim);
      if (Number.isNaN(end.getTime()) || end.getTime() < now.getTime()) continue;
      out.push({
        id: String(a.id ?? a.id_aviso ?? a.codigo),
        code: a.codigo ?? '',
        title: a.descricao ?? 'Aviso meteorológico',
        severity: a.severidade ?? '',
        color: /^#[0-9a-f]{6}$/i.test(a.aviso_cor ?? '') ? a.aviso_cor! : '#F2C200',
        startIso: Number.isNaN(start.getTime()) ? '' : start.toISOString(),
        endIso: end.toISOString(),
        risks: (a.riscos ?? []).map((r) => r.trim()).filter(Boolean),
        instructions: (a.instrucoes ?? []).map((r) => r.trim()).filter(Boolean),
        when,
      });
    }
  }
  return out.sort((x, y) => x.startIso.localeCompare(y.startIso));
}

const CACHE_KEY = 'alagou:avisos-inmet:v1';
export type CachedAlerts = { fetchedAt: string; alerts: OfficialAlert[] };

export function loadCachedAlerts(): CachedAlerts | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as CachedAlerts) : null;
  } catch {
    return null;
  }
}

/** Busca os avisos (resposta grande, ~400 kB) e guarda só os de Duque de Caxias no aparelho. */
export async function fetchAlerts(signal?: AbortSignal): Promise<CachedAlerts> {
  const res = await fetch(INMET_AVISOS_URL, { signal });
  if (!res.ok) throw new Error(`Avisos do INMET indisponíveis (${res.status}).`);
  const c = { fetchedAt: new Date().toISOString(), alerts: parseAlerts(await res.json()) };
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(c));
  } catch {
    /* armazenamento indisponível */
  }
  return c;
}

/** Avisos ainda válidos de uma cópia guardada (para o Início, sem baixar de novo). */
export function stillValid(c: CachedAlerts | null, now: Date = new Date()): OfficialAlert[] {
  return (c?.alerts ?? []).filter((a) => Date.parse(a.endIso) >= now.getTime());
}
