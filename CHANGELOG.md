# Changelog

Formato: [Keep a Changelog](https://keepachangelog.com/pt-BR/). Versões: [SemVer](https://semver.org/lang/pt-BR/).

## [Não lançado]

## [0.6.0] — 2026-11-02
### Adicionado
- E1: logomarcas Meninas pelo Clima, UERJ e UERJ/FEBF no Início, no rodapé, no Sobre ("Realização"), no módulo 6 e no README; créditos de dados e tecnologia; guia de marca.
### Alterado
- Cores principais do Alag@u alinhadas à marca Meninas pelo Clima (azul-escuro #062C58, azul-claro #3CA8EC); ícones regenerados.

## [0.5.0] — 2026-11-02
### Adicionado
- A3: app instalável (PWA) com funcionamento offline, aviso de nova versão, botão "Instalar o app" e faixa de offline.
- A3: rascunho do aviso salvo só no aparelho, com "Continuar de onde parei" / "Descartar".
### Corrigido
- O formulário passa a abrir offline mesmo sem o código do mapa salvo (mapa carregado à parte, com aviso).
- Rascunho gravado imediatamente ao fechar ou esconder a página.

## [0.4.0] — 2026-11-02
### Adicionado
- A2: selo "EXEMPLO" em todo dado fictício — mapa (pontos, agrupamentos, histórico), listas, detalhes, Início, Memória e painel administrativo.

## [0.3.0] — 2026-11-02
### Adicionado
- A1: trilho lateral de navegação (768–1023 px), menu "Mais" no topo do desktop, filtros compactos do mapa, lista fixa ao lado do mapa (≥ 1440 px), painel lateral de detalhes (≥ 768 px) e formulário em duas colunas (≥ 1024 px).
- Matriz automática de 15 tamanhos de tela (celulares mais comuns, tablet, notebooks, monitor) e galeria de prints na CI.
### Corrigido
- Menu do topo se sobrepunha ao nome Alag@u em telas de 1024–1439 px.
- Mapa baixo demais em celular deitado e em telas de 320 px.

## [0.2.0] — 2026-11-02
### Adicionado
- Fase 2: estrutura visual completa em modo demonstração (Início, Mapa ao Vivo, formulário em 8 etapas, Memória, Alertas, Aprenda, Dados, Participação, Sobre, esboço do painel administrativo).
- Testes unitários (Vitest) e de ponta a ponta com acessibilidade (Playwright + axe); CI no GitHub Actions.
- Publicação automática da demonstração no GitHub Pages e QR code no README.
### Corrigido
- Setas de tendência maiores e legíveis no mapa.

## [0.1.0] — 2026-11-02
### Adicionado
- Fases 0 e 1: diagnóstico e documento de arquitetura.
