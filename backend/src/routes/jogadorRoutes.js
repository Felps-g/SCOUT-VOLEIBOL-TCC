import { Router } from 'express';

import {
  listarJogadores,
  buscarJogador,
  criarJogador,
  atualizarJogador,
  deletarJogador
} from '../controllers/jogadorController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas as rotas de jogadores requerem autenticação
router.get('/players', authenticateToken, listarJogadores);
router.get('/jogadores', authenticateToken, listarJogadores);
router.get('/jogador', authenticateToken, listarJogadores);
router.get('/players/:id', authenticateToken, buscarJogador);
router.get('/jogadores/:id', authenticateToken, buscarJogador);
router.get('/jogador/:id', authenticateToken, buscarJogador);
router.post('/players', authenticateToken, criarJogador);
router.post('/jogadores', authenticateToken, criarJogador);
router.post('/jogador', authenticateToken, criarJogador);
router.put('/players/:id', authenticateToken, atualizarJogador);
router.put('/jogadores/:id', authenticateToken, atualizarJogador);
router.put('/jogador/:id', authenticateToken, atualizarJogador);
router.delete('/players/:id', authenticateToken, deletarJogador);
router.delete('/jogadores/:id', authenticateToken, deletarJogador);
router.delete('/jogador/:id', authenticateToken, deletarJogador);

export default router;