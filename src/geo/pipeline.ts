// Processamento dos dados geográficos (A4). Funções puras: usadas por scripts/geo/build.mjs e pelos testes.
import { bboxOf, distanceMeters, pointInGeometry, round, roundGeometry, type AreaGeometry, type BBox, type Position } from './geometry.ts';
import { normalize } from './text.ts';

export const MUNICIPIO_IBGE = '3301702';

/** Nomes oficiais dos distritos de Duque de Caxias e grafias alternativas encontradas nas fontes. */
export const DISTRITOS_OFICIAIS = ['Duque de Caxias', 'Campos Elíseos', 'Imbariê', 'Xerém'];
const ALIASES: Record<string, string> = { 'campos elyseos': 'Campos Elíseos', 'campos elisios': 'Campos Elíseos', imbarie: 'Imbariê', xerem: 'Xerém' };

/** Padroniza o nome do distrito (ex.: "Campos Elyseos" no OpenStreetMap → "Campos Elíseos"). */
export function canonicalDistrict(nome: string): string {
  const n = normalize(nome);
  return DISTRITOS_OFICIAIS.find((d) => normalize(d) === n) ?? ALIASES[n] ?? nome;
}

export type LimitFeature = {
  type: 'Feature';
  properties: { tipo: 'municipio' | 'distrito'; codigo: string; nome: string; nome_original?: string; fonte?: 'IBGE' | 'OpenStreetMap' };
  geometry: AreaGeometry;
};
export type Limites = { type: 'FeatureCollection'; features: LimitFeature[] };

/** Entrada do índice de ruas: n = nome, d = distrito, c = ponto de referência [lng, lat]. */
export type StreetEntry = { n: string; d: string; c: Position };
export type PlaceEntry = { n: string; d: string; c: Position; t: string };

type IbgeFeature = { properties: { codarea: string }; geometry: AreaGeometry };

/** Monta os limites a partir das malhas do IBGE (município + distritos) e dos nomes dos distritos. */
export function buildLimites(municipio: { features: IbgeFeature[] }, distritos: { features: IbgeFeature[] }, nomes: { id: number | string; nome: string }[]): Limites {
  const nomePorCodigo = new Map(nomes.map((n) => [String(n.id), n.nome]));
  const mun = municipio.features[0];
  if (!mun) throw new Error('Malha do município vazia.');
  const features: LimitFeature[] = [
    { type: 'Feature', properties: { tipo: 'municipio', codigo: MUNICIPIO_IBGE, nome: 'Duque de Caxias', fonte: 'IBGE' }, geometry: roundGeometry(mun.geometry) },
  ];
  for (const f of distritos.features) {
    const codigo = String(f.properties.codarea);
    const nome = nomePorCodigo.get(codigo);
    if (!nome) throw new Error(`Distrito ${codigo} sem nome na API de localidades.`);
    features.push({ type: 'Feature', properties: { tipo: 'distrito', codigo, nome: canonicalDistrict(nome), nome_original: nome, fonte: 'IBGE' }, geometry: roundGeometry(f.geometry) });
  }
  return { type: 'FeatureCollection', features };
}

type OsmRel = { type: 'relation'; id: number; tags?: Record<string, string> };
type NominatimFeature = { properties: { osm_id: number }; geometry: AreaGeometry | { type: string } };

/**
 * Alternativa quando a API do IBGE não está acessível: limites administrativos do OpenStreetMap.
 * `rels`: relações (Overpass, com tags) — o município (IBGE:GEOCODIGO=3301702) e os distritos (admin_level 9/10).
 * `geoms`: geometrias montadas pelo Nominatim (lookup com polygon_geojson=1).
 */
export function buildLimitesFromOsm(rels: { elements: (OsmRel | { type: string })[] }, geoms: { features: NominatimFeature[] }): Limites {
  const geomById = new Map<number, AreaGeometry>();
  for (const f of geoms.features)
    if (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon') geomById.set(Number(f.properties.osm_id), f.geometry as AreaGeometry);
  const relations = rels.elements.filter((e): e is OsmRel => e.type === 'relation');
  const mun = relations.find((r) => r.tags?.['IBGE:GEOCODIGO'] === MUNICIPIO_IBGE);
  if (!mun || !geomById.has(mun.id)) throw new Error('Município não encontrado no OpenStreetMap.');
  const features: LimitFeature[] = [
    { type: 'Feature', properties: { tipo: 'municipio', codigo: MUNICIPIO_IBGE, nome: 'Duque de Caxias', fonte: 'OpenStreetMap' }, geometry: roundGeometry(geomById.get(mun.id)!) },
  ];
  for (const r of relations) {
    if (r === mun || !r.tags?.name || !geomById.has(r.id)) continue;
    if (!['9', '10'].includes(r.tags.admin_level ?? '')) continue;
    features.push({
      type: 'Feature',
      properties: { tipo: 'distrito', codigo: r.tags['IBGE:GEOCODIGO'] ?? `osm-${r.id}`, nome: canonicalDistrict(r.tags.name), nome_original: r.tags.name, fonte: 'OpenStreetMap' },
      geometry: roundGeometry(geomById.get(r.id)!),
    });
  }
  return { type: 'FeatureCollection', features };
}

export function municipioOf(l: Limites): LimitFeature {
  const m = l.features.find((f) => f.properties.tipo === 'municipio');
  if (!m) throw new Error('Limites sem município.');
  return m;
}

export function districtAt(l: Limites, pt: Position): string | null {
  const d = l.features.find((f) => f.properties.tipo === 'distrito' && pointInGeometry(pt, f.geometry));
  return d ? d.properties.nome : null;
}

export function limitesBBox(l: Limites): BBox {
  return bboxOf(municipioOf(l).geometry);
}

type OsmWay = { type: 'way'; id: number; tags?: Record<string, string>; geometry?: { lat: number; lon: number }[] };
type OsmNode = { type: 'node'; id: number; lat: number; lon: number; tags?: Record<string, string> };
export type OverpassResult = { elements: (OsmWay | OsmNode | { type: string })[] };

/**
 * Índice de ruas: uma entrada por (nome, distrito, região). Vias com o mesmo nome a mais de `clusterMeters`
 * umas das outras viram entradas separadas (ruas homônimas em bairros diferentes).
 */
export function buildStreetIndex(overpass: OverpassResult, l: Limites, clusterMeters = 1500): StreetEntry[] {
  const mun = municipioOf(l).geometry;
  type Cluster = { name: string; d: string; pts: Position[]; center: Position };
  const groups = new Map<string, Cluster[]>();
  for (const el of overpass.elements) {
    if (el.type !== 'way') continue;
    const w = el as OsmWay;
    const name = w.tags?.name?.trim();
    if (!name || !w.geometry?.length) continue;
    const mid = w.geometry[Math.floor(w.geometry.length / 2)];
    const pt: Position = [mid.lon, mid.lat];
    if (!pointInGeometry(pt, mun)) continue;
    const d = districtAt(l, pt);
    if (!d) continue;
    const key = `${normalize(name)}|${d}`;
    const clusters = groups.get(key) ?? [];
    let c = clusters.find((k) => distanceMeters(k.center, pt) <= clusterMeters);
    if (!c) {
      c = { name, d, pts: [], center: pt };
      clusters.push(c);
    }
    c.pts.push(pt);
    c.center = [c.pts.reduce((s, p) => s + p[0], 0) / c.pts.length, c.pts.reduce((s, p) => s + p[1], 0) / c.pts.length];
    groups.set(key, clusters);
  }
  const out: StreetEntry[] = [];
  for (const clusters of groups.values())
    for (const c of clusters) {
      // Ponto de referência: o ponto real de via mais próximo do centro do grupo (evita cair fora da rua).
      const ref = c.pts.reduce((best, p) => (distanceMeters(p, c.center) < distanceMeters(best, c.center) ? p : best), c.pts[0]);
      out.push({ n: c.name, d: c.d, c: [round(ref[0]), round(ref[1])] });
    }
  return out.sort((a, b) => a.n.localeCompare(b.n, 'pt-BR') || a.d.localeCompare(b.d, 'pt-BR'));
}

/** Nomes de bairro do OpenStreetMap (não oficiais), dentro do município. */
export function buildPlaces(overpass: OverpassResult, l: Limites): PlaceEntry[] {
  const mun = municipioOf(l).geometry;
  const seen = new Set<string>();
  const out: PlaceEntry[] = [];
  for (const el of overpass.elements) {
    if (el.type !== 'node') continue;
    const n = el as OsmNode;
    const name = n.tags?.name?.trim();
    if (!name) continue;
    const pt: Position = [n.lon, n.lat];
    if (!pointInGeometry(pt, mun)) continue;
    const d = districtAt(l, pt);
    if (!d) continue;
    const key = `${normalize(name)}|${d}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ n: name, d, c: [round(pt[0]), round(pt[1])], t: n.tags?.place ?? '' });
  }
  return out.sort((a, b) => a.n.localeCompare(b.n, 'pt-BR'));
}
