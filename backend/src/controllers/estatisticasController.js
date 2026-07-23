/**
 * ESTATÍSTICAS CONTROLLER
 * Orquestra requisições relacionadas a estatísticas e análises
 * Ranking separado por posição
 */

import estatisticasService from '../services/estatisticasService.js';
import { EstatisticaJogadorResponseDTO } from '../dtos/index.js';
import { formatarErro } from '../utils/helpers.js';

// ============================================
// OBTER ESTATÍSTICAS DE UM JOGADOR
// ============================================
// GET /api/matches/:matchId/jogadores/:jogadorId/estatisticas
export const obterEstatisticasJogador = async (req, res) => {
  try {
    const { matchId, jogadorId } = req.params;
    const stats = await estatisticasService.obterEstatisticasJogador(matchId, jogadorId);

    res.status(200).json({
      mensagem: 'Estatísticas do jogador',
      jogador_id: jogadorId,
      match_id: matchId,
      estatisticas: new EstatisticaJogadorResponseDTO(stats)
    });
  } catch (erro) {
    console.error('Erro ao obter estatísticas:', erro);
    res.status(500).json(formatarErro('Erro ao obter estatísticas', erro));
  }
};

// ============================================
// OBTER TODAS AS ESTATÍSTICAS DO MATCH
// ============================================
// GET /api/matches/:matchId/estatisticas
export const obterEstatisticasMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const stats = await estatisticasService.obterEstatisticasMatch(matchId);

    res.status(200).json({
      mensagem: 'Estatísticas do match',
      match_id: matchId,
      total_jogadores: stats.length,
      estatisticas: stats.map(s => new EstatisticaJogadorResponseDTO(s))
    });
  } catch (erro) {
    console.error('Erro ao obter estatísticas do match:', erro);
    res.status(500).json(formatarErro('Erro ao obter estatísticas do match', erro));
  }
};

// ============================================
// ANÁLISE COMPLETA DO MATCH
// ============================================
// GET /api/matches/:matchId/analise
// Retorna dados estruturados para gráficos e includes ranking por posição
export const analisarMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const analise = await estatisticasService.analisarMatch(matchId);

    res.status(200).json({
      mensagem: 'Análise completa do match',
      match_id: matchId,
      analise: {
        resumo: {
          total_acoes: analise.totalAcoes,
          total_pontos: analise.totalPontos,
          total_erros: analise.totalErros,
          total_neutros: analise.totalNeutros,
          eficiencia_geral: analise.eficienciaGeral
        },
        acoes_por_tipo: analise.acoesPorTipo,
        sets: analise.sets,
        estatisticas_jogadores: analise.estatisticasJogadores.map(s => 
          new EstatisticaJogadorResponseDTO(s)
        ),
        ranking_por_posicao: analise.rankingPorPosicao
      }
    });
  } catch (erro) {
    console.error('Erro ao analisar match:', erro);
    res.status(500).json(formatarErro('Erro ao analisar match', erro));
  }
};

// ============================================
// RANKING DE ATACANTES APENAS
// ============================================
// GET /api/matches/:matchId/ranking/atacantes
// Retorna apenas atacantes ordenados por pontos
export const rankingAtacantes = async (req, res) => {
  try {
    const { matchId } = req.params;
    const ranking = await estatisticasService.rankingAtacantes(matchId);

    res.status(200).json({
      mensagem: 'Ranking de atacantes',
      match_id: matchId,
      posicao: 'ataque',
      total: ranking.length,
      ranking: ranking.map(j => ({
        posicao: j.rank,
        jogador_id: j.player_id,
        pontos_totais: j.total_points,
        taxa_efetividade: j.effectiveness,
        ataques: j.attacks
      }))
    });
  } catch (erro) {
    console.error('Erro ao gerar ranking de atacantes:', erro);
    res.status(500).json(formatarErro('Erro ao gerar ranking de atacantes', erro));
  }
};

// ============================================
// RANKING COMPLETO POR POSIÇÃO
// ============================================
// GET /api/matches/:matchId/ranking/por-posicao
// Agrupa e ordena jogadores por posição
export const rankingPorPosicao = async (req, res) => {
  try {
    const { matchId } = req.params;
    const ranking = await estatisticasService.rankingPorPosicao(matchId);

    const resultado = {};
    for (const [posicao, jogadores] of Object.entries(ranking)) {
      resultado[posicao] = jogadores.map(j => ({
        posicao_ranking: j.rank,
        jogador_id: j.player_id,
        pontos_totais: j.total_points,
        taxa_efetividade: j.effectiveness
      }));
    }

    res.status(200).json({
      mensagem: 'Ranking de jogadores por posição',
      match_id: matchId,
      ranking: resultado
    });
  } catch (erro) {
    console.error('Erro ao gerar ranking por posição:', erro);
    res.status(500).json(formatarErro('Erro ao gerar ranking por posição', erro));
  }
};

// ============================================
// COMPARAR DOIS JOGADORES
// ============================================
// GET /api/matches/:matchId/comparar/:jogadorId1/:jogadorId2
export const compararJogadores = async (req, res) => {
  try {
    const { matchId, jogadorId1, jogadorId2 } = req.params;
    const comparacao = await estatisticasService.compararJogadores(matchId, jogadorId1, jogadorId2);

    res.status(200).json({
      mensagem: 'Comparação entre jogadores',
      match_id: matchId,
      comparacao: {
        jogador1: new EstatisticaJogadorResponseDTO(comparacao.jogador1),
        jogador2: new EstatisticaJogadorResponseDTO(comparacao.jogador2),
        diferenca_pontos: comparacao.comparacao.diferenca_pontos,
        diferenca_efetividade: comparacao.comparacao.diferenca_efetividade
      }
    });
  } catch (erro) {
    console.error('Erro ao comparar jogadores:', erro);
    res.status(500).json(formatarErro('Erro ao comparar jogadores', erro));
  }
};
