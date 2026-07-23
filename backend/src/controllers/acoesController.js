/**
 * AÇÕES CONTROLLER
 * Orquestra requisições relacionadas a ações durante jogos ao vivo
 */

import acoesService from '../services/acoesService.js';
import estatisticasService from '../services/estatisticasService.js';
import { CreateAcaoDTO, AcaoResponseDTO } from '../dtos/index.js';
import { formatarErro, validarTipoAcao, validarResultado } from '../utils/helpers.js';

// ============================================
// REGISTRAR UMA AÇÃO (SCOUT AO VIVO)
// ============================================
// POST /api/jogos/:jogoId/acoes
// Body: { jogador_id, tipo_acao, resultado, posicao_jogador, descricao }
export const registrarAcao = async (req, res) => {
  try {
    const matchId = req.params.matchId || req.params.jogoId;
    const { jogador_id, tipo_acao, resultado, posicao_jogador, descricao, set_id, set_number, action_order } = req.body;

    // Validar tipo de ação
    if (!validarTipoAcao(tipo_acao)) {
      return res.status(400).json({
        mensagem: 'Tipo de ação inválido',
        tipos_validos: ['saque', 'recepcao', 'levantamento', 'ataque', 'bloqueio', 'defesa', 'substituicao']
      });
    }

    // Validar resultado
    if (!validarResultado(resultado)) {
      return res.status(400).json({
        mensagem: 'Resultado inválido',
        resultados_validos: ['ponto', 'erro', 'neutro']
      });
    }

    // Validar DTO
    const dto = new CreateAcaoDTO({
      jogo_id: matchId,
      match_id: matchId,
      jogador_id,
      tipo_acao,
      resultado,
      descricao: descricao || '',
      set_id,
      set_number,
      action_order
    });

    if (!dto.isValid()) {
      return res.status(400).json({
        mensagem: 'Dados inválidos',
        campos_obrigatorios: ['jogador_id', 'tipo_acao', 'resultado'],
        exemplo: {
          jogador_id: 'uuid-do-jogador',
          tipo_acao: 'ataque',
          resultado: 'ponto',
          posicao_jogador: 'ponteiro',
          descricao: 'Ataque direto na linha de fundo'
        }
      });
    }

    // Registrar ação
    const novaAcao = await acoesService.registrarAcao({
      ...dto,
      posicao_jogador: posicao_jogador || 'desconhecido'
    });

    // Atualizar estatísticas do jogador
    await estatisticasService.atualizarEstatisticasJogador(matchId, jogador_id);

    res.status(201).json({
      mensagem: 'Ação registrada com sucesso',
      acao: new AcaoResponseDTO(novaAcao)
    });
  } catch (erro) {
    console.error('Erro ao registrar ação:', erro);
    res.status(500).json(formatarErro('Erro ao registrar ação', erro));
  }
};

// ============================================
// BUSCAR TODAS AS AÇÕES DE UM JOGO
// ============================================
// GET /api/jogos/:jogoId/acoes
// Header: Authorization: Bearer <token>
export const listarAcoesPorJogo = async (req, res) => {
  try {
    const matchId = req.params.matchId || req.params.jogoId;
    const acoes = await acoesService.buscarAcoesPorJogo(matchId);

    res.status(200).json({
      mensagem: 'Ações do jogo listadas',
      total: acoes.length,
      acoes: acoes.map(a => new AcaoResponseDTO(a))
    });
  } catch (erro) {
    console.error('Erro ao listar ações:', erro);
    res.status(500).json(formatarErro('Erro ao listar ações', erro));
  }
};

// ============================================
// BUSCAR AÇÕES DE UM JOGADOR EM UM JOGO
// ============================================
// GET /api/jogos/:jogoId/jogadores/:jogadorId/acoes
// Header: Authorization: Bearer <token>
export const listarAcoesPorJogador = async (req, res) => {
  try {
    const matchId = req.params.matchId || req.params.jogoId;
    const jogadorId = req.params.jogadorId || req.params.jogador_id;
    const acoes = await acoesService.buscarAcoesPorJogador(jogadorId, matchId);

    res.status(200).json({
      mensagem: 'Ações do jogador listadas',
      jogador_id: jogadorId,
      jogo_id: matchId,
      total: acoes.length,
      acoes: acoes.map(a => new AcaoResponseDTO(a))
    });
  } catch (erro) {
    console.error('Erro ao listar ações do jogador:', erro);
    res.status(500).json(formatarErro('Erro ao listar ações do jogador', erro));
  }
};

// ============================================
// ANALISAR AÇÕES POR TIPO
// ============================================
// GET /api/jogos/:jogoId/analise/por-tipo
// Header: Authorization: Bearer <token>
export const analisarAcoesPorTipo = async (req, res) => {
  try {
    const matchId = req.params.matchId || req.params.jogoId;
    const analise = await acoesService.analisarAcoesPorTipo(matchId);

    res.status(200).json({
      mensagem: 'Análise de ações por tipo',
      jogo_id: matchId,
      analise
    });
  } catch (erro) {
    console.error('Erro ao analisar ações:', erro);
    res.status(500).json(formatarErro('Erro ao analisar ações', erro));
  }
};

// ============================================
// BUSCAR ESTATÍSTICAS DE UM TIPO DE AÇÃO
// ============================================
// GET /api/jogos/:jogoId/acoes/:tipoAcao/estatisticas
// Header: Authorization: Bearer <token>
export const obterEstatisticasAcao = async (req, res) => {
  try {
    const matchId = req.params.matchId || req.params.jogoId;
    const { tipoAcao } = req.params;
    const stats = await acoesService.buscarEstatisticasAcao(matchId, tipoAcao);

    res.status(200).json({
      mensagem: `Estatísticas de ${tipoAcao}`,
      tipo_acao: tipoAcao,
      estatisticas: stats
    });
  } catch (erro) {
    console.error('Erro ao obter estatísticas:', erro);
    res.status(500).json(formatarErro('Erro ao obter estatísticas', erro));
  }
};
