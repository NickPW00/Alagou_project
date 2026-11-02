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
*(preenchido ao concluir o item)*
