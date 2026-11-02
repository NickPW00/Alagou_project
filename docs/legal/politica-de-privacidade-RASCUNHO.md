# Política de Privacidade do Alag@u

> **RASCUNHO — NÃO VIGENTE.** Documento preliminar para revisão jurídica da UERJ. Vale para a versão do Alag@u **com banco de dados e cadastro** (Fase 3 em diante). Itens marcados com **[A DEFINIR]** dependem de decisão institucional.

Última atualização do rascunho: 02/11/2026.

## 1. Quem somos
O **Alag@u — Alagou? Avisou!** é uma plataforma comunitária de monitoramento de alagamentos em Duque de Caxias (RJ), uma iniciativa do projeto **Meninas pelo Clima — LabPENSo/UERJ**.

- **Controlador dos dados:** [A DEFINIR — ex.: Universidade do Estado do Rio de Janeiro (UERJ), por meio do LabPENSo]
- **Encarregado pelo tratamento de dados (DPO):** [A DEFINIR — nome/canal do encarregado da UERJ]
- **Contato para assuntos de privacidade:** [A DEFINIR — e-mail institucional]

## 2. Princípios
Coletamos **o mínimo necessário**, não vendemos dados, **não mostramos publicamente quem fez cada relato** e não acompanhamos a sua localização.

## 3. Quais dados tratamos

### 3.1 Sem cadastro (qualquer pessoa)
Consultar o mapa, os alertas e os conteúdos **não exige cadastro**. Nenhum dado pessoal é guardado pelo Alag@u nesse uso. Serviços externos recebem dados técnicos, como o endereço IP (ver seção 6).

### 3.2 Com cadastro (para enviar relatos)
| Dado | Para quê | Visível publicamente? |
|---|---|---|
| E-mail | Entrar no app (link de acesso sem senha) e comunicações essenciais | **Não** |
| Apelido | Identificação dentro do app | **Não** (no lançamento) |
| Faixa etária (menor ou maior de 18 anos) | Aplicar as proteções para menores de idade | **Não** |
| Data e versão do aceite dos termos | Comprovar o aceite | **Não** |

### 3.3 Relatos e contribuições
| Dado | Observação |
|---|---|
| Local do alagamento (ponto e trecho de rua), rua, bairro e distrito | É o local **da ocorrência**, não necessariamente onde você mora. **Público.** |
| Situação da rua, tendência da água, profundidade aparente, outros problemas, descrição, data e hora | **Públicos**, sem identificar o autor |
| Fotografias (quando disponíveis) | Metadados (inclusive a localização do celular) **removidos** antes do armazenamento; só ficam públicas depois de moderadas |
| Vínculo entre o relato e a sua conta | **Não público**. Usado para evitar duplicidade, limitar abusos e permitir que você edite ou exclua seus relatos |

### 3.4 O que **não** coletamos
CPF, endereço residencial, telefone, localização contínua, contatos, dados de saúde, raça, religião ou opinião política.

### 3.5 Localização do aparelho
A localização só é usada quando você toca em **"Usar minha localização"**, e uma única vez, para marcar o ponto do aviso. Somente o ponto do relato é guardado.

## 4. Bases legais (propostas para validação jurídica)
| Tratamento | Base legal proposta (Lei nº 13.709/2018) |
|---|---|
| Relatos e dados para pesquisa sobre alagamentos | Art. 7º, IV — realização de estudos por órgão de pesquisa, com anonimização sempre que possível |
| Apoio à gestão de riscos e ao planejamento urbano | Art. 7º, III — execução de políticas públicas [A VALIDAR] |
| Notificações e envio de fotografias | Art. 7º, I — consentimento, que pode ser retirado a qualquer momento |
| Segurança, prevenção de abuso e registros de auditoria | Art. 7º, IX — legítimo interesse [A VALIDAR] |

## 5. Crianças e adolescentes
O público inclui estudantes. Conforme o **art. 14** da LGPD:
- **12 a 17 anos:** participação com ciência do responsável [procedimento A DEFINIR pela coordenação];
- **menores de 12 anos:** participação apenas por meio da escola ou do projeto, com **consentimento específico de pelo menos um dos pais ou responsável legal** [procedimento A DEFINIR];
- fotografias enviadas por menores são **sempre** moderadas antes de qualquer publicação.

## 6. Com quem os dados são compartilhados
Não vendemos nem cedemos dados pessoais. Para funcionar, o Alag@u usa os serviços abaixo, que recebem dados técnicos, como o endereço IP e as informações da requisição:

| Serviço | Para quê | O que recebe |
|---|---|---|
| GitHub Pages (GitHub, Inc.) | Hospedagem do site | IP e dados técnicos de acesso |
| OpenFreeMap | Mapa de fundo | IP e a área do mapa visualizada |
| Photon (komoot) | Busca de lugares | IP e o **texto digitado** na busca de lugares |
| Open-Meteo | Previsão de chuva | IP (as coordenadas consultadas são fixas, dos distritos, e não as suas) |
| INMET | Avisos meteorológicos oficiais | IP |
| Supabase [A CONFIRMAR na Fase 3] | Banco de dados, login e armazenamento | Dados de cadastro e relatos, na condição de **operador** |

**Pesquisa:** dados para pesquisa são compartilhados de forma **agregada ou anonimizada**. Microdados georreferenciados só sob termo de uso e após avaliação de risco de reidentificação.

## 7. Armazenamento no seu aparelho
O app guarda no navegador do seu aparelho, sem enviar a ninguém:
- o **rascunho** de um aviso ainda não enviado, inclusive o ponto marcado;
- a última **previsão de chuva** consultada;
- cópias do app e de dados públicos, para funcionar sem internet.

Você pode apagar esses dados limpando os dados do site no navegador.

## 8. Por quanto tempo guardamos
| Dado | Prazo proposto |
|---|---|
| Conta (e-mail, apelido, faixa etária) | Enquanto a conta existir; excluída quando você pedir |
| Relatos | Mantidos como série histórica; **desvinculados da conta** (anonimizados) se a conta for excluída |
| Registros de auditoria e moderação | [A DEFINIR — proposta: 2 anos] |
| Fotografias | [A DEFINIR] |

## 9. Seus direitos (art. 18)
Você pode pedir:
- confirmação de que tratamos seus dados;
- acesso, correção, anonimização, portabilidade e eliminação;
- informação sobre compartilhamentos;
- revogação do consentimento.

Na Fase 3 haverá a opção **"Excluir minha conta"** no próprio app. Pedidos também pelo contato da seção 1.

## 10. Segurança
- Acesso restrito por perfis, com regras aplicadas no banco de dados.
- Conexões criptografadas (HTTPS).
- Nenhuma senha armazenada (login por link).
- Registros das ações administrativas.
- Separação entre os ambientes de desenvolvimento, testes e produção.

## 11. Alterações
Mudanças relevantes serão avisadas no app, com nova data de atualização.
