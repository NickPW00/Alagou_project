// Geometria básica em WGS84 (lng, lat). Sem dependências: usada pelo app e pelos scripts (Node).
export type Position = [number, number];
export type Ring = Position[];
export type PolygonCoords = Ring[];
export type AreaGeometry = { type: 'Polygon'; coordinates: PolygonCoords } | { type: 'MultiPolygon'; coordinates: PolygonCoords[] };
export type BBox = [number, number, number, number];

/** Ponto dentro de um anel (algoritmo do raio). */
export function pointInRing(pt: Position, ring: Ring): boolean {
  const [x, y] = pt;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Ponto dentro de polígono: dentro do anel externo e fora dos buracos. */
export function pointInPolygon(pt: Position, poly: PolygonCoords): boolean {
  if (!poly.length || !pointInRing(pt, poly[0])) return false;
  for (let k = 1; k < poly.length; k++) if (pointInRing(pt, poly[k])) return false;
  return true;
}

export function pointInGeometry(pt: Position, g: AreaGeometry): boolean {
  return g.type === 'Polygon' ? pointInPolygon(pt, g.coordinates) : g.coordinates.some((p) => pointInPolygon(pt, p));
}

export function bboxOf(g: AreaGeometry): BBox {
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  const b: BBox = [Infinity, Infinity, -Infinity, -Infinity];
  for (const poly of polys)
    for (const [x, y] of poly[0]) {
      if (x < b[0]) b[0] = x;
      if (y < b[1]) b[1] = y;
      if (x > b[2]) b[2] = x;
      if (y > b[3]) b[3] = y;
    }
  return b;
}

/** Distância em metros (fórmula de haversine). */
export function distanceMeters(a: Position, b: Position): number {
  const R = 6371008.8;
  const toRad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * toRad;
  const dLng = (b[0] - a[0]) * toRad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * toRad) * Math.cos(b[1] * toRad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function round(n: number, decimals = 5): number {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

export function roundGeometry(g: AreaGeometry, decimals = 5): AreaGeometry {
  const rr = (ring: Ring): Ring => ring.map(([x, y]) => [round(x, decimals), round(y, decimals)] as Position);
  return g.type === 'Polygon'
    ? { type: 'Polygon', coordinates: g.coordinates.map(rr) }
    : { type: 'MultiPolygon', coordinates: g.coordinates.map((p) => p.map(rr)) };
}
