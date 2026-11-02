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

**Status:** implementado e testado (versão 0.10.0).

### 3.1 Resultado da verificação (02/11/2026, a partir do GitHub Actions — servidores fora do Brasil)
Arquivo completo: [`docs/fontes/verificacao.json`](../fontes/verificacao.json).

| Fonte | Endereço | Resultado | Conclusão |
|---|---|---|---|
| **INMET — avisos ativos (API JSON)** | `apiprevmet3.inmet.gov.br/avisos/ativos` | **200**, JSON, **CORS liberado** para o site do Alag@u; ~425 kB **sem compressão** | **Viável**: integrada (ver 3.2). Formato documentado na amostra. |
| INMET — avisos (RSS) | `apiprevmet3.inmet.gov.br/avisos/rss` | 200, RSS; licença declarada: "reprodução permitida desde que citada a fonte" | Licença confirmada. Indica `avisos.inmet.gov.br` como página dos avisos. |
| INMET — previsão por município | `apiprevmet3.inmet.gov.br/previsao/3301702` | 200, JSON (resumo por turno, temperatura, vento) | Disponível; não usada agora (sem chuva em mm por hora). Candidata para o futuro. |
| INMET — portal de alertas | `alertas2.inmet.gov.br` | **conexão recusada** (ECONNRESET) | Link substituído por `avisos.inmet.gov.br` (indicado pelo próprio INMET no RSS). |
| Cemaden — mapa interativo e serviço PED | `mapainterativo…`, `sws.cemaden.gov.br/PED` | **tempo esgotado** | Provável bloqueio a acessos de fora do Brasil (como o IBGE). **Repetir a verificação no Brasil.** O link segue no app. |
| Cemaden — site institucional | `gov.br/cemaden` | 200 | OK |
| Defesa Civil RJ | `defesacivil.rj.gov.br` | 200, sem API conhecida | Mantido como link; cadastro supervisionado quando houver banco. |
| Prefeitura de Duque de Caxias | `duquedecaxias.rj.gov.br` | 200 | OK (link). |
| **Open-Meteo** | `api.open-meteo.com` | **200**, JSON, CORS `*` | **Viável**: integrado. |

### 3.2 Entregue
- **Avisos oficiais do INMET** na tela de Alertas:
  - somente os que incluem **Duque de Caxias** (código IBGE 3301702 na lista de municípios do aviso), não encerrados e ainda válidos;
  - título, **severidade como emitida pelo INMET** e cor oficial;
  - período (vigente ou previsto), riscos, orientações, código CAP, horário da consulta e link para o INMET;
  - selo "Aviso oficial · INMET", com visual separado das atualizações comunitárias;
  - sem avisos: "A ausência de aviso não significa ausência de risco".
- **Início:** resumo dos avisos a partir da **cópia guardada** na última consulta (sem baixar ~425 kB a cada visita), com o horário da consulta.
- **Previsão de chuva por distrito (Open-Meteo):**
  - 24 h hora a hora (mm e %), com resumo (total, hora de mais chuva e maior chance);
  - rótulo **"Previsão de modelo meteorológico — não é aviso oficial"**;
  - fonte e licença CC BY 4.0;
  - última previsão guardada para uso offline.
- **Robô de verificação** (`verificar-fontes.yml` + `scripts/fontes/verificar.mjs`), reutilizável: pode ser rodado também num computador no Brasil.

### 3.3 Desvios
| Planejado (desenho do A7) | Feito | Motivo |
|---|---|---|
| Se o INMET fosse acessível, propor a integração para aprovação | **Integrado** | O plano aprovado pela coordenação (item A7: "se houver feed aberto, avisos com fonte, horário e link original") já autorizava a integração caso fosse viável, e a verificação mostrou que é. |
| — | O link "INMET — Avisos" passou de `alertas2.inmet.gov.br` para `avisos.inmet.gov.br` | O primeiro recusou conexão. O segundo é o indicado pelo próprio INMET no RSS e foi **confirmado pelo robô (HTTP 200)** na verificação de 02/11/2026, 23:26 UTC. |
| Atualização por tarefa automática sem banco | Consulta direta pelo navegador | A API libera CORS. Uma tarefa agendada criaria commits a cada execução e atrasaria os avisos. |

### 3.4 Resultados
- Unitários: avisos (filtro por município sem confundir códigos parecidos, encerrados, vencidos, fuso de Brasília) e previsão (URL, fuso, próximas 24 h, resumo).
- Ponta a ponta:
  - avisos (só Duque de Caxias, campos, fonte, Início pela cópia guardada, INMET fora do ar, sem avisos);
  - previsão (distritos, rótulo, fonte, horário, sem conexão com e sem cópia);
  - acessibilidade (a tabela com rolagem lateral recebe foco pelo teclado; corrigido durante o item).
- Suíte completa: unitários **65/65**; ponta a ponta **114 passaram**, 31 ignorados (por desenho), **0 falhas**.

### 3.5 Pendências
- Repetir a verificação **a partir do Brasil** (Cemaden e portal de alertas do INMET) com `node scripts/fontes/verificar.mjs`.
- Confirmar o endereço de **detalhe** de cada aviso no INMET; hoje o link leva à página geral de avisos.
- Peso da resposta do INMET (~425 kB sem compressão): avaliar um intermediário com filtro e compressão quando houver servidor (Fase 3).
- Notificações de avisos oficiais: fase com banco, com autorização da pessoa.
