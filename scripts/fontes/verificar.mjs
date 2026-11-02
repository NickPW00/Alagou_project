// A7 — Verificação técnica das fontes meteorológicas e dos links oficiais.
// Uso: node scripts/fontes/verificar.mjs [--out docs/fontes/verificacao.json]
// Registra, para cada endereço: HTTP, tipo de conteúdo, tamanho, início do conteúdo, CORS e tempo.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const args = process.argv.slice(2);
const out = resolve(args.includes('--out') ? args[args.indexOf('--out') + 1] : 'docs/fontes/verificacao.json');

const ALVOS = [
  { fonte: 'INMET', descricao: 'Avisos meteorológicos ativos (API)', url: 'https://apiprevmet3.inmet.gov.br/avisos/ativos' },
  { fonte: 'INMET', descricao: 'Avisos meteorológicos (RSS)', url: 'https://apiprevmet3.inmet.gov.br/avisos/rss' },
  { fonte: 'INMET', descricao: 'Previsão por município (API)', url: 'https://apiprevmet3.inmet.gov.br/previsao/3301702' },
  { fonte: 'INMET', descricao: 'Portal de alertas (link da tela de Alertas)', url: 'https://alertas2.inmet.gov.br/' },
  { fonte: 'INMET', descricao: 'Portal INMET', url: 'https://portal.inmet.gov.br/' },
  { fonte: 'Cemaden', descricao: 'Mapa interativo (link da tela de Alertas)', url: 'https://mapainterativo.cemaden.gov.br/' },
  { fonte: 'Cemaden', descricao: 'Serviço de dados (PED)', url: 'https://sws.cemaden.gov.br/PED/' },
  { fonte: 'Cemaden', descricao: 'Site institucional (link do Aprenda)', url: 'https://www.gov.br/cemaden/pt-br' },
  { fonte: 'Defesa Civil RJ', descricao: 'Site (link da tela de Alertas)', url: 'https://defesacivil.rj.gov.br/' },
  { fonte: 'Prefeitura de Duque de Caxias', descricao: 'Site (link da tela de Alertas)', url: 'https://duquedecaxias.rj.gov.br/' },
  {
    fonte: 'Open-Meteo',
    descricao: 'Previsão horária de chuva (4 pontos)',
    url: 'https://api.open-meteo.com/v1/forecast?latitude=-22.786,-22.708,-22.632,-22.574&longitude=-43.311,-43.268,-43.212,-43.302&hourly=precipitation,precipitation_probability&timezone=America%2FSao_Paulo&forecast_days=2',
  },
];

async function probe(alvo) {
  const t0 = Date.now();
  try {
    const res = await fetch(alvo.url, {
      signal: AbortSignal.timeout(20000),
      redirect: 'follow',
      headers: { 'User-Agent': 'Alagou/1.0 (verificacao de fontes; projeto Meninas pelo Clima - LabPENSo/UERJ)', Origin: 'https://nickpw00.github.io' },
    });
    const body = await res.text();
    return {
      ...alvo,
      ok: res.ok,
      http: res.status,
      url_final: res.url,
      tipo: res.headers.get('content-type'),
      cors: res.headers.get('access-control-allow-origin'),
      bytes: body.length,
      inicio: body.slice(0, 300).replace(/\s+/g, ' '),
      ms: Date.now() - t0,
    };
  } catch (e) {
    return { ...alvo, ok: false, erro: `${e.name}: ${e.cause?.code ?? e.message}`, ms: Date.now() - t0 };
  }
}

const resultados = [];
for (const a of ALVOS) {
  const r = await probe(a);
  console.log(`${r.ok ? 'OK ' : 'ERR'} ${r.fonte.padEnd(30)} ${String(r.http ?? r.erro).padEnd(40)} ${a.descricao}`);
  resultados.push(r);
}
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify({ executado_em: new Date().toISOString(), origem: process.env.GITHUB_ACTIONS ? 'GitHub Actions (servidores fora do Brasil)' : 'computador local', resultados }, null, 1));
console.log(`Resultado gravado em ${out}`);
