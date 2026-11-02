// ⚠️ DADOS FICTÍCIOS PARA DEMONSTRAÇÃO VISUAL (Fase 2).
// Nada aqui representa uma ocorrência real. Ruas e bairros têm nomes de demonstração
// propositalmente artificiais, e as posições são aproximadas por distrito.
// Este módulo só é carregado quando VITE_DATA_MODE=demo.

import type { HistoricalReport, PublicReport, ReportDraft } from '../domain/types';
import type { DataSource, ModerationAction, SubmitResult } from './source';

const minutesAgo = (m: number, base: number) => new Date(base - m * 60000).toISOString();

function seed(base: number): PublicReport[] {
  const r = (
    id: string,
    district: PublicReport['district'],
    n: number,
    lng: number,
    lat: number,
    condition: PublicReport['condition'],
    trend: PublicReport['trend'],
    ago: number,
    extra: Partial<PublicReport> = {},
  ): PublicReport => ({
    id,
    district,
    neighborhood: `Bairro Demonstração ${n}`,
    street: `Rua Demonstração ${id.toUpperCase()}`,
    location: { lng, lat },
    condition,
    trend,
    hazards: [],
    observedAt: minutesAgo(ago, base),
    submittedAt: minutesAgo(Math.max(0, ago - 2), base),
    confirmations: 0,
    verification: 'published_unconfirmed',
    history: [{ at: minutesAgo(Math.max(0, ago - 2), base), condition, trend, note: 'Relato enviado (demonstração)' }],
    photoCount: 0,
    example: true,
    ...extra,
  });
  return [
    r('d1', 'Duque de Caxias', 1, -43.311, -22.786, 'fully_flooded', 'rising', 8, {
      depth: 'knee',
      hazards: ['current', 'stalled_vehicles'],
      confirmations: 3,
      verification: 'confirmed',
      description: 'Exemplo de descrição fictícia para demonstração.',
    }),
    r('d2', 'Duque de Caxias', 1, -43.304, -22.79, 'partially_flooded', 'stable', 22, { depth: 'ankle', confirmations: 1, verification: 'confirmed' }),
    r('d3', 'Duque de Caxias', 2, -43.296, -22.775, 'water_accumulation', 'receding', 55),
    r('d4', 'Campos Elíseos', 3, -43.268, -22.708, 'partially_flooded', 'rising', 15, { hazards: ['clogged_drain'] }),
    r('d5', 'Campos Elíseos', 3, -43.275, -22.715, 'no_flooding', 'unknown', 40),
    r('d6', 'Imbariê', 4, -43.212, -22.632, 'fully_flooded', 'receding', 180, {
      verification: 'conflicting',
      confirmations: 2,
      history: [
        { at: minutesAgo(200, base), condition: 'fully_flooded', trend: 'rising', note: 'Relato enviado (demonstração)' },
        { at: minutesAgo(180, base), condition: 'fully_flooded', trend: 'receding', note: 'Atualização: água baixando (demonstração)' },
      ],
    }),
    r('d7', 'Xerém', 5, -43.302, -22.574, 'water_accumulation', 'stable', 95, { verification: 'verified_by_team' }),
    r('d8', 'Imbariê', 6, -43.2, -22.64, 'cannot_assess', 'unknown', 12),
  ];
}

function seedHistorical(): HistoricalReport[] {
  const items: Omit<HistoricalReport, 'example'>[] = [
    { id: 'h1', district: 'Duque de Caxias', neighborhood: 'Bairro Demonstração 1', street: 'Rua Demonstração H1', location: { lng: -43.318, lat: -22.781 }, periodLabel: 'Verão de 2024 (exemplo)', perceivedFrequency: 'almost_every_heavy_rain', description: 'Exemplo fictício de memória comunitária.' },
    { id: 'h2', district: 'Campos Elíseos', neighborhood: 'Bairro Demonstração 3', street: 'Rua Demonstração H2', location: { lng: -43.262, lat: -22.702 }, periodLabel: 'Março de 2023 (exemplo)', perceivedFrequency: 'frequently' },
    { id: 'h3', district: 'Xerém', neighborhood: 'Bairro Demonstração 5', street: 'Rua Demonstração H3', location: { lng: -43.296, lat: -22.58 }, periodLabel: 'Janeiro de 2022 (exemplo)', perceivedFrequency: 'once' },
  ];
  return items.map((h) => ({ ...h, example: true }));
}

export class DemoSource implements DataSource {
  readonly mode = 'demo' as const;
  readonly canSubmit = true;
  private reports: PublicReport[];
  private hidden = new Set<string>();
  private historical = seedHistorical();
  private listeners = new Set<() => void>();
  private seq = 0;

  constructor(now: number = Date.now()) {
    this.reports = seed(now);
  }

  async listReports() {
    return this.reports.filter((r) => !this.hidden.has(r.id)).map((r) => ({ ...r }));
  }

  /** Inclui ocultos — usado pelo painel administrativo. */
  async listAllForAdmin() {
    return this.reports.map((r) => ({ ...r, verification: this.hidden.has(r.id) ? ('removed' as const) : r.verification }));
  }

  async listHistorical() {
    return [...this.historical];
  }

  async submitReport(d: ReportDraft, observedAtIso: string): Promise<SubmitResult> {
    if (!d.district || !d.location || !d.condition || !d.trend) throw new Error('Dados incompletos.');
    const now = new Date().toISOString();
    const id = `novo-${++this.seq}`;
    this.reports.unshift({
      id,
      district: d.district,
      neighborhood: d.neighborhood.trim(),
      street: d.street.trim(),
      nearNumber: d.nearNumber || undefined,
      referencePoint: d.referencePoint || undefined,
      location: d.location,
      condition: d.condition,
      trend: d.trend,
      depth: d.depth,
      hazards: [...d.hazards],
      description: d.description || undefined,
      observedAt: observedAtIso,
      submittedAt: now,
      confirmations: 0,
      verification: 'published_unconfirmed',
      history: [{ at: now, condition: d.condition, trend: d.trend, note: 'Relato enviado (demonstração)' }],
      photoCount: 0,
      example: true,
    });
    this.emit();
    return { id, status: 'published' };
  }

  async moderate(id: string, action: ModerationAction) {
    const r = this.reports.find((x) => x.id === id);
    if (!r) throw new Error('Relato não encontrado.');
    if (action === 'hide') this.hidden.add(id);
    if (action === 'restore') this.hidden.delete(id);
    if (action === 'verify') r.verification = 'verified_by_team';
    r.history.push({ at: new Date().toISOString(), note: `Moderação: ${action} (demonstração)` });
    this.emit();
  }

  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private emit() {
    this.listeners.forEach((fn) => fn());
  }
}
