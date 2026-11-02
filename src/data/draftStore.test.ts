import { beforeEach, describe, expect, it } from 'vitest';
import type { ReportDraft } from '../domain/types';
import { DRAFT_KEY, clearDraft, hasContent, isOldDraft, loadDraft, saveDraft } from './draftStore';

const empty: ReportDraft = {
  neighborhood: '', street: '', nearNumber: '', postalCode: '', referencePoint: '', segmentDescription: '',
  hazards: [], description: '', observedDate: '2026-11-02', observedTime: '12:00',
};
const filled: ReportDraft = { ...empty, district: 'Imbariê', street: 'Rua X', location: { lng: -43.2, lat: -22.6 }, condition: 'fully_flooded' };

describe('rascunho local (A3)', () => {
  beforeEach(() => localStorage.clear());

  it('não guarda formulário vazio (só com data/hora automáticas)', () => {
    expect(hasContent(empty)).toBe(false);
    expect(saveDraft(empty, 0)).toBeNull();
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
  });

  it('guarda, lê e apaga', () => {
    const now = new Date('2026-11-02T15:00:00Z');
    saveDraft(filled, 3, now);
    const got = loadDraft()!;
    expect(got.draft).toEqual(filled);
    expect(got.step).toBe(3);
    expect(got.savedAt).toBe(now.toISOString());
    clearDraft();
    expect(loadDraft()).toBeNull();
  });

  it('ignora JSON corrompido e versões desconhecidas', () => {
    localStorage.setItem(DRAFT_KEY, '{quebrado');
    expect(loadDraft()).toBeNull();
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ v: 2, draft: filled, step: 1, savedAt: 'x' }));
    expect(loadDraft()).toBeNull();
  });

  it('completa campos ausentes de rascunhos antigos', () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ v: 1, draft: { street: 'Rua Y' }, step: 0, savedAt: '2026-11-02T15:00:00Z' }));
    const got = loadDraft()!;
    expect(got.draft.street).toBe('Rua Y');
    expect(got.draft.hazards).toEqual([]);
    expect(got.draft.neighborhood).toBe('');
  });

  it('funciona sem armazenamento disponível (navegação privada)', () => {
    expect(saveDraft(filled, 0, new Date(), null)).toBeNull();
    expect(loadDraft(null)).toBeNull();
    expect(() => clearDraft(null)).not.toThrow();
  });

  it('marca como antigo após 7 dias', () => {
    const stored = { v: 1 as const, draft: filled, step: 0, savedAt: '2026-10-20T12:00:00Z' };
    expect(isOldDraft(stored, new Date('2026-11-02T12:00:00Z'))).toBe(true);
    expect(isOldDraft({ ...stored, savedAt: '2026-11-01T12:00:00Z' }, new Date('2026-11-02T12:00:00Z'))).toBe(false);
  });
});
