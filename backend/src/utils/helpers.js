/**
 * UTILITY FUNCTIONS
 * Funções auxiliares reutilizáveis
 */

import { v4 as uuid } from 'uuid';
import { LISTA_ACOES, LISTA_RESULTADOS } from '../constants/index.js';

export const gerarId = () => uuid();

/**
 * Calcula a taxa de efetividade de um jogador.
 * Efetividade = (ações com resultado "ponto") / (total de ações)
 *
 * As ações vêm direto do banco (tabela scout_actions), então usamos o nome
 * real da coluna (`result`), não o nome em português que só existe nos
 * DTOs de entrada.
 */
export const calcularEfetividade = (acoes) => {
  if (!acoes || acoes.length === 0) return 0;

  const sucessos = acoes.filter(a => a.result === 'ponto').length;
  return Math.round((sucessos / acoes.length) * 100) / 100;
};

/**
 * Agrupa ações por tipo (`action_type` é o nome real da coluna em scout_actions)
 */
export const agruparAcoesPorTipo = (acoes) => {
  const agrupadas = {};

  acoes.forEach(acao => {
    const tipo = acao.action_type;
    if (!agrupadas[tipo]) agrupadas[tipo] = [];
    agrupadas[tipo].push(acao);
  });

  return agrupadas;
};

/**
 * Calcula estatísticas detalhadas (pontos/erros/neutros/efetividade) de um
 * conjunto de ações — usado por tipo de ação (ataque, saque, etc.)
 */
export const calcularEstatisticasAcao = (acoes) => {
  if (!acoes || acoes.length === 0) {
    return { total: 0, pontos: 0, erros: 0, neutros: 0, taxa_efetividade: 0 };
  }

  const pontos = acoes.filter(a => a.result === 'ponto').length;
  const erros = acoes.filter(a => a.result === 'erro').length;
  const neutros = acoes.filter(a => a.result === 'neutro').length;

  return {
    total: acoes.length,
    pontos,
    erros,
    neutros,
    taxa_efetividade: Math.round((pontos / acoes.length) * 100) / 100
  };
};

// "new row violates row-level security policy" (ou "permission denied for
// table") é o sintoma quando SUPABASE_SERVICE_ROLE_KEY não está configurada
// no .env — o backend cai pra anon key e toda escrita nas tabelas de jogo
// (que têm RLS habilitado de propósito) é barrada. Sem essa detecção, cada
// controller devolvia só o erro cru do Postgres e o problema real (env mal
// configurado) ficava escondido atrás de uma mensagem genérica.
const MENSAGEM_ERRO_PERMISSAO =
  'O servidor não tem permissão para gravar no banco. Configure SUPABASE_SERVICE_ROLE_KEY no .env do backend e reinicie o servidor.';

export const formatarErro = (mensagem, erro) => {
  const detalhe = erro?.message || erro;
  const ehErroDePermissao = /row-level security|permission denied/i.test(String(detalhe || ''));

  return {
    mensagem: ehErroDePermissao ? MENSAGEM_ERRO_PERMISSAO : mensagem,
    erro: detalhe,
    timestamp: new Date().toISOString()
  };
};

export const validarResultado = (resultado) =>
  LISTA_RESULTADOS.includes(resultado?.toLowerCase());

export const validarTipoAcao = (tipoAcao) =>
  LISTA_ACOES.includes(tipoAcao?.toLowerCase());

const REGEX_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Confere se uma string é um UUID válido. Usado para devolver um erro 400
 * claro em vez de deixar o Postgres estourar "invalid input syntax for
 * type uuid" (viraria um 500 genérico) quando algum id de teste/placeholder
 * chega no lugar de um UUID de verdade.
 */
export const isUuidValido = (valor) => typeof valor === 'string' && REGEX_UUID.test(valor);
