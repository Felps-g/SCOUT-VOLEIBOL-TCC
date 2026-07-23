/**
 * SETS CONTROLLER
 * Orquestra requisições relacionadas a sets
 */

import setsService from '../services/setsService.js';
import { FinalizarSetDTO } from '../dtos/index.js';
import { formatarErro } from '../utils/helpers.js';

// ============================================
// CRIAR NOVO SET
// ============================================
// POST /api/jogos/:jogoId/sets
// Body: { numero_set }
export const criarSet = async (req, res) => {
  try {
    const matchId = req.params.matchId || req.params.jogoId;
    const { numero_set, set_number } = req.body;
    const setNumber = numero_set ?? set_number;

    if (!setNumber || setNumber < 1) {
      return res.status(400).json({
        mensagem: 'Número do set inválido'
      });
    }

    const novoSet = await setsService.criarSet(matchId, setNumber);

    res.status(201).json({
      mensagem: 'Set criado com sucesso',
      set: novoSet
    });
  } catch (erro) {
    console.error('Erro ao criar set:', erro);
    res.status(500).json(formatarErro('Erro ao criar set', erro));
  }
};

// ============================================
// LISTAR SETS DE UM JOGO
// ============================================
// GET /api/jogos/:jogoId/sets
// Header: Authorization: Bearer <token>
export const listarSetsPorJogo = async (req, res) => {
  try {
    const matchId = req.params.matchId || req.params.jogoId;
    const sets = await setsService.buscarSetsPorJogo(matchId);

    res.status(200).json({
      mensagem: 'Sets do jogo listados',
      jogo_id: matchId,
      total: sets.length,
      sets
    });
  } catch (erro) {
    console.error('Erro ao listar sets:', erro);
    res.status(500).json(formatarErro('Erro ao listar sets', erro));
  }
};

// ============================================
// FINALIZAR UM SET
// ============================================
// PUT /api/jogos/:jogoId/sets/:setId/finalizar
// Body: { placar_time, placar_adversario, vencedor }
export const finalizarSet = async (req, res) => {
  try {
    const matchId = req.params.matchId || req.params.jogoId;
    const setId = req.params.setId || req.params.id;
    const { placar_time, placar_adversario, vencedor } = req.body;

    // Validar DTO
    const dto = new FinalizarSetDTO({
      jogo_id: matchId,
      numero_set: 0, // Não usado aqui
      placar_time,
      placar_adversario,
      vencedor
    });

    if (!dto.isValid()) {
      return res.status(400).json({
        mensagem: 'Dados inválidos',
        campos_obrigatorios: ['placar_time', 'placar_adversario', 'vencedor'],
        exemplo: {
          placar_time: 25,
          placar_adversario: 20,
          vencedor: 'time_id'
        }
      });
    }

    const setAtualizado = await setsService.finalizarSet(setId, {
      placar_time,
      placar_adversario,
      vencedor
    });

    res.status(200).json({
      mensagem: 'Set finalizado com sucesso',
      set: setAtualizado
    });
  } catch (erro) {
    console.error('Erro ao finalizar set:', erro);
    res.status(500).json(formatarErro('Erro ao finalizar set', erro));
  }
};

// ============================================
// OBTER SET ATUAL
// ============================================
// GET /api/jogos/:jogoId/sets/atual
// Header: Authorization: Bearer <token>
export const obterSetAtual = async (req, res) => {
  try {
    const matchId = req.params.matchId || req.params.jogoId;
    const setAtual = await setsService.obterSetAtual(matchId);

    if (!setAtual) {
      return res.status(404).json({
        mensagem: 'Nenhum set ativo para este jogo'
      });
    }

    res.status(200).json({
      mensagem: 'Set atual',
      set: setAtual
    });
  } catch (erro) {
    console.error('Erro ao obter set atual:', erro);
    res.status(500).json(formatarErro('Erro ao obter set atual', erro));
  }
};
