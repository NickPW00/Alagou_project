// A4 — Gera os dados geográficos do Alag@u em public/geo/ (docs/pacote-a/A4-busca-limites.md).
// Uso:
//   node scripts/geo/build.mjs                       (baixa do IBGE e do OpenStreetMap; usado pelo GitHub Actions)
//   node scripts/geo/build.mjs --fixture DIR --out D (dados sintéticos, para testes)
//   --source ibge|osm|auto   origem dos limites (padrão: auto = IBGE e, se inacessível, OpenStreetMap)
// Observação: a API do IBGE pode recusar conexões de fora do Brasil (ex.: servidores do GitHub Actions).
// Para limites oficiais do IBGE, rode este script num computador no Brasil com --source ibge.
// Requer Node 22.18+ (executa os módulos TypeScript de src/geo diretamente).
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildLimites, buildLimitesFromOsm, buildPlaces, buildStreetIndex, limitesBBox, municipioOf, MUNICIPIO_IBGE } from '../../src/geo/pipeline.ts';
import { pointInGeometry } from '../../src/geo/geometry.ts';
import { CELL_SIZE, cellsOfLine, splitAtIntersections } from '../../src/geo/segments.ts';

const args = process.argv.slice(2);
const opt = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const fixture = opt('--fixture');
const source = opt('--source') ?? 'auto';
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

async function limitesIbge() {
  const municipio = fixture ? readFix('ibge-municipio.json') : await getJson(IBGE_MALHA);
  const distritos = fixture ? readFix('ibge-distritos.json') : await getJson(IBGE_DISTRITOS);
  const nomes = fixture ? readFix('ibge-nomes.json') : await getJson(IBGE_NOMES);
  return { limites: buildLimites(municipio, distritos, nomes), meta: { fonte: 'IBGE — API de Malhas v3 e API de Localidades', urls: [IBGE_MALHA, IBGE_DISTRITOS, IBGE_NOMES], licenca: 'Dados públicos do IBGE (citar a fonte)' } };
}

async function limitesOsm() {
  const q = `[out:json][timeout:120];relation["boundary"="administrative"]["IBGE:GEOCODIGO"="${MUNICIPIO_IBGE}"]->.m;.m out ids tags;.m map_to_area->.a;relation(area.a)["boundary"="administrative"]["admin_level"~"^(9|10)$"];out ids tags;`;
  const rels = fixture ? { data: readFix('osm-relacoes.json'), endpoint: 'fixture' } : await overpass(q);
  const ids = rels.data.elements.filter((e) => e.type === 'relation').map((e) => `R${e.id}`);
  const lookup = `https://nominatim.openstreetmap.org/lookup?osm_ids=${ids.join(',')}&format=geojson&polygon_geojson=1&polygon_threshold=0.00005`;
  const geoms = fixture ? readFix('osm-geometrias.json') : await getJson(lookup);
  return {
    limites: buildLimitesFromOsm(rels.data, geoms),
    meta: {
      fonte: 'OpenStreetMap — relações administrativas (geometria montada pelo Nominatim). NÃO é a malha oficial do IBGE.',
      urls: [rels.endpoint, lookup],
      licenca: 'ODbL 1.0 — © colaboradores do OpenStreetMap',
      motivo: source === 'osm' ? 'escolhido por parâmetro' : 'API do IBGE inacessível no momento da geração',
    },
  };
}

let geo;
if (source === 'osm') geo = await limitesOsm();
else {
  try {
    geo = await limitesIbge();
  } catch (e) {
    if (source === 'ibge') throw e;
    console.warn(`IBGE inacessível (${e.message}). Usando limites do OpenStreetMap.`);
    geo = await limitesOsm();
  }
}
const limites = geo.limites;
const [w, s, e, n] = limitesBBox(limites);
const bbox = `${s},${w},${n},${e}`;

const qRuas = `[out:json][timeout:240];(way["highway"~"^(${HIGHWAYS})$"](${bbox});way["highway"="service"]["name"](${bbox}););out body geom qt;`;
const qBairros = `[out:json][timeout:120];node["place"~"^(suburb|neighbourhood|quarter)$"]["name"](${bbox});out body qt;`;
const ruas = fixture ? { data: readFix('overpass-ruas.json'), endpoint: 'fixture' } : await overpass(qRuas);
const bairros = fixture ? { data: readFix('overpass-bairros.json'), endpoint: 'fixture' } : await overpass(qBairros);

const indice = buildStreetIndex(ruas.data, limites);
const places = buildPlaces(bairros.data, limites);

// A5 — trechos de rua cortados nos cruzamentos, agrupados em blocos (células) de ~1,1 km.
const ways = ruas.data.elements.filter((e) => e.type === 'way');
const munGeom = municipioOf(limites).geometry;
const segments = splitAtIntersections(ways).filter((sg) => pointInGeometry(sg.c[Math.floor(sg.c.length / 2)], munGeom));
const cells = new Map();
for (const sg of segments) for (const k of cellsOfLine(sg.c)) (cells.get(k) ?? cells.set(k, []).get(k)).push(sg);

// Verificações de sanidade: não gravar dados quebrados.
const nDistritos = limites.features.filter((f) => f.properties.tipo === 'distrito').length;
const fonteLimites = limites.features[0].properties.fonte;
if (fonteLimites === 'IBGE' && nDistritos !== 4) throw new Error(`Esperados 4 distritos do IBGE, recebidos ${nDistritos}.`);
if (nDistritos !== 4) console.warn(`Atenção: ${nDistritos} distritos encontrados no OpenStreetMap (esperados 4). O distrito automático ficará limitado.`);
if (!fixture && indice.length < 500) throw new Error(`Índice de ruas pequeno demais (${indice.length}); verifique o Overpass.`);

mkdirSync(outDir, { recursive: true });
const write = (f, o) => writeFileSync(resolve(outDir, f), JSON.stringify(o));
write('limites.geojson', limites);
write('ruas-indice.json', indice);
write('bairros-osm.json', places);
const trechosDir = resolve(outDir, 'trechos');
rmSync(trechosDir, { recursive: true, force: true });
mkdirSync(trechosDir, { recursive: true });
let trechosBytes = 0;
for (const [k, list] of cells) {
  const body = JSON.stringify(list);
  trechosBytes += Buffer.byteLength(body);
  writeFileSync(resolve(trechosDir, `${k}.json`), body);
}
writeFileSync(resolve(trechosDir, 'indice.json'), JSON.stringify({ tamanho_celula_graus: CELL_SIZE, celulas: [...cells.keys()].sort() }));
write('fontes.json', {
  gerado_em: now,
  sintetico: Boolean(fixture),
  limites: { ...geo.meta, oficial_ibge: fonteLimites === 'IBGE', distritos: limites.features.filter((f) => f.properties.tipo === 'distrito').map((f) => f.properties.nome), acessado_em: now },
  ruas_e_bairros: {
    fonte: 'OpenStreetMap (via Overpass API)',
    endpoint: ruas.endpoint,
    licenca: 'ODbL 1.0 — © colaboradores do OpenStreetMap (https://www.openstreetmap.org/copyright)',
    acessado_em: now,
    observacao: 'Nomes de bairro do OSM não são limites oficiais.',
  },
  trechos: {
    descricao: 'Vias do OpenStreetMap cortadas nos cruzamentos (nós compartilhados) e nas pontas; base derivada do OSM (ODbL).',
    tamanho_celula_graus: CELL_SIZE,
    celulas: cells.size,
    bytes_total: trechosBytes,
    bytes_medio_por_celula: cells.size ? Math.round(trechosBytes / cells.size) : 0,
  },
  contagens: { distritos: nDistritos, ruas_no_indice: indice.length, bairros_osm: places.length, trechos: segments.length },
});
console.log(`OK: ${nDistritos} distritos, ${indice.length} entradas de ruas, ${places.length} bairros, ${segments.length} trechos em ${cells.size} blocos (${Math.round(trechosBytes / 1024)} kB) → ${outDir}`);
