# Guia rápido para quem for mexer no projeto

## Subindo pro GitHub

```bash
cd scout-volei          # a pasta que contém backend/ e frontend/
git init
git add .
git commit -m "projeto inicial"
git branch -M main
git remote add origin <url-do-seu-repositorio>
git push -u origin main
```

Os `.gitignore` de `backend/` e `frontend/` já excluem `.env` e
`node_modules/` — o `.env` real com as chaves do Supabase **nunca** deve
ser commitado. Só o `.env.example` (sem valores) vai pro repositório.

## Fluxo de trabalho com o parceiro (2 pessoas)

Repo pequeno, então não precisa de processo pesado — só o suficiente pra
não sobrescrever o trabalho um do outro:

1. **`main` sempre no estado que funciona.** Ninguém commita direto nela.
2. Cada mudança em uma branch: `git checkout -b feature/nome-da-mudanca`.
3. Ao terminar, `git push` a branch e abrir um Pull Request no GitHub
   (mesmo sendo só vocês dois revisando) — isso cria um diff claro do que
   mudou antes de ir pra `main`, e evita que os dois editem os mesmos
   arquivos ao mesmo tempo sem perceber.
4. Antes de dar merge, testar o fluxo completo local (login → time →
   jogador → scout → gráfico) — é rápido e pega quebra na hora.

## Setup do parceiro (só frontend)

Ele não precisa necessariamente rodar o backend local — só apontar pra
onde o backend estiver rodando (o seu localhost, ou um deploy, se
tiverem um):

```bash
cd frontend
npm install
cp .env.example .env
# edita o .env.local se o backend não estiver em localhost:3000
npm run dev
```

## O que não pode mudar sem combinar antes

Isso é o "contrato" entre frontend e backend — mudar qualquer um destes
pontos sem avisar quebra o outro lado silenciosamente:

- **Rotas e formato de request/response da API** — está tudo documentado
  em `backend/README.md`. Se o backend mudar um nome de campo ou uma
  rota, o frontend quebra sem erro claro (geralmente vira `undefined` na
  tela, não uma exceção).
- **`tipo_acao` e `resultado` são campos separados** — um ace é
  `tipo_acao: "saque"` + `resultado: "ponto"`, nunca um valor de
  resultado à parte tipo `"ace"`.
- **As chaves de `localStorage`** usadas hoje: `scout_token`/`authToken`
  (sessão) e `time_selecionado` (time ativo, usado por `Atletas`,
  `AdicionarAtletas` e `ScoutLive`). Trocar o nome de uma chave sem
  atualizar todo mundo que lê ela quebra o app inteiro silenciosamente.
- **`services/api.js` e `services/time.js`** são o único ponto de contato
  com o backend. Toda chamada nova deveria passar por `apiRequest(...)`
  (já cuida de token, JSON e erro) em vez de um `fetch()` solto numa
  página — mantém consistência e facilita achar tudo que fala com a API.
- **O roteador em `App.jsx`** é baseado em hash simples (`#/rota`, sem
  lib externa). Pra adicionar uma página nova: criar o componente e
  registrar no objeto `rotas` do `App.jsx`. Rotas com parâmetro usam
  `#/rota?id=123` — o parâmetro é lido manualmente com
  `window.location.hash.split('?')[1]`, não `window.location.search`
  (isso já pegou um bug real durante o desenvolvimento, veja o comentário
  no próprio `App.jsx`).

Qualquer mudança que não mexa nesses pontos (estilo, layout, novas
páginas que só leem dados já expostos pela API) é segura de fazer sem
risco de quebrar o outro lado.
