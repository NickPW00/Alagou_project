import { useCallback, useEffect, useState } from 'react';
import { ReportSummary } from '../components/ReportDetail';
import { Card, EmptyState, ExampleTag, PageHeader, StatusPill } from '../components/ui';
import { dataSource, isDemo } from '../data';
import { DemoSource } from '../data/demo';
import type { ModerationAction } from '../data/source';
import { VERIFICATION_LABELS } from '../domain/labels';
import { formatBrasilia } from '../domain/time';
import type { PublicReport } from '../domain/types';

function DemoModeration() {
  const src = dataSource as DemoSource;
  const [items, setItems] = useState<PublicReport[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const load = useCallback(async () => setItems(await src.listAllForAdmin()), [src]);
  useEffect(() => {
    void load();
    return src.subscribe(() => void load());
  }, [load, src]);

  const act = async (id: string, a: ModerationAction) => {
    await src.moderate(id, a);
    setMsg(`Ação “${a}” aplicada ao relato ${id} e registrada no histórico (demonstração).`);
  };

  return (
    <section aria-labelledby="fila" className="space-y-2">
      <h2 id="fila" className="font-bold text-navy">Fila de moderação (demonstração)</h2>
      {msg && (
        <p role="status" className="rounded-lg bg-sky-50 p-2 text-sm text-navy">
          {msg}
        </p>
      )}
      <ul className="space-y-2">
        {items.map((r) => (
          <li key={r.id}>
            <Card>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-navy">
                    {r.street} <span className="text-xs text-muted">({r.id})</span>
                    <ExampleTag show={r.example} />
                  </p>
                  <p className="text-sm text-muted">
                    {r.neighborhood} · {r.district} · enviado {formatBrasilia(r.submittedAt)}
                  </p>
                  <p className="text-sm">Estado: {VERIFICATION_LABELS[r.verification]}</p>
                </div>
                <ReportSummary r={r} />
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {r.verification === 'removed' ? (
                  <button type="button" onClick={() => act(r.id, 'restore')} className="min-h-11 rounded-xl border border-navy/30 px-3 font-semibold text-navy">
                    Restaurar
                  </button>
                ) : (
                  <>
                    <button type="button" onClick={() => act(r.id, 'verify')} className="min-h-11 rounded-xl bg-ok px-3 font-semibold text-white">
                      Marcar como verificado
                    </button>
                    <button type="button" onClick={() => act(r.id, 'hide')} className="min-h-11 rounded-xl bg-severe px-3 font-semibold text-white">
                      Ocultar do público
                    </button>
                  </>
                )}
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Admin() {
  return (
    <div className="space-y-5">
      <PageHeader title="Painel administrativo" subtitle="Moderação, conteúdos, alertas supervisionados e exportações." />
      <p className="rounded-xl bg-amber-100 p-3 text-sm text-amber-900">
        Esboço visual da Fase 2. A proteção real (login, papéis e regras de acesso no banco de dados) será implementada na Fase 3 — esconder
        botões na tela não é considerado segurança.
      </p>
      {isDemo ? <DemoModeration /> : <EmptyState title="Acesso restrito.">Entre com uma conta autorizada (disponível a partir da Fase 3).</EmptyState>}
      <div className="grid gap-2 sm:grid-cols-2">
        {[
          ['Fotos pendentes de revisão', 'Fase 4'],
          ['Denúncias', 'Fase 4'],
          ['Agrupamento de relatos em eventos', 'Fase 4'],
          ['Avisos oficiais (cadastro supervisionado com link de origem)', 'Fase 5'],
          ['Conteúdos educativos', 'Fase 6'],
          ['Exportação de dados anonimizados', 'Fase 6'],
        ].map(([t, f]) => (
          <Card key={t}>
            <p className="font-semibold text-navy">{t}</p>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted">
              <StatusPill status="planejado" /> {f}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
