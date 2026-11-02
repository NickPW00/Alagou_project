// Tipos de domínio do Alag@u. Espelham os enums previstos para o banco (docs/00-...md, seção 4.1).

export const STREET_CONDITIONS = [
  'no_flooding',
  'water_accumulation',
  'partially_flooded',
  'fully_flooded',
  'cannot_assess',
] as const;
export type StreetCondition = (typeof STREET_CONDITIONS)[number];

export const WATER_TRENDS = ['rising', 'stable', 'receding', 'unknown'] as const;
export type WaterTrend = (typeof WATER_TRENDS)[number];

export const DEPTH_ESTIMATES = ['shallow', 'ankle', 'shin', 'knee', 'above_knee', 'unknown'] as const;
export type DepthEstimate = (typeof DEPTH_ESTIMATES)[number];

export const HAZARD_FLAGS = [
  'current',
  'clogged_drain',
  'open_manhole',
  'stalled_vehicles',
  'stranded_people',
  'water_in_buildings',
  'waste_or_sewage',
  'other',
] as const;
export type HazardFlag = (typeof HAZARD_FLAGS)[number];

export const VERIFICATION_STATUSES = [
  'received',
  'published_unconfirmed',
  'confirmed',
  'conflicting',
  'verified_by_team',
  'removed',
] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const PERCEIVED_FREQUENCIES = [
  'once',
  'occasionally',
  'frequently',
  'almost_every_heavy_rain',
  'unknown',
] as const;
export type PerceivedFrequency = (typeof PERCEIVED_FREQUENCIES)[number];

/** Os quatro distritos de Duque de Caxias (IBGE). */
export const DISTRICTS = ['Duque de Caxias', 'Campos Elíseos', 'Imbariê', 'Xerém'] as const;
export type District = (typeof DISTRICTS)[number];

export type LngLat = { lng: number; lat: number };

export type ReportHistoryEntry = {
  at: string; // ISO UTC
  condition?: StreetCondition;
  trend?: WaterTrend;
  note: string;
};

/** Relato como exibido publicamente (sem dados do autor). */
export type PublicReport = {
  id: string;
  district: District;
  neighborhood: string;
  street: string;
  nearNumber?: string;
  referencePoint?: string;
  location: LngLat;
  condition: StreetCondition;
  trend: WaterTrend;
  depth?: DepthEstimate;
  hazards: HazardFlag[];
  description?: string;
  observedAt: string; // ISO UTC
  submittedAt: string; // ISO UTC
  confirmations: number;
  verification: VerificationStatus;
  history: ReportHistoryEntry[];
  photoCount: number;
  /** Dado fictício de demonstração (selo "EXEMPLO"). */
  example?: boolean;
  /** A5: trecho de referência (até 100 m para cada lado do ponto), quando confirmado. */
  segmentLine?: [number, number][];
  segmentName?: string;
};

export type HistoricalReport = {
  id: string;
  district: District;
  neighborhood: string;
  street: string;
  location: LngLat;
  periodLabel: string;
  perceivedFrequency: PerceivedFrequency;
  description?: string;
  /** Dado fictício de demonstração (selo "EXEMPLO"). */
  example?: boolean;
};

export type ReportDraft = {
  district?: District;
  neighborhood: string;
  street: string;
  nearNumber: string;
  postalCode: string;
  referencePoint: string;
  segmentDescription: string;
  location?: LngLat;
  locationMethod?: 'map_pin' | 'gps' | 'search';
  /** A5: trecho escolhido pela pessoa. extent 'segment' = "Sim, neste trecho"; 'point' = "Só perto do ponto". */
  segment?: { id: string; name?: string; line: [number, number][]; extent: 'segment' | 'point' };
  condition?: StreetCondition;
  trend?: WaterTrend;
  depth?: DepthEstimate;
  hazards: HazardFlag[];
  description: string;
  observedDate: string; // YYYY-MM-DD (horário de Brasília)
  observedTime: string; // HH:MM (horário de Brasília)
};
