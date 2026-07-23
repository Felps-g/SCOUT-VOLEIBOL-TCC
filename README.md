# Scout de Vôlei (TCC)

Sistema de scout de vôlei ao vivo: cadastro de times e jogadores, registro
de ações durante o jogo, e análise de desempenho com gráficos.

```
backend/     API Node.js/Express + Supabase
frontend/    React + Vite
```

## Rodando o projeto

Precisa dos dois de pé ao mesmo tempo, em terminais separados:

```bash
cd backend && npm install && cp .env.example .env
# preencha o .env com as chaves do seu projeto Supabase
npm run dev
```

```bash
cd frontend && npm install
npm run dev
```

Backend em `http://localhost:3000`, frontend em `http://localhost:5173`.

Veja `backend/README.md` e `frontend/README.md` para detalhes de cada
parte (rotas da API, modelo de dados, estado de cada tela). Se for
trabalhar com outra pessoa no projeto (ex: dividir front/back), veja
`CONTRIBUTING.md` para o fluxo de git e o que não quebrar entre os dois.

## Fluxo principal

Login → criar/selecionar time → cadastrar jogador → Scout ao Vivo (cria o
jogo, registra ações) → salva o placar final → tela de detalhe do jogo com
gráfico de desempenho por set e ranking dos atacantes.
