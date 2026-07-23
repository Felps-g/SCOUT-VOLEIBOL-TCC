/**
 * MATCHES SERVICE
 * Lógica de negócio relacionada a matches (jogos)
 * Apenas o técnico autenticado gerencia seus matches
 */

import { gerarId } from '../utils/helpers.js';
import * as matchDb from '../database/matchOperations.js';

class MatchesService {
  /**
   * Criar um novo match
   * @param {string} userId - ID do técnico autenticado
   * @param {Object} matchData
   * @returns {Promise<Object>}
   */
  async criarMatch(userId, matchData) {
    const novoMatch = {
      id: gerarId(),
      user_id: userId,
      home_team_id: matchData.home_team_id,
      away_team_id: matchData.away_team_id,
      match_date: matchData.match_date,
      location: matchData.location,
      home_score: 0,
      away_score: 0,
      final_result: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await matchDb.criarMatch(novoMatch);
  }

  /**
   * Buscar um match completo com sets
   * @param {string} matchId
   * @returns {Promise<Object>}
   */
  async buscarJogoCompleto(matchId) {
    const match = await matchDb.buscarMatchPorId(matchId);
    
    if (!match) {
      throw new Error('Match não encontrado');
    }

    // Buscar sets do match
    const sets = await matchDb.buscarSetsPorMatch(matchId);
    
    return {
      ...match,
      sets: sets || []
    };
  }

  /**
   * Listar todos os matches de um time
   * @param {string} timeId
   * @returns {Promise<Array>}
   */
  async listarJogosPorTime(timeId) {
    return await matchDb.buscarMatchsPorTime(timeId);
  }

  /**
   * Listar todos os matches do técnico
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  async listarJogosPorUsuario(userId) {
    return await matchDb.buscarMatchsPorUsuario(userId);
  }

  /**
   * Finalizar um match com resultado final
   * @param {string} matchId
   * @param {Object} finalizacao - { resultado_final, placar_final } (ex: placar_final "3x1")
   * @returns {Promise<Object>}
   */
  async finalizarJogo(matchId, finalizacao) {
    const match = await matchDb.buscarMatchPorId(matchId);
    
    if (!match) {
      throw new Error('Match não encontrado');
    }

    // placar_final chega como string "3x1" (nosso placar x placar do adversário)
    let home_score = match.home_score;
    let away_score = match.away_score;

    if (finalizacao.placar_final) {
      const partes = String(finalizacao.placar_final)
        .toLowerCase()
        .split('x')
        .map(n => parseInt(n.trim(), 10));

      if (partes.length === 2 && !partes.some(Number.isNaN)) {
        [home_score, away_score] = partes;
      }
    }

    const atualizacoes = {
      final_result: finalizacao.resultado_final, // 'vitoria', 'derrota', 'empate'
      home_score,
      away_score,
      updated_at: new Date().toISOString()
    };

    return await matchDb.atualizarMatch(matchId, atualizacoes);
  }

  /**
   * Excluir um match e todos os dados dependentes (sets, ações, estatísticas)
   * @param {string} matchId
   * @returns {Promise<boolean>}
   */
  async deletarJogo(matchId) {
    const match = await matchDb.buscarMatchPorId(matchId);

    if (!match) {
      throw new Error('Match não encontrado');
    }

    return await matchDb.deletarMatchCompleto(matchId);
  }
}

export default new MatchesService();
