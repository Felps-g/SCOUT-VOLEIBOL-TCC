# Scout de Vôlei — Frontend

React + Vite. Fala com o backend em `http://localhost:3000/api` por padrão
(configurável via `VITE_API_URL`).

## Setup

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`. O backend precisa estar rodando junto
(veja `../backend/README.md`).

## Roteamento

`App.jsx` usa um roteador simples baseado em hash (`#/rota`), sem
dependências externas. Rotas com parâmetro usam query string dentro do
próprio hash, ex: `#/detalhe-jogo?id=123`.

## Páginas e estado atual

| Página | Estado |
|---|---|
| `Login.jsx` | Conectada — login real, token salvo e usado em todas as chamadas |
| `Atletas.jsx` | Conectada — lista jogadores reais do time selecionado |
| `AdicionarAtletas.jsx` | Conectada — cria jogador de verdade via API |
| `AtletaDetalhes.jsx` | Conectada — busca e exclui jogador real |
| `ScoutLive.jsx` | Conectada — cria jogo, resolve/cria time adversário, registra ações reais, persiste placar final |
| `Jogos.jsx` | Conectada — lista jogos reais |
| `DetalheJogo.jsx` | Conectada — gráfico de desempenho por set (Chart.js) e atleta destaque com dados reais |
| `Perfil.jsx` | **Ainda não conectada** — dados de exibição são fixos |

## `SeletorTime.jsx`

Componente compartilhado por Atletas/AdicionarAtletas/ScoutLive: busca os
times reais do técnico logado, deixa escolher um e guarda a escolha em
`localStorage` (`time_selecionado`) para as outras páginas usarem.

## Observações de design

- O adversário de um jogo é resolvido/criado como um `time` normal (via
  `POST /api/times`) — o schema do banco exige que `away_team_id`
  referencie um time real, então não existe "adversário como texto livre".
- `tipo_acao` (fundamento: saque, ataque, bloqueio...) e `resultado`
  (ponto/erro/neutro) são campos independentes — um ace é
  `saque` + `ponto`, não um resultado à parte.
