# A8 — Política de Privacidade e Termos de Participação (rascunhos)

## 1. O que será implementado
1. **Rascunho da Política de Privacidade** (LGPD — Lei nº 13.709/2018), para a fase com banco de dados (Fase 3 em diante).
2. **Rascunho dos Termos de Participação**: regras de uso, segurança, moderação, natureza não oficial das informações e licença das contribuições.
3. **Transparência já na versão atual**: a página Sobre explica o que acontece hoje com os dados de quem usa o app. Mesmo sem banco, alguns serviços externos recebem o endereço IP e o texto da busca. Os rascunhos ficam acessíveis por link.

Fora do escopo: aprovação jurídica (cabe à UERJ) e vigência. Os documentos só passam a valer com a Fase 3 e depois da revisão.

## 2. Como será
- Documentos em Markdown (`docs/legal/`), com o aviso **"RASCUNHO — não vigente; sujeito à revisão jurídica da UERJ"** no topo e campos a definir marcados como **[A DEFINIR]** (controlador, encarregado/DPO, contato, prazos).
- Conteúdo baseado nas decisões de arquitetura (Fase 1, seção 8):
  - minimização: e-mail para login, apelido, faixa etária e aceite dos termos;
  - o autor nunca é exibido publicamente;
  - sem localização contínua;
  - fotos sem metadados e moderadas;
  - menores de idade conforme o art. 14;
  - direitos do titular conforme o art. 18.
- Bases legais **propostas** para validação jurídica: art. 7º, IV (estudos por órgão de pesquisa), art. 7º, III (políticas públicas) e consentimento (art. 7º, I) para notificações e fotos.
- **Serviços de terceiros** listados com o que recebem: OpenFreeMap, Photon, Open-Meteo, INMET e GitHub Pages hoje; Supabase na Fase 3.
- Armazenamento no aparelho: rascunho do aviso, última previsão e cache do app.

### Critérios de aceite
1. Os dois rascunhos completos, com o aviso de não vigência e os campos a definir marcados.
2. A página Sobre com a seção "Seus dados hoje" e os links para os rascunhos (teste de ponta a ponta).
3. Coerência com o que o app faz de fato (revisão: cada serviço externo citado é usado no código, e nenhum serviço usado deixou de ser citado).

## 3. Como foi

**Status:** rascunhos entregues e seção do app implementada e testada (versão 0.11.0). Os documentos **não estão vigentes** e aguardam revisão jurídica da UERJ.

### 3.1 Entregue
- [`docs/legal/politica-de-privacidade-RASCUNHO.md`](../legal/politica-de-privacidade-RASCUNHO.md):
  - dados tratados com e sem cadastro e o que **não** é coletado;
  - localização só sob demanda;
  - bases legais propostas (art. 7º, I, III, IV e IX, a validar);
  - crianças e adolescentes (art. 14);
  - compartilhamentos por serviço;
  - armazenamento no aparelho, prazos, direitos (art. 18) e segurança.
- [`docs/legal/termos-de-participacao-RASCUNHO.md`](../legal/termos-de-participacao-RASCUNHO.md):
  - natureza não oficial e emergência 199/193;
  - regras de segurança e regras dos relatos;
  - moderação, natureza das informações e uso das contribuições (licença a definir; dados derivados do OSM sob ODbL);
  - responsabilidades e encerramento da conta.
- **Página Sobre:** seção **"Seus dados hoje"** (sem cadastro nem banco; serviços externos e o que cada um recebe; o que fica no aparelho e como apagar) e links para os dois rascunhos.

### 3.2 Desvios
Nenhum.

### 3.3 Verificação de coerência
Os serviços chamados automaticamente pelo código (busca em `src/`) são OpenFreeMap, Photon, Open-Meteo e INMET, além da hospedagem no GitHub Pages. **Todos estão citados** na política e na página Sobre, e nenhum serviço usado deixou de ser citado. Os demais endereços do código são links que a pessoa escolhe abrir.

### 3.4 Resultados
- Ponta a ponta (`e2e/privacy.spec.ts`): seção "Seus dados hoje" com os 5 serviços e links para os rascunhos.
- Suíte completa: unitários **65/65**; ponta a ponta **116 passaram**, 31 ignorados (por desenho), **0 falhas**.

### 3.5 Pendências (para a coordenação e o jurídico da UERJ)
- Definir o controlador, o encarregado (DPO) e o contato.
- Validar as bases legais.
- Definir o procedimento para menores, os prazos de retenção e a licença das contribuições.
