# Scout de Vôlei — Backend

API REST em Node.js/Express para o sistema de scout de vôlei. Usa Supabase
como banco de dados (Postgres) e autenticação.

## Setup

```bash
npm install
cp .env.example .env   # preencha com os valores do seu projeto Supabase
npm run dev             # ou: npm start
```

O servidor sobe em `http://localhost:3000` (ou na porta definida em `PORT`).

No boot, o terminal avisa qual chave do Supabase está em uso:

```
✅ Supabase: usando SUPABASE_SERVICE_ROLE_KEY (RLS bypassado no backend).
```

Se aparecer um `⚠️` no lugar, a `SUPABASE_SERVICE_ROLE_KEY` não foi
encontrada e o backend caiu para a anon key — toda escrita no banco vai
falhar com erro de Row Level Security até isso ser corrigido.

## Banco de dados

Rode `DATABASE_MIGRATION.sql` no SQL Editor do Supabase. É idempotente —
cria as tabelas que faltarem e garante a constraint `UNIQUE(match_id,
player_id)` em `player_match_stats` (necessária para o upsert de
estatísticas) e as políticas de RLS completas nas tabelas de jogo.

`teams` e `players` não têm RLS habilitado de propósito: a autorização
delas é feita em código (o backend confere o dono do time antes de cada
operação), e o backend só acessa o banco com a `service_role key`.

## Autenticação

Login/cadastro passam pelo Supabase Auth e devolvem um JWT. Todas as rotas
abaixo (exceto `/auth/*`) exigem o header:

```
Authorization: Bearer <token>
```

## Modelo de dados (resumo)

- **time** (`teams`) — pertence a um técnico (`user_id`). Um adversário
  também é modelado como um `team` comum (não existe texto livre para
  adversário — veja nota no frontend).
- **jogador** (`players`) — pertence a um `team`. `cpf` é único.
- **jogo** (`matches`) — liga `home_team_id` × `away_team_id`.
- **set** (`match_sets`) — criado automaticamente (Set 1) ao criar o jogo.
- **ação de scout** (`scout_actions`) — cada lance registrado durante o
  jogo: `action_type` (`saque`/`recepcao`/`levantamento`/`ataque`/
  `bloqueio`/`defesa`) + `result` (`ponto`/`erro`/`neutro`).
- **estatística do jogador no jogo** (`player_match_stats`) —
  recalculada automaticamente a cada ação registrada.

## Rotas principais

Todas sob o prefixo `/api`.

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/registrar` | Cria uma conta |
| POST | `/auth/login` | Login, devolve o token |
| GET/POST/PUT/DELETE | `/times` | CRUD de times (também aceito em `/teams`) |
| GET/POST/PUT/DELETE | `/players` | CRUD de jogadores (`?team_id=` filtra por time) |
| POST | `/matches/novo` | Cria um jogo (cria o Set 1 automaticamente) |
| GET | `/matches` | Lista os jogos do técnico logado |
| GET | `/matches/:id` | Detalhe de um jogo |
| PUT | `/matches/:id/finalizar` | Grava `resultado_final` + `placar_final` (ex: `"3x1"`) |
| DELETE | `/matches/:id` | Exclui o jogo e tudo que depende dele |
| GET | `/matches/:id/sets/atual` | Set ativo no momento |
| POST | `/matches/:id/acoes` | Registra uma ação de scout |
| GET | `/matches/:id/acoes` | Lista as ações do jogo |
| GET | `/matches/:id/analise` | Resumo completo (para os gráficos) |
| GET | `/matches/:id/ranking/atacantes` | Ranking dos atacantes por pontos |
| GET | `/matches/:id/ranking/por-posicao` | Ranking agrupado por posição |
| GET | `/matches/:id/comparar/:jogador1/:jogador2` | Compara dois jogadores |

### Registrar uma ação — exemplo

```bash
curl -X POST http://localhost:3000/api/matches/{MATCH_ID}/acoes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{
    "jogador_id": "{JOGADOR_ID}",
    "set_id": "{SET_ID}",
    "tipo_acao": "ataque",
    "resultado": "ponto",
    "posicao_jogador": "ponteiro",
    "descricao": "Ataque paralela"
  }'
```

`tipo_acao` e `resultado` são independentes: um ace, por exemplo, é
`tipo_acao: "saque"` + `resultado: "ponto"` — não existe um valor de
resultado separado para cada fundamento.

## Estrutura

```
src/
  app.js, server.js       — bootstrap do Express
  config/supabase.js      — client do Supabase
  constants/               — listas compartilhadas (tipos de ação, posições)
  controllers/             — recebem a requisição, validam, chamam o service
  services/                — regra de negócio
  database/matchOperations.js — toda query ao Supabase relacionada a jogo/scout
  dtos/                    — formato de entrada/saída de cada rota
  middlewares/authMiddleware.js
  routes/
  utils/helpers.js
```
