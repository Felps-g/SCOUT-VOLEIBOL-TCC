/**
 * ROTAS DO SCOUT DE VOLEIBOL
 * Endpoints para gerenciar matches, sets, ações e estatísticas
 * 
 * Integrado com:
 * - Autenticação Supabase (um técnico por vez)
 * - Ranking por posição (atacantes, levantadores, etc)
 * - Scout ao vivo
 * - Análise completa
 */

import { Router } from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';

// Importar controllers
import * as jogosController from '../controllers/jogosController.js';
import * as setsController from '../controllers/setsController.js';
import * as acoesController from '../controllers/acoesController.js';
import * as estatisticasController from '../controllers/estatisticasController.js';

const router = Router();

// ============================================
// MIDDLEWARE: Autenticação (Supabase)
// ============================================
// Apenas o técnico autenticado acessa os endpoints
router.use(authenticateToken);

// ============================================
// ROTAS DE MATCHES (JOGOS)
// ============================================

// POST - Criar novo match
router.post('/matches/novo', jogosController.criarJogo);

// GET - Listar todos os matches do técnico
router.get('/matches', jogosController.listarJogos);

// GET - Listar matches de um time específico
router.get('/matches/time/:timeId', jogosController.listarJogosPorTime);

// GET - Buscar um match com detalhes
router.get('/matches/:matchId', jogosController.buscarJogo);

// PUT - Finalizar um match
router.put('/matches/:matchId/finalizar', jogosController.finalizarJogo);

// DELETE - Excluir um match (e tudo que depende dele)
router.delete('/matches/:matchId', jogosController.excluirJogo);

// ============================================
// ROTAS DE SETS
// ============================================

// POST - Criar novo set
router.post('/matches/:matchId/sets', setsController.criarSet);

// GET - Listar sets de um match
router.get('/matches/:matchId/sets', setsController.listarSetsPorJogo);

// GET - Obter set atual (em andamento)
router.get('/matches/:matchId/sets/atual', setsController.obterSetAtual);

// PUT - Finalizar um set
router.put('/matches/:matchId/sets/:setId/finalizar', setsController.finalizarSet);

// ============================================
// ROTAS DE AÇÕES (SCOUT AO VIVO)
// ============================================

// POST - Registrar uma ação (PRINCIPAL PARA SCOUT)
router.post('/matches/:matchId/acoes', acoesController.registrarAcao);

// GET - Listar todas as ações de um match
router.get('/matches/:matchId/acoes', acoesController.listarAcoesPorJogo);

// GET - Listar ações de um jogador em um match
router.get('/matches/:matchId/jogadores/:jogadorId/acoes', acoesController.listarAcoesPorJogador);

// GET - Análise de ações por tipo
router.get('/matches/:matchId/analise/por-tipo', acoesController.analisarAcoesPorTipo);

// GET - Estatísticas de um tipo de ação
router.get('/matches/:matchId/acoes/:tipoAcao/estatisticas', acoesController.obterEstatisticasAcao);

// ============================================
// ROTAS DE ESTATÍSTICAS
// ============================================

// GET - Estatísticas de um jogador em um match
router.get('/matches/:matchId/jogadores/:jogadorId/estatisticas', 
  estatisticasController.obterEstatisticasJogador);

// GET - Todas as estatísticas de um match
router.get('/matches/:matchId/estatisticas', 
  estatisticasController.obterEstatisticasMatch);

// GET - Análise completa de um match (para gráficos)
router.get('/matches/:matchId/analise', 
  estatisticasController.analisarMatch);

// ============================================
// ROTAS DE RANKING (POR POSIÇÃO)
// ============================================

// GET - Ranking apenas de atacantes
router.get('/matches/:matchId/ranking/atacantes', 
  estatisticasController.rankingAtacantes);

// GET - Ranking completo por posição
// Retorna: { levantador: [...], ponteiro: [...], central: [...], libero: [...] }
router.get('/matches/:matchId/ranking/por-posicao', 
  estatisticasController.rankingPorPosicao);

// ============================================
// COMPARAÇÃO DE JOGADORES
// ============================================

// GET - Comparar dois jogadores
router.get('/matches/:matchId/comparar/:jogadorId1/:jogadorId2', 
  estatisticasController.compararJogadores);

export default router;
