import { useEffect, useState } from 'react';
import { Logo } from '../components/Institutional';
import { loadLimites } from '../geo/data';
import { Card, Disclaimer, PageHeader, SafetyBox } from '../components/ui';
import { INSTITUTIONAL_LINKS } from '../config/settings';
import { CONDITION_INFO } from '../domain/labels';
import { FRESHNESS } from '../config/settings';
import { STREET_CONDITIONS } from '../domain/types';

export default function About() {
  const [fonteLimites, setFonteLimites] = useState<string | null>(null);
  useEffect(() => {
    void loadLimites().then((l) => setFonteLimites(l ? (l.features[0]?.properties.fonte ?? null) : null));
  }, []);
  return (
    <div className="space-y-5">
      <PageHeader title="Sobre o Alag@u" subtitle="Alagou? Avisou! — Monitoramento Comunitário de Alagamentos" />
      <Card>
        <p>
          O Alag@u é uma tecnologia social de monitoramento comunitário de alagamentos em Duque de Caxias (distritos de Duque de Caxias,
          Campos Elíseos, Imbariê e Xerém). Uma iniciativa do projeto <strong>Meninas pelo Clima — LabPENSo/UERJ</strong>.
        </p>
        <div className="mt-3">
          <Disclaimer />
        </div>
      </Card>

      <Card>
        <h2 className="font-bold text-navy">Realização</h2>
        <div className="mt-3 grid items-center gap-6 sm:grid-cols-2">
          <div className="flex flex-col items-center text-center">
            <Logo name="mpc" className="h-40" />
            <p className="mt-2 text-sm">
              Projeto de pesquisa e extensão <strong>Meninas pelo Clima</strong>, do Laboratório de Pesquisa em Educação, Natureza e Sociedade
              (LabPENSo).
            </p>
            <a href={INSTITUTIONAL_LINKS.project} target="_blank" rel="noopener noreferrer" className="mt-1 text-sm font-semibold text-navy underline">
              labpenso.org/meninaspeloclima<span className="sr-only"> (abre em nova aba)</span>
            </a>
          </div>
          <div className="flex flex-col items-center gap-4 text-center">
            <Logo name="uerj" className="h-32" />
            <Logo name="uerjFebf" className="h-14" />
            <p className="text-sm">
              Universidade do Estado do Rio de Janeiro (UERJ) — Faculdade de Educação da Baixada Fluminense (FEBF), UERJ-Caxias.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-bold text-navy">Créditos de dados e tecnologia</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>
            Mapa base: dados ©{' '}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline">
              colaboradores do OpenStreetMap
            </a>{' '}
            (licença ODbL), servidos por OpenFreeMap.
          </li>
          <li>Visualização do mapa: MapLibre GL JS (código aberto, licença BSD).</li>
          <li>
            Limites do município e dos distritos:{' '}
            {fonteLimites === 'IBGE'
              ? 'IBGE — malha territorial oficial.'
              : fonteLimites === 'OpenStreetMap'
                ? 'OpenStreetMap (relações administrativas). A malha oficial do IBGE será usada assim que puder ser obtida.'
                : 'não carregados.'}
          </li>
          <li>Busca de ruas e nomes de bairro: OpenStreetMap (nomes de bairro não são limites oficiais); outros lugares: Photon (komoot).</li>
          <li>O código do Alag@u é aberto e está publicado no GitHub.</li>
        </ul>
      </Card>

      <Card>
        <h2 className="font-bold text-navy">Como funciona</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {STREET_CONDITIONS.map((c) => (
            <li key={c}>
              <strong>{CONDITION_INFO[c].label}:</strong> {CONDITION_INFO[c].description}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm">
          Atualidade: até {FRESHNESS.recentMinutes} min, relato recente; até {FRESHNESS.staleMinutes / 60} h, atualização recomendada; acima
          disso, desatualizado (fica cinza, mas permanece no histórico). Um relato desatualizado não significa que a água baixou.
        </p>
      </Card>

      <Card>
        <h2 className="font-bold text-navy">Instalar o Alag@u no celular</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>
            <strong>Android (Chrome):</strong> toque em “Instalar o app” na tela inicial do Alag@u ou, no menu ⋮ do navegador, em “Instalar
            aplicativo” / “Adicionar à tela inicial”.
          </li>
          <li>
            <strong>iPhone (Safari):</strong> toque em Compartilhar (quadrado com seta) e depois em “Adicionar à Tela de Início”.
          </li>
        </ul>
        <p className="mt-2 text-sm">
          Depois da primeira visita, o app abre mesmo sem internet. Os relatos mostrados podem estar desatualizados quando você estiver offline.
        </p>
        <p className="mt-2 text-sm">
          <strong>Rascunhos:</strong> enquanto você preenche um aviso, ele é salvo só neste aparelho (inclusive o ponto marcado no mapa) até ser
          enviado ou descartado. Ninguém mais tem acesso a esse rascunho.
        </p>
      </Card>

      <Card>
        <h2 className="font-bold text-navy">Seus dados hoje</h2>
        <p className="mt-1 text-sm">
          Nesta versão de demonstração <strong>não há cadastro nem banco de dados</strong>: o Alag@u não guarda nenhum dado seu em servidor. Para
          funcionar, o app usa serviços externos que recebem dados técnicos da sua conexão (como o endereço IP):
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>GitHub Pages: hospedagem do site;</li>
          <li>OpenFreeMap: mapa de fundo (recebe a área do mapa visualizada);</li>
          <li>Photon (komoot): busca de lugares (recebe o texto digitado nessa busca);</li>
          <li>Open-Meteo: previsão de chuva (as coordenadas consultadas são fixas, dos distritos, e não as suas);</li>
          <li>INMET: avisos meteorológicos oficiais.</li>
        </ul>
        <p className="mt-2 text-sm">
          No seu aparelho ficam guardados, sem envio a ninguém: o rascunho de um aviso não enviado, a última previsão consultada e cópias do app
          para uso sem internet. Para apagar, limpe os dados do site no navegador.
        </p>
      </Card>

      <Card>
        <h2 className="font-bold text-navy">Privacidade e termos</h2>
        <p className="mt-1 text-sm">
          A Política de Privacidade e os Termos de Participação valerão a partir da versão com cadastro e estão em revisão jurídica. Princípios já
          adotados: consulta pública sem cadastro; nome e e-mail nunca exibidos; sem localização contínua; fotos só após moderação e sem metadados.
        </p>
        <ul className="mt-2 space-y-1 text-sm">
          <li>
            <a href="https://github.com/NickPW00/Alagou_project/blob/claude/stoic-ramanujan-h530ag/docs/legal/politica-de-privacidade-RASCUNHO.md" target="_blank" rel="noopener noreferrer" className="font-semibold text-navy underline">
              Política de Privacidade (rascunho, não vigente)<span className="sr-only"> — abre em nova aba</span>
            </a>
          </li>
          <li>
            <a href="https://github.com/NickPW00/Alagou_project/blob/claude/stoic-ramanujan-h530ag/docs/legal/termos-de-participacao-RASCUNHO.md" target="_blank" rel="noopener noreferrer" className="font-semibold text-navy underline">
              Termos de Participação (rascunho, não vigente)<span className="sr-only"> — abre em nova aba</span>
            </a>
          </li>
        </ul>
      </Card>
      <SafetyBox />
    </div>
  );
}
