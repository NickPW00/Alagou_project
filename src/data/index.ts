import { useCallback, useEffect, useState } from 'react';
import { DATA_MODE } from '../config/settings';
import type { HistoricalReport, PublicReport } from '../domain/types';
import { DemoSource } from './demo';
import { NoBackendSource, type DataSource } from './source';

export const dataSource: DataSource = DATA_MODE === 'demo' ? new DemoSource() : new NoBackendSource();
export const isDemo = dataSource.mode === 'demo';

type State<T> = { data: T; loading: boolean; error: string | null; updatedAt: Date | null };

function useLive<T>(load: () => Promise<T>, initial: T) {
  const [state, setState] = useState<State<T>>({ data: initial, loading: true, error: null, updatedAt: null });

  const refresh = useCallback(async () => {
    try {
      const data = await load();
      setState({ data, loading: false, error: null, updatedAt: new Date() });
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e instanceof Error ? e.message : 'Erro ao carregar dados.' }));
    }
  }, [load]);

  useEffect(() => {
    void refresh();
    return dataSource.subscribe(() => void refresh());
  }, [refresh]);

  return { ...state, refresh };
}

const loadReports = () => dataSource.listReports();
const loadHistorical = () => dataSource.listHistorical();

export function useReports() {
  return useLive<PublicReport[]>(loadReports, []);
}

export function useHistorical() {
  return useLive<HistoricalReport[]>(loadHistorical, []);
}
