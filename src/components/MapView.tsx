import * as maplibregl from 'maplibre-gl';
import type { GeoJSONSource, Map as MLMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import { useEffect, useRef, useState } from 'react';
import { INITIAL_VIEW, MAP_STYLE_URL } from '../config/settings';
import { CONDITION_INFO, OUTDATED_COLOR } from '../domain/labels';
import { freshnessOf } from '../domain/time';
import { loadLimites } from '../geo/data';
import type { HistoricalReport, LngLat, PublicReport, StreetCondition, WaterTrend } from '../domain/types';

// O Vite não detecta a URL dinâmica do worker do MapLibre; informamos explicitamente.
maplibregl.setWorkerUrl(workerUrl);

const SEVERITY: Record<StreetCondition, number> = {
  cannot_assess: 0,
  no_flooding: 1,
  water_accumulation: 2,
  partially_flooded: 3,
  fully_flooded: 4,
};

type Props = {
  reports?: PublicReport[];
  historical?: HistoricalReport[];
  showHistorical?: boolean;
  onSelectReport?: (id: string) => void;
  onSelectHistorical?: (id: string) => void;
  pick?: { value?: LngLat; onPick: (p: LngLat) => void };
  focus?: LngLat | null;
  label: string;
  className?: string;
  onStatus?: (s: 'loading' | 'ready' | 'error') => void;
};

function reportsToGeoJSON(reports: PublicReport[], now: Date): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: reports.map((r) => {
      const fr = freshnessOf(r.observedAt, now);
      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [r.location.lng, r.location.lat] },
        properties: {
          id: r.id,
          trend: r.trend,
          color: fr === 'outdated' ? OUTDATED_COLOR : CONDITION_INFO[r.condition].color,
          opacity: fr === 'recent' ? 1 : fr === 'stale' ? 0.75 : 0.55,
          sev: fr === 'outdated' ? 0 : SEVERITY[r.condition],
          ex: r.example ? 1 : 0,
        },
      };
    }),
  };
}

function historicalToGeoJSON(items: HistoricalReport[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: items.map((h) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [h.location.lng, h.location.lat] },
      properties: { id: h.id, ex: h.example ? 1 : 0 },
    })),
  };
}

/**
 * Desenha o selo de tendência em canvas (não depende de fontes do estilo do mapa).
 * 64 px com pixelRatio 2 → 32 px na tela: círculo azul-escuro, borda branca e seta branca grossa.
 */
function trendImage(trend: WaterTrend): ImageData {
  const s = 64;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d')!;
  const m = s / 2;
  g.fillStyle = '#062C58';
  g.strokeStyle = '#FFFFFF';
  g.lineWidth = 5;
  g.beginPath();
  g.arc(m, m, m - 4, 0, Math.PI * 2);
  g.fill();
  g.stroke();

  g.strokeStyle = '#FFFFFF';
  g.fillStyle = '#FFFFFF';
  g.lineWidth = 7;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  if (trend === 'unknown') {
    g.font = 'bold 38px Arial, Helvetica, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('?', m, m + 2);
  } else {
    // Seta desenhada apontando para cima e girada conforme a tendência.
    const angle = { rising: 0, stable: Math.PI / 2, receding: Math.PI }[trend];
    g.save();
    g.translate(m, m);
    g.rotate(angle);
    g.beginPath();
    g.moveTo(0, 15);
    g.lineTo(0, -13);
    g.moveTo(-11, -2);
    g.lineTo(0, -14);
    g.lineTo(11, -2);
    g.stroke();
    g.restore();
  }
  return g.getImageData(0, 0, s, s);
}

/** Retângulo arredondado com alternativa para navegadores sem `roundRect` (ex.: iOS < 16). */
function roundedRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  if (typeof g.roundRect === 'function') g.roundRect(x, y, w, h, r);
  else g.rect(x, y, w, h);
  g.fill();
}

/** Selo "EXEMPLO" para dados fictícios, desenhado em canvas (pixelRatio 2). */
function exampleImage(): ImageData {
  const w = 132, h = 40;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  g.fillStyle = '#FFFFFF';
  roundedRect(g, 0, 0, w, h, 10);
  g.fillStyle = '#F2C200';
  roundedRect(g, 3, 3, w - 6, h - 6, 8);
  g.fillStyle = '#1A1A1A';
  g.font = 'bold 22px Arial, Helvetica, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('EXEMPLO', w / 2, h / 2 + 1);
  return g.getImageData(0, 0, w, h);
}

export default function MapView({
  reports = [],
  historical = [],
  showHistorical = false,
  onSelectReport,
  onSelectHistorical,
  pick,
  focus,
  label,
  className = '',
  onStatus,
}: Props) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const cb = useRef({ onSelectReport, onSelectHistorical, pick, onStatus });
  cb.current = { onSelectReport, onSelectHistorical, pick, onStatus };

  useEffect(() => {
    if (!container.current) return;
    cb.current.onStatus?.('loading');
    let map: MLMap;
    try {
      map = new maplibregl.Map({
        container: container.current,
        style: MAP_STYLE_URL,
        center: [INITIAL_VIEW.center.lng, INITIAL_VIEW.center.lat],
        zoom: INITIAL_VIEW.zoom,
        attributionControl: { compact: true },
      });
    } catch {
      // Ex.: navegador sem WebGL.
      setFailed(true);
      cb.current.onStatus?.('error');
      return;
    }
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.addControl(
      new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: false }),
      'top-right',
    );

    let loaded = false;
    const timeout = window.setTimeout(() => {
      if (!loaded) {
        setFailed(true);
        cb.current.onStatus?.('error');
      }
    }, 15000);

    map.on('error', () => {
      // Erros antes do carregamento (estilo indisponível) impedem o uso do mapa.
      if (!loaded) {
        setFailed(true);
        cb.current.onStatus?.('error');
      }
    });

    map.on('load', () => {
      loaded = true;
      window.clearTimeout(timeout);
      (['rising', 'stable', 'receding', 'unknown'] as const).forEach((t) =>
        map.addImage(`trend-${t}`, trendImage(t), { pixelRatio: 2 }),
      );
      const hasGlyphs = Boolean(map.getStyle().glyphs);
      map.addImage('example-tag', exampleImage(), { pixelRatio: 2 });

      map.addSource('historical', { type: 'geojson', data: historicalToGeoJSON([]) });
      map.addLayer({
        id: 'historical-points',
        type: 'circle',
        source: 'historical',
        layout: { visibility: 'none' },
        paint: {
          'circle-radius': 9,
          'circle-color': '#FFFFFF',
          'circle-opacity': 0.85,
          'circle-stroke-color': '#6A1B9A',
          'circle-stroke-width': 3,
        },
      });

      map.addLayer({
        id: 'historical-example',
        type: 'symbol',
        source: 'historical',
        filter: ['==', ['get', 'ex'], 1],
        layout: { visibility: 'none', 'icon-image': 'example-tag', 'icon-offset': [0, 21], 'icon-allow-overlap': true },
      });

      map.addSource('reports', {
        type: 'geojson',
        data: reportsToGeoJSON([], new Date()),
        cluster: true,
        clusterRadius: 40,
        clusterMaxZoom: 14,
        clusterProperties: { maxSev: ['max', ['get', 'sev']], ex: ['max', ['get', 'ex']] },
      });
      const sevColor: maplibregl.ExpressionSpecification = [
        'match',
        ['get', 'maxSev'],
        4, CONDITION_INFO.fully_flooded.color,
        3, CONDITION_INFO.partially_flooded.color,
        2, CONDITION_INFO.water_accumulation.color,
        1, CONDITION_INFO.no_flooding.color,
        OUTDATED_COLOR,
      ];
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'reports',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': sevColor,
          'circle-radius': ['step', ['get', 'point_count'], 18, 10, 24, 50, 30],
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-width': 3,
        },
      });
      if (hasGlyphs) {
        map.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'reports',
          filter: ['has', 'point_count'],
          layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-size': 14 },
          paint: { 'text-color': '#FFFFFF', 'text-halo-color': '#062C58', 'text-halo-width': 1.5 },
        });
      }
      map.addLayer({
        id: 'report-points',
        type: 'circle',
        source: 'reports',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['get', 'color'],
          'circle-opacity': ['get', 'opacity'],
          'circle-radius': 12,
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-width': 3,
        },
      });
      map.addLayer({
        id: 'report-trend',
        type: 'symbol',
        source: 'reports',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'icon-image': ['concat', 'trend-', ['get', 'trend']],
          'icon-size': 1,
          'icon-offset': [18, -18],
          'icon-allow-overlap': true,
        },
      });

      map.addLayer({
        id: 'report-example',
        type: 'symbol',
        source: 'reports',
        filter: ['==', ['get', 'ex'], 1],
        layout: {
          'icon-image': 'example-tag',
          // Abaixo do ponto (ou do agrupamento, que é maior).
          'icon-offset': ['case', ['has', 'point_count'], ['literal', [0, 32]], ['literal', [0, 23]]],
          'icon-allow-overlap': true,
        },
      });

      // A4: limites oficiais do IBGE (município e distritos), abaixo dos relatos.
      void loadLimites().then((limites) => {
        if (!limites || mapRef.current !== map) return;
        map.addSource('limites', { type: 'geojson', data: limites as unknown as GeoJSON.FeatureCollection });
        map.addLayer(
          {
            id: 'limite-distritos',
            type: 'line',
            source: 'limites',
            filter: ['==', ['get', 'tipo'], 'distrito'],
            paint: { 'line-color': '#062C58', 'line-width': 1.5, 'line-opacity': 0.55, 'line-dasharray': [3, 2] },
          },
          'historical-points',
        );
        map.addLayer(
          {
            id: 'limite-municipio',
            type: 'line',
            source: 'limites',
            filter: ['==', ['get', 'tipo'], 'municipio'],
            paint: { 'line-color': '#062C58', 'line-width': 2.5, 'line-opacity': 0.7 },
          },
          'historical-points',
        );
      });

      map.on('click', 'report-points', (e) => {
        const id = e.features?.[0]?.properties?.id;
        if (id) cb.current.onSelectReport?.(String(id));
      });
      map.on('click', 'historical-points', (e) => {
        const id = e.features?.[0]?.properties?.id;
        if (id) cb.current.onSelectHistorical?.(String(id));
      });
      map.on('click', 'clusters', async (e) => {
        const f = e.features?.[0];
        if (!f) return;
        const src = map.getSource('reports') as GeoJSONSource;
        const zoom = await src.getClusterExpansionZoom(f.properties.cluster_id);
        map.easeTo({ center: (f.geometry as GeoJSON.Point).coordinates as [number, number], zoom });
      });
      for (const layer of ['report-points', 'clusters', 'historical-points']) {
        map.on('mouseenter', layer, () => (map.getCanvas().style.cursor = 'pointer'));
        map.on('mouseleave', layer, () => (map.getCanvas().style.cursor = ''));
      }
      map.on('click', (e) => {
        if (!cb.current.pick) return;
        cb.current.pick.onPick({ lng: e.lngLat.lng, lat: e.lngLat.lat });
      });

      setReady(true);
      cb.current.onStatus?.('ready');
    });

    return () => {
      window.clearTimeout(timeout);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Atualiza dados sem recriar o mapa; recalcula a atualidade a cada minuto.
  useEffect(() => {
    if (!ready) return;
    const apply = () => {
      (mapRef.current?.getSource('reports') as GeoJSONSource | undefined)?.setData(reportsToGeoJSON(reports, new Date()));
    };
    apply();
    const t = window.setInterval(apply, 60000);
    return () => window.clearInterval(t);
  }, [ready, reports]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    (map.getSource('historical') as GeoJSONSource).setData(historicalToGeoJSON(historical));
    map.setLayoutProperty('historical-points', 'visibility', showHistorical ? 'visible' : 'none');
    map.setLayoutProperty('historical-example', 'visibility', showHistorical ? 'visible' : 'none');
  }, [ready, historical, showHistorical]);

  // Marcador arrastável para escolher o ponto no formulário.
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    const value = pick?.value;
    if (!value) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }
    if (!markerRef.current) {
      markerRef.current = new maplibregl.Marker({ color: '#062C58', draggable: true })
        .setLngLat([value.lng, value.lat])
        .addTo(map);
      markerRef.current.on('dragend', () => {
        const ll = markerRef.current!.getLngLat();
        cb.current.pick?.onPick({ lng: ll.lng, lat: ll.lat });
      });
    } else {
      markerRef.current.setLngLat([value.lng, value.lat]);
    }
  }, [ready, pick?.value]);

  useEffect(() => {
    if (ready && focus) mapRef.current?.flyTo({ center: [focus.lng, focus.lat], zoom: Math.max(mapRef.current.getZoom(), 15) });
  }, [ready, focus]);

  return (
    <div className={`relative ${className}`}>
      <div ref={container} role="region" aria-label={label} className="h-full w-full" data-testid="map" />
      {!ready && !failed && (
        <div role="status" className="absolute inset-0 grid place-items-center bg-sky-50 text-navy">
          Carregando mapa…
        </div>
      )}
      {failed && (
        <div role="alert" className="absolute inset-0 grid place-items-center bg-gray-100 p-6 text-center text-ink">
          <div>
            <p className="font-bold">Não foi possível carregar o mapa.</p>
            <p className="mt-1 text-sm text-muted">
              Verifique sua conexão. Você ainda pode consultar os relatos em formato de lista.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
