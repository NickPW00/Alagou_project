import { Layers, List, Map as MapIcon, Search, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Legend from '../components/Legend';
import MapView from '../components/LazyMap';
import ReportDetail, { ReportSummary } from '../components/ReportDetail';
import { EmptyState, ExampleTag } from '../components/ui';
import { useHistorical, useReports } from '../data';
import { filterReports, type ReportFilter } from '../domain/filters';
import { FREQUENCY_LABELS } from '../domain/labels';
import { formatBrasilia } from '../domain/time';
import { DISTRICTS, type District, type PublicReport } from '../domain/types';

function DistrictSelect({ value, onChange, className = '' }: { value: District | ''; onChange: (d: District | '') => void; className?: string }) {
  return (
    <label className={className}>
      <span className="sr-only">Filtrar por distrito</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as District | '')}
        className="h-11 w-full max-w-[11rem] rounded-full border border-gray-300 bg-white px-3"
      >
        <option value="">Todos os distritos</option>
        {DISTRICTS.map((d) => (
          <option key={d}>{d}</option>
        ))}
      </select>
    </label>
  );
}

function ReportList({ reports, onSelect }: { reports: PublicReport[]; onSelect: (id: string) => void }) {
  return (
    <>
      <h2 className="mb-2 font-bold text-navy">{reports.length} relato(s)</h2>
      <ul className="space-y-2">
        {reports.map((r) => (
          <li key={r.id}>
            <button type="button" onClick={() => onSelect(r.id)} className="w-full rounded-2xl bg-white p-3 text-left shadow-sm ring-1 ring-black/5">
              <p className="font-semibold text-navy">
                {r.street}
                <ExampleTag show={r.example} />
              </p>
              <p className="mb-1 text-sm text-muted">
                {r.neighborhood} · {r.district} · {formatBrasilia(r.observedAt)}
              </p>
              <ReportSummary r={r} />
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function LiveMap() {
  const { data: reports, loading, error, updatedAt } = useReports();
  const { data: historical } = useHistorical();
  const [filter, setFilter] = useState<ReportFilter>({ query: '', district: '', period: 'now' });
  const [view, setView] = useState<'map' | 'list'>('map');
  const [mapStatus, setMapStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedHist, setSelectedHist] = useState<string | null>(null);
  const [legendOpen, setLegendOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const visible = useMemo(() => filterReports(reports, filter), [reports, filter]);
  const showHistorical = filter.period === 'history';
  const histVisible = historical.filter((h) => (filter.district ? h.district === filter.district : true));
  const report = reports.find((r) => r.id === selected) ?? null;
  const hist = historical.find((h) => h.id === selectedHist) ?? null;
  const listMode = view === 'list' || mapStatus === 'error';
  const activeFilters = (filter.district ? 1 : 0) + (filter.period === 'history' ? 1 : 0);
  const status = loading ? 'Carregando relatos…' : error ? `Erro: ${error}` : updatedAt ? `Atualizado às ${formatBrasilia(updatedAt.toISOString()).slice(-5)}` : '';
  const select = (id: string) => {
    setSelectedHist(null);
    setSelected(id);
  };

  return (
    <div className="absolute inset-x-0 top-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] flex flex-col md:bottom-0">
      {/* Barra de filtros. Em telas ≤ 479 px e em celular deitado, os filtros ficam atrás do botão "Filtros". */}
      <div className="z-30 space-y-2 bg-white/95 p-2 shadow lg:p-3 short:space-y-1 short:p-1.5">
        <div className="flex gap-2">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Pesquisar rua ou bairro</span>
            <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={filter.query}
              onChange={(e) => setFilter({ ...filter, query: e.target.value })}
              placeholder="Pesquisar rua ou bairro"
              className="h-11 w-full rounded-full border border-gray-300 pl-10 pr-3"
            />
          </label>
          <DistrictSelect className="hidden min-[480px]:block short:hidden" value={filter.district} onChange={(d) => setFilter({ ...filter, district: d })} />
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            aria-controls="filtros-mapa"
            className="flex h-11 shrink-0 items-center gap-1 rounded-full border border-navy/30 bg-white px-3 font-semibold text-navy min-[480px]:hidden short:flex"
          >
            <SlidersHorizontal size={16} aria-hidden="true" />
            Filtros{activeFilters > 0 && <span className="rounded-full bg-navy px-1.5 text-xs text-white">{activeFilters}</span>}
          </button>
        </div>
        <div id="filtros-mapa" className={`flex-wrap items-center gap-2 text-sm ${filtersOpen ? 'flex' : 'hidden min-[480px]:flex short:hidden'}`}>
          <DistrictSelect className="w-full min-[480px]:hidden short:block short:w-auto" value={filter.district} onChange={(d) => setFilter({ ...filter, district: d })} />
          <div role="group" aria-label="Período" className="flex rounded-full bg-gray-100 p-1">
            {(['now', 'history'] as const).map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={filter.period === p}
                onClick={() => setFilter({ ...filter, period: p })}
                className={`min-h-9 rounded-full px-3 font-semibold ${filter.period === p ? 'bg-navy text-white' : 'text-navy'}`}
              >
                {p === 'now' ? 'Agora (24 h)' : 'Histórico'}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setView(view === 'map' ? 'list' : 'map')}
            disabled={mapStatus === 'error'}
            className="flex min-h-9 items-center gap-1 rounded-full border border-navy/30 px-3 font-semibold text-navy disabled:opacity-50 min-[1440px]:hidden"
          >
            {view === 'map' ? <List size={16} aria-hidden="true" /> : <MapIcon size={16} aria-hidden="true" />}
            {view === 'map' ? 'Ver lista' : 'Ver mapa'}
          </button>
          <button
            type="button"
            onClick={() => setLegendOpen((v) => !v)}
            aria-expanded={legendOpen}
            aria-controls="legenda"
            className="flex min-h-9 items-center gap-1 rounded-full border border-navy/30 px-3 font-semibold text-navy"
          >
            <Layers size={16} aria-hidden="true" /> Legenda
          </button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1">
        {/* Telas ≥ 1440 px: lista fixa ao lado do mapa. */}
        <aside aria-label="Lista de relatos" className="hidden w-96 shrink-0 overflow-y-auto border-r border-black/10 bg-[#f5f8fb] p-3 min-[1440px]:block">
          <ReportList reports={visible} onSelect={select} />
        </aside>

        <div className="relative min-w-0 flex-1">
          <div className={`absolute inset-0 ${listMode ? 'invisible min-[1440px]:visible' : ''}`}>
            <MapView
              className="h-full w-full"
              label="Mapa de relatos de alagamento em Duque de Caxias"
              reports={visible}
              historical={histVisible}
              showHistorical={showHistorical}
              onSelectReport={select}
              onSelectHistorical={(id) => {
                setSelected(null);
                setSelectedHist(id);
              }}
              focus={report?.location ?? null}
              onStatus={setMapStatus}
            />
          </div>

          <p aria-live="polite" className="pointer-events-none absolute left-2 top-2 z-20 rounded-full bg-white/90 px-2 py-0.5 text-xs text-ink shadow">
            {status}
          </p>

          {legendOpen && (
            <div id="legenda" className="absolute left-2 top-9 z-30 max-h-[calc(100%-2.75rem)] w-64 overflow-y-auto rounded-2xl bg-white p-3 shadow-lg">
              <Legend showHistorical={showHistorical} />
            </div>
          )}

          {listMode && (
            <div className="absolute inset-0 overflow-y-auto bg-[#f5f8fb] p-3 pb-6 min-[1440px]:hidden">
              {mapStatus === 'error' && (
                <p role="alert" className="mb-3 rounded-xl bg-amber-100 p-3 text-sm text-amber-900">
                  O mapa não pôde ser carregado. Mostrando os relatos em lista.
                </p>
              )}
              <ReportList reports={visible} onSelect={select} />
            </div>
          )}

          {!loading && visible.length === 0 && !report && (
            <div className="pointer-events-none absolute inset-x-3 bottom-4 z-20 md:left-auto md:w-96">
              <div className="pointer-events-auto">
                <EmptyState title="Nenhum relato para este filtro.">
                  A ausência de relatos não significa ausência de risco.{' '}
                  <Link to="/avisar" className="font-semibold text-navy underline">
                    Avisar alagamento
                  </Link>
                </EmptyState>
              </div>
            </div>
          )}

          {report && <ReportDetail report={report} onClose={() => setSelected(null)} />}
          {hist && (
            <div
              role="dialog"
              aria-label="Registro histórico"
              className="absolute inset-x-0 bottom-0 z-40 max-h-[75%] overflow-y-auto rounded-t-3xl bg-white p-4 shadow-2xl md:bottom-auto md:left-4 md:right-auto md:top-4 md:max-h-[calc(100%-2rem)] md:w-96 md:rounded-3xl"
            >
              <p className="text-xs font-bold uppercase text-[#6A1B9A]">Aqui já alagou! (histórico)</p>
              <h2 className="text-lg font-bold text-navy">
                {hist.street}
                <ExampleTag show={hist.example} />
              </h2>
              <p className="text-sm text-muted">
                {hist.neighborhood} · {hist.district}
              </p>
              <p className="mt-2 text-sm">Período: {hist.periodLabel}</p>
              <p className="text-sm">Frequência percebida: {FREQUENCY_LABELS[hist.perceivedFrequency]}</p>
              {hist.description && <p className="mt-2 text-sm">“{hist.description}”</p>}
              <p className="mt-2 text-xs text-muted">Registro histórico não é evidência de alagamento atual.</p>
              <button type="button" onClick={() => setSelectedHist(null)} className="mt-3 min-h-11 rounded-xl border border-navy/30 px-4 font-semibold text-navy">
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
