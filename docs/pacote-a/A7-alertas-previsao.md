# A7 — Verificação do INMET e previsão de chuva (Open-Meteo)

Decisão da coordenação (02/11/2026): previsão de modelo não oficial (Open-Meteo) **aprovada**, sempre com o rótulo "não é aviso oficial".

## 1. O que será implementado
1. **Verificação técnica das fontes oficiais** (INMET, Cemaden, Defesa Civil RJ, Prefeitura): existência de API ou feed, resposta, formato, permissão de acesso pelo navegador (CORS). Também confere se os links da tela de Alertas funcionam (pendência da Fase 2).
2. **Previsão de chuva por distrito** na tela "Vai chover? Fique ligado!":
   - próximas 24 h, hora a hora (milímetros e probabilidade);
   - resumo (total previsto e hora de maior chance);
   - escolha entre os 4 distritos;
   - fonte, horário da consulta e link;
   - rótulo **"Previsão de modelo meteorológico — não é aviso oficial"**.
3. **Sem internet:** mostra a última previsão consultada, com a data e a hora da consulta.

Fora do escopo: integrar avisos oficiais automaticamente, a menos que a verificação mostre uma fonte acessível. Se mostrar, a integração vira uma proposta para aprovação. Notificações push ficam para a fase com banco.

## 2. Como será

### 2.1 Verificação (robô)
- Workflow sob demanda `verificar-fontes.yml`, que roda `scripts/fontes/verificar.mjs` a partir do GitHub Actions.
- Para cada endereço, registra: código HTTP, tipo de conteúdo, tamanho, início do conteúdo, cabeçalho CORS e tempo de resposta.
- Resultado gravado em `docs/fontes/verificacao.json`, analisado na seção "Como foi".
- **Limitação conhecida:** como no A4, sites do governo podem recusar conexões de fora do Brasil. Um bloqueio vindo dos servidores do GitHub não prova que a fonte é inacessível no Brasil. Nesse caso, a verificação deve ser repetida de um computador no Brasil com o mesmo script.

### 2.2 Previsão (Open-Meteo)
- **Fonte:** API pública do Open-Meteo, que combina modelos meteorológicos globais e regionais. Gratuita para uso não comercial, licença CC BY 4.0 (exige atribuição) e sem chave de acesso.
- **Uma consulta só** para os 4 pontos de referência dos distritos (os mesmos usados para validar os limites no A4), com as variáveis `precipitation` e `precipitation_probability` horárias, fuso `America/Sao_Paulo`, 2 dias.
- `src/weather/openMeteo.ts`: montagem da URL e interpretação da resposta (funções puras, testadas).
- **Exibição:** barras simples por hora com o valor em mm e a probabilidade em %. Não há classificação de intensidade em categorias, para não parecer escala oficial; mostramos os números.
- **Última previsão guardada** no aparelho (`localStorage`), para uso offline, com aviso da data e hora da consulta.
- Visual claramente separado dos avisos oficiais (seção própria, ícone de modelo, rótulo).

### 2.3 Critérios de aceite
1. A verificação executada, com o resultado registrado e analisado (fonte por fonte: o que funciona, o que não, por quê e próximos passos).
2. A previsão aparece para o distrito escolhido, com o rótulo "não é aviso oficial", a fonte com link, a licença e o horário da consulta (teste de ponta a ponta com resposta simulada).
3. Falha de rede: aparece a última previsão guardada com o aviso, ou uma mensagem clara se não houver nenhuma (teste de ponta a ponta).
4. Interpretação correta das horas no fuso de Brasília e das próximas 24 h (teste unitário).
5. Acessibilidade e matriz de telas mantidas.

## 3. Como foi
*(preenchido ao concluir o item)*
