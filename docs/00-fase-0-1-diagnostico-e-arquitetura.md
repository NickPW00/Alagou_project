# Alag@u — Fase 0 (Diagnóstico) e Fase 1 (Planejamento e Arquitetura)

> **Alag@u — Alagou? Avisou!**
> Monitoramento Comunitário de Alagamentos
> Uma iniciativa do projeto Meninas pelo Clima — LabPENSo/UERJ.

**Status deste documento:** proposta para aprovação da coordenação. Nenhum código de aplicação foi escrito, nenhum serviço foi contratado e nada foi publicado.

Legenda de status usada em todo o documento: **Planejado** · **Em desenvolvimento** · **Implementado** · **Testado** · **Pendente (depende de decisão/insumo externo)**.

---

## 1. Fase 0 — Diagnóstico do ambiente

| Item verificado | Resultado |
|---|---|
| Repositório Git | Existe (`NickPW00/Alagou_project`), **sem nenhum commit** e sem branches no remoto. |
| Arquivos existentes | Nenhum (apenas a pasta `.git`). Nada a preservar ou sobrescrever. |
| Dependências instaladas no projeto | Nenhuma (sem `package.json`, sem lockfiles). |
| Código reutilizável | Nenhum no repositório. |
| Dados/configurações a preservar | Nenhum. |
| Logomarca Meninas pelo Clima | **Não disponível no repositório** → Pendente. Cores exatas da identidade institucional não podem ser extraídas ainda. |
| Ferramentas no ambiente de desenvolvimento (container) | Node.js 22, npm 10, PostgreSQL 16 (cliente), Docker 29. CLI do Supabase não instalada (pode ser instalada via npm quando necessário). |

**Conclusão:** projeto começa do zero. Não há risco de perda de trabalho anterior. Este documento é o primeiro artefato versionado.

**Insumos que precisamos da coordenação:**
1. Arquivo original da logomarca Meninas pelo Clima (SVG ou PNG em alta resolução) e manual de marca, se houver.
2. Definição de quem será a pessoa responsável (controladora) pelos dados para fins de LGPD — provavelmente a UERJ/LabPENSo.
3. Conta institucional para serviços (e-mail do projeto) — evita que a infraestrutura fique vinculada a uma pessoa física.
4. Decisão sobre hospedagem (ver seção 3).

---

## 2. Arquitetura recomendada (resumo)

```
┌──────────────────────────────────────────────────────────────┐
│  PWA (navegador Android / iPhone / desktop)                  │
│  React + TypeScript + Vite + Tailwind + MapLibre GL          │
│  Service Worker (cache do app, rascunhos offline em IndexedDB)│
└──────────────┬───────────────────────────┬───────────────────┘
               │ HTTPS (REST/RPC)          │ WebSocket (Realtime)
┌──────────────▼───────────────────────────▼───────────────────┐
│  Supabase (código aberto; gerenciado OU auto-hospedado)      │
│  • PostgreSQL 15+ com PostGIS                                │
│  • Auth (e-mail com link mágico / OTP)                       │
│  • PostgREST + Row Level Security (permissões no banco)      │
│  • Realtime (mudanças no banco → clientes conectados)        │
│  • Storage (fotos em bucket privado, só moderadas são públicas)│
│  • Edge Functions (validação, EXIF, geocodificação, alertas) │
└──────────────┬───────────────────────────────────────────────┘
               │ jobs agendados (pg_cron / Edge Functions)
┌──────────────▼───────────────────────────────────────────────┐
│  Fontes externas: tiles OSM, geocodificador (Photon/Nominatim)│
│  INMET (avisos), Cemaden (pluviômetros) — após verificação   │
└──────────────────────────────────────────────────────────────┘
```

**Por que esta combinação:**
- **Tudo é código aberto**: React, MapLibre, PostgreSQL/PostGIS e o próprio Supabase (licença Apache 2.0). Se o serviço gerenciado ficar caro ou indisponível, o mesmo banco e as mesmas migrações rodam num servidor da UERJ com Docker — **sem reescrever o app**.
- **Segurança no banco, não só na tela**: as regras de quem pode ler/escrever ficam em políticas RLS do PostgreSQL. Mesmo que alguém chame a API diretamente, um visitante não consegue alterar dados de outra pessoa ou funções administrativas.
- **Tempo real sem servidor próprio**: Supabase Realtime entrega inserções/atualizações aos mapas abertos.
- **PostGIS** resolve as perguntas geográficas que o projeto exige (relatos próximos no mesmo trecho, “em qual distrito/bairro caiu este ponto”, exportação GeoJSON).
- **PWA** atende Android e iPhone pelo navegador com um único código, e pode virar app da Google Play via *Trusted Web Activity* depois.

---

## 3. Comparação das alternativas

### 3.1 Backend / banco de dados

| Critério | **A. Supabase gerenciado** (recomendado para MVP) | **B. Supabase auto-hospedado na UERJ** | **C. Node.js (Fastify/NestJS) + PostgreSQL/PostGIS próprios** | D. Firebase (Google) |
|---|---|---|---|---|
| Custo inicial | Zero (plano gratuito) | Zero em licença; exige servidor | Zero em licença; mais horas de desenvolvimento | Zero (plano gratuito) |
| Custo de operação | Grátis no piloto; ~US$ 25/mês (plano Pro) em uso contínuo | Servidor/VM institucional + horas de TI | Servidor + horas de TI | Cobrança por leitura — imprevisível com mapa em tempo real |
| Manutenção | Baixa (backups, atualizações pelo provedor) | Alta (atualizações, backups, monitoramento) | Alta (API, WebSocket, auth próprios) | Baixa |
| Segurança | RLS no banco + Auth consolidado | Igual a A, mas depende da equipe de TI | Depende inteiramente do código escrito | Regras próprias do Firestore |
| Geoespacial | PostGIS completo | PostGIS completo | PostGIS completo | Fraco (sem PostGIS) |
| Tempo real | Nativo | Nativo | Implementar (Socket.IO etc.) | Nativo |
| Hospedagem institucional UERJ | Migração direta para B | Sim | Sim | Não |
| Dependência externa | Média (mitigada: código aberto, exporta tudo) | Baixa | Baixa | Alta (proprietário) |
| Escalabilidade | Suficiente para município inteiro | Depende do servidor | Depende do servidor | Alta |

**Recomendação:** começar em **A** (Supabase gerenciado, região São Paulo `sa-east-1`) durante o MVP e o piloto, com todas as migrações versionadas no Git. Avaliar **B** quando houver servidor institucional e equipe de TI disponível. **D** foi descartado por falta de PostGIS e dependência proprietária; **C** foi descartado no MVP porque exige reconstruir autenticação, autorização e tempo real — mais código, mais risco de falhas de segurança.

> Atenção: no plano gratuito o Supabase **pausa projetos sem atividade por ~7 dias** e não inclui backups diários automatizados. Serve para desenvolvimento e piloto curto; para uso real durante a temporada de chuvas, o plano pago (ou a auto-hospedagem) é necessário. Valores devem ser reconfirmados na contratação.

### 3.2 Frontend

| Opção | Prós | Contras | Decisão |
|---|---|---|---|
| **React + Vite + TypeScript** | Simples, gera site estático (hospedagem grátis em qualquer lugar, inclusive na UERJ), ótimo para PWA | SEO limitado (pouco relevante aqui) | **Escolhido** |
| Next.js | SEO, renderização no servidor | Exige servidor Node ou Vercel; mais complexidade | Não no MVP |
| Flutter / React Native | App nativo | Duas bases de código (web + app); publicação em loja antes da hora | Futuro, se necessário |

Componentes: **Tailwind CSS** + **Radix UI / React Aria** (componentes acessíveis, navegação por teclado e leitor de tela). Gráficos: **Recharts** ou **Observable Plot**. Validação: **Zod** (mesmos esquemas no cliente e nas Edge Functions).

### 3.3 Mapa

| Opção | Prós | Contras | Decisão |
|---|---|---|---|
| **MapLibre GL JS** | Vetorial, rápido, *clustering* nativo, estilos customizáveis, código aberto | Um pouco mais pesado que Leaflet | **Escolhido** |
| Leaflet | Leve, simples, muito documentado | Raster; clustering via plugin; menos fluido com muitos pontos | Alternativa de contingência |

Tiles (fundo do mapa): o servidor `tile.openstreetmap.org` **não deve ser usado em produção por aplicativos** (política de uso da OSMF). Opções: **OpenFreeMap** (gratuito, vetorial, sem chave), MapTiler/Stadia (plano gratuito com cota) ou tiles auto-hospedados (PMTiles da região num bucket). Atribuição “© colaboradores do OpenStreetMap” sempre visível.

### 3.4 Geocodificação (endereço → coordenada)

| Opção | Observação |
|---|---|
| Nominatim público (OSM) | Gratuito, mas a política proíbe autocompletar e limita a 1 requisição/s. Só para buscas pontuais, via servidor intermediário com cache. |
| **Photon (komoot)** | Feito para autocompletar sobre dados OSM; instância pública tem limites — ideal auto-hospedar no futuro. |
| Auto-hospedar Nominatim/Photon só do RJ | Sem limites, sem custo de licença; exige servidor. |
| Google/Mapbox | Melhor cobertura, mas pago e com restrições de armazenar resultados. |

**Decisão:** todas as buscas passam por uma Edge Function própria (`/geocode`) com cache, limite por usuário e restrição à caixa de Duque de Caxias. Isso permite trocar o provedor sem mexer no app. **Sempre** exigimos que a pessoa confirme o ponto no mapa — a qualidade do endereçamento OSM em ruas de periferia pode ser incompleta, e o pino arrastável resolve isso.

### 3.5 Limites territoriais

- **Município e distritos:** malhas do **IBGE** (API de malhas `servicodados.ibge.gov.br`, município 3301702). A importação será feita por script versionado, registrando fonte, data de acesso e licença.
- **Bairros:** verificar a base de **bairros do Censo 2022 (IBGE)** e/ou a base oficial da Prefeitura de Duque de Caxias. **Pendente de verificação** — se não houver base oficial adequada, o bairro será campo de texto confirmado pela pessoa (com lista de sugestões), e não inventaremos polígonos.
- **Ruas:** extraídas do OpenStreetMap (licença ODbL) para a área do município, somente para busca e para associar relatos a trechos.

---

## 4. Modelo inicial do banco de dados

Convenções: chaves `uuid` (exceto tabelas territoriais, que guardam também o código oficial), horários em `timestamptz` (armazenados em UTC, exibidos em `America/Sao_Paulo`), geometrias em `geometry(…, 4326)`, `created_at`/`updated_at` em todas as tabelas, exclusão lógica (`deleted_at`/`status`) onde há histórico.

### 4.1 Tipos enumerados

```sql
street_condition: 'no_flooding' | 'water_accumulation' | 'partially_flooded' | 'fully_flooded' | 'cannot_assess'
water_trend:      'rising' | 'stable' | 'receding' | 'unknown'
depth_estimate:   'shallow' | 'ankle' | 'shin' | 'knee' | 'above_knee' | 'unknown'
hazard_flag:      'current' | 'clogged_drain' | 'open_manhole' | 'stalled_vehicles' | 'stranded_people'
                  | 'water_in_buildings' | 'waste_or_sewage' | 'other'
verification_status: 'received' | 'published_unconfirmed' | 'confirmed' | 'conflicting'
                     | 'verified_by_team' | 'removed'            -- "desatualizado" é calculado pelo tempo, não gravado
confirmation_type: 'confirm' | 'water_rose' | 'water_receding' | 'water_drained' | 'different' | 'cannot_confirm'
perceived_frequency: 'once' | 'occasionally' | 'frequently' | 'almost_every_heavy_rain' | 'unknown'
user_role: 'contributor' | 'moderator' | 'admin'
```

> “Desatualizado” **não é gravado**: é derivado de `observed_at` + parâmetros configuráveis (30 min / 2 h). Assim, mudar a política não exige reescrever dados e nunca se conclui que o alagamento acabou só porque o tempo passou.

### 4.2 Tabelas

| Tabela | Campos principais | Observações |
|---|---|---|
| `municipalities` | id, ibge_code (único), name, state, geom MultiPolygon, source, source_date | Prepara expansão para a Baixada. |
| `districts` | id, municipality_id FK, ibge_code, name, geom | 4 distritos de Duque de Caxias (IBGE). |
| `neighborhoods` | id, district_id FK, name, geom (nullable), source | Polígono só se houver fonte verificável. |
| `streets` | id, municipality_id FK, name, osm_id, geom MultiLineString | Para busca e associação. |
| `monitored_locations` | id, street_id FK, neighborhood_id FK, label, geom Point/LineString, first_observed_at, last_observed_at | Trecho de rua com histórico. Criado automaticamente quando um relato não cai perto de um trecho existente. |
| `flood_events` | id, monitored_location_id FK, started_at, last_report_at, status (`open`/`closed_by_team`/`merged`), merged_into FK, grouping_rule_version | Episódio que agrupa relatos. |
| `reports` | id, author_id FK profiles, flood_event_id FK, monitored_location_id FK, district_id, neighborhood_id, street_name, house_number_near, postal_code, reference_point, segment_description, geom Point, location_method (`search`/`map_pin`/`gps`), condition, trend, depth, hazards hazard_flag[], description, observed_at, submitted_at, is_historical, verification_status, client_draft_id (único, evita envio duplicado offline) | Núcleo do sistema. CHECK `observed_at <= submitted_at + 5 min`. |
| `report_updates` | id, report_id FK, author_id, field changes (jsonb antes/depois), condition, trend, created_at | Histórico imutável de alterações. |
| `confirmations` | id, report_id FK, author_id FK, type, condition (opcional), trend (opcional), observed_at, created_at | Índice único parcial impede o mesmo usuário de confirmar o mesmo relato mais de uma vez por janela de tempo. |
| `photos` | id, report_id/historical_report_id FK, uploader_id, storage_path, width, height, bytes, mime, exif_stripped bool, moderation_status (`pending`/`approved`/`rejected`), created_at | Bucket privado; só `approved` vira público. |
| `historical_reports` | id, author_id, monitored_location_id, geom, street_name, neighborhood_id, period_start, period_end (data aproximada), perceived_frequency, impacts, description, verification_status | Camada “Aqui já alagou!”. |
| `weather_alerts` | id, source (`inmet`/`cemaden`/`defesa_civil_rj`/`defesa_civil_caxias`), external_id, title, severity_as_issued, area_description, geom (nullable), issued_at, updated_at, valid_from, valid_until, original_url, raw jsonb, ingested_by (`auto`/`admin`) | Único por (source, external_id). Nunca criado sem fonte. |
| `educational_contents` | id, module (1–6), slug, title, body_md, media, references jsonb, status (`draft`/`published`), author_id, reviewed_by, published_at | CMS simples. |
| `profiles` | id = auth.users.id, display_name (apelido), role, age_bracket (`under_18`/`18_plus`), terms_accepted_version, terms_accepted_at, is_blocked | **Sem nome completo público.** E-mail fica só em `auth.users`, nunca exposto. |
| `notification_preferences` | profile_id FK, neighborhood_ids[], followed_location_ids[], channels (push/e-mail), official_alerts bool, community_updates bool, push_subscription jsonb | Só com consentimento explícito. |
| `moderation_actions` | id, moderator_id, target_type, target_id, action (`hide`/`restore`/`verify`/`merge`/`split`/`reject_photo`…), reason, created_at | Imutável. |
| `abuse_reports` (denúncias) | id, reporter_id, target_type, target_id, reason, status, resolved_by | Adicional ao mínimo pedido. |
| `audit_logs` | id, actor_id, action, table_name, record_id, old jsonb, new jsonb, ip_hash, created_at | Preenchido por *triggers*; somente inserção. |
| `app_settings` | key, value jsonb | Prazos de validade (30 min/2 h), raio de agrupamento etc. — parametrizáveis. |

### 4.3 Índices e integridade

- `GIST(geom)` em `reports`, `monitored_locations`, `historical_reports`, `districts`, `neighborhoods`, `streets`.
- `BTREE(observed_at DESC)` em `reports`; composto `(monitored_location_id, observed_at DESC)`.
- Índice de texto (`pg_trgm`) em `streets.name` e `neighborhoods.name` para busca tolerante a erros de digitação.
- *Trigger* que, ao inserir relato, valida que o ponto está dentro do município (`ST_Within`) e preenche distrito/bairro automaticamente quando houver polígono.
- `report_updates`, `moderation_actions` e `audit_logs` sem permissão de `UPDATE`/`DELETE` para ninguém via API.

### 4.4 Regra de agrupamento (auditável, versionada)

Versão 1 (a ser validada pela equipe científica):
1. Um relato é associado ao `monitored_location` existente mais próximo se estiver a **≤ 50 m** e na mesma rua (nome normalizado); senão, cria-se um novo local.
2. Dentro do local, o relato entra no `flood_event` aberto se o último relato do evento tiver **≤ 6 h**; senão, abre-se um novo evento.
3. Relatos “sem alagamento” não abrem evento novo, mas entram no evento aberto (ajudam a registrar o escoamento).
4. Toda decisão grava `grouping_rule_version`; administradores podem **separar** ou **mesclar** eventos, sempre com registro em `moderation_actions`. Relatos individuais nunca são apagados.

### 4.5 Regras de confiança (transparentes, sem “nota” pseudo-científica)

Em vez de uma pontuação numérica, o mapa mostra **estados descritivos**:
- *Relato recebido* → *Publicado, sem confirmação independente* → *Confirmado por N pessoas* (N = contas distintas, excluindo o autor) → *Informações conflitantes* (quando confirmações recentes divergem da situação) → *Verificado pela equipe* → *Removido pela moderação*.
- Atualidade aparece separadamente (recente / atualização recomendada / desatualizado).
- A regra completa ficará publicada na página “Como funciona”.

---

## 5. Estrutura das telas

Barra inferior (celular, uso com uma mão): **Início · Mapa · [＋ Avisar] (botão central destacado) · Alertas · Mais**.
Menu “Mais”: Mapa da Memória, Aprenda e Previna, Duque de Caxias em Dados, Minha Participação, Sobre / Privacidade / Termos, Entrar/Sair. Painel administrativo em rota separada (`/admin`), visível apenas para quem tem papel autorizado (e protegido no banco).

| Tela | Conteúdo principal | Fase |
|---|---|---|
| Início | Marca Alag@u em destaque, slogan, botões “Ver mapa ao vivo” e “Avisar alagamento”, contadores calculados do banco (com mensagem clara quando zero), últimas atualizações, avisos oficiais vigentes, atalho para segurança e aviso legal | 2–3 |
| Mapa ao Vivo | Mapa, busca de rua/bairro, filtro de distrito, alternância “Agora / Histórico”, legenda, “atualizado há X min”, indicador de conexão | 2–3 |
| Detalhe do relato (painel inferior) | Endereço, bairro/distrito, situação (cor + texto + ícone), tendência (seta), profundidade, horários, foto, confirmações, estado de verificação, histórico; botões Confirmar / A situação mudou / Ver histórico / Compartilhar | 3–4 |
| Avisar Alagamento | Formulário em 8 etapas (seção 6) | 3 |
| Alertas de Chuva | “Vai chover? Fique ligado!” — avisos oficiais (com fonte, horários e link original), separados visualmente das atualizações comunitárias | 5 |
| Mapa da Memória | “Aqui já alagou!” — camada histórica, lista por rua, registro retrospectivo | 5 |
| Aprenda e Previna | 6 módulos, conteúdo gerenciado pelo painel | 6 |
| Duque de Caxias em Dados | Indicadores, gráficos, filtros, nota metodológica, exportação anonimizada | 6 |
| Minha Participação | Meus relatos, confirmações, rascunhos não enviados, preferências de notificação, excluir minha conta | 3–5 |
| Admin | Fila de moderação, fotos pendentes, denúncias, agrupamentos, conteúdos, alertas manuais com fonte, exportações | 2 (esqueleto) → 4–6 |

Acessibilidade: a situação nunca é comunicada só por cor — sempre cor + ícone + texto (importante para daltonismo). Contraste AA, alvos de toque ≥ 44 px, foco visível, rótulos ARIA, suporte a leitor de tela no mapa via lista alternativa de relatos.

---

## 6. Fluxo de registro de uma ocorrência

```
[Avisar] → precisa estar logado? ── não ──► Entrar (link mágico por e-mail, 1 passo)
   │ sim                                     + aceitar termos (1ª vez) + faixa etária
   ▼
1. Onde aconteceu?   busca de endereço (sugestões) │ marcar no mapa │ "Usar minha localização"
                     → pino arrastável para confirmar → distrito/bairro preenchidos (editáveis)
                     → se vários resultados, pede escolha; se fora do município, avisa
2. Como está a rua?  5 opções grandes com cor + ícone
3. A água está subindo ou baixando?  4 opções
4. Profundidade aparente (opcional) — com aviso "Não entre na água para medir"
5. Outros problemas (múltipla escolha)
6. Fotos (até 3, opcional) + descrição — orientações de privacidade  [habilitado só na Fase 4]
7. Quando? padrão = agora; permite ajustar; bloqueia data futura; > 24 h marca como histórico
8. Revisão → "Avisar a comunidade!"
   │
   ├─ online  → Edge Function valida (Zod + regras + limite de frequência) → grava → agrupa
   │            → Realtime notifica mapas abertos → mensagem de sucesso + estado
   │              ("publicado" ou "aguardando verificação")
   └─ offline → salva rascunho no aparelho (IndexedDB) com aviso claro:
                "Salvo só neste celular — ainda não enviado" → reenvio automático
                quando a conexão voltar (client_draft_id evita duplicata)
```

Antes de publicar, um relato pode ficar “aguardando verificação” quando: conta nova com muitos envios em pouco tempo, ponto muito distante de qualquer rua, conteúdo de texto sinalizado, ou contém foto (fotos sempre passam por moderação antes de ficarem públicas).

---

## 7. Funcionamento previsto do mapa em tempo real

1. **Carga inicial:** o app chama uma função RPC `reports_in_view(bbox, desde)` que devolve os relatos públicos do recorte visível (somente campos públicos — sem autor).
2. **Assinatura:** o app assina o canal Realtime das tabelas `reports`, `confirmations` e `report_updates` (apenas linhas públicas, respeitando RLS).
3. **Atualização:** a cada evento recebido, o marcador é criado/alterado sem recarregar a página; o carimbo “atualizado há X” é renovado.
4. **Reconexão:** se a conexão cair, o app mostra “Sem conexão — exibindo dados de HH:MM”, tenta reconectar com espera progressiva e, ao voltar, busca tudo com `updated_at > último_recebido` (recupera eventos perdidos).
5. **Plano B:** se o WebSocket não funcionar (redes móveis restritivas), o app passa a consultar a cada 60 s.
6. **Validade:** a cor perde intensidade conforme o tempo (recente → atualização recomendada → desatualizado/cinza com contorno), recalculada no cliente a cada minuto a partir de `app_settings`. Relatos antigos saem da visão “Agora”, mas continuam em “Histórico”.
7. **Agrupamento visual:** clusters nativos do MapLibre; o cluster assume a cor da situação mais grave e recente entre seus pontos.
8. **Legenda fixa** + aviso: “Cores são descrições comunitárias, não classificações oficiais. Verde não significa rua segura.”

---

## 8. Autenticação, perfis e proteção de dados

### 8.1 Estratégia de participação (baixo atrito × prevenção de abuso)

| Ação | Exige conta? |
|---|---|
| Ver mapa, histórico, alertas, conteúdo educativo, indicadores | **Não** |
| Registrar relato, confirmar, registrar memória | **Sim** — login sem senha (link mágico/código por e-mail) |
| Moderação e administração | Sim, com papel `moderator`/`admin` atribuído no banco |

Motivo: relatos anônimos sem conta tornariam impossível impedir que uma mesma pessoa “confirme” várias vezes o próprio relato ou faça spam. O login por e-mail sem senha é o menor atrito viável. Login por telefone (SMS) tem custo por mensagem → avaliado depois. Proteção extra: **Cloudflare Turnstile** (CAPTCHA gratuito e discreto) no login e no envio.

### 8.2 Controles de abuso
- Limite de frequência por conta (ex.: 10 relatos/h, 30 confirmações/h) aplicado no banco/Edge Function.
- Uma confirmação por pessoa por relato a cada 30 min; o autor não confirma o próprio relato.
- Detecção de duplicata: mesmo autor, ≤ 50 m, ≤ 15 min → propõe atualizar o relato existente em vez de criar outro.
- Contas bloqueáveis pela moderação; tudo registrado em `moderation_actions`.

### 8.3 LGPD
- **Minimização:** guardamos e-mail (para login), apelido, faixa etária e data de aceite dos termos. Nada de CPF, endereço residencial, telefone ou localização contínua. A geolocalização do aparelho é usada **uma vez**, só quando a pessoa toca em “Usar minha localização”, e apenas o ponto da ocorrência é salvo.
- **Publicidade:** o público vê o relato, nunca o autor (nem apelido, no MVP). Exportações acadêmicas são agregadas ou com coordenadas generalizadas, sem identificadores.
- **Bases legais (a validar com a assessoria jurídica da UERJ):** execução de política pública/pesquisa por órgão de pesquisa (art. 7º, IV e art. 11, II, c — estudos por órgão de pesquisa) e consentimento para notificações e fotos.
- **Menores de idade:** o público inclui estudantes. Para menores de 18 anos, os termos pedirão ciência do responsável; para menores de 12 anos (crianças, art. 14), a participação deve ocorrer **por meio da escola/projeto**, com consentimento específico do responsável — a coordenação precisa definir o procedimento. Fotos enviadas por menores sempre passam por moderação.
- **Fotos:** remoção de EXIF (inclui GPS do celular) no servidor, limite de 5 MB, formatos JPEG/PNG/WebP, bucket privado, moderação antes da publicação, botão de denúncia, orientação para evitar rostos e placas.
- **Retenção e exclusão:** a pessoa pode excluir sua conta; os relatos permanecem desvinculados (anonimizados), preservando a série histórica. `audit_logs` com retenção definida (proposta: 2 anos).
- **Segredos:** chaves só em variáveis de ambiente/cofre do provedor; `.env` no `.gitignore`; chave `service_role` nunca vai para o navegador; ambientes separados (dev / teste / produção = projetos Supabase distintos).
- **Documentos a produzir:** Política de Privacidade e Termos de Participação preliminares (Fase 3), para revisão jurídica.

---

## 9. Integração com fontes meteorológicas oficiais

Princípio: **nenhum aviso é criado pelo Alag@u.** Cada item mostra fonte, horário de emissão, horário de atualização e link original. Avisos oficiais e atualizações comunitárias têm visual diferente (ex.: faixa com brasão/nome do órgão vs. ícone do Alag@u).

| Fonte | O que buscamos | Situação conhecida | Ação na Fase 5 |
|---|---|---|---|
| **INMET** | Avisos meteorológicos (alertas por área e severidade) | Publica avisos em portal público e, segundo conhecimento prévio, em feed RSS/CAP. **Não verificado tecnicamente nesta fase.** | Verificar endpoint, formato, licença, estabilidade e frequência; se OK, ingestão automática a cada 10–15 min com filtro por área que intersecta Duque de Caxias. |
| **Cemaden** | Acumulados de pluviômetros próximos | Mapa interativo público; acesso a dados via serviço que historicamente exige cadastro/token. **Não verificado.** | Solicitar acesso formal (via UERJ, se necessário); enquanto isso, link para o mapa oficial. |
| **Defesa Civil RJ (estadual)** | Avisos e boletins | Normalmente redes sociais/site, sem API pública conhecida. | Cadastro **supervisionado** por administradores no painel (com link obrigatório para a publicação original). |
| **Defesa Civil de Duque de Caxias** | Avisos locais, sirenes | Idem; sem API conhecida. | Idem; buscar parceria institucional. |
| Previsão numérica (ex.: Open-Meteo) | Previsão e probabilidade de chuva | API aberta, mas **não é fonte oficial brasileira**. | Opcional, rotulada “previsão de modelo — não é aviso oficial”, só se a coordenação aprovar. |

Notificações push (Web Push, gratuito) serão preparadas na Fase 5, somente com autorização da pessoa, separando “Aviso oficial” de “Atualização comunitária do Alag@u”. Observação: no iPhone, push em PWA só funciona após “Adicionar à Tela de Início” (iOS 16.4+).

---

## 10. Custos potenciais

Valores aproximados, em dólar quando cobrados em dólar; devem ser reconfirmados no momento da contratação.

| Item | Desenvolvimento / piloto | Operação contínua (temporada de chuvas) |
|---|---|---|
| Supabase | Grátis (com pausa por inatividade e sem backup diário) | Plano Pro ~US$ 25/mês (~R$ 140–150/mês), ou auto-hospedagem na UERJ (custo de servidor + TI) |
| Hospedagem do app (site estático) | Grátis (Cloudflare Pages, Netlify, GitHub Pages) | Grátis ou servidor UERJ |
| Tiles do mapa | Grátis (OpenFreeMap) | Grátis; ou plano gratuito MapTiler/Stadia; risco de cota se uso crescer |
| Geocodificação | Grátis (Photon/Nominatim públicos, com limites) | Grátis; auto-hospedar se houver muito uso (servidor ~4–8 GB RAM só para RJ) |
| Domínio (ex.: alagou.org.br ou subdomínio uerj.br/labpenso.org) | — | ~R$ 40/ano (.org.br) ou zero com subdomínio institucional |
| Turnstile (anti-robô), Web Push | Grátis | Grátis |
| E-mail transacional (link mágico) | Grátis no Supabase (limite baixo) | Provedor SMTP (ex.: Resend/Brevo, planos gratuitos com milhares de e-mails/mês) |
| SMS (se adotado) | — | Pago por mensagem — **não recomendado no MVP** |
| Google Play (futuro) | — | Taxa única de US$ 25 da conta de desenvolvedor |
| Manutenção humana | — | Moderação de relatos/fotos e atualização de dependências: estimar algumas horas por semana na temporada de chuvas |

**Resumo:** MVP e piloto podem custar **R$ 0** em infraestrutura. Operação real e confiável: **cerca de R$ 150–200/mês**, ou zero em serviços com hospedagem institucional (trocando custo financeiro por horas de TI).

---

## 11. Riscos e limitações

| Risco | Impacto | Mitigação |
|---|---|---|
| Relatos falsos ou maliciosos | Desinformação em momento crítico | Login, limites de frequência, estados de verificação, moderação, aviso legal permanente |
| Poucos relatos (mapa vazio) | Falsa sensação de segurança | Mensagem “A ausência de relatos não significa ausência de risco”; engajamento via escolas do projeto |
| Endereçamento OSM incompleto em bairros periféricos | Pontos errados | Confirmação no mapa por pino; possibilidade de mapear ruas no OSM com estudantes (cartografia social) |
| Limites de serviços gratuitos (tiles, geocodificação, Supabase) | Indisponibilidade em pico de chuva — justamente quando mais se usa | Camada de abstração, cache, plano pago na temporada, opção de auto-hospedagem |
| Pessoas se arriscando para registrar | Segurança física | Avisos em todas as etapas; nunca pedir para entrar na água; não pedir medição |
| Dados de menores | Risco legal (LGPD art. 14) | Procedimento com escola/responsáveis; minimização; moderação de fotos |
| Fontes oficiais sem API | Alertas incompletos | Cadastro supervisionado com link original; documentar limitação |
| Reidentificação via microdados georreferenciados | Privacidade | Exportação pública agregada/generalizada; microdados só sob termo de uso para pesquisa |
| Conexão instável | Relato perdido | Rascunho local, reenvio automático, indicação clara do estado |
| Dependência de uma pessoa desenvolvedora | Continuidade | Documentação, migrações versionadas, stack popular e aberta |
| Bairros sem base oficial | Filtros por bairro imprecisos | Não inventar polígonos; usar texto confirmado + pesquisar base municipal |
| iOS: limitações de PWA (push, instalação) | Experiência pior no iPhone | Funciona normalmente pelo navegador; push apenas após instalar |

Limitação de princípio: o Alag@u **não** indicará rotas seguras, **não** emitirá alertas próprios e **não** converterá relatos comunitários em classificação oficial de risco.

---

## 12. Plano de implementação da primeira versão funcional (MVP)

Objetivo do MVP: **registrar uma rua alagada, localizá-la no mapa, armazenar e compartilhar com outros usuários em tempo real**, com moderação básica e segurança no banco.

| Etapa | Entregas | Critério de aceite verificável |
|---|---|---|
| **2a. Fundação** | Projeto Vite+React+TS+Tailwind, lint, testes (Vitest + Playwright), CI no GitHub Actions, `.env.example`, README, estrutura de pastas | `npm test` e build passam no CI |
| **2b. Identidade e navegação** | Paleta provisória (até receber a logomarca), barra inferior, Início, Mapa com MapLibre centrado em Duque de Caxias, legenda, telas de aviso legal/segurança, formulário em etapas (sem envio) | Testes de responsividade (360 px a desktop) e acessibilidade (axe) sem violações graves. Dados demonstrativos só em modo **“DEMONSTRAÇÃO”** visível |
| **3a. Banco** | Migrações SQL versionadas (PostGIS, enums, tabelas da seção 4, RLS, triggers de auditoria), importação IBGE de município/distritos, seed de `app_settings` | Testes de banco (pgTAP) passam: visitante não escreve; usuário não altera relato alheio; admin modera |
| **3b. Autenticação e perfis** | Login por link mágico, aceite de termos, faixa etária, papéis | Testes E2E de cadastro/login/permissões |
| **3c. Registro e geocodificação** | Edge Functions `/geocode` e `/reports` (validação Zod, limite de frequência, data futura bloqueada), formulário completo (sem fotos), rascunho offline | Relato criado aparece no banco com UTC correto e é exibido em horário de Brasília |
| **3d. Mapa compartilhado em tempo real** | RPC por recorte, assinatura Realtime, reconexão + recuperação, clusters, painel de detalhe, validade temporal | Teste E2E com **dois navegadores**: relato criado em A aparece em B sem recarregar; atualização também |
| **4 (parte mínima)** | Confirmações e “a situação mudou”, histórico de alterações, fila de moderação (ocultar/restaurar/verificar) | Critérios de aceitação mínimos da Parte XII cumpridos e demonstrados |

Itens explicitamente **fora** do MVP (fases seguintes): fotos (exigem moderação e remoção de EXIF prontas — Fase 4), Mapa da Memória e alertas meteorológicos (Fase 5), conteúdo educativo e painel de dados (Fase 6), PWA instalável completo (Fase 7).

Ao fim de cada etapa: relatório com o que foi **implementado** e **testado**, resultados dos testes e pendências — e pedido de aprovação antes de seguir.

---

## 13. Decisões que dependem da coordenação

1. **Aprovar a arquitetura** (Supabase gerenciado no MVP → possível migração para UERJ).
2. **Enviar a logomarca** Meninas pelo Clima e eventuais diretrizes de marca.
3. **Login obrigatório para registrar** (recomendado) ou aceitar relatos anônimos com moderação prévia?
4. **Procedimento para participação de menores** (especialmente menores de 12 anos).
5. **Quem cria as contas de serviço** (Supabase, hospedagem, domínio) — preferencialmente com e-mail institucional. Eu não criarei contas nem contratarei serviços sem autorização.
6. Validar os parâmetros iniciais (30 min / 2 h; raio de 50 m; janela de evento de 6 h) com a equipe científica.
7. Exibir ou não previsão de modelo não oficial (Open-Meteo) na tela de alertas.
