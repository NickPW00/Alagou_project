import { HISTORICAL_AFTER_HOURS } from '../config/settings';
import type { District, PublicReport } from './types';

export const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

export type ReportFilter = { query: string; district: District | ''; period: 'now' | 'history' };

export function filterReports(reports: PublicReport[], f: ReportFilter, now: Date = new Date()): PublicReport[] {
  const q = normalize(f.query);
  const cutoff = now.getTime() - HISTORICAL_AFTER_HOURS * 3600000;
  return reports
    .filter((r) => (f.district ? r.district === f.district : true))
    .filter((r) => (q ? normalize(`${r.street} ${r.neighborhood}`).includes(q) : true))
    .filter((r) => (f.period === 'now' ? new Date(r.observedAt).getTime() >= cutoff : true))
    .sort((a, b) => b.observedAt.localeCompare(a.observedAt));
}
