# Alag@u — Plano das próximas etapas (revisão para autorização)

**Status:** proposta. Nada deste documento foi implementado. Aguarda autorização da coordenação.

Organização:
1. Estudo de responsividade, com diagnóstico medido na versão atual
2. Destaque do trecho da rua no mapa
3. Pacote A — o que pode ser feito **sem banco de dados**
4. Pacote B — o que **depende do banco de dados** (Fase 3 em diante)
5. Decisões necessárias

Esforço em escala relativa: **P** (pequeno), **M** (médio), **G** (grande).

---

## 1. Estudo de responsividade

### 1.1 Diagnóstico da versão atual (medido em 02/11/2026)

Medição automatizada (Playwright) em 11 tamanhos de tela, na versão publicada da Fase 2:

| Tela | Exemplo | Altura útil do mapa | Rolagem lateral | Observação |
|---|---|---|---|---|
| 280×653 | Galaxy Fold (tela externa) | 297 px (45%) | não | Campo de busca espremido ("Pesq…"), faixa de demonstração ocupa 3 linhas, filtros ocupam 3 linhas |
| 320×568 | Android pequeno / iPhone SE (1ª geração) | **212 px (37%)** | não | Mapa pequeno demais para uso confortável |
| 360×740 | Android popular | 428 px (58%) | não | Adequado |
| 390×844 | iPhone 12–15 | 532 px (63%) | não | Adequado |
| 430×932 | Celular grande | 620 px (67%) | não | Adequado |
| **844×390** | **Celular deitado** | **142 px (36%)** | não | **Praticamente inutilizável**: cabeçalho, filtros e barra inferior ocupam a tela ([print](img/resp-844x390-mapa-baixo.png)) |
| 768×1024 | Tablet em pé | 776 px (76%) | não | Usa o layout de celular esticado |
| **1024×768** | **Tablet deitado** | 556 px (72%) | não | **Defeito: o menu do topo quebra em 2 linhas e fica por cima do nome Alag@u** |
| **1280×720** | **Notebook / projetor** | 508 px (71%) | não | **Mesmo defeito** ([print](img/resp-1280-menu-sobre-logo.png)) |
| 1366×768 | Notebook comum | 556 px (72%) | não | Mesmo defeito |
| 1920×1080 | Monitor | 868 px (80%) | não | Adequado, mas desperdiça espaço lateral |

Pontos positivos: **nenhuma tela tem rolagem lateral**, e a acessibilidade passa nos dois perfis já testados (celular 412 px e desktop 1280 px).

O defeito do menu é o mais urgente: afeta justamente notebooks e projetores, que são o cenário de uma apresentação.

### 1.2 Faixas de tela e comportamento proposto

| Faixa | Largura × altura | Navegação | Mapa ao Vivo | Detalhe do relato | Formulário |
|---|---|---|---|---|---|
| XS | < 360 px | Barra inferior só com ícones e rótulos curtos | Busca numa linha; filtros num botão "Filtros" que abre um painel | Painel inferior | 1 coluna |
| Celular | 360–767 px | Barra inferior atual | Barra de filtros compacta e recolhível ao rolar o mapa | Painel inferior (até 75% da altura) | 1 coluna |
| **Tela baixa** (qualquer largura com altura < 500 px: celular deitado) | — | Barra lateral fina à esquerda em vez da inferior; cabeçalho escondido no mapa | Filtros num botão sobre o mapa; mapa ocupa ≥ 75% da área | Painel lateral à direita | 1 coluna, botões fixos à direita |
| Tablet | 768–1023 px | Barra lateral com ícones e rótulos | Filtros no topo, numa linha | **Painel lateral** (não cobre o mapa) | 2 colunas: campos + mapa |
| Desktop | 1024–1439 px | Topo com os 5 itens principais + menu "Mais" (corrige a sobreposição) | Filtros no topo | Painel lateral | 2 colunas |
| Desktop largo | ≥ 1440 px | Topo completo | **Lista e mapa lado a lado** (útil em projetor e para a equipe) | Painel lateral | 2 colunas |

Outros pontos do estudo:
- **Zoom de texto em 200% e fonte grande do Android** (WCAG 1.4.4 e 1.4.10): rótulos não podem ser cortados nem sobrepostos.
- **Áreas seguras** (notch do iPhone na horizontal, barra de gestos do Android).
- **Faixa de demonstração compacta** no mapa: uma linha só ("DEMONSTRAÇÃO · dados fictícios"), com o texto completo ao tocar.
- **Alvos de toque** de no mínimo 44×44 px em telas de toque.
- **Desempenho em aparelhos simples**: medir o tempo até o mapa aparecer em rede 3G simulada.

### 1.3 Como será testado
- **Matriz automatizada no CI**: os 11 tamanhos acima, mais 200% de zoom, nas páginas principais. Verificações automáticas:
  - sem rolagem lateral;
  - mapa com altura mínima de 50% da tela ou 240 px;
  - **logo e menu sem sobreposição**, comparando as caixas dos elementos;
  - alvos de toque ≥ 44 px;
  - acessibilidade (axe) em todos os tamanhos.
- **Galeria de prints** gerada a cada envio, para revisão visual pela equipe.
- **Aparelhos reais** (lista de checagem manual): um Android simples, um iPhone, um tablet e o projetor que será usado nas apresentações.

**Critério de aceite:** todas as verificações automáticas passam nos 11 tamanhos, e a revisão visual dos prints não aponta corte de texto nem sobreposição.

**Esforço:** M. Não depende do banco.

---

## 2. Destaque do trecho da rua no mapa

**Ideia:** em vez de só um ponto, pintar o **trecho da rua** onde o relato foi feito, indo até os cruzamentos (transversais) ou até o fim da rua. Assim fica visualmente claro qual rua está com água.

### 2.1 Avaliação
A ideia é boa e se encaixa no modelo de dados já aprovado: o **"local monitorado"** (Fase 1, seção 4) passa a ser exatamente esse trecho de rua. Isso também simplifica o agrupamento de relatos, que passa a ser "mesmo trecho" em vez de "raio de 50 m".

Há quatro cuidados, sendo o primeiro o mais importante:

1. **Não exagerar a informação (cuidado científico).** Um relato vale para o que a pessoa viu, e um trecho entre dois cruzamentos pode ter centenas de metros, principalmente em avenidas e nas estradas de Xerém. Pintar o trecho inteiro pode sugerir que ele está todo alagado. Propostas:
   - **limite de extensão destacada**, inicialmente até 100 m para cada lado do ponto, cortado nos cruzamentos. É um parâmetro configurável, a ser validado pela equipe científica;
   - **confirmação no formulário**: depois de marcar o ponto, o app destaca o trecho detectado e pergunta "A água está neste trecho?", com as opções *Sim, o trecho todo* / *Só perto do ponto* / *Escolher outro trecho*;
   - texto na legenda: "A linha indica o trecho de referência do relato; a água pode não ocupar toda a extensão".
2. **Pontos fictícios sobre ruas reais.** Na demonstração, pintar ruas reais de vermelho aumenta o risco de alguém achar que é verdade. Proposta: na demonstração, os trechos aparecem **tracejados e com o selo "EXEMPLO"**.
3. **Casos difíceis do mapa de ruas** (OpenStreetMap):
   - avenidas com pista dupla: cada sentido é uma linha separada, então destacar a mais próxima e oferecer "ambos os sentidos";
   - rotatórias;
   - viadutos e pontes sobre outra rua: preferir a via no nível do chão, e a pessoa pode trocar;
   - ruas sem nome;
   - ruas que ainda não existem no OpenStreetMap, comuns na periferia: **voltar ao ponto simples**, sem inventar trecho.
4. **Licença.** A base de trechos é derivada do OpenStreetMap (licença ODbL). Exige atribuição e, se os trechos forem exportados ou distribuídos, eles seguem a mesma licença.

### 2.2 Como funcionaria tecnicamente
1. **Preparo dos trechos (uma vez e atualizado periodicamente):**
   - uma tarefa automática no GitHub baixa as ruas de Duque de Caxias do OpenStreetMap;
   - recorta pelo limite oficial do IBGE;
   - mantém só as vias de circulação (descarta calçadas, trilhas etc.);
   - **divide cada rua nos cruzamentos**, gerando os trechos com identificador, nome e comprimento.
2. **No formulário:** ao marcar o ponto, o app procura o trecho mais próximo (até ~30 m). Se encontrar, destaca e pede confirmação; se não, segue com o ponto simples.
3. **No mapa:**
   - zoom afastado: continuam os pontos e agrupamentos atuais;
   - **zoom de rua** (aproximado): o trecho aparece como linha grossa na cor da situação, com borda branca, e a seta de tendência fica no ponto observado;
   - relato desatualizado: linha cinza tracejada.
4. **Vários relatos no mesmo trecho:** prevalece a observação válida mais recente. Se houver divergência, aparece o estado "Informações conflitantes".

### 2.3 Sem banco × com banco
- **Sem banco (Pacote A):**
  - pipeline de geração dos trechos;
  - arquivo estático de trechos publicado com o site, dividido por distrito ou em formato de "tiles" (blocos) para ficar leve no celular. **O tamanho ainda precisa ser medido no protótipo**;
  - detecção do trecho e confirmação no formulário;
  - desenho das linhas no mapa (na demonstração, tracejado e com "EXEMPLO").
- **Com banco (Pacote B):**
  - os mesmos trechos vão para uma tabela `street_segments` no PostGIS;
  - a associação relato → trecho passa a ser feita **no servidor**, que é a fonte oficial;
  - o histórico e as estatísticas passam a ser por trecho;
  - nada do Pacote A se perde.

**Esforço:** G, dividido em duas partes: protótipo e medição (M) e acabamento (M).
**Depende de:** limites do IBGE (item A4).

---

## 3. Pacote A — sem banco de dados

Ordem recomendada:

| # | Item | Esforço | Por que nesta ordem | Critério de aceite |
|---|---|---|---|---|
| **A1** | **Responsividade** (seção 1): corrigir a sobreposição do menu, tela baixa, XS, tablets, desktop largo e matriz de testes | M | Defeito visível em notebooks e projetores | Matriz de 11 tamanhos passando no CI e galeria de prints revisada |
| A2 | **Selo "EXEMPLO"** nos pontos fictícios | P | Reduz o risco de confundir demonstração com ocorrência real | Todo ponto e todo detalhe de demonstração identificado |
| A3 | **App instalável (PWA) + rascunho no celular** | M | Ajuda quem tem internet instável | App instalável no Android; formulário preservado após fechar a aba ou ficar sem internet, com o aviso "Salvo só neste celular" |
| A4 | **Busca de endereços com sugestões + limites do IBGE** (município e distritos; distrito preenchido automaticamente) | M | Formulário mais fácil e preciso; base para o A5 | Busca restrita ao município; endereço não encontrado e vários resultados tratados; limites com fonte e data documentadas |
| **A5** | **Trecho da rua** (seção 2) | G | Depende do A4 | Trecho detectado e confirmado no formulário; linhas no mapa no zoom de rua; ponto simples quando não há rua; tamanho dos arquivos medido e aceitável em 3G |
| A6 | **Conteúdo de segurança e educativo** (rascunho para revisão da equipe) | M | Pode ser feito em paralelo | Textos revisados pela equipe antes de publicar; nenhuma referência inventada |
| A7 | **Verificação do INMET**; se houver feed aberto, avisos atualizados por tarefa automática sem banco | P–M | Resultado incerto, depende da fonte | Relatório da verificação (API, licença, formato, frequência); se viável, avisos com fonte, horário e link original |
| A8 | **Rascunhos de Política de Privacidade e Termos** | P | Necessários antes da Fase 3 | Documentos prontos para a revisão jurídica |
| A9 | **Link direto para um relato** (compartilhar abre o ponto no mapa) | P | Complementa o botão "Compartilhar" | Link abre o mapa já com o relato selecionado |

**Fica de fora até decisão sua:** previsão de modelo não oficial (Open-Meteo), que exige rótulo "não é aviso oficial".

Ao fim de cada item: testes, publicação automática na demonstração e relatório do que foi feito.

---

## 4. Pacote B — com banco de dados

| Fase | Conteúdo | Ajustes trazidos por esta revisão |
|---|---|---|
| **3 — Núcleo funcional** | Banco (migrações, RLS, auditoria), login sem senha, papéis, envio real de relatos com validação no servidor e limite de frequência, mapa compartilhado em tempo real com reconexão, Política de Privacidade e Termos | Nova tabela **`street_segments`**; `monitored_locations` passa a apontar para o trecho; o relato guarda o trecho confirmado e a extensão escolhida ("trecho todo" ou "perto do ponto"); o rascunho do celular (A3) passa a ser **enviado automaticamente** quando a conexão volta |
| **4 — Confiabilidade** | Confirmações (uma por pessoa), estados de verificação, agrupamento em eventos, moderação, denúncias, fotos com moderação | Agrupamento **por trecho** em vez de raio de 50 m; moderadores podem corrigir o trecho de um relato |
| **5 — Alertas e memória** | Registro de memórias, avisos da Defesa Civil cadastrados pelos administradores, notificações por bairro | Memórias também associadas a trechos ("nesta rua já alagou") |
| **6 — Educação e pesquisa** | Gerenciador de conteúdo, painel de dados com filtros, exportação anonimizada | Indicadores e exportação **por trecho** (respeitando a licença ODbL); conteúdo do A6 migra para o gerenciador |
| **7 — Publicação** | Testes em aparelhos reais, guia de implantação, preparo para a Google Play | Inclui a lista de checagem de aparelhos reais do item 1.3 |

**Depende de:** projeto Supabase criado pela coordenação e decisões de login e participação de menores (Fase 1).

---

## 5. Decisões necessárias

1. **Autorizar o Pacote A** e a ordem proposta (A1 → A9), ou indicar prioridades diferentes.
2. **Trecho da rua:**
   - limite inicial de extensão destacada (proposta: 100 m para cada lado do ponto, cortado nos cruzamentos);
   - confirmação do trecho pela pessoa no formulário (recomendado: sim);
   - na demonstração, trechos tracejados com "EXEMPLO" (recomendado: sim).
3. **Previsão de modelo não oficial (Open-Meteo):** exibir ou não.
4. **Aparelhos para teste real:** quais celulares, tablets e projetor a equipe tem disponíveis.
5. **Para o Pacote B:** projeto Supabase e as decisões pendentes da Fase 1.
