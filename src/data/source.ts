import type { DataMode } from '../config/settings';
import type { HistoricalReport, PublicReport, ReportDraft } from '../domain/types';

export type SubmitResult = { id: string; status: 'published' | 'pending_review' };
export type ModerationAction = 'hide' | 'restore' | 'verify';

/**
 * Contrato da camada de dados. A Fase 2 tem duas implementações:
 *  - `demo`: dados FICTÍCIOS em memória, só para avaliação visual (faixa de demonstração sempre visível);
 *  - `none`: nenhum backend — tudo vazio, como em produção antes da Fase 3.
 * A Fase 3 adicionará a implementação Supabase (PostgreSQL/PostGIS + Realtime).
 */
export interface DataSource {
  readonly mode: DataMode;
  readonly canSubmit: boolean;
  listReports(): Promise<PublicReport[]>;
  listHistorical(): Promise<HistoricalReport[]>;
  submitReport(draft: ReportDraft, observedAtIso: string): Promise<SubmitResult>;
  moderate(reportId: string, action: ModerationAction): Promise<void>;
  /** Notifica quando os dados mudam. Retorna função para cancelar. */
  subscribe(onChange: () => void): () => void;
}

export class NoBackendSource implements DataSource {
  readonly mode = 'none' as const;
  readonly canSubmit = false;
  async listReports() {
    return [];
  }
  async listHistorical() {
    return [];
  }
  async submitReport(): Promise<SubmitResult> {
    throw new Error('O envio de relatos será habilitado quando o banco de dados estiver configurado (Fase 3).');
  }
  async moderate() {
    throw new Error('Moderação indisponível sem banco de dados.');
  }
  subscribe() {
    return () => {};
  }
}
