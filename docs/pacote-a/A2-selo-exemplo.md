# A2 — Selo "EXEMPLO" nos dados fictícios

## 1. O que será implementado
Agora que o mapa mostra ruas reais, um ponto fictício sobre uma rua de verdade pode ser lido como ocorrência real por quem olha de relance. Todo dado de demonstração passa a ter um **selo "EXEMPLO"** visível:
- no mapa: em cada ponto e em cada agrupamento de pontos;
- nas listas (mapa, Início, Mapa da Memória, painel administrativo) e nos painéis de detalhe.

Fora do escopo: mudar os dados de demonstração.

## 2. Como será
- **Marcação no dado, não só na tela:** os tipos `PublicReport` e `HistoricalReport` ganham o campo `example?: boolean`. A fonte de demonstração marca `example: true` em todos os registros, inclusive nos enviados pelo formulário no modo demonstração. Assim o selo não depende de uma variável global e continua correto se, no futuro, a tela misturar fontes.
- **Mapa:** camada de símbolos com uma imagem "EXEMPLO" desenhada em canvas (fundo amarelo de atenção, texto azul-escuro, borda branca), logo abaixo de cada ponto. Os agrupamentos herdam a marcação por uma propriedade agregada (`clusterProperties`). A imagem não depende das fontes do estilo do mapa, então funciona mesmo com o mapa base indisponível.
- **Telas:** componente `ExampleTag` ("EXEMPLO", com texto acessível "dado fictício de exemplo") ao lado do nome da rua.

Alternativa considerada: mudar a cor dos pontos fictícios. Descartada, porque a cor é a informação principal (situação da rua) e precisa ser a mesma dos dados reais para a demonstração fazer sentido.

### Critérios de aceite
1. Todo registro da fonte de demonstração tem `example: true` (teste unitário).
2. Detalhe do relato, listas do mapa, Início, Memória e painel administrativo mostram "EXEMPLO" em cada item fictício (teste de ponta a ponta).
3. No mapa, o selo aparece sob pontos e agrupamentos (revisão visual da galeria).
4. Sem violações de acessibilidade sérias ou críticas; a matriz do A1 continua passando.

## 3. Como foi

**Status:** implementado e testado (versão 0.4.0).

### 3.1 Entregue
- Campo `example` nos tipos de relato e de memória; a fonte de demonstração marca todos os registros, inclusive os enviados pelo formulário.
- Selo "EXEMPLO" no mapa, sob pontos, agrupamentos e pontos históricos ([print](../img/a2-selo-exemplo-mapa.png)), desenhado em canvas e com alternativa para navegadores sem `roundRect` (iOS < 16).
- Componente `ExampleTag` no detalhe do relato, nas listas do mapa (inclusive na lista lateral de telas largas), no Início, no Mapa da Memória, no painel administrativo e no detalhe histórico. Para leitores de tela, o selo é lido como "EXEMPLO — dado fictício de demonstração".

### 3.2 Desvios
Nenhum.

### 3.3 Resultados
- Teste unitário novo: todos os registros de demonstração têm `example: true` (21/21 unitários).
- Teste de ponta a ponta novo (`e2e/example-tag.spec.ts`): conta os selos em cada tela (3 no Início, 8 na lista do mapa, 3 na Memória, 8 no painel administrativo), no celular e no desktop.
- Suíte completa: **67 passaram**, 31 ignorados (por desenho), **0 falhas**; matriz de responsividade do A1 mantida.
- Revisão visual: o selo não cobre a cor da situação nem a seta de tendência.
