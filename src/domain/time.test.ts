import { describe, expect, it } from 'vitest';
import { brasiliaToUtcIso, formatBrasilia, freshnessOf, nowInBrasilia, relativeTime } from './time';

const now = new Date('2026-11-02T15:00:00Z');
const ago = (m: number) => new Date(now.getTime() - m * 60000).toISOString();

describe('freshnessOf', () => {
  it('classifica pelos limites configurados (30 min / 2 h)', () => {
    expect(freshnessOf(ago(0), now)).toBe('recent');
    expect(freshnessOf(ago(30), now)).toBe('recent');
    expect(freshnessOf(ago(31), now)).toBe('stale');
    expect(freshnessOf(ago(120), now)).toBe('stale');
    expect(freshnessOf(ago(121), now)).toBe('outdated');
  });
  it('aceita parâmetros customizados', () => {
    expect(freshnessOf(ago(20), now, { recentMinutes: 10, staleMinutes: 15 })).toBe('outdated');
  });
});

describe('fuso horário', () => {
  it('converte horário de Brasília (UTC−3) para UTC', () => {
    expect(brasiliaToUtcIso('2026-11-02', '12:00')).toBe('2026-11-02T15:00:00.000Z');
  });
  it('rejeita entradas inválidas', () => {
    expect(brasiliaToUtcIso('02/11/2026', '12:00')).toBeNull();
    expect(brasiliaToUtcIso('2026-11-02', '')).toBeNull();
  });
  it('exibe UTC no horário de Brasília', () => {
    expect(formatBrasilia('2026-11-02T15:00:00Z')).toContain('12:00');
  });
  it('obtém data/hora atuais de Brasília, inclusive na virada do dia em UTC', () => {
    expect(nowInBrasilia(new Date('2026-11-03T01:30:00Z'))).toEqual({ date: '2026-11-02', time: '22:30' });
  });
});

describe('relativeTime', () => {
  it('formata intervalos em português', () => {
    expect(relativeTime(ago(0), now)).toBe('agora mesmo');
    expect(relativeTime(ago(5), now)).toBe('há 5 min');
    expect(relativeTime(ago(125), now)).toBe('há 2 h 5 min');
    expect(relativeTime(ago(60 * 50), now)).toBe('há 2 dias');
  });
});
