import { Map, Megaphone } from 'lucide-react';
import { InstallButton } from '../components/AppStatus';
import { InitiativeBadge } from '../components/Institutional';
import { Link } from 'react-router-dom';
import { ReportSummary } from '../components/ReportDetail';
import { Card, EmptyState, ExampleTag, SafetyBox } from '../components/ui';
import { isDemo, useHistorical, useReports } from '../data';
import { freshnessOf, relativeTime } from '../domain/time';
import { HISTORICAL_AFTER_HOURS } from '../config/settings';

export default function Home() {
  const { data: reports, loading } = useReports();
  const { data: historical } = useHistorical();
  const now = new Date();
  const last24h = reports.filter((r) => now.getTime() - new Date(r.observedAt).getTime() <= HISTORICAL_AFTER_HOURS * 3600000);
  const active = last24h.filter((r) => freshnessOf(r.observedAt, now) !== 'outdated' && r.condition !== 'no_flooding' && r.condition !== 'cannot_assess');
  const activeStreets = new Set(active.map((r) => `${r.street}|${r.neighborhood}`)).size;
  const monitored = new Set([...reports, ...historical].map((r) => `${r.street}|${r.neighborhood}`)).size;
  const latest = [...reports].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)).slice(0, 3);

  return (
    <div className="space-y-5">
      <section className="-mx-4 -mt-4 bg-gradient-to-b from-navy to-navy-700 px-4 pb-8 pt-6 text-white sm:rounded-b-3xl">
        <h1 className="text-5xl font-black tracking-tight sm:text-6xl">Alag@u</h1>
        <p className="mt-1 text-2xl font-bold text-sky">Alagou? Avisou!</p>
        <p className="mt-1 text-base text-white/90">Monitoramento Comunitário de Alagamentos</p>
        <p className="mt-1 text-sm text-white/80">Duque de Caxias · RJ</p>
        <InitiativeBadge />
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link to="/mapa" className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-white text-lg font-bold text-navy shadow">
            <Map aria-hidden="true" /> Ver mapa ao vivo
          </Link>
          <Link to="/avisar" className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-sky text-lg font-bold text-navy shadow">
            <Megaphone aria-hidden="true" /> Avisar alagamento
          </Link>
          <InstallButton className="sm:col-span-2" />
        </div>
      </section>

      <section aria-labelledby="resumo">
        <h2 id="resumo" className="mb-2 text-lg font-bold text-navy">
          Resumo {isDemo && <span className="text-sm font-semibold text-amber-800">(dados de demonstração)</span>}
        </h2>
        {loading ? (
          <p role="status" className="text-muted">Carregando…</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {[
              { n: last24h.length, label: 'relatos nas últimas 24 h' },
              { n: activeStreets, label: 'ruas com relatos ativos de água' },
              { n: monitored, label: 'localidades com registros' },
            ].map((s) => (
              <Card key={s.label} className="text-center">
                <p className="text-3xl font-black text-navy">{s.n}</p>
                <p className="text-xs leading-tight text-muted">{s.label}</p>
              </Card>
            ))}
          </div>
        )}
        <p className="mt-2 text-xs text-muted">Números calculados a partir dos relatos registrados. Relatos não são eventos comprovados.</p>
      </section>

      <section aria-labelledby="ultimas">
        <h2 id="ultimas" className="mb-2 text-lg font-bold text-navy">Últimas atualizações comunitárias</h2>
        {!loading && latest.length === 0 ? (
          <EmptyState title="Ainda não há relatos registrados.">
            Quando alguém avisar um alagamento, ele aparecerá aqui. A ausência de relatos não significa ausência de risco.
          </EmptyState>
        ) : (
          <ul className="space-y-2">
            {latest.map((r) => (
              <li key={r.id}>
                <Card>
                  <p className="font-semibold text-navy">
                    {r.street}
                    <ExampleTag show={r.example} />
                  </p>
                  <p className="mb-2 text-sm text-muted">
                    {r.neighborhood} · {r.district} · {relativeTime(r.observedAt)}
                  </p>
                  <ReportSummary r={r} />
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="oficiais">
        <h2 id="oficiais" className="mb-2 text-lg font-bold text-navy">Avisos oficiais</h2>
        <EmptyState title="Nenhum aviso oficial integrado ainda.">
          A integração com fontes oficiais está prevista para a Fase 5.{' '}
          <Link to="/alertas" className="font-semibold text-navy underline">Ver fontes oficiais</Link>
        </EmptyState>
      </section>

      <SafetyBox />
    </div>
  );
}
