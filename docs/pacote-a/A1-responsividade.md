# A1 — Responsividade

## 1. O que será implementado

Corrigir os problemas medidos no estudo ([plano, seção 1](../02-plano-proximas-etapas.md)) e garantir, por testes automáticos, que o app funciona bem nos **celulares mais comuns no Brasil**, além de tablets, notebooks e monitores.

Problemas a resolver:
1. **Menu do topo sobre o nome Alag@u** em telas de 1024–1439 px (notebooks e projetores).
2. **Mapa baixo demais** com o celular deitado (142 px em 844×390) e em telas de 320 px.
3. **Telas muito estreitas** (≤ 359 px): busca espremida, faixa de demonstração e filtros ocupando várias linhas.
4. **Tablets**: hoje usam o layout de celular esticado, e o painel de detalhes cobre o mapa.
5. **Monitores grandes**: espaço lateral desperdiçado.

Fora do escopo: testes em aparelhos físicos (sem aparelhos disponíveis; ficam para a Fase 7) e mudanças de conteúdo.

## 2. Como será

### 2.1 Matriz de telas (celulares mais comuns)
Tamanhos em pixels CSS. Os modelos são exemplos aproximados de cada tamanho.

| Perfil | Tamanho | Exemplos |
|---|---|---|
| Android compacto | 360×800 | Galaxy A0x/A1x, Moto E, Redmi A |
| Android médio | 384×854 | Galaxy A1x/A2x |
| Android médio-grande | 393×873 | Moto G, Redmi Note |
| Android grande | 412×915 | Galaxy A3x/A5x |
| iPhone SE (2ª/3ª) | 375×667 | tela baixa e estreita |
| iPhone 12–15 | 390×844 | — |
| iPhone 11 / XR | 414×896 | — |
| Android deitado | 800×360 | — |
| iPhone deitado | 844×390 | — |
| Limite: tela pequena | 320×568 | celulares antigos |
| Limite: dobrável | 280×653 | Galaxy Fold (tela externa) |
| Tablet em pé | 768×1024 | — |
| Notebook / projetor | 1280×720 | — |
| Notebook comum | 1366×768 | — |
| Monitor | 1920×1080 | — |

### 2.2 Mudanças de layout

| Faixa | Mudança |
|---|---|
| **Desktop 1024–1439 px** | Topo com o nome Alag@u e só os itens principais (Início, Mapa, Avisar alagamento, Alertas) + botão **"Mais"** que abre um menu com os demais. Acima de 1440 px, todos os itens, se couberem. |
| **768–1023 px** (tablets e celulares deitados) | Barra inferior substituída por um **trilho lateral** à esquerda (ícones + rótulos curtos, com o botão "Avisar" destacado). Ganha altura útil, o que é decisivo em celular deitado. |
| **Tela baixa** (altura ≤ 500 px na horizontal) | Na página do mapa, o cabeçalho é escondido (a marca fica no topo do trilho) e a faixa de demonstração vira uma linha curta. |
| **≤ 479 px** | Barra de filtros do mapa compacta: busca + botão **"Filtros"**, que mostra distrito, período, lista e legenda. |
| **≤ 359 px** | Texto curto na faixa de demonstração ("DEMONSTRAÇÃO · dados fictícios"). |
| **≥ 768 px** | Detalhe do relato como **painel lateral** (não cobre o centro do mapa). |
| **≥ 1440 px** | Na página do mapa, **lista de relatos fixa ao lado do mapa**. |
| **≥ 1024 px** | Etapa "Onde aconteceu?" do formulário em **duas colunas** (campos à esquerda, mapa à direita). |

Implementação: classes responsivas do Tailwind e uma variante própria `short` (`@media (max-height: 500px) and (orientation: landscape)`), sem JavaScript para detectar a tela.

Alternativas consideradas:
- *Esconder a barra inferior ao rolar o mapa* — descartada: confunde quem tem menos familiaridade digital.
- *Menu hambúrguer no desktop* — descartada: esconde a navegação de quem usa projetor; o "Mais" mantém os itens principais à vista.

### 2.3 Riscos
- O trilho lateral muda a posição da navegação em tablets: os rótulos ficam visíveis para não perder clareza.
- Mais variações de layout significam mais chances de regressão; a matriz automática no CI cobre isso.

### 2.4 Critérios de aceite (verificados automaticamente em todos os 15 tamanhos)
1. Sem rolagem lateral em nenhuma página.
2. O nome Alag@u não se sobrepõe a nenhum item de navegação.
3. Mapa ao Vivo com altura útil ≥ 55% da tela (≥ 50% em 280 px).
4. Itens de navegação com área de toque ≥ 44×44 px em telas de toque.
5. Nenhuma violação de acessibilidade séria ou crítica (axe) no Início e no Mapa.
6. Navegação acessível: no celular em pé, barra inferior; de 768 a 1023 px, trilho lateral; a partir de 1024 px, topo.
7. Galeria de prints gerada a cada execução do CI, para revisão visual.

### 2.5 Plano de testes
- Novo `e2e/responsive.spec.ts` com a matriz acima.
- Os testes existentes continuam nos perfis celular (Pixel 7) e desktop (1280 px).
- Revisão visual da galeria antes de concluir o item.

## 3. Como foi

**Status:** implementado e testado (versão 0.3.0).

### 3.1 Entregue
- **Topo do desktop:** marca + Início, Mapa, Avisar alagamento, Alertas e um menu **"Mais"** (fecha com Esc, com clique fora ou ao navegar). A marca não encolhe e o menu não quebra linha. A partir de 1600 px, todos os itens ficam visíveis.
- **Trilho lateral** de 768 a 1023 px (tablets e celulares deitados), com o botão "Avisar" destacado e alvos de toque ≥ 44 px. A lista de itens fica fixa ao rolar a página.
- **Tela baixa** (celular deitado): cabeçalho escondido, marca no topo do trilho e faixa de demonstração numa linha curta.
- **Filtros do mapa compactos** (≤ 479 px e tela baixa): busca + botão **"Filtros"**, com contador de filtros ativos.
- **"Atualizado às…"** passou a ser um selo sobre o mapa, visível em todos os tamanhos.
- **Painel lateral** de detalhes a partir de 768 px. **Lista fixa ao lado do mapa** a partir de 1440 px.
- **Formulário** "Onde aconteceu?" em duas colunas a partir de 1024 px, com o mapa maior e fixo.
- **Matriz automática** (`e2e/responsive.spec.ts`) com 15 tamanhos, e a **galeria de prints** publicada como artefato a cada execução da CI (`galeria-telas`).

### 3.2 Desvios em relação ao planejado
| Planejado | Feito | Motivo |
|---|---|---|
| Todos os itens no topo a partir de 1440 px | A partir de **1600 px** | Medido: os 10 itens com os nomes completos não cabem numa linha em 1440 px |
| Esconder o cabeçalho em tela baixa só no mapa | Escondido em **todas as páginas** em tela baixa | Na revisão visual, o item "Mais" do trilho ficava cortado no Início com o celular deitado |

### 3.3 Resultados
| Tela | Mapa antes | Mapa depois |
|---|---|---|
| Celular deitado 844×390 | 142 px (36%) | ≥ 55% (critério verificado) |
| 320×568 | 212 px (37%) | ≥ 55% |
| Notebook 1280×720 | menu sobre a marca | sem sobreposição (verificado por teste) |

- Matriz de responsividade: **30/30** testes passando (15 tamanhos × 2 testes).
- Suíte completa: **65 passaram**, 31 ignorados (a matriz roda só uma vez, no projeto desktop; o teste do menu "Mais" é só de celular), **0 falhas**. Testes unitários: **20/20**.
- Problemas encontrados pelos testes e corrigidos durante o item:
  - alvo de toque de 36 px no logo do trilho;
  - "Mais" cortado no celular deitado;
  - seletores duplicados de distrito nos testes antigos.

### 3.4 Pendências
- Teste em aparelhos físicos (Fase 7).
- Zoom de texto em 200%: não entrou na matriz automática nesta versão. Fica para revisão em conjunto com o A6 (conteúdo).
