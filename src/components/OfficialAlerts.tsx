// A7 — Avisos OFICIAIS do INMET (visual separado das atualizações comunitárias).
import { ExternalLink, Landmark } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatBrasilia } from '../domain/time';
import { fetchAlerts, INMET_AVISOS_SITE, loadCachedAlerts, stillValid, type CachedAlerts } from '../weather/inmet';

export default function OfficialAlerts() {
  const [state, setState] = useState<{ data: CachedAlerts | null; status: 'loading' | 'ok' | 'stale' | 'error' }>(() => ({ data: loadCachedAlerts(), status: 'loading' }));
  useEffect(() => {
    const ctrl = new AbortController();
    fetchAlerts(ctrl.signal)
      .then((data) => setState({ data, status: 'ok' }))
      .catch(() => {
        if (ctrl.signal.aborted) return;
        const c = loadCachedAlerts();
        setState({ data: c, status: c ? 'stale' : 'error' });
      });
    return () => ctrl.abort();
  }, []);

  const alerts = stillValid(state.data);
  return (
    <section aria-labelledby="oficial">
      <h2 id="oficial" className="mb-2 flex items-center gap-2 text-lg font-bold text-navy">
        <Landmark size={20} aria-hidden="true" /> Avisos oficiais do INMET
      </h2>
      {state.status === 'loading' && !state.data && (
        <p role="status" className="text-muted">
          Consultando os avisos do INMET…
        </p>
      )}
      {state.status === 'error' && (
        <p role="alert" className="rounded-xl bg-gray-100 p-3 text-sm">
          Não foi possível consultar os avisos do INMET agora. Consulte os canais oficiais abaixo.
        </p>
      )}
      {state.status === 'stale' && state.data && (
        <p role="status" className="mb-2 rounded-xl bg-gray-100 p-3 text-sm">
          Sem conexão com o INMET. Mostrando os avisos consultados em {formatBrasilia(state.data.fetchedAt)} — podem estar desatualizados.
        </p>
      )}
      {state.data && alerts.length === 0 && (
        <p className="rounded-xl border border-dashed border-navy/30 bg-white p-4 text-sm">
          Nenhum aviso do INMET vigente para Duque de Caxias. <strong>A ausência de aviso não significa ausência de risco.</strong>
        </p>
      )}
      <ul className="space-y-3">
        {alerts.map((a) => (
          <li key={a.id}>
            <article aria-labelledby={`aviso-${a.id}`} className="rounded-2xl border-l-8 bg-white p-4 shadow-sm ring-1 ring-black/5" style={{ borderLeftColor: a.color }}>
              <p className="text-xs font-bold uppercase tracking-wide text-navy">Aviso oficial · INMET</p>
              <h3 id={`aviso-${a.id}`} className="mt-0.5 text-lg font-bold text-ink">
                {a.title}
              </h3>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-full border border-ink/20 px-2 py-0.5 font-semibold" style={{ background: a.color, color: '#1A1A1A' }}>
                  {a.severity}
                </span>
                <span className="text-muted">(severidade como emitida pelo INMET)</span>
              </p>
              <p className="mt-2 text-sm">
                <strong>{a.when === 'futuro' ? 'Previsto' : 'Vigente'}:</strong> {a.startIso ? formatBrasilia(a.startIso) : '—'} até {formatBrasilia(a.endIso)}
              </p>
              {a.risks.length > 0 && (
                <>
                  <p className="mt-2 text-sm font-semibold">Riscos</p>
                  <ul className="list-disc pl-5 text-sm">
                    {a.risks.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </>
              )}
              {a.instructions.length > 0 && (
                <>
                  <p className="mt-2 text-sm font-semibold">Orientações</p>
                  <ul className="list-disc pl-5 text-sm">
                    {a.instructions.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </>
              )}
              <p className="mt-3 text-xs text-muted">
                Fonte: INMET — Instituto Nacional de Meteorologia · código {a.code} · consultado em {formatBrasilia(state.data!.fetchedAt)}.{' '}
                <a href={INMET_AVISOS_SITE} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 underline">
                  Ver avisos no INMET <ExternalLink size={12} aria-hidden="true" />
                  <span className="sr-only"> (abre em nova aba)</span>
                </a>
              </p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
