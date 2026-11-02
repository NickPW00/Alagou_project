import type {
  DepthEstimate,
  HazardFlag,
  PerceivedFrequency,
  StreetCondition,
  VerificationStatus,
  WaterTrend,
} from './types';

export type ConditionInfo = {
  label: string; // usado no mapa/legenda
  question: string; // usado no formulário
  description: string;
  color: string; // cor de preenchimento (token)
  textOnColor: string;
};

/** Categorias visuais comunitárias — NÃO são classificações hidrológicas oficiais. */
export const CONDITION_INFO: Record<StreetCondition, ConditionInfo> = {
  no_flooding: {
    label: 'Sem alagamento observado',
    question: 'Sem alagamento observado',
    description: 'Não havia água acumulada na via no momento da observação. Verde não significa que a rua é segura.',
    color: '#2E7D32',
    textOnColor: '#FFFFFF',
  },
  water_accumulation: {
    label: 'Acúmulo de água',
    question: 'Água acumulada na rua',
    description: 'Água sobre o pavimento, sem informação suficiente para caracterizar alagamento parcial.',
    color: '#F2C200',
    textOnColor: '#1A1A1A',
  },
  partially_flooded: {
    label: 'Rua parcialmente alagada',
    question: 'Rua parcialmente alagada',
    description: 'Água cobrindo parte significativa do trecho observado.',
    color: '#EF6C00',
    textOnColor: '#1A1A1A',
  },
  fully_flooded: {
    label: 'Rua totalmente alagada',
    question: 'Rua totalmente alagada',
    description: 'Água cobrindo toda a largura aparente do trecho observado.',
    color: '#C62828',
    textOnColor: '#FFFFFF',
  },
  cannot_assess: {
    label: 'Informação desconhecida',
    question: 'Não consigo avaliar',
    description: 'Não há observação confiável sobre a situação da via.',
    color: '#757575',
    textOnColor: '#FFFFFF',
  },
};

/** Cinza: desconhecido ou desatualizado. */
export const OUTDATED_COLOR = '#8A8A8A';

export const TREND_INFO: Record<WaterTrend, { label: string; question: string; arrow: string }> = {
  rising: { label: 'Água subindo', question: 'Está subindo', arrow: '↑' },
  stable: { label: 'Nível aparentemente estável', question: 'Parece estável', arrow: '→' },
  receding: { label: 'Água baixando ou escoando', question: 'Está baixando', arrow: '↓' },
  unknown: { label: 'Tendência não informada', question: 'Não sei informar', arrow: '?' },
};

export const DEPTH_LABELS: Record<DepthEstimate, string> = {
  shallow: 'Água rasa cobrindo o pavimento',
  ankle: 'Aproximadamente na altura do tornozelo',
  shin: 'Aproximadamente na altura da canela',
  knee: 'Aproximadamente na altura do joelho',
  above_knee: 'Acima do joelho',
  unknown: 'Não sei informar',
};

export const HAZARD_LABELS: Record<HazardFlag, string> = {
  current: 'Água com correnteza',
  clogged_drain: 'Bueiro obstruído',
  open_manhole: 'Possível bueiro aberto',
  stalled_vehicles: 'Veículos parados',
  stranded_people: 'Pessoas ilhadas',
  water_in_buildings: 'Água entrando em imóveis',
  waste_or_sewage: 'Resíduos ou esgoto aparente',
  other: 'Outros problemas',
};

export const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  received: 'Relato recebido',
  published_unconfirmed: 'Publicado, sem confirmação independente',
  confirmed: 'Com confirmações independentes',
  conflicting: 'Informações conflitantes',
  verified_by_team: 'Verificado pela equipe',
  removed: 'Removido pela moderação',
};

export const FREQUENCY_LABELS: Record<PerceivedFrequency, string> = {
  once: 'Aconteceu uma vez',
  occasionally: 'Acontece ocasionalmente',
  frequently: 'Acontece frequentemente',
  almost_every_heavy_rain: 'Acontece em quase toda chuva forte',
  unknown: 'Não sei informar',
};

export const SAFETY_MESSAGES = [
  'Não entre em ruas alagadas para fazer registros.',
  'Nunca atravesse uma área alagada para verificar sua profundidade.',
  'A ausência de relatos não significa ausência de risco.',
  'Em caso de emergência, ligue 199 para a Defesa Civil ou 193 para os Bombeiros.',
] as const;

export const DISCLAIMER =
  'O Alag@u é uma plataforma comunitária de informação e ciência cidadã. Seus registros não substituem os alertas, avaliações e orientações dos órgãos de Defesa Civil.';
