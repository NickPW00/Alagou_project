import { lazy, Suspense, type ComponentProps } from 'react';
import ErrorBoundary from './ErrorBoundary';

// O código do mapa (MapLibre, ~290 kB comprimido) é carregado à parte. Se não estiver salvo no aparelho
// e não houver internet, o restante da tela continua funcionando (A3).
const MapView = lazy(() => import('./MapView'));

type Props = ComponentProps<typeof MapView>;

export default function LazyMapView(props: Props) {
  const box = `relative ${props.className ?? ''}`;
  return (
    <ErrorBoundary
      onError={() => props.onStatus?.('error')}
      fallback={
        <div className={box}>
          <div role="alert" className="absolute inset-0 grid place-items-center bg-gray-100 p-4 text-center text-ink">
            <div>
              <p className="font-bold">Mapa indisponível sem internet.</p>
              <p className="mt-1 text-sm text-muted">Conecte-se para carregar o mapa. O restante do app continua funcionando.</p>
            </div>
          </div>
        </div>
      }
    >
      <Suspense
        fallback={
          <div className={box}>
            <div role="status" className="absolute inset-0 grid place-items-center bg-sky-50 text-navy">
              Carregando mapa…
            </div>
          </div>
        }
      >
        <MapView {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}
