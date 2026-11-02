# Alag@u

**Alagou? Avisou!** — Monitoramento Comunitário de Alagamentos

Uma iniciativa do projeto Meninas pelo Clima — LabPENSo/UERJ.

## Status

- Fases 0 e 1 (diagnóstico e arquitetura): aprovadas.
- Fase 2 (estrutura visual): concluída, **aguardando aprovação**. Ainda não há banco de dados; os dados de demonstração são fictícios e sinalizados.

Documentos:
- [Diagnóstico e arquitetura](docs/00-fase-0-1-diagnostico-e-arquitetura.md)
- [Fase 2 — estrutura visual e testes](docs/01-fase-2-estrutura-visual.md)
- [Pendências](docs/pendencias.md)

## Desenvolvimento

Requisitos: Node.js 22+.

```bash
npm install
cp .env.example .env.local
npm run dev          # servidor local
npm test             # testes unitários
npm run test:e2e     # testes ponta a ponta (Playwright)
npm run build        # versão de produção em dist/
```

Tecnologias: React, TypeScript, Vite, Tailwind CSS, MapLibre GL (mapa base © colaboradores do OpenStreetMap).

> O Alag@u é uma plataforma comunitária de informação e ciência cidadã. Seus registros não substituem os alertas, avaliações e orientações dos órgãos de Defesa Civil.
> Em caso de emergência, ligue 199 (Defesa Civil) ou 193 (Bombeiros).
