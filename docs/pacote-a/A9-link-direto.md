# A9 — Link direto para um relato

## 1. O que será implementado
1. **Link de cada relato:** `…/mapa?relato=<id>` abre o Mapa ao Vivo já com o relato selecionado, o painel de detalhes aberto e o mapa aproximado nele.
2. **Compartilhar** passa a enviar esse link:
   - pelo menu de compartilhamento do celular (WhatsApp etc.);
   - ou copiando o link, nos navegadores sem esse menu.
   - O texto deixa claro que é **informação comunitária, não alerta oficial**.
3. **Endereço sincronizado:** ao abrir ou fechar um relato, o endereço da página é atualizado sem criar entradas extras no "voltar" do navegador.
4. **Relato não encontrado** (removido, desatualizado demais ou que só existe no aparelho de quem enviou, como na demonstração): mensagem clara, com o mapa normal.

Fora do escopo: links para pontos arbitrários do mapa e prévias com imagem ao compartilhar (exigem servidor).

## 2. Como será
- Parâmetro de busca `relato` lido com `useSearchParams` (React Router), funcionando também no subcaminho do GitHub Pages e offline: o service worker devolve o app para qualquer rota, e a `404.html` cobre o primeiro acesso no Pages.
- Atualização com `replace: true` (sem poluir o histórico).
- Compartilhar:
  - texto: "Alag@u: <rua>, <bairro> — <situação> (informação comunitária, não é alerta oficial)" + link;
  - sem `navigator.share`, copia o link para a área de transferência e mostra "Link copiado";
  - se a cópia falhar, mostra o link para copiar à mão.
- Na demonstração, relatos enviados pelo formulário existem só na aba aberta. O aviso de "não encontrado" explica isso.

### Critérios de aceite
1. Abrir `/mapa?relato=d6` mostra o detalhe do relato D6 (teste de ponta a ponta).
2. Selecionar e fechar um relato atualiza e limpa o parâmetro, sem novas entradas no histórico (teste).
3. Compartilhar copia um link com `?relato=` e o texto de "não é alerta oficial" (teste com permissão de área de transferência).
4. Identificador inexistente mostra a mensagem de não encontrado (teste).
5. A suíte e a matriz de telas continuam passando.

## 3. Como foi
*(preenchido ao concluir o item)*
