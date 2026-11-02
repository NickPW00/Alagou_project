// A4 — carregamento sob demanda dos dados geográficos gerados em public/geo/ (scripts/geo/build.mjs).
import { DISTRICTS, type District, type LngLat } from '../domain/types';
import { pointInGeometry, type Position } from './geometry.ts';
import { canonicalDistrict, districtAt, municipioOf, type Limites, type PlaceEntry, type StreetEntry } from './pipeline.ts';
import { normalize } from './text.ts';

const base = `${import.meta.env.BASE_URL}geo/`;
const cache = new Map<string, Promise<unknown>>();

function load<T>(file: string, fallback: T): Promise<T> {
  if (!cache.has(file)) {
    const p = fetch(base + file)
      .then((r) => (r.ok ? (r.json() as Promise<T>) : fallback))
      .catch(() => {
        cache.delete(file); // tenta de novo na próxima vez (ex.: estava offline)
        return fallback;
      });
    cache.set(file, p);
  }
  return cache.get(file) as Promise<T>;
}

export const loadLimites = () => load<Limites | null>('limites.geojson', null);
export const loadStreetIndex = () => load<StreetEntry[]>('ruas-indice.json', []);
export const loadPlaces = () => load<PlaceEntry[]>('bairros-osm.json', []);

/** Converte o nome de distrito do IBGE para o tipo usado no app. */
export function toDistrict(nome: string | null): District | null {
  if (!nome) return null;
  const n = normalize(canonicalDistrict(nome));
  return DISTRICTS.find((d) => normalize(d) === n) ?? null;
}

export type Locate = { district: District | null; inside: boolean | null };

/** Distrito e situação (dentro/fora do município) de um ponto. `inside: null` = limites indisponíveis. */
export function locate(limites: Limites | null, p: LngLat): Locate {
  if (!limites) return { district: null, inside: null };
  const pt: Position = [p.lng, p.lat];
  const inside = pointInGeometry(pt, municipioOf(limites).geometry);
  return { inside, district: inside ? toDistrict(districtAt(limites, pt)) : null };
}

/** Apenas para testes: limpa o cache em memória. */
export function _resetGeoCache() {
  cache.clear();
}
