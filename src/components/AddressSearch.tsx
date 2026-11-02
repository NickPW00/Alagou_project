// A4 — busca de ruas, bairros e lugares com sugestões (padrão "combobox" acessível).
import { MapPin, Search } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { loadLimites, loadPlaces, loadStreetIndex } from '../geo/data';
import { searchGeocoder, searchLocal, type SearchResult } from '../geo/search';
import { useOnline } from './AppStatus';

type Props = {
  label: string;
  placeholder?: string;
  /** Consulta também o geocodificador (Photon) além do índice local. */
  geocoder?: boolean;
  /** Modo controlado (ex.: busca do Mapa ao Vivo, que também filtra relatos). */
  value?: string;
  onChange?: (v: string) => void;
  onSelect: (r: SearchResult) => void;
  inputClassName?: string;
  hideLabel?: boolean;
};

export default function AddressSearch({ label, placeholder, geocoder = false, value, onChange, onSelect, inputClassName, hideLabel }: Props) {
  const [inner, setInner] = useState('');
  const query = value ?? inner;
  const setQuery = (v: string) => (onChange ? onChange(v) : setInner(v));
  const [local, setLocal] = useState<SearchResult[]>([]);
  const [remote, setRemote] = useState<SearchResult[]>([]);
  const [remoteState, setRemoteState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const online = useOnline();
  const listId = useId();
  const wrap = useRef<HTMLDivElement>(null);

  // Índice local: imediato (e disponível offline depois de carregado).
  useEffect(() => {
    let alive = true;
    if (query.trim().length < 2) {
      setLocal([]);
      return;
    }
    void Promise.all([loadStreetIndex(), loadPlaces()]).then(([s, p]) => alive && setLocal(searchLocal(s, p, query)));
    return () => {
      alive = false;
    };
  }, [query]);

  // Geocodificador: 400 ms após parar de digitar, cancelando a consulta anterior.
  useEffect(() => {
    setRemote([]);
    if (!geocoder || !online || query.trim().length < 3) {
      setRemoteState('idle');
      return;
    }
    const ctrl = new AbortController();
    const t = window.setTimeout(async () => {
      setRemoteState('loading');
      try {
        setRemote(await searchGeocoder(query, await loadLimites(), ctrl.signal));
        setRemoteState('idle');
      } catch (e) {
        if (!ctrl.signal.aborted) setRemoteState('error');
        void e;
      }
    }, 400);
    return () => {
      ctrl.abort();
      window.clearTimeout(t);
    };
  }, [query, geocoder, online]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, []);

  const results = [...local, ...remote];
  const showList = open && query.trim().length >= 2;
  const choose = (r: SearchResult) => {
    onSelect(r);
    setOpen(false);
    setActive(-1);
  };

  return (
    <div ref={wrap} className="relative">
      <label htmlFor={`${listId}-input`} className={hideLabel ? 'sr-only' : 'mb-1 block font-semibold'}>
        {label}
      </label>
      <div className="relative">
        <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          id={`${listId}-input`}
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 && results[active] ? `${listId}-${results[active].id}` : undefined}
          autoComplete="off"
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setOpen(true);
              setActive((a) => Math.min(a + 1, results.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === 'Enter' && showList && active >= 0 && results[active]) {
              e.preventDefault();
              choose(results[active]);
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          className={inputClassName ?? 'h-12 w-full rounded-xl border border-gray-400 bg-white pl-10 pr-3 text-base'}
        />
      </div>
      {showList && (
        <div className="absolute inset-x-0 top-full z-40 mt-1 max-h-80 overflow-y-auto rounded-2xl bg-white p-1 shadow-xl ring-1 ring-black/10">
          <ul id={listId} role="listbox" aria-label={`Sugestões para ${query}`}>
            {results.map((r, i) => (
              <li
                key={r.id}
                id={`${listId}-${r.id}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(r)}
                className={`flex min-h-12 cursor-pointer items-start gap-2 rounded-xl px-3 py-2 ${i === active ? 'bg-sky-50' : 'hover:bg-sky-50'}`}
              >
                <MapPin size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-navy" />
                <span>
                  <span className="block font-semibold text-ink">{r.label}</span>
                  <span className="block text-xs text-muted">{r.detail}</span>
                </span>
              </li>
            ))}
          </ul>
          <p role="status" className="px-3 py-2 text-xs text-muted">
            {remoteState === 'loading'
              ? 'Buscando outros lugares…'
              : results.length === 0
                ? 'Nenhum resultado. Você pode marcar o ponto direto no mapa.'
                : remoteState === 'error'
                  ? 'Busca de outros lugares indisponível agora.'
                  : !online && geocoder
                    ? 'Sem internet: buscando só nas ruas salvas no aparelho.'
                    : ''}
          </p>
          <p className="px-3 pb-2 text-[11px] text-muted">Busca: © colaboradores do OpenStreetMap{geocoder ? ' · Photon' : ''}</p>
        </div>
      )}
    </div>
  );
}
