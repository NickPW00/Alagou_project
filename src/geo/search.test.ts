import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { limitesFonteLabel, locate, toDistrict } from './data';
import { buildLimites, buildPlaces, buildStreetIndex } from './pipeline';
import { searchGeocoder, searchLocal, stripNumber } from './search';

const fx = (f: string) => JSON.parse(readFileSync(`scripts/geo/fixture/${f}`, 'utf8'));
const limites = buildLimites(fx('ibge-municipio.json'), fx('ibge-distritos.json'), fx('ibge-nomes.json'));
const streets = buildStreetIndex(fx('overpass-ruas.json'), limites);
const places = buildPlaces(fx('overpass-bairros.json'), limites);

describe('busca local (A4)', () => {
  it('ignora acentos e número de porta; separa homônimas por distrito', () => {
    expect(stripNumber('Rua das Flores, 123')).toBe('Rua das Flores');
    const r = searchLocal(streets, places, 'rua das flôres 45');
    expect(r).toHaveLength(3);
    expect(r.map((x) => x.detail)).toEqual(['Distrito de Duque de Caxias', 'Distrito de Duque de Caxias', 'Distrito de Imbariê']);
  });
  it('prioriza quem começa com o texto e inclui bairros', () => {
    const r = searchLocal(streets, places, 'exemplo');
    expect(r[0].label).toBe('Avenida Exemplo Central');
    expect(searchLocal(streets, places, 'teste norte')[0]).toMatchObject({ kind: 'place', district: 'Imbariê' });
  });
  it('exige ao menos 2 letras', () => {
    expect(searchLocal(streets, places, 'r')).toEqual([]);
  });
});

describe('distrito automático (A4)', () => {
  it('identifica distrito, ponto fora e ausência de limites', () => {
    expect(locate(limites, { lng: -43.4, lat: -22.6 })).toEqual({ inside: true, district: 'Xerém' });
    expect(locate(limites, { lng: -43.0, lat: -22.9 })).toEqual({ inside: false, district: null });
    expect(locate(null, { lng: -43.4, lat: -22.6 })).toEqual({ inside: null, district: null });
    expect(toDistrict('CAMPOS ELISEOS')).toBe('Campos Elíseos');
    expect(toDistrict('Campos Elyseos')).toBe('Campos Elíseos');
    expect(limitesFonteLabel(limites)).toBe('limite oficial do IBGE');
    expect(limitesFonteLabel(null)).toBe('limite do OpenStreetMap');
  });
});

describe('Photon (A4)', () => {
  afterEach(() => vi.restoreAllMocks());
  it('envia a área do município e descarta resultados fora do limite', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          features: [
            { geometry: { coordinates: [-43.25, -22.75] }, properties: { name: 'Escola Teste', street: 'Avenida Exemplo Central', osm_key: 'amenity' } },
            { geometry: { coordinates: [-43.0, -22.9] }, properties: { name: 'Fora', osm_key: 'place' } },
          ],
        }),
      ),
    );
    const r = await searchGeocoder('escola', limites, undefined, 'https://geo.test/api/');
    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.searchParams.get('bbox')).toBe('-43.45,-22.85,-43.13,-22.5');
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ label: 'Escola Teste', street: 'Avenida Exemplo Central', district: 'Campos Elíseos' });
  });
  it('não consulta com menos de 3 letras', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    expect(await searchGeocoder('ab', limites)).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
