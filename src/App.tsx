import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';

const Admin = lazy(() => import('./pages/Admin'));
const Alerts = lazy(() => import('./pages/Alerts'));
const Data = lazy(() => import('./pages/Data'));
const Learn = lazy(() => import('./pages/Learn'));
const LiveMap = lazy(() => import('./pages/LiveMap'));
const Memory = lazy(() => import('./pages/Memory'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Participation = lazy(() => import('./pages/Participation'));
const ReportForm = lazy(() => import('./pages/ReportForm'));
const About = lazy(() => import('./pages/About'));

const TITLES: Record<string, string> = {
  '/': 'Início',
  '/mapa': 'Mapa ao Vivo',
  '/avisar': 'Avisar Alagamento',
  '/alertas': 'Alertas de Chuva',
  '/memoria': 'Mapa da Memória',
  '/aprenda': 'Aprenda e Previna',
  '/dados': 'Duque de Caxias em Dados',
  '/participacao': 'Minha Participação',
  '/sobre': 'Sobre',
  '/admin': 'Painel administrativo',
};

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = `${TITLES[pathname] ?? 'Página não encontrada'} · Alag@u`;
  }, [pathname]);

  return (
    <Layout>
      <Suspense fallback={<p role="status" className="p-6 text-center text-navy">Carregando…</p>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mapa" element={<LiveMap />} />
        <Route path="/avisar" element={<ReportForm />} />
        <Route path="/alertas" element={<Alerts />} />
        <Route path="/memoria" element={<Memory />} />
        <Route path="/aprenda" element={<Learn />} />
        <Route path="/dados" element={<Data />} />
        <Route path="/participacao" element={<Participation />} />
        <Route path="/sobre" element={<About />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </Layout>
  );
}
