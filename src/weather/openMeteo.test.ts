import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { forecastUrl, next24, parseForecast, summarize } from './openMeteo';

// Resposta SINTÉTICA no formato do Open-Meteo (e2e/fixtures/open-meteo.json).
const fixture = JSON.parse(readFileSync('e2e/fixtures/open-meteo.json', 'utf8'));

describe('previsão Open-Meteo (A7)', () => {
  it('consulta os 4 distritos de uma vez, em mm e no fuso de Brasília', () => {
    const u = new URL(forecastUrl('https://api.test/v1/forecast'));
    expect(u.searchParams.get('latitude')!.split(',')).toHaveLength(4);
    expect(u.searchParams.get('hourly')).toBe('precipitation,precipitation_probability');
    expect(u.searchParams.get('timezone')).toBe('America/Sao_Paulo');
  });
  it('converte horário local para UTC e associa cada ponto ao seu distrito', () => {
    const f = parseForecast(fixture);
    expect(f.map((d) => d.district)).toEqual(['Duque de Caxias', 'Campos Elíseos', 'Imbariê', 'Xerém']);
    expect(f[0].hours[0].iso).toBe('2026-11-02T03:00:00.000Z'); // 00:00 em Brasília
    expect(f[0].hours[17]).toMatchObject({ mm: 8.2 });
  });
  it('seleciona as próximas 24 h e resume total, pico e maior probabilidade', () => {
    const f = parseForecast(fixture);
    const h = next24(f[0].hours, new Date('2026-11-02T15:30:00Z')); // 12:30 em Brasília
    expect(h).toHaveLength(24);
    expect(h[0].iso).toBe('2026-11-02T15:00:00.000Z');
    const s = summarize(h);
    expect(s.totalMm).toBe(14.9);
    expect(s.peak?.mm).toBe(8.2);
    expect(s.maxProb).toBe(89);
    expect(summarize(next24(f[3].hours, new Date('2026-11-02T15:30:00Z')))).toMatchObject({ totalMm: 0, peak: null });
  });
});
