import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildLimites, buildPlaces, buildStreetIndex, districtAt, limitesBBox } from './pipeline';

// Dados SINTÉTICOS (scripts/geo/fixture): retângulo dividido em 4 quadrantes.
const fx = (f: string) => JSON.parse(readFileSync(`scripts/geo/fixture/${f}`, 'utf8'));
const limites = buildLimites(fx('ibge-municipio.json'), fx('ibge-distritos.json'), fx('ibge-nomes.json'));

describe('processamento dos dados geográficos (A4)', () => {
  it('monta município + 4 distritos com nomes do IBGE', () => {
    expect(limites.features.map((f) => f.properties.nome)).toEqual(['Duque de Caxias', 'Xerém', 'Imbariê', 'Duque de Caxias', 'Campos Elíseos']);
    expect(limitesBBox(limites)).toEqual([-43.45, -22.85, -43.13, -22.5]);
  });
  it('identifica o distrito de um ponto e devolve null fora do município', () => {
    expect(districtAt(limites, [-43.4, -22.6])).toBe('Xerém');
    expect(districtAt(limites, [-43.2, -22.8])).toBe('Campos Elíseos');
    expect(districtAt(limites, [-43.0, -22.9])).toBeNull();
  });
  it('falha se faltar nome de distrito', () => {
    expect(() => buildLimites(fx('ibge-municipio.json'), fx('ibge-distritos.json'), [])).toThrow(/sem nome/);
  });
  it('índice de ruas: agrupa trechos próximos, separa homônimas distantes e ignora vias sem nome ou fora', () => {
    const idx = buildStreetIndex(fx('overpass-ruas.json'), limites);
    const flores = idx.filter((e) => e.n === 'Rua das Flores');
    expect(flores).toHaveLength(3);
    expect(flores.map((e) => e.d).sort()).toEqual(['Duque de Caxias', 'Duque de Caxias', 'Imbariê']);
    expect(idx.find((e) => e.n === 'Rua Fora do Município')).toBeUndefined();
    expect(idx).toHaveLength(4);
  });
  it('bairros do OSM: dentro do município e sem duplicatas', () => {
    const p = buildPlaces(fx('overpass-bairros.json'), limites);
    expect(p.map((x) => x.n)).toEqual(['Bairro Teste Norte', 'Bairro Teste Sul']);
    expect(p[0].d).toBe('Imbariê');
  });
});

describe('limites pelo OpenStreetMap (alternativa ao IBGE)', () => {
  it('monta município e distritos a partir das relações e geometrias', async () => {
    const { buildLimitesFromOsm } = await import('./pipeline');
    const l = buildLimitesFromOsm(fx('osm-relacoes.json'), fx('osm-geometrias.json'));
    expect(l.features.map((f) => `${f.properties.tipo}:${f.properties.nome}:${f.properties.fonte}`)).toEqual([
      'municipio:Duque de Caxias:OpenStreetMap',
      'distrito:Xerém:OpenStreetMap',
      'distrito:Imbariê:OpenStreetMap',
      'distrito:Duque de Caxias:OpenStreetMap',
      'distrito:Campos Elíseos:OpenStreetMap',
    ]);
    expect(districtAt(l, [-43.4, -22.6])).toBe('Xerém');
  });
  it('falha se o município não existir', async () => {
    const { buildLimitesFromOsm } = await import('./pipeline');
    expect(() => buildLimitesFromOsm({ elements: [] }, { features: [] })).toThrow(/não encontrado/);
  });
});
