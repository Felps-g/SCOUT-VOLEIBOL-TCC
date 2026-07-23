/**
 * AÇÕES SERVICE
 * Lógica de negócio relacionada a ações durante jogos
 */

import { gerarId, calcularEstatisticasAcao, agruparAcoesPorTipo } from '../utils/helpers.js';
import * as matchDb from '../database/matchOperations.js';

class AcoesService {
  /**
   * Registrar uma ação durante o jogo ao vivo
   * @param {Object} acaoData
   * @returns {Promise<Object>}
   */
  async registrarAcao(acaoData) {
    const matchId = acaoData.match_id || acaoData.jogo_id;

    const jogo = await matchDb.buscarMatchPorId(matchId);

    if (!jogo) {
      throw new Error('Jogo não encontrado');
    }

    const sets = await matchDb.buscarSetsPorMatch(matchId);
    const setAtual = acaoData.set_id
      ? sets.find(set => set.id === acaoData.set_id)
      : acaoData.set_number
        ? sets.find(set => Number(set.set_number) === Number(acaoData.set_number))
        : sets.find(set => set.status !== 'finished') || sets[sets.length - 1];

    if (!setAtual) {
      throw new Error('Nenhum set ativo para este jogo');
    }

    const novaAcao = {
      id: gerarId(),
      match_id: matchId,
      set_id: setAtual.id,
      player_id: acaoData.jogador_id,
      action_type: acaoData.tipo_acao.toLowerCase(),
      result: acaoData.resultado.toLowerCase(),
      player_position: acaoData.posicao_jogador || null,
      action_order: acaoData.action_order || 0,
      action_timestamp: new Date().toISOString(),
      description: acaoData.descricao || '',
      created_at: new Date().toISOString()
    };

    return await matchDb.criarAcao(novaAcao);
  }

  /**
   * Buscar todas as ações de um jogo
   * @param {string} jogoId
   * @returns {Promise<Array>}
   */
  async buscarAcoesPorJogo(jogoId) {
    return await matchDb.buscarAcoesPorMatch(jogoId);
  }

  /**
   * Buscar ações de um set específico
   * @param {string} setId
   * @returns {Promise<Array>}
   */
  async buscarAcoesPorSet(setId) {
    return await matchDb.buscarAcoesPorSet(setId);
  }

  /**
   * Buscar todas as ações de um jogador em um jogo
   * @param {string} jogadorId
   * @param {string} jogoId
   * @returns {Promise<Array>}
   */
  async buscarAcoesPorJogador(jogadorId, jogoId) {
    return await matchDb.buscarAcoesPorJogador(jogadorId, jogoId);
  }

  /**
   * Agrupar ações por tipo para análise
   * @param {string} jogoId
   * @returns {Promise<Object>}
   */
  async analisarAcoesPorTipo(jogoId) {
    const acoes = await matchDb.buscarAcoesPorMatch(jogoId);
    return agruparAcoesPorTipo(acoes);
  }

  /**
   * Obter estatísticas de um tipo de ação
   * @param {string} jogoId
   * @param {string} tipoAcao
   * @returns {Promise<Object>}
   */
  async buscarEstatisticasAcao(jogoId, tipoAcao) {
    const acoes = await matchDb.buscarAcoesPorMatch(jogoId);
    const acoesTipo = acoes.filter(a => a.action_type === tipoAcao.toLowerCase());
    
    return calcularEstatisticasAcao(acoesTipo);
  }
}

export default new AcoesService();
