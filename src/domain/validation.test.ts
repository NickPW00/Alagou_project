import { describe, expect, it } from 'vitest';
import type { ReportDraft } from './types';
import { isHistorical, validateAll, validateStep } from './validation';

const now = new Date('2026-11-02T15:00:00Z'); // 12:00 em Brasília

const base: ReportDraft = {
  district: 'Xerém',
  neighborhood: 'Bairro X',
  street: 'Rua Y',
  nearNumber: '',
  postalCode: '',
  referencePoint: '',
  segmentDescription: '',
  location: { lng: -43.3, lat: -22.6 },
  condition: 'partially_flooded',
  trend: 'rising',
  hazards: [],
  description: '',
  observedDate: '2026-11-02',
  observedTime: '11:50',
};

describe('validação do formulário', () => {
  it('aceita um relato completo', () => {
    expect(validateAll(base, now)).toEqual({});
  });
  it('exige distrito, bairro, rua e localização', () => {
    const e = validateStep('where', { ...base, district: undefined, neighborhood: ' ', street: '', location: undefined }, now);
    expect(Object.keys(e).sort()).toEqual(['district', 'location', 'neighborhood', 'street']);
  });
  it('bloqueia ponto fora do município quando os limites estão disponíveis (A4)', () => {
    expect(validateStep('where', base, now, { outsideMunicipality: true }).location).toMatch(/fora do município/);
    expect(validateStep('where', base, now, { outsideMunicipality: false }).location).toBeUndefined();
  });
  it('valida CEP opcional', () => {
    expect(validateStep('where', { ...base, postalCode: '123' }, now).postalCode).toBeDefined();
    expect(validateStep('where', { ...base, postalCode: '25000-000' }, now).postalCode).toBeUndefined();
  });
  it('exige situação e tendência', () => {
    expect(validateStep('condition', { ...base, condition: undefined }, now).condition).toBeDefined();
    expect(validateStep('trend', { ...base, trend: undefined }, now).trend).toBeDefined();
  });
  it('não aceita datas futuras (com tolerância de 5 min)', () => {
    expect(validateStep('when', { ...base, observedTime: '12:04' }, now).observedAt).toBeUndefined();
    expect(validateStep('when', { ...base, observedTime: '12:10' }, now).observedAt).toMatch(/futuro/);
    expect(validateStep('when', { ...base, observedDate: '2026-11-03' }, now).observedAt).toMatch(/futuro/);
  });
  it('identifica relatos com mais de 24 h como históricos', () => {
    expect(isHistorical('2026-11-01T14:00:00Z', now)).toBe(true);
    expect(isHistorical('2026-11-02T10:00:00Z', now)).toBe(false);
  });
});
