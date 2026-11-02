// A3 — rascunho do aviso salvo SOMENTE neste aparelho (docs/pacote-a/A3-pwa-rascunho.md).
import type { ReportDraft } from '../domain/types';

export const DRAFT_KEY = 'alagou:rascunho:v1';
export const OLD_DRAFT_DAYS = 7;

export type StoredDraft = { v: 1; draft: ReportDraft; step: number; savedAt: string };

/** Acesso ao localStorage que nunca lança erro (navegação privada, armazenamento bloqueado…). */
export function safeStorage(): Storage | null {
  try {
    const s = window.localStorage;
    const probe = '__alagou__';
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

/** Um rascunho só vale a pena guardar se a pessoa já informou algo além da data/hora preenchidas automaticamente. */
export function hasContent(d: ReportDraft): boolean {
  return Boolean(
    d.district || d.neighborhood.trim() || d.street.trim() || d.location || d.condition || d.trend || d.depth ||
      d.hazards.length || d.description.trim() || d.referencePoint.trim() || d.nearNumber.trim() || d.postalCode.trim() || d.segmentDescription.trim(),
  );
}

export function saveDraft(draft: ReportDraft, step: number, now: Date = new Date(), storage = safeStorage()): StoredDraft | null {
  if (!storage || !hasContent(draft)) return null;
  const stored: StoredDraft = { v: 1, draft, step, savedAt: now.toISOString() };
  try {
    storage.setItem(DRAFT_KEY, JSON.stringify(stored));
    return stored;
  } catch {
    return null; // cota cheia etc.
  }
}

export function loadDraft(storage = safeStorage()): StoredDraft | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredDraft>;
    if (parsed?.v !== 1 || !parsed.draft || typeof parsed.step !== 'number' || typeof parsed.savedAt !== 'string') return null;
    // Garante campos novos com valores padrão caso o formato evolua.
    const d = parsed.draft as Partial<ReportDraft>;
    const draft: ReportDraft = {
      neighborhood: '', street: '', nearNumber: '', postalCode: '', referencePoint: '', segmentDescription: '',
      description: '', observedDate: '', observedTime: '', ...d, hazards: Array.isArray(d.hazards) ? d.hazards : [],
    };
    return { v: 1, draft, step: parsed.step, savedAt: parsed.savedAt };
  } catch {
    return null;
  }
}

export function clearDraft(storage = safeStorage()): void {
  try {
    storage?.removeItem(DRAFT_KEY);
  } catch {
    /* ignora */
  }
}

export function isOldDraft(stored: StoredDraft, now: Date = new Date()): boolean {
  return now.getTime() - new Date(stored.savedAt).getTime() > OLD_DRAFT_DAYS * 24 * 3600 * 1000;
}
