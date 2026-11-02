import { describe, expect, it } from 'vitest';
import { bboxOf, distanceMeters, pointInGeometry, pointInPolygon, roundGeometry, type AreaGeometry, type PolygonCoords } from './geometry';
import { normalize } from './text';

const square: PolygonCoords = [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]];
const withHole: PolygonCoords = [square[0], [[4, 4], [6, 4], [6, 6], [4, 6], [4, 4]]];

describe('geometria (A4)', () => {
  it('ponto dentro e fora de polígono', () => {
    expect(pointInPolygon([5, 5], square)).toBe(true);
    expect(pointInPolygon([11, 5], square)).toBe(false);
  });
  it('respeita buracos', () => {
    expect(pointInPolygon([5, 5], withHole)).toBe(false);
    expect(pointInPolygon([2, 2], withHole)).toBe(true);
  });
  it('multipolígono', () => {
    const g: AreaGeometry = { type: 'MultiPolygon', coordinates: [square, [[[20, 20], [30, 20], [30, 30], [20, 30], [20, 20]]]] };
    expect(pointInGeometry([25, 25], g)).toBe(true);
    expect(pointInGeometry([15, 15], g)).toBe(false);
    expect(bboxOf(g)).toEqual([0, 0, 30, 30]);
  });
  it('distância em metros (1 grau de latitude ≈ 111 km)', () => {
    expect(distanceMeters([-43.3, -22.7], [-43.3, -21.7])).toBeGreaterThan(110_000);
    expect(distanceMeters([-43.3, -22.7], [-43.3, -21.7])).toBeLessThan(112_000);
  });
  it('arredonda coordenadas', () => {
    const g = roundGeometry({ type: 'Polygon', coordinates: [[[-43.123456789, -22.987654321], [0, 0], [1, 1], [-43.123456789, -22.987654321]]] });
    expect(g.coordinates[0][0]).toEqual([-43.12346, -22.98765]);
  });
  it('normaliza nomes para busca', () => {
    expect(normalize('  Rua  São   João ')).toBe('rua sao joao');
  });
});
