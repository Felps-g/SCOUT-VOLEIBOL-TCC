/**
 * ESTATÍSTICAS SERVICE
 * Lógica de negócio relacionada a estatísticas e análises
 * Ranking separado por posição (atacantes, levantadores, etc)
 */

import { v4 as uuid } from 'uuid';
import { calcularEfetividade, agruparAcoesPorTipo } from '../utils/helpers.js';
import * as matchDb from '../database/matchOperations.js';
import { supabase } from '../config/supabase.js';

class EstatisticasService {
  /**
   * Calcular e atualizar estatísticas de um jogador em um match
   * @param {string} matchId
   * @param {string} jogadorId
   * @returns {Promise<Object>}
   */
  async calcularEstatisticasJogador(matchId, jogadorId) {
    // Buscar a posição real do jogador (tabela players) para o ranking por posição
    const { data: jogador } = await supabase
      .from('players')
      .select('position')
      .eq('id', jogadorId)
      .single();

    // Buscar todas as ações do jogador no match
    const acoes = await matchDb.buscarAcoesPorJogador(jogadorId, matchId);

    if (!acoes || acoes.length === 0) {
      return {
        player_id: jogadorId,
        match_id: matchId,
        position: jogador?.position || null,
        total_points: 0,
        attacks: { total: 0, points: 0, errors: 0, effectiveness: 0 },
        serves: { total: 0, points: 0, errors: 0, effectiveness: 0 },
        receptions: { total: 0, points: 0, errors: 0, effectiveness: 0 },
        sets: { total: 0, points: 0, errors: 0, effectiveness: 0 },
        blocks: { total: 0, points: 0, errors: 0, effectiveness: 0 },
        defense: { total: 0, points: 0, errors: 0, effectiveness: 0 },
        effectiveness: 0
      };
    }

    // Agrupar ações por tipo
    const acoesPorTipo = agruparAcoesPorTipo(acoes);

    // Calcular estatísticas para cada tipo de ação
    const stats = {
      player_id: jogadorId,
      match_id: matchId,
      position: jogador?.position || null,
      total_points: acoes.filter(a => a.result === 'ponto').length,
      attacks: this.calcularEstatisticasAcao(acoesPorTipo['ataque'] || []),
      serves: this.calcularEstatisticasAcao(acoesPorTipo['saque'] || []),
      receptions: this.calcularEstatisticasAcao(acoesPorTipo['recepcao'] || []),
      sets: this.calcularEstatisticasAcao(acoesPorTipo['levantamento'] || []),
      blocks: this.calcularEstatisticasAcao(acoesPorTipo['bloqueio'] || []),
      defense: this.calcularEstatisticasAcao(acoesPorTipo['defesa'] || []),
      effectiveness: calcularEfetividade(acoes)
    };

    return stats;
  }

  /**
   * Calcular estatísticas de um tipo de ação
   */
  calcularEstatisticasAcao(acoes) {
    if (!acoes || acoes.length === 0) {
      return {
        total: 0,
        points: 0,
        errors: 0,
        effectiveness: 0
      };
    }

    const points = acoes.filter(a => a.result === 'ponto').length;
    const errors = acoes.filter(a => a.result === 'erro').length;
    
    return {
      total: acoes.length,
      points,
      errors,
      effectiveness: Math.round((points / acoes.length) * 100) / 100
    };
  }

  /**
   * Buscar ou criar estatísticas de um jogador em um match
   * @param {string} matchId
   * @param {string} jogadorId
   * @returns {Promise<Object>}
   */
  async obterEstatisticasJogador(matchId, jogadorId) {
    let stats = await matchDb.buscarEstatisticaJogador(matchId, jogadorId);

    if (!stats) {
      const novasStats = await this.calcularEstatisticasJogador(matchId, jogadorId);
      stats = await matchDb.upsertEstatistica({
        match_id: matchId,
        player_id: jogadorId,
        ...novasStats,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    return stats;
  }

  /**
   * Atualizar estatísticas após uma nova ação
   * @param {string} matchId
   * @param {string} jogadorId
   * @returns {Promise<Object>}
   */
  async atualizarEstatisticasJogador(matchId, jogadorId) {
    const novasStats = await this.calcularEstatisticasJogador(matchId, jogadorId);

    // upsert atômico (ver comentário em matchOperations.js) — evita linhas
    // duplicadas quando várias ações do mesmo jogador são salvas em paralelo
    return await matchDb.upsertEstatistica({
      match_id: matchId,
      player_id: jogadorId,
      ...novasStats,
      updated_at: new Date().toISOString()
    });
  }

  /**
   * Obter estatísticas de todos os jogadores em um match
   * @param {string} matchId
   * @returns {Promise<Array>}
   */
  async obterEstatisticasMatch(matchId) {
    return await matchDb.buscarEstatisticasMatch(matchId);
  }

  /**
   * RANKING POR POSIÇÃO - Apenas atacantes
   * @param {string} matchId
   * @returns {Promise<Array>}
   */
  async rankingAtacantes(matchId) {
    const stats = await matchDb.buscarRankingAtacantes(matchId);
    
    return stats.map((s, index) => ({
      ...s,
      rank: index + 1
    })) || [];
  }

  /**
   * RANKING COMPLETO POR POSIÇÃO
   * Agrupa jogadores por posição e ordena por pontos
   * @param {string} matchId
   * @returns {Promise<Object>}
   */
  async rankingPorPosicao(matchId) {
    const stats = await matchDb.buscarEstatisticasComPosicao(matchId);
    
    const ranking = {};
    
    stats.forEach(jogador => {
      if (!ranking[jogador.position]) {
        ranking[jogador.position] = [];
      }
      ranking[jogador.position].push({
        ...jogador,
        rank: ranking[jogador.position].length + 1
      });
    });

    return ranking;
  }

  /**
   * Gerar análise completa de um match
   * Retorna dados estruturados para gráficos
   * @param {string} matchId
   * @returns {Promise<Object>}
   */
  async analisarMatch(matchId) {
    const acoes = await matchDb.buscarAcoesPorMatch(matchId);
    const stats = await matchDb.buscarEstatisticasMatch(matchId);
    const sets = await matchDb.buscarSetsPorMatch(matchId);

    return {
      totalAcoes: acoes.length,
      totalPontos: acoes.filter(a => a.result === 'ponto').length,
      totalErros: acoes.filter(a => a.result === 'erro').length,
      totalNeutros: acoes.filter(a => a.result === 'neutro').length,
      acoesPorTipo: agruparAcoesPorTipo(acoes),
      estatisticasJogadores: stats,
      sets: sets,
      eficienciaGeral: calcularEfetividade(acoes),
      rankingPorPosicao: await this.rankingPorPosicao(matchId)
    };
  }

  /**
   * Comparar desempenho entre dois jogadores
   * @param {string} matchId
   * @param {string} jogadorId1
   * @param {string} jogadorId2
   * @returns {Promise<Object>}
   */
  async compararJogadores(matchId, jogadorId1, jogadorId2) {
    const stats1 = await this.obterEstatisticasJogador(matchId, jogadorId1);
    const stats2 = await this.obterEstatisticasJogador(matchId, jogadorId2);

    return {
      jogador1: stats1,
      jogador2: stats2,
      comparacao: {
        diferenca_pontos: (stats1.total_points || 0) - (stats2.total_points || 0),
        diferenca_efetividade: (stats1.effectiveness || 0) - (stats2.effectiveness || 0)
      }
    };
  }
}

export default new EstatisticasService();
