# A5 — Destaque do trecho da rua

Decisões da coordenação (02/11/2026): limite de **100 m para cada lado do ponto**, cortado nos cruzamentos; **a pessoa confirma o trecho** no formulário; na demonstração, trechos **tracejados com o selo "EXEMPLO"**.

## 1. O que será implementado
1. **Trechos de rua** de Duque de Caxias: cada rua do OpenStreetMap dividida nos cruzamentos (e nos finais de rua), com identificador, nome e comprimento.
2. **No formulário (etapa 1):** ao marcar o ponto, o app encontra o trecho mais próximo (até 30 m), destaca no mapa a parte de até 100 m para cada lado do ponto e pergunta **"A água está neste trecho?"**:
   - **Sim, neste trecho**: o relato fica associado ao trecho destacado;
   - **Só perto do ponto**: o relato fica só como ponto;
   - **Escolher outra rua**: lista as outras vias próximas (até 3) para escolher.
   - Sem rua próxima (rua ausente no OSM, ponto em terreno etc.): segue como ponto simples, sem inventar trecho.
   - Se a rua do trecho escolhido tiver nome e o campo "Nome da rua" estiver vazio, o campo é preenchido.
3. **No mapa:** com zoom de rua (≥ 15), cada relato com trecho aparece como **linha grossa na cor da situação**, com borda branca, e a seta de tendência fica no ponto observado. Relato desatualizado: linha cinza. Na demonstração: **tracejado**, com o selo "EXEMPLO" mantido no ponto.
4. **Legenda:** "A linha indica o trecho de referência do relato; a água pode não ocupar toda a extensão."

Fora do escopo: associação no servidor (Fase 3, tabela `street_segments`) e estatísticas por trecho (Fase 6).

## 2. Como será

### 2.1 Geração dos trechos (robô do A4, ampliado)
- A mesma consulta ao Overpass do A4 já traz, para cada via, a geometria e os **identificadores dos nós**. Um nó usado por duas ou mais vias (ou repetido na mesma via) é um **cruzamento**.
- Cada via é cortada nos cruzamentos e nas pontas → **trecho** = `{ id: "<via>-<n>", nome, tipo de via, comprimento, coordenadas }`. Coordenadas com 5 casas decimais (~1 m).
- Só entram trechos com o ponto médio dentro do município.
- **Divisão em blocos (células):** grade de 0,01° (~1,1 km). Cada célula vira um arquivo `public/geo/trechos/<x>_<y>.json` com os trechos que a tocam. O app só baixa as células em volta do ponto, o que é leve no celular e funciona offline depois de baixado (cache do service worker).
- Índice `public/geo/trechos/indice.json`: lista das células existentes e o tamanho da grade.
- **Medição do tamanho** (critério de aceite): tamanho total e tamanho médio por célula registrados em `fontes.json`.

### 2.2 No app
- `src/geo/segments.ts`, com funções puras e testadas:
  - ponto mais próximo sobre uma linha (projeção em metros, por aproximação local equirretangular, suficiente para distâncias de até ~1 km);
  - recorte da linha a ±100 m do ponto projetado, limitado às pontas do trecho (que já são os cruzamentos);
  - escolha das vias candidatas até 30 m, ordenadas por distância, com uma por nome de rua.
- `ReportDraft` ganha `segment?: { id; name?; line: [lng, lat][]; extent: 'segment' | 'point' }`. `PublicReport` ganha `segmentLine?`.
- **Demonstração:** os relatos fictícios passam a ter trecho resolvido da mesma forma, a partir dos blocos (sem inventar geometria). Se não houver rua a até 30 m, ficam como ponto.
- **Mapa:** camada de linhas a partir do zoom 15, com espessura crescente conforme o zoom, filtrada para os relatos visíveis; tracejado quando `example`.

### 2.3 Cuidados (aprovados na revisão)
- **Não exagerar a informação:** limite de 100 m, confirmação pela pessoa e texto na legenda e no detalhe do relato.
- **Pista dupla, viadutos, rotatórias:** a pessoa escolhe entre as vias próximas ("Escolher outra rua"); o app não tenta adivinhar.
- **Licença ODbL:** os trechos são base derivada do OSM, com atribuição nos créditos e em `fontes.json`.

### 2.4 Critérios de aceite
1. O robô gera trechos cortados nos cruzamentos e os blocos, com tamanho medido e registrado (teste unitário com dados sintéticos: cruzamento em T, cruzamento em X, via que se repete).
2. Recorte a ±100 m correto, inclusive perto das pontas (testes unitários).
3. Formulário:
   - destaca o trecho, pergunta e permite "Sim", "Só perto do ponto" e "Escolher outra rua";
   - sem rua próxima, segue como ponto;
   - a escolha aparece na revisão (teste de ponta a ponta com blocos sintéticos).
4. Mapa: trecho aparece no zoom de rua e some no zoom afastado; tracejado na demonstração (revisão visual).
5. Detalhe do relato e legenda com o aviso sobre a extensão.
6. A suíte, a matriz de telas e a acessibilidade continuam passando.

## 3. Como foi

**Status:** implementado e testado (versão 0.8.0).

### 3.1 Entregue
- **Trechos reais** gerados pelo robô: **22.355 trechos** de Duque de Caxias em **330 blocos**.
  - Peso comprimido por bloco: mediana 1,6 kB, 90% abaixo de 4,9 kB, máximo 7,6 kB.
  - Os 9 blocos em volta de um ponto somam ~14 kB no caso típico e ~66 kB no pior caso.
  - Medição registrada em `public/geo/fontes.json`.
- `src/geo/segments.ts`: divisão nos cruzamentos, ponto mais próximo, recorte a ±100 m limitado aos cruzamentos, vias candidatas (até 30 m, uma por nome) e células.
- **Formulário:**
  - "A água está neste trecho?" com "Sim, neste trecho", "Só perto do ponto" e "Escolher outra rua" (com a distância de cada via);
  - preenchimento do nome da rua;
  - resposta obrigatória quando há rua próxima;
  - mover o ponto refaz a pergunta;
  - o rascunho guarda a escolha;
  - o trecho aparece na revisão;
  - o mapa enquadra o trecho destacado ([print](../img/a5-trecho-formulario.png)).
- **Mapa:** linhas na cor da situação a partir do zoom 15, cinza quando desatualizadas e **tracejadas com o selo "EXEMPLO"** na demonstração ([print](../img/a5-trecho-exemplo-mapa.png)).
- **Detalhe do relato e legenda** com o aviso sobre a extensão.
- **Demonstração:** os relatos fictícios usam o mesmo método. 4 dos 8 ganharam trecho (rua real a até 30 m) e 4 ficaram como ponto, sem trecho inventado.

### 3.2 Desvios e ajustes feitos na revisão
| Situação | O que foi feito |
|---|---|
| No zoom inicial, o trecho de 200 m quase sumia atrás do marcador. | O mapa enquadra o trecho destacado (até zoom 17,5), e focar um relato aproxima até zoom 16,5. |
| O tracejado com traços curtos parecia "losangos". | Traços mais longos (2,5 × 1,5). |
| O detalhe de um relato fictício citaria o nome de uma rua real ("Trecho de referência na Avenida…"). | Os trechos de demonstração não guardam o nome da rua real. |
| Texto desatualizado sob o campo de rua ("a busca será adicionada na Fase 3"). | Removido; a busca já existe desde o A4. |

### 3.3 Resultados
- Unitários: cruzamento em T e em X, laço, comprimento, projeção, recorte (meio, ponta, trecho curto), candidatas (ordem, distância máxima, uma por nome), células e validação da confirmação (55/55 no total).
- Ponta a ponta (`e2e/segment.spec.ts`, celular e desktop, trechos sintéticos):
  - confirmação obrigatória;
  - "Escolher outra rua";
  - nome preenchido;
  - trecho na revisão e no detalhe após o envio;
  - "Só perto do ponto";
  - sem rua próxima, segue sem perguntar.
- Suíte completa: **100 passaram**, 31 ignorados (por desenho), **0 falhas**.
- Revisão com dados reais: um ponto na Avenida Presidente Kennedy detectou a via correta e destacou o trecho.

### 3.4 Pendências
- Associação relato → trecho no servidor e estatísticas por trecho (Fases 3 e 6).
- Pista dupla: hoje a pessoa escolhe o sentido em "Escolher outra rua"; a opção "ambos os sentidos" fica para avaliação com uso real.
