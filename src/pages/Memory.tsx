import { Link } from 'react-router-dom';
import { Card, EmptyState, PageHeader, StatusPill } from '../components/ui';
import { useHistorical, useReports } from '../data';
import { FREQUENCY_LABELS } from '../domain/labels';

export default function Memory() {
  const { data: historical, loading } = useHistorical();
  const { data: reports } = useReports();

  // Frequência CALCULADA = nº de relatos no sistema para a mesma rua/bairro (não é frequência real de alagamentos).
  const counted = (street: string, neighborhood: string) =>
    reports.filter((r) => r.street === street && r.neighborhood === neighborhood && r.condition !== 'no_flooding').length;

  return (
    <div className="space-y-5">
      <PageHeader title="Aqui já alagou!" subtitle="Mapa da Memória: a memória comunitária dos alagamentos em Duque de Caxias." />
      <p className="text-sm">
        Veja as ruas com registros históricos. No <Link to="/mapa" className="font-semibold text-navy underline">Mapa ao Vivo</Link>, escolha
        “Histórico” para ativar a camada <em>Histórico de alagamentos</em>.
      </p>
      <p className="rounded-xl bg-purple-50 p-3 text-sm text-purple-900">
        Registros históricos não são evidência de alagamento atual e não constituem classificação oficial de risco.
      </p>

      {loading ? (
        <p role="status">Carregando…</p>
      ) : historical.length === 0 ? (
        <EmptyState title="Ainda não há memórias registradas." />
      ) : (
        <ul className="space-y-2">
          {historical.map((h) => (
            <li key={h.id}>
              <Card>
                <p className="font-semibold text-navy">{h.street}</p>
                <p className="text-sm text-muted">
                  {h.neighborhood} · {h.district}
                </p>
                <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 text-sm">
                  <dt className="text-muted">Período</dt>
                  <dd>{h.periodLabel}</dd>
                  <dt className="text-muted">Frequência percebida</dt>
                  <dd>{FREQUENCY_LABELS[h.perceivedFrequency]}</dd>
                  <dt className="text-muted">Relatos no Alag@u</dt>
                  <dd>{counted(h.street, h.neighborhood)} (frequência calculada a partir dos registros do sistema)</dd>
                </dl>
                {h.description && <p className="mt-2 text-sm">“{h.description}”</p>}
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Card>
        <h2 className="flex items-center gap-2 font-bold text-navy">
          Registrar uma memória <StatusPill status="planejado" />
        </h2>
        <p className="mt-1 text-sm text-muted">
          Na Fase 5 você poderá registrar alagamentos antigos: local, data ou período aproximado, frequência percebida, descrição e foto
          opcional.
        </p>
      </Card>
    </div>
  );
}
