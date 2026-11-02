# A4 — Busca de endereços e limites oficiais do IBGE

## 1. O que será implementado
1. **Limites oficiais** do município de Duque de Caxias e dos seus **4 distritos** (IBGE), desenhados no mapa.
2. **Distrito automático:** ao marcar o ponto (no mapa, pelo GPS ou pela busca), o distrito é preenchido pelo limite oficial, e a pessoa pode corrigir. Ponto **fora do município** gera aviso e bloqueia o avanço.
3. **Busca de endereços com sugestões** no formulário ("Onde aconteceu?"):
   - **ruas de Duque de Caxias** a partir de um índice próprio (OpenStreetMap), instantâneo e que funciona **offline** depois de carregado;
   - **outros lugares** (pontos de referência, endereços com número) por um geocodificador público (Photon, baseado no OpenStreetMap), só com internet;
   - ruas com o mesmo nome em lugares diferentes aparecem **separadas, com o distrito**, para a pessoa escolher a correta;
   - endereço não encontrado: orientação para marcar o ponto direto no mapa.
4. **Sugestões de bairro** a partir dos nomes de bairro do OpenStreetMap (apenas sugestões; o campo continua livre).
5. **Mapa ao Vivo:** a busca passa a sugerir também ruas e bairros, e levar o mapa até eles ("ir para").

Fora do escopo: limites oficiais de bairros (não há base oficial verificada; ver pendências) e trechos de rua (A5).

## 2. Como será

### 2.1 Fontes de dados

| Dado | Fonte | Licença | Como é obtido |
|---|---|---|---|
| Município e distritos | IBGE — API de Malhas v3 (`servicodados.ibge.gov.br/api/v3/malhas/municipios/3301702?intrarregiao=distrito`) e API de Localidades (nomes dos distritos) | Dados públicos do IBGE (citar a fonte) | Robô do GitHub Actions |
| Ruas e nomes de bairro | OpenStreetMap via Overpass API | ODbL (atribuição e compartilhamento pela mesma licença) | Robô do GitHub Actions |
| Busca de outros lugares | Photon (komoot) — `photon.komoot.io` | Dados OSM; uso justo da instância pública | Direto do navegador, sob demanda |

**Por que um robô?** O ambiente de desenvolvimento não acessa IBGE nem OpenStreetMap, mas o GitHub Actions acessa. O workflow `dados-geograficos.yml`, executado sob demanda:
1. baixa os dados;
2. processa com scripts versionados (`scripts/geo/`);
3. grava os arquivos em `public/geo/` com um arquivo de **fontes** (URL, data de acesso e licença);
4. faz o commit no repositório.

Assim os dados ficam auditáveis e reproduzíveis, e o app não depende do IBGE nem do Overpass em tempo de uso.

### 2.2 Arquivos gerados (`public/geo/`)
- `limites.geojson`: município + 4 distritos (código IBGE e nome), com coordenadas arredondadas a 5 casas decimais (~1 m).
- `ruas-indice.json`: uma entrada por rua, distrito e região (nome, distrito e ponto de referência).
- `bairros-osm.json`: nomes de bairro do OSM com ponto de referência e distrito, rotulados como **não oficiais**.
- `fontes.json`: proveniência de cada arquivo.

### 2.3 No app
- Módulo de geometria próprio e testado (`src/geo/geometry.ts`), usado tanto pelo app quanto pelos scripts: ponto dentro de polígono (com buracos e multipolígonos), caixa delimitadora, distância.
- Carregamento **sob demanda** dos arquivos (só quando o formulário ou a busca precisam), guardados pelo service worker para uso offline.
- Busca:
  - nomes normalizados (sem acentos e sem diferença entre maiúsculas e minúsculas);
  - prioridade para quem começa com o texto digitado, depois para quem contém;
  - até 8 sugestões locais;
  - Photon com espera de 400 ms após a digitação, mínimo de 3 letras, cancelamento da consulta anterior, restrição à área do município e descarte de resultados fora do limite.
- Selecionar uma sugestão:
  - preenche rua e distrito;
  - posiciona o mapa e o marcador;
  - pede para conferir: "Confira se o marcador está no trecho certo e arraste se precisar".
- Atribuição visível: "Busca: OpenStreetMap / Photon".
- Limites desenhados como linhas finas tracejadas, que não competem com os relatos.
- Configuração: `VITE_GEOCODER_URL` (permite trocar o Photon público por uma instância própria no futuro).

### 2.4 Riscos
- **API do IBGE indisponível ou com formato diferente:** o robô falha com mensagem clara e nada é gravado. O app funciona sem os limites: sem distrito automático e sem bloqueio de ponto fora do município.
- **Photon público com limite de uso:** o uso é baixo no piloto. Se crescer, hospedar uma instância própria (custo de servidor). A busca local de ruas não depende do Photon.
- **Nomes de rua faltando no OSM em bairros periféricos:** a pessoa sempre pode digitar a rua e marcar no mapa.

### 2.5 Critérios de aceite
1. O robô gera os arquivos com dados reais do IBGE e do OSM, e `fontes.json` registra URL, data e licença.
2. Distritos detectados corretamente por ponto em polígono (testes unitários com geometria conhecida e, depois da geração, com pontos de referência dos 4 distritos).
3. Ponto fora do município bloqueia a etapa com mensagem clara (teste de ponta a ponta).
4. A busca sugere ruas do índice, separa nomes iguais por distrito, preenche rua, distrito e marcador, e trata "não encontrado" (teste de ponta a ponta com índice de teste).
5. O Photon é consultado com a área do município, e resultados fora do limite são descartados (teste com resposta simulada).
6. A busca local funciona offline depois do primeiro carregamento (teste no projeto `pwa`).
7. A suíte, a matriz de telas e a acessibilidade continuam passando.

## 3. Como foi

**Status:** implementado e testado (versão 0.7.0), com uma pendência de dados: os limites oficiais do IBGE (ver 3.2).

### 3.1 Entregue
- **Pipeline de dados** (`scripts/geo/build.mjs` + `src/geo/pipeline.ts`) e o **robô** `dados-geograficos.yml` (sob demanda), que gravam `public/geo/` com `fontes.json` (URLs, data e licença).
- **Dados reais gerados** (02/11/2026):
  - 4 distritos e o contorno do município;
  - **4.155** entradas no índice de ruas (57 kB comprimido);
  - **73** nomes de bairro do OSM.
- **Distrito automático** pelo ponto marcado (mapa, GPS ou busca), com o texto indicando a fonte do limite.
- **Ponto fora do município** bloqueia a etapa, com mensagem clara.
- **Busca com sugestões** (`AddressSearch`, padrão *combobox* acessível, com teclado e leitor de tela):
  - índice local de ruas e bairros, que funciona offline;
  - Photon com espera de 400 ms, cancelamento e restrição ao município;
  - homônimas separadas por distrito;
  - "não encontrado" com orientação;
  - remoção do número de porta na busca local.
- **Sugestões de bairro** no campo Bairro (nomes do OSM, filtrados pelo distrito).
- **Limites desenhados** no Mapa ao Vivo e no mapa do formulário: município em linha contínua, distritos tracejados.
- **Mapa ao Vivo:** a busca sugere ruas e bairros e leva o mapa até eles.
- **Sobre:** créditos com a fonte real dos limites, lida de `public/geo`.

### 3.2 Desvios e problemas encontrados
| Situação | O que foi feito |
|---|---|
| **A API do IBGE recusou as conexões do GitHub Actions** (3 tentativas com tempo esgotado em `servicodados.ibge.gov.br:443`; a API costuma bloquear acessos de fora do Brasil). | O robô passou a **tentar o IBGE e, se falhar, usar as relações administrativas do OpenStreetMap** (município com o código IBGE 3301702 e os 4 distritos), registrando em `fontes.json` (`oficial_ibge: false`) que **não é a malha oficial**. O app mostra "limite do OpenStreetMap" em vez de "oficial do IBGE". **Pendente:** gerar com o IBGE a partir de um computador no Brasil (comando abaixo). |
| O OSM grafa um distrito como **"Campos Elyseos"**. | Padronização para os 4 nomes oficiais, guardando o nome original (`nome_original`). |
| A revisão visual pegou o texto "limite oficial do IBGE" aplicado a dados do OSM. | Texto passou a depender da fonte. |
| O teste do fluxo completo escolhia o distrito antes de marcar o ponto; com o distrito automático, o clique passou a trocar o distrito (comportamento correto). | Teste ajustado: marca o ponto, verifica o distrito detectado e depois a pessoa corrige; usa limites sintéticos para ser determinístico. |

**Para gerar os limites oficiais do IBGE** (num computador no Brasil, com Node 22.18 ou mais novo):
```bash
node scripts/geo/build.mjs --source ibge
```
Depois, faça o commit de `public/geo/` e envie para o GitHub. O app passa a exibir "limite oficial do IBGE" automaticamente.

### 3.3 Resultados
- **Validação dos dados reais:** o Centro de Duque de Caxias, Xerém, Imbariê e Campos Elíseos caem nos distritos corretos, e o centro do Rio de Janeiro fica fora do município.
- Unitários: geometria (incluindo buracos e multipolígonos), processamento (IBGE e OSM), índice (homônimas, vias sem nome ou fora), busca, distrito automático e Photon simulado (área do município enviada, resultado de fora descartado).
- Ponta a ponta (`e2e/address.spec.ts`, celular e desktop): homônimas por distrito; preenchimento de rua, distrito e ponto; Photon com teclado; "não encontrado"; GPS fora bloqueia e GPS dentro preenche o distrito; busca do Mapa ao Vivo.
- Projeto `pwa`: busca de ruas **offline** depois do primeiro uso.
- Os testes de ponta a ponta usam **dados sintéticos** (`e2e/fixtures/geo`), para serem determinísticos.
- Suíte completa: **unitários 54/54**; ponta a ponta **94 passaram**, 31 ignorados (por desenho), **0 falhas**.

### 3.4 Pendências
- Limites oficiais do IBGE (comando acima).
- Base oficial de bairros (Prefeitura ou Censo 2022): continua pendente; os nomes do OSM são só sugestões.
- Photon público: avaliar uma instância própria se o uso crescer.
