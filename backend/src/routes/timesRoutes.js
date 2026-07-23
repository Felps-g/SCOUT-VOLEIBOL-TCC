import { Router } from 'express';
import { listarTimes, buscarTime, criarTime, atualizarTime, deletarTime } from '../controllers/timesController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas as rotas de times requerem autenticação
router.get('/teams', authenticateToken, listarTimes);
router.get('/times', authenticateToken, listarTimes);
router.get('/teams/:id', authenticateToken, buscarTime);
router.get('/times/:id', authenticateToken, buscarTime);
router.post('/teams', authenticateToken, criarTime);
router.post('/times', authenticateToken, criarTime);
router.put('/teams/:id', authenticateToken, atualizarTime);
router.put('/times/:id', authenticateToken, atualizarTime);
router.delete('/teams/:id', authenticateToken, deletarTime);
router.delete('/times/:id', authenticateToken, deletarTime);

export default router;
