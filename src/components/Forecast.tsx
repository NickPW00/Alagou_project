// A7 — Previsão de chuva por distrito (Open-Meteo). Previsão de modelo: NÃO é aviso oficial.
import { CloudRain, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DISTRICTS, type District } from '../domain/types';
import { formatBrasilia } from '../domain/time';
import { fetchForecast, loadCached, next24, OPEN_METEO_SITE, summarize, type Cached } from '../weather/openMeteo';

const hourLabel = (iso: string) => formatBrasilia(iso).slice(-5);

export default function Forecast() {
  const [state, setState] = useState<{ data: Cached | null; status: 'loading' | 'ok' | 'stale' | 'error'; error?: string }>(() => ({ data: loadCached(), status: 'loading' }));
  const [district, setDistrict] = useState<District>('Duque de Caxias');

  useEffect(() => {
    const ctrl = new AbortController();
    fetchForecast(ctrl.signal)
      .then((data) => setState({ data, status: 'ok' }))
      .catch((e: Error) => {
        if (ctrl.signal.aborted) return;
        const cached = loadCached();
        setState({ data: cached, status: cached ? 'stale' : 'error', error: e.message });
      });
    return () => ctrl.abort();
  }, []);

  const f = state.data?.data.find((d) => d.district === district);
  const hours = f ? next24(f.hours) : [];
  const s = summarize(hours);
  const max = Math.max(1, ...hours.map((h) => h.mm));

  return (
    <section aria-labelledby="previsao" className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
      <h2 id="previsao" className="flex items-center gap-2 text-lg font-bold text-navy">
        <CloudRain size={20} aria-hidden="true" /> Previsão de chuva — próximas 24 horas
      </h2>
      <p className="mt-1 inline-block rounded-lg bg-amber-100 px-2 py-1 text-sm font-semibold text-amber-900">
        Previsão de modelo meteorológico — não é aviso oficial.
      </p>

      <label className="mt-3 block">
        <span className="mb-1 block text-sm font-semibold">Distrito</span>
        <select value={district} onChange={(e) => setDistrict(e.target.value as District)} className="h-11 w-full max-w-xs rounded-xl border border-gray-400 bg-white px-3">
          {DISTRICTS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </label>

      {state.status === 'loading' && !state.data && (
        <p role="status" className="mt-3 text-muted">
          Consultando a previsão…
        </p>
      )}
      {state.status === 'error' && (
        <p role="alert" className="mt-3 rounded-lg bg-gray-100 p-3 text-sm">
          Não foi possível consultar a previsão agora e não há previsão salva neste aparelho. Consulte os canais oficiais abaixo.
        </p>
      )}
      {state.status === 'stale' && state.data && (
        <p role="status" className="mt-3 rounded-lg bg-gray-100 p-3 text-sm">
          Sem conexão com o serviço de previsão. Mostrando a previsão consultada em {formatBrasilia(state.data.fetchedAt)} — pode estar desatualizada.
        </p>
      )}

      {f && hours.length > 0 && (
        <>
          <p className="mt-3 text-[15px]" data-testid="resumo-previsao">
            {s.totalMm > 0 ? (
              <>
                Chuva prevista: <strong>{s.totalMm.toLocaleString('pt-BR')} mm</strong> nas próximas 24 h
                {s.peak && (
                  <>
                    , com mais chuva por volta das <strong>{hourLabel(s.peak.iso)}</strong> ({s.peak.mm.toLocaleString('pt-BR')} mm em 1 h)
                  </>
                )}
                .
              </>
            ) : (
              <>Nenhuma chuva prevista pelo modelo nas próximas 24 h.</>
            )}
            {s.maxProb !== null && <> Maior chance de chuva: {s.maxProb}%.</>}
          </p>
          <div className="mt-3 overflow-x-auto" tabIndex={0} role="region" aria-label="Tabela de chuva por hora (role para os lados)">
            <table className="w-full min-w-[34rem] border-separate border-spacing-x-0.5 text-center text-[11px]">
              <caption className="sr-only">Chuva prevista por hora para o distrito de {district}, em milímetros, e chance de chuva</caption>
              <tbody>
                <tr>
                  {hours.map((h) => (
                    <td key={h.iso} className="h-24 align-bottom">
                      <div className="mx-auto w-3 rounded-t bg-sky" style={{ height: `${Math.max(h.mm > 0 ? 4 : 1, (h.mm / max) * 80)}px` }} aria-hidden="true" />
                    </td>
                  ))}
                </tr>
                <tr className="font-semibold">
                  {hours.map((h) => (
                    <td key={h.iso}>{h.mm.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}</td>
                  ))}
                </tr>
                <tr className="text-muted">
                  {hours.map((h) => (
                    <td key={h.iso}>{h.prob === null ? '—' : `${h.prob}%`}</td>
                  ))}
                </tr>
                <tr>
                  {hours.map((h) => (
                    <th key={h.iso} scope="col" className="font-normal">
                      {hourLabel(h.iso).slice(0, 2)}h
                    </th>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-1 text-xs text-muted">Linhas: chuva em mm em cada hora · chance de chuva · hora (Brasília). Ponto de referência no centro aproximado do distrito.</p>
        </>
      )}

      <p className="mt-3 text-xs text-muted">
        Fonte:{' '}
        <a href={OPEN_METEO_SITE} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 underline">
          Open-Meteo.com <ExternalLink size={12} aria-hidden="true" />
        </a>{' '}
        (licença CC BY 4.0), que combina modelos meteorológicos.
        {state.data && <> Consultado em {formatBrasilia(state.data.fetchedAt)}.</>} Para avisos oficiais, consulte o INMET e a Defesa Civil.
      </p>
    </section>
  );
}
