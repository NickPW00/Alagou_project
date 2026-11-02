// A4 — Gera os dados geográficos do Alag@u em public/geo/ (docs/pacote-a/A4-busca-limites.md).
// Uso:
//   node scripts/geo/build.mjs                       (baixa do IBGE e do OpenStreetMap; usado pelo GitHub Actions)
//   node scripts/geo/build.mjs --fixture DIR --out D (dados sintéticos, para testes)
// Requer Node 22.18+ (executa os módulos TypeScript de src/geo diretamente).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildLimites, buildPlaces, buildStreetIndex, limitesBBox, MUNICIPIO_IBGE } from '../../src/geo/pipeline.ts';

const args = process.argv.slice(2);
const opt = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const fixture = opt('--fixture');
const outDir = resolve(opt('--out') ?? resolve(import.meta.dirname, '../../public/geo'));
const now = new Date().toISOString();

const IBGE_MALHA = `https://servicodados.ibge.gov.br/api/v3/malhas/municipios/${MUNICIPIO_IBGE}?formato=application/vnd.geo%2Bjson&qualidade=intermediaria`;
const IBGE_DISTRITOS = `${IBGE_MALHA}&intrarregiao=distrito`;
const IBGE_NOMES = `https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${MUNICIPIO_IBGE}/distritos`;
const OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
const HIGHWAYS = 'motorway|trunk|primary|secondary|tertiary|unclassified|residential|living_street|road|pedestrian|motorway_link|trunk_link|primary_link|secondary_link|tertiary_link';

async function getJson(url, init) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { ...init, headers: { 'User-Agent': 'Alagou/1.0 (projeto Meninas pelo Clima - LabPENSo/UERJ)', ...(init?.headers ?? {}) } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn(`Falha ao baixar ${url} (tentativa ${attempt}): ${e.message}`);
      if (attempt === 3) throw e;
      await new Promise((r) => setTimeout(r, 5000 * attempt));
    }
  }
}

async function overpass(query) {
  let last;
  for (const endpoint of OVERPASS) {
    try {
      return { data: await getJson(endpoint, { method: 'POST', body: new URLSearchParams({ data: query }) }), endpoint };
    } catch (e) {
      last = e;
    }
  }
  throw last;
}

const readFix = (f) => JSON.parse(readFileSync(resolve(fixture, f), 'utf8'));

const municipio = fixture ? readFix('ibge-municipio.json') : await getJson(IBGE_MALHA);
const distritos = fixture ? readFix('ibge-distritos.json') : await getJson(IBGE_DISTRITOS);
const nomes = fixture ? readFix('ibge-nomes.json') : await getJson(IBGE_NOMES);
const limites = buildLimites(municipio, distritos, nomes);
const [w, s, e, n] = limitesBBox(limites);
const bbox = `${s},${w},${n},${e}`;

const qRuas = `[out:json][timeout:240];(way["highway"~"^(${HIGHWAYS})$"](${bbox});way["highway"="service"]["name"](${bbox}););out body geom qt;`;
const qBairros = `[out:json][timeout:120];node["place"~"^(suburb|neighbourhood|quarter)$"]["name"](${bbox});out body qt;`;
const ruas = fixture ? { data: readFix('overpass-ruas.json'), endpoint: 'fixture' } : await overpass(qRuas);
const bairros = fixture ? { data: readFix('overpass-bairros.json'), endpoint: 'fixture' } : await overpass(qBairros);

const indice = buildStreetIndex(ruas.data, limites);
const places = buildPlaces(bairros.data, limites);

// Verificações de sanidade: não gravar dados quebrados.
const nDistritos = limites.features.filter((f) => f.properties.tipo === 'distrito').length;
if (nDistritos !== 4) throw new Error(`Esperados 4 distritos, recebidos ${nDistritos}.`);
if (!fixture && indice.length < 500) throw new Error(`Índice de ruas pequeno demais (${indice.length}); verifique o Overpass.`);

mkdirSync(outDir, { recursive: true });
const write = (f, o) => writeFileSync(resolve(outDir, f), JSON.stringify(o));
write('limites.geojson', limites);
write('ruas-indice.json', indice);
write('bairros-osm.json', places);
write('fontes.json', {
  gerado_em: now,
  sintetico: Boolean(fixture),
  limites: { fonte: 'IBGE — API de Malhas v3 e API de Localidades', urls: [IBGE_MALHA, IBGE_DISTRITOS, IBGE_NOMES], licenca: 'Dados públicos do IBGE (citar a fonte)', acessado_em: now },
  ruas_e_bairros: {
    fonte: 'OpenStreetMap (via Overpass API)',
    endpoint: ruas.endpoint,
    licenca: 'ODbL 1.0 — © colaboradores do OpenStreetMap (https://www.openstreetmap.org/copyright)',
    acessado_em: now,
    observacao: 'Nomes de bairro do OSM não são limites oficiais.',
  },
  contagens: { distritos: nDistritos, ruas_no_indice: indice.length, bairros_osm: places.length },
});
console.log(`OK: ${nDistritos} distritos, ${indice.length} entradas de ruas, ${places.length} bairros → ${outDir}`);
