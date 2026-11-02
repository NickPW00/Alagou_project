import { Crosshair, Info, Save } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import MapView from '../components/LazyMap';
import { ConditionSwatch, SafetyBox } from '../components/ui';
import { dataSource, isDemo } from '../data';
import { clearDraft, isOldDraft, loadDraft, saveDraft, type StoredDraft } from '../data/draftStore';
import type { SubmitResult } from '../data/source';
import { CONDITION_INFO, DEPTH_LABELS, HAZARD_LABELS, TREND_INFO } from '../domain/labels';
import { brasiliaToUtcIso, formatBrasilia, nowInBrasilia } from '../domain/time';
import {
  DEPTH_ESTIMATES,
  DISTRICTS,
  HAZARD_FLAGS,
  STREET_CONDITIONS,
  WATER_TRENDS,
  type District,
  type ReportDraft,
} from '../domain/types';
import { STEPS, isHistorical, validateAll, validateStep, type Errors } from '../domain/validation';

export function emptyDraft(now: Date = new Date()): ReportDraft {
  const { date, time } = nowInBrasilia(now);
  return {
    neighborhood: '',
    street: '',
    nearNumber: '',
    postalCode: '',
    referencePoint: '',
    segmentDescription: '',
    hazards: [],
    description: '',
    observedDate: date,
    observedTime: time,
  };
}

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block font-semibold">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm font-semibold text-severe">
          {error}
        </p>
      )}
    </div>
  );
}

const input = 'h-12 w-full rounded-xl border border-gray-400 bg-white px-3 text-base';

function Choice<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  error,
  render,
}: {
  name: string;
  legend: string;
  options: readonly T[];
  value?: T;
  onChange: (v: T) => void;
  error?: string;
  render: (v: T) => ReactNode;
}) {
  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="mb-3 text-xl font-bold text-navy">{legend}</legend>
      <div className="grid gap-2">
        {options.map((o) => (
          <label
            key={o}
            className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-2 bg-white px-4 py-2 text-base font-medium has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-sky ${value === o ? 'border-navy bg-sky-50' : 'border-gray-200'}`}
          >
            <input type="radio" name={name} value={o} checked={value === o} onChange={() => onChange(o)} className="h-5 w-5 accent-[#062C58]" />
            {render(o)}
          </label>
        ))}
      </div>
      {error && (
        <p id={`${name}-error`} className="mt-2 text-sm font-semibold text-severe">
          {error}
        </p>
      )}
    </fieldset>
  );
}

export default function ReportForm() {
  const [draft, setDraft] = useState<ReportDraft>(() => emptyDraft());
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [geoMsg, setGeoMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // A3: rascunho guardado neste aparelho. Nunca é restaurado sem a pessoa escolher.
  const [pendingDraft, setPendingDraft] = useState<StoredDraft | null>(() => loadDraft());
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (pendingDraft || result) return;
    const t = window.setTimeout(() => {
      const stored = saveDraft(draft, step);
      if (stored) setSavedAt(stored.savedAt);
    }, 300);
    return () => window.clearTimeout(t);
  }, [draft, step, pendingDraft, result]);

  // Grava imediatamente se a página for fechada, recarregada ou escondida antes do intervalo de 300 ms.
  const latest = useRef({ draft, step, active: true });
  latest.current = { draft, step, active: !pendingDraft && !result };
  useEffect(() => {
    const flush = () => latest.current.active && saveDraft(latest.current.draft, latest.current.step);
    const onVisibility = () => document.visibilityState === 'hidden' && flush();
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onVisibility);
      flush(); // ao sair da tela do formulário
    };
  }, []);

  const current = STEPS[step];
  const set = <K extends keyof ReportDraft>(k: K, v: ReportDraft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  // Move o foco para o título ao trocar de etapa (leitores de tela), mas não ao abrir a página.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step, result]);

  const next = () => {
    const e = validateStep(current.id, draft);
    setErrors(e);
    if (Object.keys(e).length === 0) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  };

  const useMyLocation = () => {
    if (!('geolocation' in navigator)) {
      setGeoMsg('Seu navegador não oferece localização. Marque o ponto no mapa.');
      return;
    }
    setGeoMsg('Obtendo localização…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDraft((d) => ({ ...d, location: { lng: pos.coords.longitude, lat: pos.coords.latitude }, locationMethod: 'gps' }));
        setGeoMsg('Localização obtida. Confira o ponto no mapa e arraste se necessário.');
      },
      () => setGeoMsg('Não foi possível obter sua localização (permissão negada ou GPS desativado). Marque o ponto no mapa.'),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const submit = async () => {
    const e = validateAll(draft);
    setErrors(e);
    if (Object.keys(e).length) {
      setSubmitError('Há informações faltando. Volte às etapas indicadas.');
      return;
    }
    const iso = brasiliaToUtcIso(draft.observedDate, draft.observedTime)!;
    setSubmitting(true);
    setSubmitError(null);
    try {
      setResult(await dataSource.submitReport(draft, iso));
      clearDraft();
      setSavedAt(null);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Não foi possível enviar.');
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="space-y-4">
        <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-extrabold text-navy">
          Obrigado por colaborar com o Alag@u!
        </h1>
        <p role="status" className="text-lg">
          Sua informação foi registrada e poderá ajudar outras pessoas.
        </p>
        <p className="rounded-xl bg-sky-50 p-3 font-medium text-navy">
          Situação do relato: {result.status === 'published' ? 'publicado no mapa' : 'aguardando verificação da equipe'}.
          {isDemo && ' (Modo demonstração: o relato existe só nesta aba e some ao recarregar.)'}
        </p>
        <div className="flex flex-wrap gap-2">
          <Link to="/mapa" className="flex min-h-12 items-center rounded-xl bg-navy px-5 font-bold text-white">
            Ver no mapa
          </Link>
          <button
            type="button"
            onClick={() => {
              setDraft(emptyDraft());
              setStep(0);
              setResult(null);
            }}
            className="min-h-12 rounded-xl border border-navy/30 px-5 font-bold text-navy"
          >
            Fazer outro aviso
          </button>
        </div>
      </div>
    );
  }

  if (pendingDraft) {
    const d = pendingDraft.draft;
    const where = [d.street, d.neighborhood, d.district].filter(Boolean).join(', ');
    return (
      <div className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#0E6F99]">Alagou? Conta pra gente!</p>
        <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-extrabold text-navy">
          Você tem um aviso não enviado
        </h1>
        <div className="rounded-2xl border-l-4 border-attention bg-white p-4 shadow-sm">
          <p className="flex items-center gap-2 font-semibold text-ink">
            <Save size={18} aria-hidden="true" /> Salvo só neste aparelho — ainda não enviado
          </p>
          <p className="mt-1 text-sm text-muted">
            Guardado em {formatBrasilia(pendingDraft.savedAt)}
            {where && <> · {where}</>} · etapa {Math.min(pendingDraft.step, STEPS.length - 1) + 1} de {STEPS.length}
          </p>
          {isOldDraft(pendingDraft) && (
            <p className="mt-2 rounded-lg bg-amber-100 p-2 text-sm text-amber-900">
              Este rascunho tem mais de 7 dias. Confira se a situação ainda é a mesma antes de enviar.
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              const base = emptyDraft();
              setDraft({ ...base, ...d, observedDate: d.observedDate || base.observedDate, observedTime: d.observedTime || base.observedTime });
              setStep(Math.min(Math.max(pendingDraft.step, 0), STEPS.length - 1));
              setSavedAt(pendingDraft.savedAt);
              setPendingDraft(null);
            }}
            className="min-h-12 rounded-xl bg-navy px-5 font-bold text-white"
          >
            Continuar de onde parei
          </button>
          <button
            type="button"
            onClick={() => {
              clearDraft();
              setPendingDraft(null);
            }}
            className="min-h-12 rounded-xl border border-navy/30 bg-white px-5 font-bold text-navy"
          >
            Descartar
          </button>
        </div>
      </div>
    );
  }

  const observedIso = brasiliaToUtcIso(draft.observedDate, draft.observedTime);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#0E6F99]">Alagou? Conta pra gente!</p>
        <div className="mt-2 flex items-center gap-2" aria-hidden="true">
          {STEPS.map((s, i) => (
            <span key={s.id} className={`h-2 flex-1 rounded-full ${i <= step ? 'bg-navy' : 'bg-gray-300'}`} />
          ))}
        </div>
        <p className="mt-1 text-sm text-muted">
          Etapa {step + 1} de {STEPS.length}
        </p>
        <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-extrabold text-navy">
          {current.title}
        </h1>
        {savedAt && (
          <p role="status" className="mt-1 flex items-center gap-1 text-xs text-muted">
            <Save size={14} aria-hidden="true" /> Rascunho salvo só neste aparelho às {formatBrasilia(savedAt).slice(-5)} — ainda não enviado.
          </p>
        )}
      </div>

      {!dataSource.canSubmit && (
        <p role="note" className="flex gap-2 rounded-xl bg-amber-100 p-3 text-sm text-amber-900">
          <Info size={18} aria-hidden="true" className="shrink-0" />
          O envio será habilitado quando o banco de dados estiver configurado (Fase 3). Você pode percorrer o formulário.
        </p>
      )}

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (current.id === 'review') void submit();
          else next();
        }}
        className="space-y-4"
      >
        {current.id === 'where' && (
          <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:space-y-0">
            <div className="space-y-4">
            <p className="text-sm text-muted">Informe o local do alagamento — não precisa ser onde você mora.</p>
            <Field id="district" label="Distrito *" error={errors.district}>
              <select id="district" className={input} value={draft.district ?? ''} onChange={(e) => set('district', (e.target.value || undefined) as District | undefined)} aria-invalid={!!errors.district}>
                <option value="">Escolha…</option>
                {DISTRICTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </Field>
            <Field id="neighborhood" label="Bairro *" error={errors.neighborhood}>
              <input id="neighborhood" className={input} value={draft.neighborhood} onChange={(e) => set('neighborhood', e.target.value)} aria-invalid={!!errors.neighborhood} autoComplete="off" />
            </Field>
            <Field id="street" label="Nome da rua ou avenida *" error={errors.street} hint="A busca de endereços com sugestões será adicionada na Fase 3.">
              <input id="street" className={input} value={draft.street} onChange={(e) => set('street', e.target.value)} aria-invalid={!!errors.street} autoComplete="off" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field id="nearNumber" label="Número próximo">
                <input id="nearNumber" className={input} inputMode="numeric" value={draft.nearNumber} onChange={(e) => set('nearNumber', e.target.value)} />
              </Field>
              <Field id="postalCode" label="CEP" error={errors.postalCode}>
                <input id="postalCode" className={input} inputMode="numeric" placeholder="00000-000" value={draft.postalCode} onChange={(e) => set('postalCode', e.target.value)} />
              </Field>
            </div>
            <Field id="referencePoint" label="Ponto de referência">
              <input id="referencePoint" className={input} value={draft.referencePoint} onChange={(e) => set('referencePoint', e.target.value)} />
            </Field>
            <Field id="segmentDescription" label="Descrição do trecho" hint="Ex.: entre a praça e a escola.">
              <input id="segmentDescription" className={input} value={draft.segmentDescription} onChange={(e) => set('segmentDescription', e.target.value)} />
            </Field>

            </div>

            <div className="lg:sticky lg:top-4 lg:self-start">
              <p className="mb-1 font-semibold">Localização no mapa *</p>
              <p className="mb-2 text-sm text-muted">Toque no mapa para marcar o trecho. Depois, arraste o marcador para ajustar.</p>
              <button type="button" onClick={useMyLocation} className="mb-2 flex min-h-12 items-center gap-2 rounded-xl border border-navy/30 bg-white px-4 font-semibold text-navy">
                <Crosshair size={18} aria-hidden="true" /> Usar minha localização
              </button>
              {geoMsg && (
                <p role="status" className="mb-2 text-sm text-navy">
                  {geoMsg}
                </p>
              )}
              <MapView
                className="h-72 overflow-hidden rounded-2xl ring-1 ring-black/10 lg:h-[28rem]"
                label="Mapa para marcar o local do alagamento"
                pick={{ value: draft.location, onPick: (p) => setDraft((d) => ({ ...d, location: p, locationMethod: 'map_pin' })) }}
                focus={draft.locationMethod === 'gps' ? draft.location : null}
              />
              {draft.location ? (
                <p className="mt-1 text-sm font-semibold text-[#1B5E20]">Ponto marcado no mapa.</p>
              ) : (
                errors.location && <p className="mt-1 text-sm font-semibold text-severe">{errors.location}</p>
              )}
            </div>
          </div>
        )}

        {current.id === 'condition' && (
          <Choice
            name="condition"
            legend="Qual é a situação da rua agora?"
            options={STREET_CONDITIONS}
            value={draft.condition}
            onChange={(v) => set('condition', v)}
            error={errors.condition}
            render={(c) => (
              <>
                <ConditionSwatch condition={c} size={20} /> {CONDITION_INFO[c].question}
              </>
            )}
          />
        )}

        {current.id === 'trend' && (
          <Choice
            name="trend"
            legend="A água está subindo ou baixando?"
            options={WATER_TRENDS}
            value={draft.trend}
            onChange={(v) => set('trend', v)}
            error={errors.trend}
            render={(t) => (
              <>
                <span aria-hidden="true" className="w-5 text-center text-xl font-bold">{TREND_INFO[t].arrow}</span> {TREND_INFO[t].question}
              </>
            )}
          />
        )}

        {current.id === 'depth' && (
          <div className="space-y-3">
            <SafetyBox compact />
            <Choice
              name="depth"
              legend="Qual é a profundidade aparente? (opcional)"
              options={DEPTH_ESTIMATES}
              value={draft.depth}
              onChange={(v) => set('depth', v)}
              render={(d) => DEPTH_LABELS[d]}
            />
            <p className="text-xs text-muted">Estimativa visual, à distância. Não é convertida em centímetros.</p>
          </div>
        )}

        {current.id === 'hazards' && (
          <fieldset>
            <legend className="mb-3 text-xl font-bold text-navy">Marque o que você observou (opcional)</legend>
            <div className="grid gap-2">
              {HAZARD_FLAGS.map((h) => (
                <label key={h} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border-2 border-gray-200 bg-white px-4 has-[:checked]:border-navy has-[:checked]:bg-sky-50">
                  <input
                    type="checkbox"
                    checked={draft.hazards.includes(h)}
                    onChange={(e) => set('hazards', e.target.checked ? [...draft.hazards, h] : draft.hazards.filter((x) => x !== h))}
                    className="h-5 w-5 accent-[#062C58]"
                  />
                  {HAZARD_LABELS[h]}
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">Estes relatos não equivalem a confirmação oficial de interdição da via.</p>
          </fieldset>
        )}

        {current.id === 'media' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-dashed border-navy/30 bg-white p-4">
              <p className="font-semibold">Fotografias (até 3, opcional)</p>
              <p className="mt-1 text-sm text-muted">
                O envio de fotos será liberado na Fase 4, depois que estiverem prontos: limite de tamanho, validação de formato, remoção de
                metadados (incluindo localização do celular), armazenamento protegido e moderação.
              </p>
              <p className="mt-2 text-sm">Quando liberado: evite rostos, placas de veículos e números de casas.</p>
            </div>
            <Field id="description" label="Descrição (opcional)" error={errors.description} hint={`${draft.description.length}/1000 caracteres. Não inclua nomes, telefones ou endereços de pessoas.`}>
              <textarea id="description" rows={4} maxLength={1000} className="w-full rounded-xl border border-gray-400 bg-white p-3 text-base" value={draft.description} onChange={(e) => set('description', e.target.value)} />
            </Field>
          </div>
        )}

        {current.id === 'when' && (
          <div className="space-y-4">
            <p className="text-sm text-muted">Horário de Brasília. Já vem preenchido com o momento atual.</p>
            <div className="grid grid-cols-2 gap-3">
              <Field id="observedDate" label="Data da observação" error={errors.observedAt}>
                <input id="observedDate" type="date" className={input} max={nowInBrasilia().date} value={draft.observedDate} onChange={(e) => set('observedDate', e.target.value)} aria-invalid={!!errors.observedAt} />
              </Field>
              <Field id="observedTime" label="Horário da observação">
                <input id="observedTime" type="time" className={input} value={draft.observedTime} onChange={(e) => set('observedTime', e.target.value)} aria-invalid={!!errors.observedAt} />
              </Field>
            </div>
            {observedIso && isHistorical(observedIso) && (
              <p className="rounded-xl bg-purple-50 p-3 text-sm text-purple-900">
                Esta observação tem mais de 24 horas e será identificada como relato histórico.
              </p>
            )}
          </div>
        )}

        {current.id === 'review' && (
          <div className="space-y-3">
            <dl className="divide-y divide-gray-200 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 text-sm">
              {[
                ['Local', `${draft.street}${draft.nearNumber ? `, perto do nº ${draft.nearNumber}` : ''} — ${draft.neighborhood}, ${draft.district}`],
                ['Referência', draft.referencePoint || '—'],
                ['Situação', draft.condition ? CONDITION_INFO[draft.condition].question : '—'],
                ['Água', draft.trend ? TREND_INFO[draft.trend].question : '—'],
                ['Profundidade', draft.depth ? DEPTH_LABELS[draft.depth] : 'Não informada'],
                ['Outros problemas', draft.hazards.length ? draft.hazards.map((h) => HAZARD_LABELS[h]).join(', ') : 'Nenhum'],
                ['Descrição', draft.description || '—'],
                ['Observado em', observedIso ? formatBrasilia(observedIso) : '—'],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[8rem_1fr] gap-2 py-2">
                  <dt className="font-semibold text-muted">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-muted">
              Ao enviar, o relato fica visível publicamente sem seu nome ou e-mail. Ele não substitui alertas da Defesa Civil.
            </p>
            {submitError && (
              <p role="alert" className="rounded-xl bg-red-50 p-3 font-semibold text-severe">
                {submitError}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-2 py-2">
          {step > 0 && (
            <button type="button" onClick={back} className="min-h-12 flex-1 rounded-xl border border-navy/30 bg-white font-bold text-navy">
              Voltar
            </button>
          )}
          {current.id === 'review' ? (
            <button type="submit" disabled={submitting || !dataSource.canSubmit} className="min-h-12 flex-[2] rounded-xl bg-sky text-lg font-black text-navy disabled:opacity-50">
              {submitting ? 'Enviando…' : 'Avisar a comunidade!'}
            </button>
          ) : (
            <button type="submit" className="min-h-12 flex-[2] rounded-xl bg-navy font-bold text-white">
              Continuar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
