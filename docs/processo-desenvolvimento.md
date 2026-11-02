# Processo de desenvolvimento do Alag@u

Todo item de trabalho segue o mesmo ciclo, registrado num documento próprio (ex.: `docs/pacote-a/A1-responsividade.md`).

## 1. Ciclo de cada item

| Etapa | O que acontece | Registro |
|---|---|---|
| **1. O que será implementado** | Requisitos, escopo e o que fica de fora | Seção "O que será implementado" |
| **2. Como será** | Desenho técnico, alternativas consideradas, riscos, critérios de aceite verificáveis e plano de testes | Seção "Como será", em commit próprio, **antes** do código |
| **3. Implementação** | Código em commits pequenos e descritivos ([Conventional Commits](https://www.conventionalcommits.org/pt-br/)) | Histórico do Git |
| **4. Verificação** | Testes automatizados (unitários + ponta a ponta + acessibilidade), checagem visual e revisão do próprio código contra os critérios de aceite | Seção "Como foi" |
| **5. Como foi** | O que foi entregue, desvios em relação ao planejado (e por quê), resultados dos testes, pendências | Seção "Como foi" + `CHANGELOG.md` |
| **6. Publicação** | Envio ao GitHub → CI → publicação automática da demonstração | GitHub Actions |

## 2. Definição de "pronto"
Um item só é considerado concluído quando:
- todos os critérios de aceite estão verificados (de preferência por teste automatizado);
- `npm run typecheck`, `npm test`, `npm run build` e `npm run test:e2e` passam;
- não há violações de acessibilidade sérias ou críticas (axe);
- não há rolagem lateral nem sobreposição na matriz de telas (a partir do A1);
- o documento do item tem as três seções preenchidas;
- o `CHANGELOG.md` foi atualizado.

## 3. Regras permanentes
- Nunca apresentar dados fictícios como reais; a demonstração é sempre sinalizada.
- Nunca colocar senhas, chaves ou tokens no código.
- Não publicar em lojas nem contratar serviços sem autorização.
- Dados de terceiros (IBGE, OpenStreetMap, INMET, Open-Meteo) sempre com fonte, data e licença registradas.
- Status das funcionalidades informado como: planejado · em desenvolvimento · implementado · testado · pendente.

## 4. Versionamento
- Versão em `package.json`, no formato [SemVer](https://semver.org/lang/pt-BR/): cada item entregue do Pacote A sobe a versão menor (0.3.0, 0.4.0, …).
- `CHANGELOG.md` no formato [Keep a Changelog](https://keepachangelog.com/pt-BR/).
