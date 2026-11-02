// Parâmetros configuráveis. Na Fase 3 passam a vir da tabela `app_settings`.
// Os prazos são uma política inicial e devem ser avaliados pela equipe científica.

export const FRESHNESS = {
  /** Até este limite: relato recente. */
  recentMinutes: 30,
  /** Até este limite: atualização recomendada. Acima: desatualizado. */
  staleMinutes: 120,
};

/** Relatos com observação mais antiga do que isto são marcados como históricos. */
export const HISTORICAL_AFTER_HOURS = 24;

/** Tolerância para relógios de celular adiantados ao validar "data futura". */
export const FUTURE_TOLERANCE_MINUTES = 5;

export const TIME_ZONE = 'America/Sao_Paulo';

/**
 * Vista inicial APROXIMADA do mapa sobre Duque de Caxias (centro e zoom).
 * Não é limite administrativo: os limites oficiais (IBGE) serão importados na Fase 3.
 */
export const INITIAL_VIEW = {
  center: { lng: -43.29, lat: -22.68 },
  zoom: 10.3,
};

export const MAP_STYLE_URL: string =
  import.meta.env.VITE_MAP_STYLE_URL || 'https://tiles.openfreemap.org/styles/liberty';

export type DataMode = 'demo' | 'none';
export const DATA_MODE: DataMode = import.meta.env.VITE_DATA_MODE === 'demo' ? 'demo' : 'none';

export const EMERGENCY = { civilDefense: '199', firefighters: '193' };

export const INSTITUTIONAL_LINKS = {
  project: 'https://labpenso.org/meninaspeloclima',
  instagram: 'https://www.instagram.com/meninas.pelo.clima/',
};
