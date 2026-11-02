import { describe, expect, it, vi } from 'vitest';
import { DemoSource } from './demo';
import { NoBackendSource } from './source';

describe('DemoSource', () => {
  it('usa apenas nomes claramente fictícios', async () => {
    const src = new DemoSource();
    for (const r of await src.listReports()) {
      expect(r.street).toMatch(/Demonstração/);
      expect(r.neighborhood).toMatch(/Demonstração/);
    }
  });
  it('registra relato, notifica assinantes e preserva histórico na moderação', async () => {
    const src = new DemoSource();
    const fn = vi.fn();
    src.subscribe(fn);
    const res = await src.submitReport(
      { district: 'Imbariê', neighborhood: 'B', street: 'R', nearNumber: '', postalCode: '', referencePoint: '', segmentDescription: '', location: { lng: -43.2, lat: -22.6 }, condition: 'fully_flooded', trend: 'rising', hazards: [], description: '', observedDate: '', observedTime: '' },
      new Date().toISOString(),
    );
    expect(fn).toHaveBeenCalledTimes(1);
    expect((await src.listReports())[0].id).toBe(res.id);
    await src.moderate(res.id, 'hide');
    expect((await src.listReports()).find((r) => r.id === res.id)).toBeUndefined();
    const all = await src.listAllForAdmin();
    const hidden = all.find((r) => r.id === res.id)!;
    expect(hidden.verification).toBe('removed');
    expect(hidden.history.length).toBe(2);
  });
  it('rejeita relato incompleto', async () => {
    const src = new DemoSource();
    await expect(src.submitReport({ neighborhood: '', street: '', nearNumber: '', postalCode: '', referencePoint: '', segmentDescription: '', hazards: [], description: '', observedDate: '', observedTime: '' }, '')).rejects.toThrow();
  });
});

describe('NoBackendSource', () => {
  it('não inventa dados e não aceita envio', async () => {
    const src = new NoBackendSource();
    expect(await src.listReports()).toEqual([]);
    expect(src.canSubmit).toBe(false);
    await expect(src.submitReport()).rejects.toThrow(/Fase 3/);
  });
});

describe('selo EXEMPLO (A2)', () => {
  it('marca todos os dados de demonstração como exemplo, inclusive os enviados', async () => {
    const src = new DemoSource();
    expect((await src.listReports()).every((r) => r.example === true)).toBe(true);
    expect((await src.listHistorical()).every((h) => h.example === true)).toBe(true);
    await src.submitReport(
      { district: 'Xerém', neighborhood: 'B', street: 'R', nearNumber: '', postalCode: '', referencePoint: '', segmentDescription: '', location: { lng: -43.3, lat: -22.6 }, condition: 'no_flooding', trend: 'unknown', hazards: [], description: '', observedDate: '', observedTime: '' },
      new Date().toISOString(),
    );
    expect((await src.listReports())[0].example).toBe(true);
  });
});
