# A3 — App instalável (PWA) e rascunho salvo no aparelho

## 1. O que será implementado
1. **App instalável:** o Alag@u pode ser adicionado à tela inicial do celular e abre em tela cheia, como um aplicativo.
2. **Funcionamento com internet ruim ou sem internet:** as telas, os textos e os ícones ficam guardados no aparelho depois da primeira visita. Sem conexão, o app abre normalmente e avisa que está offline.
3. **Rascunho do aviso:** o formulário "Avisar alagamento" é salvo no aparelho enquanto a pessoa preenche. Se a aba fechar, a bateria acabar ou a internet cair, ao voltar o app oferece **"Continuar de onde parei"** ou **"Descartar"**, com o aviso claro de que o rascunho está **"salvo só neste aparelho — ainda não enviado"**.
4. **Atualização segura:** quando houver versão nova, aparece "Nova versão disponível — Atualizar", sem recarregar sozinho (o que poderia atrapalhar quem está preenchendo um aviso).

Fora do escopo (dependem do banco, Fase 3): envio automático do rascunho quando a conexão volta; notificações push; fotos offline (Fase 4).

## 2. Como será

### 2.1 PWA
- **Biblioteca:** `vite-plugin-pwa` 2.x (Workbox), que é o padrão do ecossistema Vite, compatível com o Vite 8 e de código aberto (MIT). Alternativa considerada: service worker escrito à mão. Descartada por ser mais sujeita a erros de cache e de atualização.
- **Manifesto:** nome "Alag@u — Alagou? Avisou!", nome curto "Alag@u", idioma pt-BR, `display: standalone`, cor azul-escuro, `start_url` e `scope` relativos (funciona no subcaminho do GitHub Pages).
- **Ícones:** PNG 192 e 512 px, uma versão *maskable* (com margem de segurança para Android) e `apple-touch-icon` de 180 px. São gerados a partir do SVG do Alag@u por um script versionado (`scripts/gerar-icones.mjs`), usando o navegador do Playwright para renderizar. Os ícones são provisórios até chegar a identidade oficial.
- **Estratégia de cache:**

| Recurso | Estratégia | Motivo |
|---|---|---|
| Página, JS e CSS principais, ícones | Pré-cache na instalação | App abre offline |
| Código do mapa (~290 kB comprimido) | Guardado no primeiro uso | Não gastar dados de quem nunca abre o mapa |
| Estilo do mapa (OpenFreeMap) | Usa a cópia guardada e atualiza em segundo plano | Mapa abre rápido |
| Blocos de mapa (tiles) | Cópia guardada, até 600 blocos por 7 dias | Áreas já vistas funcionam com internet ruim |
| Navegação em rotas (ex.: `/mapa`) | Retorna o app guardado | Links diretos funcionam offline |

- **Aviso de offline:** faixa "Sem internet — mostrando informações salvas neste aparelho", usando os eventos `online`/`offline` do navegador.
- **Instalar:** botão "Instalar o app" quando o navegador oferecer (Chrome/Android). No iPhone, instruções na página Sobre ("Compartilhar → Adicionar à Tela de Início").

### 2.2 Rascunho
- Salvo no `localStorage` do navegador (chave versionada `alagou:rascunho:v1`), com o formulário, a etapa atual e o horário. É pequeno e síncrono, o que basta para texto. Fotos (Fase 4) exigirão IndexedDB.
- Gravação a cada alteração, com pequeno atraso (300 ms) para não gravar a cada tecla.
- Ao abrir o formulário com um rascunho guardado: aviso com data e hora do rascunho e os botões "Continuar de onde parei" e "Descartar". **Nunca restaura em silêncio.**
- Rascunho apagado após envio bem-sucedido ou ao descartar.
- Rascunho com mais de 7 dias: o aviso informa que é antigo. A data da observação continua a do rascunho, e a validação de data futura continua valendo.
- Leitura e gravação protegidas (`try/catch`): em navegação privada ou com armazenamento bloqueado, o formulário funciona normalmente, só sem rascunho.
- **Privacidade:** o rascunho, inclusive o ponto marcado no mapa, fica só no aparelho. A página Sobre informa isso.

### 2.3 Riscos
- Cache antigo servindo versão desatualizada: mitigado pelo aviso de nova versão e pelos arquivos com hash no nome.
- Blocos de mapa guardados ocupam espaço: limitados a 600 blocos e 7 dias.

### 2.4 Critérios de aceite
1. Manifesto válido (nome, ícones 192/512/maskable, `start_url`, `display`), com ícones acessíveis (teste automático).
2. Service worker registrado na versão de produção.
3. **Com o aparelho offline**, recarregar o Início e abrir `/mapa` e `/avisar` mostra o app, com a faixa de offline (teste automático simulando offline).
4. Rascunho: preencher, recarregar → aparece "Continuar de onde parei"; ao continuar, os campos e a etapa voltam; "Descartar" limpa; após enviar, não há rascunho (teste automático).
5. Sem armazenamento disponível, o formulário funciona (teste unitário).
6. A suíte e a matriz de responsividade continuam passando.

### 2.5 Testes
- Unitários: módulo de rascunho (gravar, ler, apagar, JSON corrompido, versão diferente, armazenamento indisponível).
- Ponta a ponta: rascunho no servidor de desenvolvimento; PWA e offline num novo projeto Playwright, que roda contra a **versão de produção** (`vite build` + `vite preview`), porque o service worker só existe nela.

## 3. Como foi
*(preenchido ao concluir o item)*
