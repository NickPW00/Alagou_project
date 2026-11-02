import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseAlerts, stillValid } from './inmet';

// Resposta SINTÉTICA no formato real da API do INMET.
const fixture = JSON.parse(readFileSync('e2e/fixtures/inmet-avisos.json', 'utf8'));
const now = new Date('2026-11-02T15:30:00Z'); // 12:30 em Brasília

describe('avisos do INMET (A7)', () => {
  it('mantém só avisos que incluem Duque de Caxias (3301702), não encerrados e ainda válidos', () => {
    const a = parseAlerts(fixture, now);
    expect(a.map((x) => x.id)).toEqual(['1', '4']); // 2 é de outro município, 3 encerrado, 5 já terminou
    expect(a[0]).toMatchObject({ title: 'Acumulado de Chuva', severity: 'Perigo', color: '#FF9900', when: 'hoje' });
    expect(a[0].startIso).toBe('2026-11-02T13:00:00.000Z'); // 10:00 em Brasília
    expect(a[0].instructions[0]).toBe('Instrução de teste.');
  });
  it('não confunde códigos parecidos', () => {
    expect(parseAlerts({ hoje: [{ id: 9, inicio: '2026-11-02 10:00', fim: '2026-11-03 10:00', geocodes: '33017020,1330170' }] }, now)).toEqual([]);
  });
  it('descarta da cópia guardada os avisos que venceram', () => {
    const c = { fetchedAt: now.toISOString(), alerts: parseAlerts(fixture, now) };
    expect(stillValid(c, new Date('2026-11-03T14:00:00Z')).map((x) => x.id)).toEqual(['4']);
  });
});
