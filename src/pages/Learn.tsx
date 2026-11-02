import { ExternalLink } from 'lucide-react';
import { Card, PageHeader, SafetyBox, StatusPill } from '../components/ui';
import { INSTITUTIONAL_LINKS } from '../config/settings';
import { Logo } from '../components/Institutional';

// Estrutura dos módulos. Os textos completos serão escritos e revisados pela equipe do projeto
// e cadastrados pelo gerenciador de conteúdo (Fase 6). Não incluímos referências não verificadas.
const MODULES = [
  {
    n: 1,
    title: 'Por que as ruas alagam?',
    topics: ['Chuvas intensas', 'Impermeabilização', 'Drenagem urbana', 'Urbanização', 'Rios e canais', 'Alterações no uso do solo', 'Mudanças climáticas', 'Desigualdades socioambientais'],
  },
  {
    n: 2,
    title: 'Entenda os fenômenos',
    topics: ['Alagamento', 'Inundação', 'Enxurrada', 'Enchente', 'Nível da água', 'Precipitação', 'Bacia hidrográfica'],
    note: 'As definições seguirão a terminologia oficial do Cemaden e da Defesa Civil.',
  },
  {
    n: 3,
    title: 'Como se proteger?',
    topics: ['Antes das chuvas', 'Durante os alagamentos', 'Depois que a água baixar', 'Cuidados com eletricidade', 'Riscos de contaminação', 'Proteção de crianças, idosos e pessoas com deficiência', 'Orientações da Defesa Civil'],
  },
  {
    n: 4,
    title: 'Cidades resilientes',
    topics: ['Jardins de chuva', 'Telhados verdes', 'Pavimentos permeáveis', 'Arborização urbana', 'Recuperação de rios', 'Áreas verdes', 'Drenagem sustentável', 'Soluções baseadas na natureza'],
  },
  {
    n: 5,
    title: 'Ciência cidadã',
    topics: ['Como seus registros ajudam pesquisas', 'Conhecimento do território', 'Participação pública', 'Planejamento urbano'],
  },
];

export default function Learn() {
  return (
    <div className="space-y-5">
      <PageHeader title="Aprenda e Previna" subtitle="Educação ambiental com linguagem simples e base científica." />
      <SafetyBox />
      <ul className="grid gap-3 sm:grid-cols-2">
        {MODULES.map((m) => (
          <li key={m.n}>
            <Card className="h-full">
              <p className="text-xs font-bold uppercase text-[#0E6F99]">Módulo {m.n}</p>
              <h2 className="flex flex-wrap items-center gap-2 text-lg font-bold text-navy">
                {m.title} <StatusPill status="em desenvolvimento" />
              </h2>
              <ul className="mt-2 flex flex-wrap gap-1">
                {m.topics.map((t) => (
                  <li key={t} className="rounded-full bg-sky-50 px-2 py-0.5 text-xs text-navy">
                    {t}
                  </li>
                ))}
              </ul>
              {m.note && <p className="mt-2 text-xs text-muted">{m.note}</p>}
            </Card>
          </li>
        ))}
        <li>
          <Card className="h-full">
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
      <p className="text-sm text-muted">Textos, ilustrações, vídeos, quizzes e materiais para download serão publicados na Fase 6.</p>
    </div>
  );
}
