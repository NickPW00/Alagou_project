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
*(preenchido ao concluir o item)*
