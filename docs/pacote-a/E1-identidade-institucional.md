# E1 — Logomarcas institucionais e cores da marca (item extra)

Pedido da coordenação em 02/11/2026, durante o Pacote A: "Coloque as logos nos locais interessantes, como créditos e coisas do tipo". Arquivos recebidos:
- Logomarca **Meninas pelo Clima** (JPEG 1600×1600);
- Logomarca da **UERJ** (JPEG 428×428);
- Logomarcas **UERJ + FEBF — UERJ-Caxias** (JPEG 454×144).

## 1. O que será implementado
1. Logomarcas nos locais institucionais:
   - **rodapé** de todas as páginas (exceto a tela cheia do mapa);
   - **Início**: "Uma iniciativa do projeto Meninas pelo Clima", com a logomarca;
   - **Sobre**: seção "Realização" com todas as logomarcas e os créditos de dados e tecnologia (OpenStreetMap, OpenFreeMap, MapLibre);
   - **Aprenda e Previna**, módulo 6 (Meninas pelo Clima);
   - **README** do repositório.
2. **Cores da identidade institucional:** o azul-escuro e o azul-claro do Alag@u passam a ser os da Meninas pelo Clima, reforçando a associação entre as marcas, como pede o documento da Fase 1 ("extraia as cores exatas da identidade institucional quando os arquivos estiverem disponíveis").

Fora do escopo: redesenhar a marca do Alag@u ou alterar as logomarcas institucionais.

## 2. Como será
- **Sem alterar as logomarcas:** as imagens são apenas redimensionadas e convertidas para WebP (formato leve, suportado por todos os navegadores atuais). A da Meninas pelo Clima tem só a margem branca externa reduzida, sem mudança de proporção, cor ou composição. Os originais ficam guardados em `docs/marca/originais/`.
- **Fundo branco:** os arquivos são JPEG com fundo branco, então sempre aparecem sobre superfícies brancas (cartões e selos), nunca diretamente sobre o azul.
- **Peso:** cada logomarca com menos de 40 kB, com largura e altura declaradas (sem "pulos" de layout) e carregamento tardio (`loading="lazy"`) fora da primeira tela.
- **Acessibilidade:** texto alternativo descritivo ("Logomarca do projeto Meninas pelo Clima" etc.).
- **Cores** (amostradas do arquivo JPEG, portanto aproximadas; confirmar com o manual de marca, se houver):

| Uso no Alag@u | Antes | Depois (Meninas pelo Clima) |
|---|---|---|
| Azul-escuro (identidade e navegação) | #0B2545 | **#062C58** |
| Azul-claro (água e tecnologia) | #13A3E0 | **#3CA8EC** |

  As cores de situação da rua (verde, amarelo, laranja, vermelho e cinza) **não mudam**: são cores de significado, ajustadas para contraste e legibilidade. O verde da marca (#80B844), por exemplo, não teria contraste suficiente com texto branco.
- **Ícones do app** regenerados com o novo azul.
- **Guia de marca** em `docs/marca/README.md`, com as cores, os arquivos e as regras de uso.

### Critérios de aceite
1. Logomarcas visíveis no rodapé, no Início, no Sobre e no módulo 6, com texto alternativo (teste de ponta a ponta).
2. Imagens com menos de 40 kB cada.
3. Contraste AA mantido com as novas cores (axe em todas as páginas e na matriz de telas).
4. Sem rolagem lateral e sem sobreposição na matriz do A1.

## 3. Como foi
*(preenchido ao concluir o item)*
