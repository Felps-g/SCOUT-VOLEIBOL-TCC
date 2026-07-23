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

    // IMPORTANTE: `set_number` (o set escolhido pelo técnico na tela do
    // Scout Live) é priorizado sobre `set_id`. O Scout Live busca o "set
    // atual" uma única vez no início e reusa esse mesmo `set_id` para todas
    // as ações da sessão, mesmo quando o técnico troca de Set 1 pra Set
    // 2/3 na interface — sem essa priorização, TODAS as ações caíam sempre
    // no primeiro set criado automaticamente, e o gráfico "Desempenho por
    // Set" na página de detalhe do jogo nunca refletia os sets reais.
    // Quando o set pedido ainda não existe (ex: técnico virou pro Set 2 sem
    // nenhum set 2 criado no banco), criamos na hora em vez de falhar.
    let setAtual = acaoData.set_number
      ? sets.find(set => Number(set.set_number) === Number(acaoData.set_number))
      : acaoData.set_id
        ? sets.find(set => set.id === acaoData.set_id)
        : sets.find(set => set.status !== 'finished') || sets[sets.length - 1];

    if (!setAtual && acaoData.set_number) {
      setAtual = await matchDb.criarSet({
        id: gerarId(),
        match_id: matchId,
        set_number: Number(acaoData.set_number),
        home_points: 0,
        away_points: 0,
        status: 'active',
        started_at: new Date().toISOString(),
        finished_at: null,
        winner_team_id: null,
        created_at: new Date().toISOString()
      });
    }

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
