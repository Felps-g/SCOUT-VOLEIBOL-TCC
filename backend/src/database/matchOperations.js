/**
 * DATABASE OPERATIONS - MATCHES & SCOUT
 * Camada de acesso ao banco de dados
 * Todas as operações Supabase estão centralizadas aqui
 * 
 * Trabalha com:
 * - matches (jogos)
 * - match_sets (sets)
 * - scout_actions (ações)
 * - player_match_stats (estatísticas)
 */

import { supabase } from '../config/supabase.js';
import { POSICOES_ATAQUE } from '../constants/index.js';

// ============================================
// MATCHES (JOGOS)
// ============================================

export const criarMatch = async (matchData) => {
  const { data, error } = await supabase
    .from('matches')
    .insert([matchData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const buscarMatchPorId = async (matchId) => {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const buscarMatchsPorTime = async (timeId) => {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .or(`home_team_id.eq.${timeId},away_team_id.eq.${timeId}`)
    .order('match_date', { ascending: false });

  if (error) throw error;
  return data;
};

export const buscarMatchsPorUsuario = async (userId) => {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', userId)
    .order('match_date', { ascending: false });

  if (error) throw error;
  return data;
};

export const atualizarMatch = async (matchId, atualizacoes) => {
  const { data, error } = await supabase
    .from('matches')
    .update(atualizacoes)
    .eq('id', matchId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Exclui um match e tudo que depende dele.
// As foreign keys reais de match_sets/scout_actions/player_match_stats
// para matches NÃO são ON DELETE CASCADE, então apagar a linha do match
// direto quebra com violação de FK — por isso apagamos os filhos primeiro.
export const deletarMatchCompleto = async (matchId) => {
  const { error: erroAcoes } = await supabase
    .from('scout_actions')
    .delete()
    .eq('match_id', matchId);
  if (erroAcoes) throw erroAcoes;

  const { error: erroStats } = await supabase
    .from('player_match_stats')
    .delete()
    .eq('match_id', matchId);
  if (erroStats) throw erroStats;

  const { error: erroSets } = await supabase
    .from('match_sets')
    .delete()
    .eq('match_id', matchId);
  if (erroSets) throw erroSets;

  const { error: erroMatch } = await supabase
    .from('matches')
    .delete()
    .eq('id', matchId);
  if (erroMatch) throw erroMatch;

  return true;
};

// ============================================
// SETS (MATCH_SETS)
// ============================================

export const criarSet = async (setData) => {
  const { data, error } = await supabase
    .from('match_sets')
    .insert([setData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const buscarSetsPorMatch = async (matchId) => {
  const { data, error } = await supabase
    .from('match_sets')
    .select('*')
    .eq('match_id', matchId)
    .order('set_number', { ascending: true });

  if (error) throw error;
  return data;
};

export const atualizarSet = async (setId, atualizacoes) => {
  const { data, error } = await supabase
    .from('match_sets')
    .update(atualizacoes)
    .eq('id', setId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// AÇÕES (SCOUT_ACTIONS)
// ============================================

export const criarAcao = async (acaoData) => {
  const { data, error } = await supabase
    .from('scout_actions')
    .insert([acaoData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const buscarAcoesPorMatch = async (matchId) => {
  const { data, error } = await supabase
    .from('scout_actions')
    .select('*')
    .eq('match_id', matchId)
    .order('action_timestamp', { ascending: true });

  if (error) throw error;
  return data;
};

export const buscarAcoesPorSet = async (setId) => {
  const { data, error } = await supabase
    .from('scout_actions')
    .select('*')
    .eq('set_id', setId)
    .order('action_timestamp', { ascending: true });

  if (error) throw error;
  return data;
};

export const buscarAcoesPorJogador = async (jogadorId, matchId) => {
  const { data, error } = await supabase
    .from('scout_actions')
    .select('*')
    .eq('player_id', jogadorId)
    .eq('match_id', matchId)
    .order('action_timestamp', { ascending: true });

  if (error) throw error;
  return data;
};

// ============================================
// ESTATÍSTICAS (PLAYER_MATCH_STATS)
// ============================================

// Upsert atômico: como o ScoutLive salva várias ações do mesmo jogador em
// paralelo, um simples "buscar depois inserir/atualizar" tem uma condição de
// corrida (duas requisições podem ver "não existe" ao mesmo tempo e as duas
// inserirem). O upsert resolve isso no nível do banco, mas exige uma
// constraint UNIQUE(match_id, player_id) em player_match_stats — ver
// DATABASE_MIGRATION.sql.
export const upsertEstatistica = async (estatisticaData) => {
  const { data, error } = await supabase
    .from('player_match_stats')
    .upsert([estatisticaData], { onConflict: 'match_id,player_id' })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const criarEstatistica = async (estatisticaData) => {
  const { data, error } = await supabase
    .from('player_match_stats')
    .insert([estatisticaData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const atualizarEstatistica = async (estatisticaId, atualizacoes) => {
  const { data, error } = await supabase
    .from('player_match_stats')
    .update(atualizacoes)
    .eq('id', estatisticaId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const buscarEstatisticaJogador = async (matchId, jogadorId) => {
  const { data, error } = await supabase
    .from('player_match_stats')
    .select('*')
    .eq('match_id', matchId)
    .eq('player_id', jogadorId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const buscarEstatisticasMatch = async (matchId) => {
  const { data, error } = await supabase
    .from('player_match_stats')
    .select('*')
    .eq('match_id', matchId);

  if (error) throw error;
  return data;
};

// ============================================
// RANKING POR POSIÇÃO
// ============================================

// Ranking de atacantes: só considera jogadores que jogam em posição de
// ataque (ponteiro, oposto, central) — levantador e líbero ficam de fora
// mesmo que tenham pontuado, porque não é relevante pra esse ranking.
// Ordenado por total_points (maior pontuador primeiro).
export const buscarRankingAtacantes = async (matchId) => {
  const { data, error } = await supabase
    .from('player_match_stats')
    .select('*')
    .eq('match_id', matchId)
    .in('position', POSICOES_ATAQUE)
    .order('total_points', { ascending: false });

  if (error) throw error;
  return data;
};

export const buscarEstatisticasComPosicao = async (matchId) => {
  const { data, error } = await supabase
    .from('player_match_stats')
    .select('*')
    .eq('match_id', matchId)
    .order('position', { ascending: true })
    .order('total_points', { ascending: false });

  if (error) throw error;
  return data;
};
