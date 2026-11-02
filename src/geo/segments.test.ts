import { describe, expect, it } from 'vitest';
import { candidatesNear, cellKey, cellsAround, cellsOfLine, lineLength, nearestOnLine, sliceAround, splitAtIntersections, type Segment } from './segments';

const g = (pts: [number, number][]) => pts.map(([lon, lat]) => ({ lon, lat }));
// ~0,001° de longitude ≈ 102 m nesta latitude.
const way = (id: number, name: string | undefined, nodes: number[], pts: [number, number][]) => ({ id, tags: { highway: 'residential', ...(name ? { name } : {}) }, nodes, geometry: g(pts) });

describe('trechos de rua (A5)', () => {
  it('corta nos cruzamentos em T e em X e mantém as pontas', () => {
    const ways = [
      way(1, 'Rua A', [1, 2, 3, 4, 5], [[-43.300, -22.7], [-43.299, -22.7], [-43.298, -22.7], [-43.297, -22.7], [-43.296, -22.7]]),
      way(2, 'Rua B', [10, 3], [[-43.298, -22.701], [-43.298, -22.7]]), // T no nó 3
      way(3, 'Rua C', [20, 4, 21], [[-43.297, -22.701], [-43.297, -22.7], [-43.297, -22.699]]), // X no nó 4
    ];
    const s = splitAtIntersections(ways);
    expect(s.filter((x) => x.n === 'Rua A').map((x) => x.c.length)).toEqual([3, 2, 2]); // 1-2-3 | 3-4 | 4-5
    expect(s.filter((x) => x.n === 'Rua C')).toHaveLength(2);
    expect(s.find((x) => x.n === 'Rua B')!.id).toBe('2-0');
  });
  it('trata via que passa duas vezes pelo mesmo nó (laço)', () => {
    const s = splitAtIntersections([way(1, 'Laço', [1, 2, 3, 1], [[0, 0], [0.001, 0], [0.001, 0.001], [0, 0]])]);
    expect(s.length).toBeGreaterThanOrEqual(1);
  });
  it('mede comprimento e projeta o ponto mais próximo', () => {
    const line: [number, number][] = [[-43.300, -22.7], [-43.298, -22.7]];
    expect(lineLength(line)).toBeGreaterThan(200);
    expect(lineLength(line)).toBeLessThan(210);
    const n = nearestOnLine([-43.299, -22.7002], line);
    expect(n.distance).toBeGreaterThan(20);
    expect(n.distance).toBeLessThan(25);
    expect(n.along).toBeGreaterThan(100);
    expect(n.along).toBeLessThan(105);
  });
  it('recorta a ±100 m do ponto, limitado às pontas do trecho', () => {
    const line: [number, number][] = [[-43.305, -22.7], [-43.295, -22.7]]; // ~1 km
    const mid = sliceAround(line, 500);
    expect(lineLength(mid)).toBeGreaterThan(195);
    expect(lineLength(mid)).toBeLessThan(205);
    const nearStart = sliceAround(line, 30);
    expect(nearStart[0]).toEqual([-43.305, -22.7]);
    expect(lineLength(nearStart)).toBeGreaterThan(125);
    expect(lineLength(nearStart)).toBeLessThan(135);
    const short: [number, number][] = [[-43.3, -22.7], [-43.2995, -22.7]]; // ~51 m: trecho inteiro
    expect(lineLength(sliceAround(short, 20))).toBeCloseTo(lineLength(short), 0);
  });
  it('lista vias próximas, uma por nome, até 30 m', () => {
    const segs: Segment[] = [
      { id: 'a-0', n: 'Rua A', c: [[-43.3, -22.7], [-43.298, -22.7]] },
      { id: 'a-1', n: 'Rua A', c: [[-43.298, -22.7], [-43.296, -22.7]] },
      { id: 'b-0', n: 'Rua B', c: [[-43.299, -22.7001], [-43.299, -22.702]] },
      { id: 'c-0', n: 'Rua Longe', c: [[-43.29, -22.69], [-43.289, -22.69]] },
    ];
    const c = candidatesNear([-43.2991, -22.70005], segs);
    expect(c.map((x) => x.segment.n)).toEqual(['Rua A', 'Rua B']); // A a ~5 m, B a ~12 m
    expect(candidatesNear([-43.25, -22.65], segs)).toEqual([]);
  });
  it('células: chave, linha atravessando células e vizinhança 3×3', () => {
    expect(cellKey(-43.305, -22.705)).toBe('-4331_-2271');
    expect(cellsOfLine([[-43.305, -22.705], [-43.285, -22.705]]).size).toBe(3);
    expect(cellsAround(-43.305, -22.705)).toHaveLength(9);
  });
});
