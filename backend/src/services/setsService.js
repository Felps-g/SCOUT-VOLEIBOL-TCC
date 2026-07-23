/**
 * SETS SERVICE
 * Lógica de negócio relacionada a sets
 */

import { gerarId } from '../utils/helpers.js';
import * as matchDb from '../database/matchOperations.js';

class SetsService {
  /**
   * Criar um novo set
   * @param {string} jogoId
   * @param {number} numeroSet
   * @returns {Promise<Object>}
   */
  async criarSet(jogoId, numeroSet) {
    const jogo = await matchDb.buscarMatchPorId(jogoId);

    if (!jogo) {
      throw new Error('Jogo não encontrado');
    }

    const novoSet = {
      id: gerarId(),
      match_id: jogoId,
      set_number: numeroSet,
      home_points: 0,
      away_points: 0,
      status: 'active',
      started_at: new Date().toISOString(),
      finished_at: null,
      winner_team_id: null,
      created_at: new Date().toISOString()
    };

    return await matchDb.criarSet(novoSet);
  }

  /**
   * Buscar todos os sets de um jogo
   * @param {string} jogoId
   * @returns {Promise<Array>}
   */
  async buscarSetsPorJogo(jogoId) {
    return await matchDb.buscarSetsPorMatch(jogoId);
  }

  /**
   * Finalizar um set com placares
   * @param {string} setId
   * @param {Object} finalizacao
   * @returns {Promise<Object>}
   */
  async finalizarSet(setId, finalizacao) {
    const atualizacoes = {
      home_points: finalizacao.home_points ?? finalizacao.placar_time ?? 0,
      away_points: finalizacao.away_points ?? finalizacao.placar_adversario ?? 0,
      winner_team_id: finalizacao.winner_team_id ?? finalizacao.vencedor ?? null,
      status: 'finished',
      finished_at: new Date().toISOString()
    };

    return await matchDb.atualizarSet(setId, atualizacoes);
  }

  /**
   * Obter o set atual (último set do jogo)
   * @param {string} jogoId
   * @returns {Promise<Object>}
   */
  async obterSetAtual(jogoId) {
    const sets = await matchDb.buscarSetsPorMatch(jogoId);

    if (!sets || sets.length === 0) {
      return null;
    }

    return sets.find(set => set.status !== 'finished') || sets[sets.length - 1];
  }

  /**
   * Contar quantos sets existem em um jogo
   * @param {string} jogoId
   * @returns {Promise<number>}
   */
  async contarSets(jogoId) {
    const sets = await matchDb.buscarSetsPorMatch(jogoId);
    return sets ? sets.length : 0;
  }
}

export default new SetsService();
