import { CheckCircle2, ChevronDown, ExternalLink, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Logo } from '../components/Institutional';
import { Card, PageHeader, SafetyBox } from '../components/ui';
import { INSTITUTIONAL_LINKS } from '../config/settings';
import { DRAFT_NOTICE, MODULES, QUIZ, type Block } from '../content/aprenda';

function DraftTag() {
  return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">{DRAFT_NOTICE}</span>;
}

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-2 text-[15px] leading-relaxed">
      {blocks.map((b, i) =>
        'h' in b ? (
          <h3 key={i} className="pt-2 font-bold text-navy">
            {b.h}
          </h3>
        ) : 'p' in b ? (
          <p key={i}>{b.p}</p>
        ) : 'list' in b ? (
          <ul key={i} className="list-disc space-y-1 pl-5">
            {b.list.map((li) => (
              <li key={li}>{li}</li>
            ))}
          </ul>
        ) : (
          <p key={i} className="rounded-lg bg-sky-50 p-2 text-sm text-navy">
            {b.tip}
          </p>
        ),
      )}
    </div>
  );
}

/** Quiz do módulo 2: cada pergunta mostra se acertou e explica a resposta. */
function Quiz() {
  const [answers, setAnswers] = useState<(number | null)[]>(() => QUIZ.map(() => null));
  const done = answers.filter((a) => a !== null).length;
  const right = answers.filter((a, i) => a === QUIZ[i].answer).length;
  return (
    <Card>
      <h2 className="text-lg font-bold text-navy">Teste seus conhecimentos</h2>
      <p className="text-sm text-muted">Quatro perguntas rápidas. Funciona mesmo sem internet.</p>
      <ol className="mt-3 space-y-4">
        {QUIZ.map((q, qi) => {
          const chosen = answers[qi];
          return (
            <li key={q.q}>
              <fieldset>
                <legend className="font-semibold">
                  {qi + 1}. {q.q}
                </legend>
                <div className="mt-2 grid gap-2">
                  {q.options.map((opt, oi) => {
                    const isChosen = chosen === oi;
                    const correct = oi === q.answer;
                    return (
                      <label
                        key={opt}
                        className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-2 px-3 has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-sky ${
                          chosen === null ? 'border-gray-200 bg-white' : correct ? 'border-ok bg-green-50' : isChosen ? 'border-severe bg-red-50' : 'border-gray-200 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`quiz-${qi}`}
                          checked={isChosen}
                          disabled={chosen !== null}
                          onChange={() => setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)))}
                          className="h-5 w-5 accent-[#062C58]"
                        />
                        {opt}
                      </label>
                    );
                  })}
                </div>
                {chosen !== null && (
                  <p role="status" className={`mt-2 flex items-start gap-2 text-sm ${chosen === q.answer ? 'text-[#1B5E20]' : 'text-severe'}`}>
                    {chosen === q.answer ? <CheckCircle2 size={18} aria-hidden="true" className="shrink-0" /> : <XCircle size={18} aria-hidden="true" className="shrink-0" />}
                    <span>
                      <strong>{chosen === q.answer ? 'Acertou!' : 'Não é essa.'}</strong> {q.explain}
                    </span>
                  </p>
                )}
              </fieldset>
            </li>
          );
        })}
      </ol>
      {done === QUIZ.length && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p role="status" className="font-bold text-navy">
            Você acertou {right} de {QUIZ.length}.
          </p>
          <button type="button" onClick={() => setAnswers(QUIZ.map(() => null))} className="min-h-11 rounded-xl border border-navy/30 px-4 font-semibold text-navy">
            Refazer
          </button>
        </div>
      )}
    </Card>
  );
}

export default function Learn() {
  return (
    <div className="space-y-5">
      <PageHeader title="Aprenda e Previna" subtitle="Educação ambiental com linguagem simples e base científica." />
      <p className="text-sm">
        <DraftTag /> Os textos abaixo são uma primeira versão e serão revisados pela equipe científica do projeto antes da publicação definitiva.
      </p>
      <SafetyBox />

      <ul className="space-y-3">
        {MODULES.map((m) => (
          <li key={m.n}>
            <details className="group rounded-2xl bg-white shadow-sm ring-1 ring-black/5 open:ring-navy/20">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 rounded-2xl p-4 [&::-webkit-details-marker]:hidden">
                <span>
                  <span className="block text-xs font-bold uppercase text-[#0E6F99]">Módulo {m.n}</span>
                  <span className="block text-lg font-bold text-navy">{m.title}</span>
                  <span className="block text-sm text-muted">{m.intro}</span>
                </span>
                <ChevronDown aria-hidden="true" className="shrink-0 text-navy transition-transform group-open:rotate-180" />
              </summary>
              <div className="border-t border-navy/10 px-4 pb-4 pt-2">
                <Blocks blocks={m.blocks} />
              </div>
            </details>
          </li>
        ))}
        <li>
          <Card>
            <p className="text-xs font-bold uppercase text-[#0E6F99]">Módulo 6</p>
            <h2 className="text-lg font-bold text-navy">Meninas pelo Clima</h2>
            <Logo name="mpc" className="my-2 h-28" />
            <p className="mt-1 text-sm">
              Projeto de pesquisa e extensão da UERJ, vinculado ao LabPENSo, com estudantes de escolas públicas de Duque de Caxias: educação
              científica, justiça climática, ciência cidadã e protagonismo de meninas e mulheres.
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <a href={INSTITUTIONAL_LINKS.project} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-navy underline">
                  labpenso.org/meninaspeloclima <ExternalLink size={14} aria-hidden="true" />
                </a>
              </li>
              <li>
                <a href={INSTITUTIONAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-navy underline">
                  Instagram @meninas.pelo.clima <ExternalLink size={14} aria-hidden="true" />
                </a>
              </li>
            </ul>
          </Card>
        </li>
      </ul>

      <Quiz />

      <Card>
        <h2 className="font-bold text-navy">Onde conferir as orientações oficiais</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>
            <a href="https://www.gov.br/cemaden/pt-br" target="_blank" rel="noopener noreferrer" className="underline">
              Cemaden — Centro Nacional de Monitoramento e Alertas de Desastres Naturais
            </a>
          </li>
          <li>
            <a href="https://defesacivil.rj.gov.br/" target="_blank" rel="noopener noreferrer" className="underline">
              Defesa Civil do Estado do Rio de Janeiro
            </a>
          </li>
        </ul>
        <p className="mt-2 text-xs text-muted">A lista de referências científicas será definida pela equipe do projeto. Ilustrações, vídeos e materiais para download virão na Fase 6.</p>
      </Card>
    </div>
  );
}
