// A4 — busca de ruas/bairros (índice local) e de lugares (Photon).
import type { LngLat } from '../domain/types';
import { bboxOf, pointInGeometry } from './geometry.ts';
import { districtAt, municipioOf, type Limites, type PlaceEntry, type StreetEntry } from './pipeline.ts';
import { normalize } from './text.ts';

export type SearchResult = {
  id: string;
  kind: 'street' | 'place' | 'geocoder';
  label: string; // texto principal
  detail: string; // distrito / tipo
  street?: string; // nome da rua, quando houver
  district: string | null;
  location: LngLat;
};

/** Remove número de porta do fim ("Rua X, 123" → "Rua X") para a busca local. */
export const stripNumber = (q: string) => q.replace(/[,\s]+\d+[a-z]?\s*$/i, '');

function score(name: string, q: string): number {
  const n = normalize(name);
  if (n.startsWith(q)) return 0;
  if (n.split(' ').some((w) => w.startsWith(q))) return 1;
  if (n.includes(q)) return 2;
  return -1;
}

export function searchLocal(streets: StreetEntry[], places: PlaceEntry[], query: string, limit = 8): SearchResult[] {
  const q = normalize(stripNumber(query));
  if (q.length < 2) return [];
  const hits: { r: SearchResult; s: number }[] = [];
  streets.forEach((e, i) => {
    const s = score(e.n, q);
    if (s >= 0) hits.push({ s, r: { id: `r${i}`, kind: 'street', label: e.n, detail: `Distrito de ${e.d}`, street: e.n, district: e.d, location: { lng: e.c[0], lat: e.c[1] } } });
  });
  places.forEach((e, i) => {
    const s = score(e.n, q);
    if (s >= 0) hits.push({ s, r: { id: `b${i}`, kind: 'place', label: e.n, detail: `Bairro (OpenStreetMap) · ${e.d}`, district: e.d, location: { lng: e.c[0], lat: e.c[1] } } });
  });
  return hits
    .sort((a, b) => a.s - b.s || a.r.label.localeCompare(b.r.label, 'pt-BR') || (a.r.district ?? '').localeCompare(b.r.district ?? '', 'pt-BR'))
    .slice(0, limit)
    .map((h) => h.r);
}

export const GEOCODER_URL: string = import.meta.env.VITE_GEOCODER_URL || 'https://photon.komoot.io/api/';

type PhotonFeature = { geometry: { coordinates: [number, number] }; properties: Record<string, string | undefined> };

/** Busca no Photon restrita à área do município; descarta resultados fora do limite oficial. */
export async function searchGeocoder(query: string, limites: Limites | null, signal?: AbortSignal, url = GEOCODER_URL): Promise<SearchResult[]> {
  const q = query.trim();
  if (q.length < 3) return [];
  const params = new URLSearchParams({ q, limit: '8' });
  if (limites) {
    const [w, s, e, n] = bboxOf(municipioOf(limites).geometry);
    params.set('bbox', `${w},${s},${e},${n}`);
    params.set('lon', String((w + e) / 2));
    params.set('lat', String((s + n) / 2));
  }
  const res = await fetch(`${url}?${params}`, { signal });
  if (!res.ok) throw new Error(`Busca indisponível (${res.status}).`);
  const data = (await res.json()) as { features?: PhotonFeature[] };
  const out: SearchResult[] = [];
  for (const [i, f] of (data.features ?? []).entries()) {
    const [lng, lat] = f.geometry.coordinates;
    if (limites && !pointInGeometry([lng, lat], municipioOf(limites).geometry)) continue;
    const p = f.properties;
    const street = p.street ?? (p.osm_key === 'highway' ? p.name : undefined);
    const label = [p.name ?? street, p.housenumber].filter(Boolean).join(', ');
    const district = limites ? districtAt(limites, [lng, lat]) : null;
    const detail = [p.street && p.name !== p.street ? p.street : null, p.district ?? p.locality, district ? `Distrito de ${district}` : null].filter(Boolean).join(' · ');
    out.push({ id: `g${i}`, kind: 'geocoder', label: label || 'Local sem nome', detail, street, district, location: { lng, lat } });
  }
  return out;
}
