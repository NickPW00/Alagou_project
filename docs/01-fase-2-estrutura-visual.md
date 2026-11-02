# Alag@u — Fase 2: Estrutura visual

**Status:** concluída, aguardando aprovação da coordenação para iniciar a Fase 3.

## Como rodar

```bash
npm install
cp .env.example .env.local     # VITE_DATA_MODE=demo para ver dados de demonstração
npm run dev                    # http://localhost:5173
```

Sem `VITE_DATA_MODE=demo`, o app roda **sem backend**: todas as telas mostram estados vazios e o envio fica desabilitado. É assim que ele se comporta até a Fase 3.

## Decisões tomadas por padrão (podem ser revistas)

Como as decisões 2 a 6 do documento da Fase 1 ainda estão em aberto, a Fase 2 adotou:

| Decisão | Padrão adotado |
|---|---|
| Logomarca Meninas pelo Clima | Ainda não recebida. Só o nome do projeto aparece em texto. A marca do Alag@u (gota com @ e ondas) e a paleta são **provisórias**. |
| Login para registrar | Recomendado, previsto para a Fase 3. No modo demonstração o formulário funciona sem login. |
| Parâmetros de validade | 30 min / 2 h, em `src/config/settings.ts` (na Fase 3 passam para a tabela `app_settings`). |
| Período "Agora" no mapa | Últimas 24 h. Relatos mais antigos aparecem só em "Histórico". |

## Status por funcionalidade

Legenda: ✅ implementado e testado · 🟡 implementado parcialmente (interface pronta, depende de fase futura) · ⏳ planejado

| Item | Status | Observação |
|---|---|---|
| Identidade (nome, slogan, subtítulo, aviso legal, emergência 199/193) | ✅ | Paleta provisória. Marca institucional pendente. |
| Navegação: barra inferior no celular (botão central "Avisar") + menu "Mais"; barra superior no desktop | ✅ | Teste E2E no celular |
| Tela inicial (botões principais, contadores calculados dos dados, últimas atualizações, estados vazios) | ✅ | Teste unitário garante que, sem backend, nenhum número é inventado |
| Mapa ao Vivo (MapLibre, clusters com a cor do relato mais grave, setas de tendência, validade temporal, legenda, filtro por distrito, busca de texto, Agora/Histórico, lista alternativa, localização opcional) | ✅ | A busca ainda filtra só os relatos carregados. A busca de endereços (geocodificação) entra na Fase 3. |
| Falha do serviço de mapas → aviso e lista | ✅ | Teste E2E simulando o serviço fora do ar |
| Painel de detalhes do relato (todos os campos pedidos, histórico, compartilhar) | 🟡 | "Confirmar" e "A situação mudou" mostram aviso de Fase 4 |
| Formulário em 8 etapas (validação, data futura bloqueada, relato histórico > 24 h, marcar no mapa com pino arrastável, "Usar minha localização") | ✅ | Fotos ⏳ Fase 4 (exigem a remoção de metadados e a moderação prontas) |
| Mapa da Memória (lista, frequência percebida × frequência calculada, camada histórica no mapa) | 🟡 | Registro de memórias ⏳ Fase 5 |
| Alertas de Chuva (separação oficial × comunitário, links para fontes oficiais) | 🟡 | Integração automática ⏳ Fase 5. Os links precisam ser conferidos (ver pendências). |
| Aprenda e Previna (6 módulos estruturados) | 🟡 | Textos completos e gerenciador de conteúdo ⏳ Fase 6. Nenhuma referência foi inventada. |
| Duque de Caxias em Dados (indicadores, distribuição por distrito e por situação, metodologia) | 🟡 | Filtros temporais e exportação ⏳ Fase 6 |
| Painel administrativo (fila de moderação: ocultar, restaurar, verificar, com registro no histórico) | 🟡 | **Só demonstração. A proteção real vem na Fase 3**, com login, papéis e RLS no banco. |
| Minha Participação, Sobre/Privacidade | 🟡 | Login ⏳ Fase 3 |

## Dados de demonstração

- Ficam só em `src/data/demo.ts` e são carregados apenas com `VITE_DATA_MODE=demo`.
- Uma faixa amarela fixa avisa: "MODO DEMONSTRAÇÃO — dados fictícios".
- Ruas e bairros têm nomes artificiais ("Rua Demonstração D1"), e um teste garante isso. As posições são aproximadas por distrito.
- Relatos enviados no modo demonstração ficam só na aba aberta e somem ao recarregar.

## Testes executados

| Conjunto | Resultado |
|---|---|
| `npm run typecheck` (TypeScript estrito) | sem erros |
| `npm test` (Vitest): validade temporal, fuso de Brasília, validação do formulário, datas futuras, filtros, fonte de demonstração, ausência de dados sem backend, tela inicial | **20/20 passaram** |
| `npm run test:e2e` (Playwright, Chromium, perfis **celular (Pixel 7)** e **desktop 1280 px**): todas as páginas, acessibilidade (axe, WCAG 2.0/2.1/2.2 A e AA, sem violações sérias ou críticas), sem rolagem horizontal, navegação por teclado, menu "Mais", mapa e filtros, falha do mapa, fluxo completo das 8 etapas até o relato aparecer no mapa, GPS negado, moderação | **35 passaram, 1 ignorado** (o teste do menu "Mais" é exclusivo do celular) |
| `npm run build` | ok |

Os testes E2E substituem o estilo do mapa por um fundo liso, para não depender do serviço externo de mapas, que não está acessível neste ambiente de desenvolvimento. Portanto, **o fundo cartográfico real do OpenFreeMap ainda não foi visto funcionando**: precisa ser conferido num navegador comum.

Problemas encontrados pelos testes e corrigidos nesta fase:
- o "worker" do MapLibre não carregava com o Vite;
- o mapa ao vivo ficava com altura zero;
- havia contraste insuficiente no botão "Avisar";
- havia uma região rolável sem foco por teclado.

## Desempenho

- O mapa (MapLibre, ~290 kB comprimido) é carregado sob demanda.
- A tela inicial baixa cerca de 100 kB de JavaScript comprimido.
