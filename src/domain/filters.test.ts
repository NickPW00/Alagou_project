import { describe, expect, it } from 'vitest';
import { DemoSource } from '../data/demo';
import { filterReports, normalize } from './filters';

describe('filtros do mapa', () => {
  it('normaliza acentos e caixa', () => {
    expect(normalize('  Campos Elíseos ')).toBe('campos eliseos');
  });
  it('filtra por distrito, texto e período', async () => {
    const now = Date.now();
    const reports = await new DemoSource(now).listReports();
    const xerem = filterReports(reports, { query: '', district: 'Xerém', period: 'history' }, new Date(now));
    expect(xerem.every((r) => r.district === 'Xerém')).toBe(true);
    expect(xerem.length).toBeGreaterThan(0);
    const q = filterReports(reports, { query: 'demonstracao d4', district: '', period: 'history' }, new Date(now));
    expect(q.map((r) => r.id)).toEqual(['d4']);
    // um relato com 25 h some de "Agora" mas continua no histórico
    const old = { ...reports[0], id: 'old', observedAt: new Date(now - 25 * 3600000).toISOString() };
    expect(filterReports([old], { query: '', district: '', period: 'now' }, new Date(now))).toHaveLength(0);
    expect(filterReports([old], { query: '', district: '', period: 'history' }, new Date(now))).toHaveLength(1);
  });
});
