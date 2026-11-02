import { ExternalLink, Users } from 'lucide-react';
import Forecast from '../components/Forecast';
import OfficialAlerts from '../components/OfficialAlerts';
import { Card, PageHeader, SafetyBox } from '../components/ui';

// Links para canais oficiais. Devem ser revisados periodicamente (ver docs/pendencias.md).
const SOURCES = [
  {
    name: 'INMET — Avisos meteorológicos',
    desc: 'Instituto Nacional de Meteorologia: avisos de chuvas intensas por área e severidade.',
    url: 'https://avisos.inmet.gov.br',
  },
  {
    name: 'Cemaden — Mapa interativo',
    desc: 'Centro Nacional de Monitoramento e Alertas de Desastres Naturais: dados de pluviômetros.',
    url: 'https://mapainterativo.cemaden.gov.br/',
  },
  {
    name: 'Defesa Civil do Estado do Rio de Janeiro',
    desc: 'Avisos, boletins e orientações estaduais.',
    url: 'https://defesacivil.rj.gov.br/',
  },
  {
    name: 'Prefeitura de Duque de Caxias',
    desc: 'Canais oficiais do município, incluindo a Defesa Civil municipal.',
    url: 'https://duquedecaxias.rj.gov.br/',
  },
];

export default function Alerts() {
  return (
    <div className="space-y-5">
      <PageHeader title="Vai chover? Fique ligado!" subtitle="Acompanhamento meteorológico para Duque de Caxias." />

      <OfficialAlerts />

      <Forecast />

      <section aria-labelledby="fontes">
        <h2 id="fontes" className="mb-2 text-lg font-bold text-navy">Consulte as fontes oficiais</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {SOURCES.map((s) => (
            <li key={s.url}>
              <Card className="h-full">
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-start justify-between gap-2 font-semibold text-navy underline">
                  {s.name} <ExternalLink size={16} aria-hidden="true" className="mt-1 shrink-0" />
                  <span className="sr-only">(abre em nova aba)</span>
                </a>
                <p className="mt-1 text-sm text-muted">{s.desc}</p>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="comunidade">
        <h2 id="comunidade" className="mb-2 flex items-center gap-2 text-lg font-bold text-navy">
          <Users size={20} aria-hidden="true" /> Atualizações comunitárias do Alag@u
        </h2>
        <p className="rounded-2xl border-l-4 border-sky bg-white p-4 text-sm">
          Informações enviadas por moradores. <strong>Não são avisos oficiais.</strong> Notificações por bairro serão configuráveis na Fase 5,
          sempre com sua autorização.
        </p>
      </section>

      <SafetyBox />
    </div>
  );
}
