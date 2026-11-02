import { FUTURE_TOLERANCE_MINUTES, HISTORICAL_AFTER_HOURS } from '../config/settings';
import { brasiliaToUtcIso } from './time';
import type { ReportDraft } from './types';

export type StepId = 'where' | 'condition' | 'trend' | 'depth' | 'hazards' | 'media' | 'when' | 'review';

export const STEPS: { id: StepId; title: string }[] = [
  { id: 'where', title: 'Onde aconteceu?' },
  { id: 'condition', title: 'Como está a rua?' },
  { id: 'trend', title: 'O que está acontecendo com a água?' },
  { id: 'depth', title: 'Qual é a profundidade aparente?' },
  { id: 'hazards', title: 'Há outros problemas?' },
  { id: 'media', title: 'Fotografia e descrição' },
  { id: 'when', title: 'Quando aconteceu?' },
  { id: 'review', title: 'Revisão e envio' },
];

export type Errors = Partial<Record<string, string>>;

export function validateStep(step: StepId, d: ReportDraft, now: Date = new Date()): Errors {
  const e: Errors = {};
  switch (step) {
    case 'where':
      if (!d.district) e.district = 'Escolha o distrito.';
      if (!d.neighborhood.trim()) e.neighborhood = 'Informe o bairro.';
      if (!d.street.trim()) e.street = 'Informe o nome da rua ou avenida.';
      if (!d.location) e.location = 'Marque o local no mapa ou use sua localização.';
      if (d.postalCode && !/^\d{5}-?\d{3}$/.test(d.postalCode.trim())) e.postalCode = 'CEP no formato 00000-000.';
      break;
    case 'condition':
      if (!d.condition) e.condition = 'Escolha uma opção.';
      break;
    case 'trend':
      if (!d.trend) e.trend = 'Escolha uma opção.';
      break;
    case 'when': {
      const iso = brasiliaToUtcIso(d.observedDate, d.observedTime);
      if (!iso) e.observedAt = 'Informe data e horário válidos.';
      else if (new Date(iso).getTime() > now.getTime() + FUTURE_TOLERANCE_MINUTES * 60000)
        e.observedAt = 'A observação não pode estar no futuro.';
      break;
    }
    case 'media':
      if (d.description.length > 1000) e.description = 'Use no máximo 1000 caracteres.';
      break;
    default:
      break;
  }
  return e;
}

export function validateAll(d: ReportDraft, now: Date = new Date()): Errors {
  return STEPS.reduce<Errors>((acc, s) => ({ ...acc, ...validateStep(s.id, d, now) }), {});
}

export function isHistorical(observedIso: string, now: Date = new Date()): boolean {
  return now.getTime() - new Date(observedIso).getTime() > HISTORICAL_AFTER_HOURS * 3600000;
}
