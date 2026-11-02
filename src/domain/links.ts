// A9 — link direto para um relato.
import { CONDITION_INFO } from './labels';
import type { PublicReport } from './types';

/** Endereço que abre o Mapa ao Vivo já com o relato selecionado (funciona no subcaminho do GitHub Pages). */
export function reportUrl(id: string, origin: string = location.origin, base: string = import.meta.env.BASE_URL): string {
  return `${origin}${base}mapa?relato=${encodeURIComponent(id)}`;
}

export function shareText(r: Pick<PublicReport, 'street' | 'neighborhood' | 'condition'>): string {
  return `Alag@u: ${r.street}, ${r.neighborhood} — ${CONDITION_INFO[r.condition].label} (informação comunitária, não é alerta oficial).`;
}
