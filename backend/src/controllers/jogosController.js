/**
 * JOGOS CONTROLLER
 * Orquestra requisições relacionadas a jogos
 * Valida entrada, chama services, retorna respostas
 */

import jogosService from '../services/jogosService.js';
import setsService from '../services/setsService.js';
import { CreateJogoDTO, JogoResponseDTO, FinalizarJogoDTO } from '../dtos/index.js';
import { formatarErro, isUuidValido } from '../utils/helpers.js';

// ============================================
// CRIAR NOVO JOGO
// ============================================
// POST /api/jogos/novo
// Body: { time_id, time_adversario_id, data_jogo, local }
export const criarJogo = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      time_id,
      time_adversario_id,
      data_jogo,
      local,
      home_team_id,
      away_team_id,
      match_date,
      location
    } = req.body;

    const dto = new CreateJogoDTO({
      time_id: time_id || home_team_id,
      time_adversario_id: time_adversario_id || away_team_id,
      data_jogo: data_jogo || match_date,
      local: local || location
    });

    // Validar DTO
    if (!dto.isValid()) {
      return res.status(400).json({
        mensagem: 'Dados inválidos',
        campos_obrigatorios: ['time_id', 'time_adversario_id', 'data_jogo']
      });
    }

    // time_id/time_adversario_id precisam ser UUIDs reais de times já
    // cadastrados (retornados por POST/GET /api/times) — não um texto
    // qualquer nem um id de exemplo copiado de alguma documentação.
    if (!isUuidValido(dto.time_id) || !isUuidValido(dto.time_adversario_id)) {
      return res.status(400).json({
        mensagem: 'time_id e time_adversario_id precisam ser UUIDs reais de times cadastrados (use POST/GET /api/times para obtê-los)',
        recebido: { time_id: dto.time_id, time_adversario_id: dto.time_adversario_id }
      });
    }

    // Criar jogo
    const novoJogo = await jogosService.criarMatch(userId, {
      home_team_id: dto.time_id,
      away_team_id: dto.time_adversario_id,
      match_date: dto.data_jogo,
      location: dto.local
    });

    // Criar primeiro set automaticamente
    await setsService.criarSet(novoJogo.id, 1);

    res.status(201).json({
      mensagem: 'Jogo criado com sucesso',
      jogo: new JogoResponseDTO(novoJogo)
    });
  } catch (erro) {
    console.error('Erro ao criar jogo:', erro);
    res.status(500).json(formatarErro('Erro ao criar jogo', erro));
  }
};

// ============================================
// LISTAR JOGOS DO TREINADOR
// ============================================
// GET /api/jogos
// Header: Authorization: Bearer <token>
export const listarJogos = async (req, res) => {
  try {
    const userId = req.user.id;
    const jogos = await jogosService.listarJogosPorUsuario(userId);

    res.status(200).json({
      mensagem: 'Jogos listados com sucesso',
      total: jogos.length,
      jogos: jogos.map(j => new JogoResponseDTO(j))
    });
  } catch (erro) {
    console.error('Erro ao listar jogos:', erro);
    res.status(500).json(formatarErro('Erro ao listar jogos', erro));
  }
};

// ============================================
// BUSCAR UM JOGO COM DETALHES COMPLETOS
// ============================================
// GET /api/jogos/:jogoId
// Header: Authorization: Bearer <token>
export const buscarJogo = async (req, res) => {
  try {
    const matchId = req.params.matchId || req.params.jogoId;
    const jogo = await jogosService.buscarJogoCompleto(matchId);

    if (!jogo) {
      return res.status(404).json({
        mensagem: 'Jogo não encontrado'
      });
    }

    res.status(200).json({
      mensagem: 'Jogo encontrado',
      jogo: new JogoResponseDTO(jogo)
    });
  } catch (erro) {
    console.error('Erro ao buscar jogo:', erro);
    res.status(500).json(formatarErro('Erro ao buscar jogo', erro));
  }
};

// ============================================
// LISTAR JOGOS DE UM TIME
// ============================================
// GET /api/jogos/time/:timeId
// Header: Authorization: Bearer <token>
export const listarJogosPorTime = async (req, res) => {
  try {
    const { timeId } = req.params;
    const jogos = await jogosService.listarJogosPorTime(timeId);

    res.status(200).json({
      mensagem: 'Jogos do time listados',
      time_id: timeId,
      total: jogos.length,
      jogos: jogos.map(j => new JogoResponseDTO(j))
    });
  } catch (erro) {
    console.error('Erro ao listar jogos do time:', erro);
    res.status(500).json(formatarErro('Erro ao listar jogos do time', erro));
  }
};

// ============================================
// EXCLUIR UM JOGO
// ============================================
// DELETE /api/matches/:matchId
// Header: Authorization: Bearer <token>
export const excluirJogo = async (req, res) => {
  try {
    const matchId = req.params.matchId || req.params.jogoId;
    await jogosService.deletarJogo(matchId);

    res.status(200).json({
      mensagem: 'Jogo excluído com sucesso'
    });
  } catch (erro) {
    console.error('Erro ao excluir jogo:', erro);
    res.status(500).json(formatarErro('Erro ao excluir jogo', erro));
  }
};

// ============================================
// FINALIZAR UM JOGO
// ============================================
// PUT /api/jogos/:jogoId/finalizar
// Body: { resultado_final, placar_final }
export const finalizarJogo = async (req, res) => {
  try {
    const matchId = req.params.matchId || req.params.jogoId;
    const { resultado_final, placar_final } = req.body;

    // Validar DTO
    const dto = new FinalizarJogoDTO({ jogo_id: matchId, resultado_final, placar_final });
    if (!dto.isValid()) {
      return res.status(400).json({
        mensagem: 'Dados inválidos',
        campos_obrigatorios: ['resultado_final', 'placar_final'],
        exemplo: {
          resultado_final: 'vitoria',
          placar_final: '3x1'
        }
      });
    }

    const jogoAtualizado = await jogosService.finalizarJogo(matchId, dto);

    res.status(200).json({
      mensagem: 'Jogo finalizado com sucesso',
      jogo: new JogoResponseDTO(jogoAtualizado)
    });
  } catch (erro) {
    console.error('Erro ao finalizar jogo:', erro);
    res.status(500).json(formatarErro('Erro ao finalizar jogo', erro));
  }
};
