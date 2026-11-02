import { Card, EmptyState, PageHeader, StatusPill } from '../components/ui';
import { isDemo, useHistorical, useReports } from '../data';
import { CONDITION_INFO } from '../domain/labels';
import { DISTRICTS, STREET_CONDITIONS } from '../domain/types';

function Bars({ title, rows }: { title: string; rows: { label: string; value: number; color?: string }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <Card>
      <h2 className="mb-3 font-bold text-navy">{title}</h2>
      <table className="w-full text-sm">
        <caption className="sr-only">{title}</caption>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <th scope="row" className="w-2/5 py-1 pr-2 text-left font-normal">
                {r.label}
              </th>
              <td className="py-1">
                <div className="flex items-center gap-2">
                  <div className="h-4 rounded" style={{ width: `${(r.value / max) * 100}%`, minWidth: r.value ? 4 : 0, background: r.color ?? '#13A3E0' }} />
                  <span className="font-semibold">{r.value}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

export default function Data() {
  const { data: reports, loading } = useReports();
  const { data: historical } = useHistorical();
  const locations = new Set([...reports, ...historical].map((r) => `${r.street}|${r.neighborhood}`)).size;

  return (
    <div className="space-y-5">
      <PageHeader title="Duque de Caxias em Dados" subtitle="Indicadores calculados a partir dos registros do Alag@u.">
        {isDemo && <p className="mt-2 font-semibold text-amber-800">Dados de demonstração — não usar para análise.</p>}
      </PageHeader>

      {loading ? (
        <p role="status">Carregando…</p>
      ) : reports.length === 0 ? (
        <EmptyState title="Ainda não há relatos para calcular indicadores." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { n: reports.length, label: 'relatos' },
              { n: '—', label: 'eventos identificados (Fase 4)' },
              { n: locations, label: 'locais com registros' },
              { n: historical.length, label: 'memórias históricas' },
            ].map((s) => (
              <Card key={s.label} className="text-center">
                <p className="text-3xl font-black text-navy">{s.n}</p>
                <p className="text-xs text-muted">{s.label}</p>
              </Card>
            ))}
          </div>
          <Bars title="Relatos por distrito" rows={DISTRICTS.map((d) => ({ label: d, value: reports.filter((r) => r.district === d).length }))} />
          <Bars
            title="Relatos por situação observada"
            rows={STREET_CONDITIONS.map((c) => ({ label: CONDITION_INFO[c].label, value: reports.filter((r) => r.condition === c).length, color: CONDITION_INFO[c].color }))}
          />
        </>
      )}

      <Card>
        <h2 className="font-bold text-navy">Metodologia e limitações</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>Relatos são observações comunitárias; número de relatos não é número comprovado de eventos.</li>
          <li>A cobertura depende de onde há pessoas participando — áreas sem relatos não são áreas sem alagamento.</li>
          <li>As categorias de situação são descrições visuais, não medições hidrológicas.</li>
        </ul>
      </Card>
      <Card>
        <h2 className="flex items-center gap-2 font-bold text-navy">
          Filtros temporais, gráficos interativos e exportação <StatusPill status="planejado" />
        </h2>
        <p className="mt-1 text-sm text-muted">
          Exportação anonimizada em CSV e GeoJSON (compatível com QGIS/ArcGIS) prevista para a Fase 6, após avaliação de risco de reidentificação.
        </p>
      </Card>
    </div>
  );
}
