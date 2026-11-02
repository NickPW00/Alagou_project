# Publicação da demonstração (GitHub Pages)

Endereço: **https://nickpw00.github.io/Alagou_project/**

- O que é publicado: a versão de **demonstração**, com dados fictícios e a faixa "MODO DEMONSTRAÇÃO" sempre visível. Não há banco de dados nem coleta de dados pessoais.
- Quando: a cada push no branch `claude/stoic-ramanujan-h530ag`, pelo workflow `.github/workflows/deploy-pages.yml`. Também dá para rodar manualmente em Actions → "Publicar demonstração" → Run workflow.
- Custo: gratuito, porque o repositório é público.

## Ativação (uma única vez, feita pela pessoa dona do repositório)
1. No GitHub, abra o repositório → **Settings** → **Pages**.
2. Em **Build and deployment → Source**, escolha **GitHub Actions**.
3. Em **Actions**, rode de novo o workflow "Publicar demonstração" (ou faça um novo push).

## Como tirar do ar
Settings → Pages → **Unpublish site**, ou desative o workflow em Actions.

## Limitações
- O GitHub Pages hospeda apenas sites estáticos. Na Fase 3, o banco de dados (Supabase) fica num serviço separado, e o site continua podendo ser hospedado aqui, na Cloudflare/Netlify ou num servidor da UERJ.
- Links diretos (ex.: `/Alagou_project/mapa`) funcionam por meio de uma cópia do `index.html` como `404.html`. A página abre normalmente, mas o servidor responde com o código HTTP 404.
