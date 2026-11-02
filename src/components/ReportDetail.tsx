import { CheckCircle2, History, RefreshCw, Share2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { DEPTH_LABELS, HAZARD_LABELS, VERIFICATION_LABELS } from '../domain/labels';
import { formatBrasilia, freshnessOf, relativeTime } from '../domain/time';
import type { PublicReport } from '../domain/types';
import { ConditionBadge, FreshnessTag, TrendBadge } from './ui';

export function ReportSummary({ r, now = new Date() }: { r: PublicReport; now?: Date }) {
  const fr = freshnessOf(r.observedAt, now);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ConditionBadge condition={r.condition} freshness={fr} />
      <TrendBadge trend={r.trend} />
      <FreshnessTag freshness={fr} />
    </div>
  );
}

export default function ReportDetail({ report, onClose }: { report: PublicReport; onClose: () => void }) {
  const [showHistory, setShowHistory] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
    setShowHistory(false);
    setNotice(null);
  }, [report.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const fr = freshnessOf(report.observedAt);
  const share = async () => {
    const text = `Alag@u: ${report.street}, ${report.neighborhood} — informação comunitária, não é alerta oficial.`;
    try {
      if (navigator.share) await navigator.share({ title: 'Alag@u', text, url: location.href });
      else {
        await navigator.clipboard.writeText(text);
        setNotice('Texto copiado para compartilhar.');
      }
    } catch {
      /* compartilhamento cancelado */
    }
  };
  const phase4 = () => setNotice('Confirmações e atualizações serão habilitadas na Fase 4 (com login e controle de duplicidade).');

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="dialog"
      aria-modal="false"
      aria-labelledby="report-title"
      className="absolute inset-x-0 bottom-0 z-40 max-h-[75%] overflow-y-auto rounded-t-3xl bg-white p-4 shadow-2xl md:bottom-auto md:left-4 md:right-auto md:top-4 md:max-h-[calc(100%-2rem)] md:w-[26rem] md:rounded-3xl short:top-2 short:max-h-[calc(100%-1rem)]"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <h2 id="report-title" className="text-lg font-bold text-navy">
            {report.street}
            {report.nearNumber ? `, perto do nº ${report.nearNumber}` : ''}
          </h2>
          <p className="text-sm text-muted">
            {report.neighborhood} · Distrito de {report.district}
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="Fechar detalhes" className="grid h-11 w-11 shrink-0 place-items-center rounded-full hover:bg-gray-100">
          <X aria-hidden="true" />
        </button>
      </div>

      <ReportSummary r={report} />
      {fr === 'outdated' && (
        <p className="mt-2 rounded-lg bg-gray-100 p-2 text-sm text-ink">
          Este relato está desatualizado. Isso <strong>não</strong> significa que a água baixou — apenas que não há observação recente.
        </p>
      )}

      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        {report.referencePoint && (<><dt className="text-muted">Referência</dt><dd>{report.referencePoint}</dd></>)}
        <dt className="text-muted">Profundidade</dt>
        <dd>{report.depth ? DEPTH_LABELS[report.depth] : 'Não informada'}</dd>
        <dt className="text-muted">Observado em</dt>
        <dd>
          {formatBrasilia(report.observedAt)} ({relativeTime(report.observedAt)})
        </dd>
        <dt className="text-muted">Enviado em</dt>
        <dd>{formatBrasilia(report.submittedAt)}</dd>
        <dt className="text-muted">Confirmações</dt>
        <dd>{report.confirmations === 0 ? 'Nenhuma confirmação independente' : `${report.confirmations} pessoa(s) diferente(s)`}</dd>
        <dt className="text-muted">Verificação</dt>
        <dd>{VERIFICATION_LABELS[report.verification]}</dd>
        <dt className="text-muted">Fotos</dt>
        <dd>{report.photoCount ? `${report.photoCount}` : 'Sem fotos'}</dd>
      </dl>

      {report.hazards.length > 0 && (
        <div className="mt-3">
          <p className="text-sm font-semibold">Outros problemas relatados</p>
          <ul className="mt-1 flex flex-wrap gap-1">
            {report.hazards.map((h) => (
              <li key={h} className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                {HAZARD_LABELS[h]}
              </li>
            ))}
          </ul>
          <p className="mt-1 text-xs text-muted">Relatos comunitários — não indicam interdição oficial da via.</p>
        </div>
      )}
      {report.description && <p className="mt-3 text-sm">“{report.description}”</p>}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" onClick={phase4} className="flex min-h-11 items-center justify-center gap-1 rounded-xl bg-navy px-3 font-semibold text-white">
          <CheckCircle2 size={18} aria-hidden="true" /> Confirmar situação
        </button>
        <button type="button" onClick={phase4} className="flex min-h-11 items-center justify-center gap-1 rounded-xl bg-sky px-3 font-semibold text-navy">
          <RefreshCw size={18} aria-hidden="true" /> A situação mudou
        </button>
        <button
          type="button"
          onClick={() => setShowHistory((v) => !v)}
          aria-expanded={showHistory}
          className="flex min-h-11 items-center justify-center gap-1 rounded-xl border border-navy/30 px-3 font-semibold text-navy"
        >
          <History size={18} aria-hidden="true" /> Ver histórico
        </button>
        <button type="button" onClick={share} className="flex min-h-11 items-center justify-center gap-1 rounded-xl border border-navy/30 px-3 font-semibold text-navy">
          <Share2 size={18} aria-hidden="true" /> Compartilhar
        </button>
      </div>
      {notice && (
        <p role="status" className="mt-2 rounded-lg bg-sky-50 p-2 text-sm text-navy">
          {notice}
        </p>
      )}
      {showHistory && (
        <ol className="mt-3 space-y-1 border-l-2 border-sky pl-3 text-sm">
          {[...report.history].reverse().map((h, i) => (
            <li key={i}>
              <span className="font-medium">{formatBrasilia(h.at)}</span> — {h.note}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
