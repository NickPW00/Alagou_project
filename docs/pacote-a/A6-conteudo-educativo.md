# A6 — Conteúdo de segurança e educativo (rascunho para revisão)

## 1. O que será implementado
1. **Textos curtos** dos módulos 1 a 5 do "Aprenda e Previna", em linguagem popular:
   - Por que as ruas alagam?
   - Entenda os fenômenos
   - Como se proteger?
   - Cidades resilientes
   - Ciência cidadã
2. **Guia de segurança** "antes, durante e depois da chuva" (módulo 3), com os contatos 199 e 193.
3. **Quiz** de 4 perguntas (módulo 2), com explicação de cada resposta e funcionamento offline.
4. Todo o conteúdo marcado como **"Rascunho em revisão pela equipe Meninas pelo Clima"** até a aprovação.

Fora do escopo: gerenciador de conteúdo com edição pelo painel (Fase 6, com banco), vídeos, ilustrações e materiais para download.

## 2. Como será
- **Conteúdo em arquivo versionado** (`src/content/aprenda.ts`): texto estruturado (título, parágrafos, listas). Isso permite revisão por *pull request* e histórico de alterações, e na Fase 6 o conteúdo migra para o gerenciador sem reescrita.
- **Exibição** em seções expansíveis acessíveis (`<details>`/`<summary>`, que funcionam com teclado e leitor de tela), uma por módulo.
- **Terminologia** (módulo 2) coerente com o uso do Cemaden e da Defesa Civil para alagamento, inundação, enchente (cheia) e enxurrada.
- **Referências:** nenhuma referência bibliográfica é inventada. O texto indica apenas as **instituições** cujas orientações devem ser conferidas pela equipe (Cemaden, Defesa Civil), com links para os sites institucionais. A lista definitiva de referências fica a cargo da equipe científica.
- **Segurança:**
  - nunca orientar a entrar na água;
  - eletricidade e contaminação em destaque;
  - grupos vulneráveis (crianças, idosos, pessoas com deficiência);
  - emergência: 199 (Defesa Civil) e 193 (Bombeiros).

### Critérios de aceite
1. Os 5 módulos com texto, cada um com o selo "Rascunho em revisão".
2. Quiz funcional: resposta certa ou errada com explicação, navegável por teclado (teste de ponta a ponta).
3. Nenhuma orientação para entrar em água e nenhuma referência inventada (revisão do texto).
4. Acessibilidade e matriz de telas continuam passando.

## 3. Como foi

**Status:** implementado e testado (versão 0.9.0). O conteúdo continua **aguardando revisão da equipe**.

### 3.1 Entregue
- `src/content/aprenda.ts`: textos dos módulos 1 a 5:
  - causas dos alagamentos, incluindo a geografia da Baixada e a justiça climática;
  - alagamento, enchente, inundação, enxurrada, precipitação, nível da água e bacia hidrográfica;
  - segurança antes, durante e depois, com eletricidade, contaminação e grupos vulneráveis;
  - soluções baseadas na natureza;
  - ciência cidadã.
- Página com módulos expansíveis acessíveis, selo **"Rascunho em revisão pela equipe Meninas pelo Clima"**, quiz de 4 perguntas com explicação e placar, e links institucionais (Cemaden, Defesa Civil RJ) para conferência.

### 3.2 Desvios
Nenhum.

### 3.3 Resultados
- **Teste-guarda do conteúdo** (`src/content/aprenda.test.ts`):
  - toda frase que fala em entrar ou atravessar ruas ou água contém "não" ou "nunca";
  - nenhuma referência bibliográfica;
  - 199/193 presentes;
  - respostas do quiz válidas.
- Ponta a ponta (`e2e/learn.spec.ts`): módulos abrem por clique e por teclado; quiz com acerto, erro, explicação, placar e "Refazer"; sem violações de acessibilidade.
- Suíte completa: unitários **59/59**; ponta a ponta **104 passaram**, 31 ignorados (por desenho), **0 falhas**.

### 3.4 Pendências (para a equipe)
- Revisar todos os textos, especialmente as definições do módulo 2, conferindo nos materiais do Cemaden e da Defesa Civil.
- Definir a lista de referências científicas.
- Ilustrações, vídeos e materiais para download (Fase 6).
