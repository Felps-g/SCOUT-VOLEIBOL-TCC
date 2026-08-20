# SCOUT LIVE — Plataforma de Análise de Voleibol

> SCOUT LIVE é uma plataforma gratuita de análise de voleibol pensada para times amadores e escolares, que facilita a coleta, o processamento e a visualização de estatísticas de partida.

[![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)]()
[![License](https://img.shields.io/badge/license-[LICENSE]-blue)]()

## Visão geral
O SCOUT LIVE tem como objetivo democratizar o acesso a análises esportivas no voleibol, oferecendo uma ferramenta simples e acessível que ajuda treinadores e atletas a tomar decisões baseadas em dados, identificar padrões de desempenho e melhorar processos de treino mesmo com recursos limitados.

## Impacto
- Reduz a dependência de análises manuais (planilhas) e interpretações subjetivas.
- Torna a análise de partidas acessível para escolas, clubes e equipes comunitárias com orçamento reduzido.
- Contribui para desenvolvimento técnico de atletas e para a formação de treinadores com base em evidências.
- Promove inclusão esportiva ao diminuir barreiras financeiras e técnicas ao uso de tecnologia de análise.

## Problema que resolvemos
Muitos times amadores e escolares não têm acesso a ferramentas profissionais por serem caras, complexas ou exigirem infraestrutura. Como consequência, análises ficam incompletas ou inexistentes, decisões ficam baseadas em intuição e o desenvolvimento da equipe fica prejudicado.

## Solução (o que o SCOUT oferece)
- Interface simples para registro de ações em jogo (saques, recepções, levantamentos, ataques, bloqueios, defesas, erros).
- Processamento automático de estatísticas por jogador, por set e por partida.
- Visualizações fáceis de interpretar.
- Exportação de relatórios para impressão ou compartilhamento.
- Priorização de usabilidade para treinadores sem formação técnica.

## Público-alvo
- Treinadores e atletas de equipes amadoras e escolares.
- Professores de educação física.
- Estudantes e pesquisadores interessados em análise esportiva.
- Voluntários e técnicos que atuam em clubes comunitários.

## Benefícios para o usuário
- Economiza tempo na produção de relatórios.
- Ajuda a identificar pontos fortes e fracos individuais e coletivos.
- Facilita planejamento de treinos baseado em dados reais de jogo.
- Permite acompanhamento de evolução ao longo da temporada.

## Funcionalidades principais

### Recursos atuais
- Registro manual de ações por partida.
- Visualizações de estatísticas em gráficos de acertos/erros e aproveitamento.
- Relatórios por jogador e por partida.
- Exportação CSV.

### Funcionalidades planejadas
- Mobile responsiveness aprimorada para uso em tablets durante partidas.
- Visualizações avançadas conforme necessidade.
- Comparações entre partidas e relatórios automatizados.
- Comunidade e contribuições externas.

## Equipe
- Felipe Gianinni — Backend, processamento de dados, análise estatística e coordenação do projeto.
- João Pardinho (Fabrizio) — Frontend e design de interface.

## Stack Tecnológico
- Frontend: JavaScript / React 
- Estilo: CSS 
- Backend: Javascript / Express
- Banco de dados: PostgreSQL
- Visualização: Chart.js
- Ferramentas: Git, GitHub, npm, Supabase

## Arquitetura do sistema
```text
Usuário
  ↓
Aplicação Frontend (JavaScript)
  ↓
Backend API (opcional — Node.js / outro)
  ↓
Processamento de Dados e Análises
  ↓
Banco de Dados / Armazenamento
```
