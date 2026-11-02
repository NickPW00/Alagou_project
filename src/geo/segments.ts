// A5 — trechos de rua: divisão nos cruzamentos, células estáticas, ponto mais próximo e recorte a ±100 m.
// Sem dependências do app: usado pelo app e pelo script de dados (Node).
import { round, type Position } from './geometry.ts';
import { normalize } from './text.ts';

/** Trecho de rua (formato compacto dos arquivos): id, n = nome, h = tipo de via, c = coordenadas. */
export type Segment = { id: string; n?: string; h?: string; c: Position[] };

type WayIn = { id: number; tags?: Record<string, string>; nodes?: number[]; geometry?: { lat: number; lon: number }[] };

/**
 * Divide as vias nos cruzamentos: um nó usado por duas ou mais vias (ou repetido na mesma via) é cruzamento.
 * As pontas das vias são mantidas como pontas dos trechos.
 */
export function splitAtIntersections(ways: WayIn[]): Segment[] {
  const usage = new Map<number, number>();
  for (const w of ways) for (const n of w.nodes ?? []) usage.set(n, (usage.get(n) ?? 0) + 1);
  const out: Segment[] = [];
  for (const w of ways) {
    const nodes = w.nodes ?? [];
    const geom = w.geometry ?? [];
    if (nodes.length < 2 || geom.length !== nodes.length) continue;
    let start = 0;
    let part = 0;
    for (let i = 1; i < nodes.length; i++) {
      const isLast = i === nodes.length - 1;
      if (isLast || (usage.get(nodes[i]) ?? 0) >= 2) {
        const coords = geom.slice(start, i + 1).map((g) => [round(g.lon), round(g.lat)] as Position);
        out.push({ id: `${w.id}-${part++}`, ...(w.tags?.name ? { n: w.tags.name } : {}), ...(w.tags?.highway ? { h: w.tags.highway } : {}), c: coords });
        start = i;
      }
    }
  }
  return out;
}

// ---- Projeção local (metros) — suficiente para distâncias de até ~1–2 km ----
const M_PER_DEG_LAT = 110_540;
const mPerDegLng = (lat: number) => 111_320 * Math.cos((lat * Math.PI) / 180);

function toXY(p: Position, origin: Position): [number, number] {
  return [(p[0] - origin[0]) * mPerDegLng(origin[1]), (p[1] - origin[1]) * M_PER_DEG_LAT];
}
function fromXY(xy: [number, number], origin: Position): Position {
  return [origin[0] + xy[0] / mPerDegLng(origin[1]), origin[1] + xy[1] / M_PER_DEG_LAT];
}

export function lineLength(line: Position[]): number {
  if (line.length < 2) return 0;
  let L = 0;
  for (let i = 1; i < line.length; i++) {
    const [x, y] = toXY(line[i], line[i - 1]);
    L += Math.hypot(x, y);
  }
  return L;
}

export type Nearest = { distance: number; point: Position; along: number };

/** Ponto da linha mais próximo de `pt`: distância (m), ponto projetado e distância percorrida desde o início (m). */
export function nearestOnLine(pt: Position, line: Position[]): Nearest {
  let best: Nearest = { distance: Infinity, point: line[0], along: 0 };
  let acc = 0;
  for (let i = 1; i < line.length; i++) {
    const a = toXY(line[i - 1], pt);
    const b = toXY(line[i], pt);
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len2 = dx * dx + dy * dy;
    const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, -(a[0] * dx + a[1] * dy) / len2));
    const px = a[0] + t * dx;
    const py = a[1] + t * dy;
    const d = Math.hypot(px, py);
    const segLen = Math.sqrt(len2);
    if (d < best.distance) best = { distance: d, point: fromXY([px, py], pt), along: acc + t * segLen };
    acc += segLen;
  }
  return best;
}

/** Parte da linha entre `from` e `to` metros a partir do início (com pontas interpoladas). */
export function sliceLine(line: Position[], from: number, to: number): Position[] {
  const out: Position[] = [];
  let acc = 0;
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1];
    const b = line[i];
    const [x, y] = toXY(b, a);
    const seg = Math.hypot(x, y);
    const s0 = acc;
    const s1 = acc + seg;
    const at = (s: number): Position => (seg === 0 ? a : fromXY([(x * (s - s0)) / seg, (y * (s - s0)) / seg], a));
    if (s1 >= from && s0 <= to) {
      if (!out.length) out.push(from > s0 ? at(from) : a);
      if (to < s1) {
        out.push(at(to));
        break;
      }
      out.push(b);
    }
    acc = s1;
  }
  return out.map(([lng, lat]) => [round(lng, 6), round(lat, 6)] as Position);
}

/** Trecho de referência: até `radius` metros para cada lado do ponto projetado, limitado às pontas (cruzamentos). */
export function sliceAround(line: Position[], along: number, radius = 100): Position[] {
  const L = lineLength(line);
  return sliceLine(line, Math.max(0, along - radius), Math.min(L, along + radius));
}

export type Candidate = { segment: Segment; distance: number; along: number; point: Position };

/** Vias próximas (até `maxDistance` m), da mais próxima para a mais distante, uma por nome de rua. */
export function candidatesNear(pt: Position, segments: Segment[], maxDistance = 30, max = 3): Candidate[] {
  const all = segments
    .map((s) => ({ segment: s, ...nearestOnLine(pt, s.c) }))
    .filter((c) => c.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);
  const seen = new Set<string>();
  const out: Candidate[] = [];
  for (const c of all) {
    const key = c.segment.n ? `n:${normalize(c.segment.n)}` : `id:${c.segment.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
    if (out.length === max) break;
  }
  return out;
}

// ---- Células (blocos estáticos) ----
export const CELL_SIZE = 0.01; // graus (~1,1 km)
export const cellKey = (lng: number, lat: number, size = CELL_SIZE) => `${Math.floor(lng / size)}_${Math.floor(lat / size)}`;

/** Células tocadas por uma linha (amostrando a cada ~200 m para não pular células). */
export function cellsOfLine(line: Position[], size = CELL_SIZE): Set<string> {
  const keys = new Set<string>();
  for (let i = 0; i < line.length; i++) {
    keys.add(cellKey(line[i][0], line[i][1], size));
    if (i > 0) {
      const [a, b] = [line[i - 1], line[i]];
      const steps = Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])) / 0.002);
      for (let k = 1; k < steps; k++) keys.add(cellKey(a[0] + ((b[0] - a[0]) * k) / steps, a[1] + ((b[1] - a[1]) * k) / steps, size));
    }
  }
  return keys;
}

/** Células em volta de um ponto (3×3), para garantir vias logo além da borda da célula. */
export function cellsAround(lng: number, lat: number, size = CELL_SIZE): string[] {
  const cx = Math.floor(lng / size);
  const cy = Math.floor(lat / size);
  const out: string[] = [];
  for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) out.push(`${cx + dx}_${cy + dy}`);
  return out;
}
