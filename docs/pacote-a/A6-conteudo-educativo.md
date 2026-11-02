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
*(preenchido ao concluir o item)*
