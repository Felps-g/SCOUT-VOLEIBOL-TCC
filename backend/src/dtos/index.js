/**
 * DATA TRANSFER OBJECTS (DTOs)
 * 
 * Validam e transferem dados entre camadas:
 * - Requisições do frontend (input)
 * - Respostas da API (output)
 */

// ============================================
// REQUISIÇÃO: Criar novo jogo
// ============================================
export class CreateJogoDTO {
  constructor({
    time_id,
    time_adversario_id,
    data_jogo,
    local
  }) {
    this.time_id = time_id;
    this.time_adversario_id = time_adversario_id;
    this.data_jogo = data_jogo;
    this.local = local;
  }

  isValid() {
    return this.time_id && 
           this.time_adversario_id &&
           this.data_jogo;
  }
}

// ============================================
// REQUISIÇÃO: Registrar uma ação durante jogo ao vivo
// ============================================
export class CreateAcaoDTO {
  constructor({
    jogo_id,
    match_id,
    jogador_id,
    tipo_acao,
    resultado,
    descricao = '',
    set_id = null,
    set_number = null,
    action_order = 0
  }) {
    this.jogo_id = jogo_id || match_id;
    this.match_id = match_id || jogo_id;
    this.jogador_id = jogador_id;
    this.tipo_acao = tipo_acao;
    this.resultado = resultado;
    this.descricao = descricao;
    this.set_id = set_id;
    this.set_number = set_number;
    this.action_order = action_order;
  }

  isValid() {
    return this.jogo_id && 
           this.jogador_id && 
           this.tipo_acao && 
           this.resultado;
  }
}

// ============================================
// REQUISIÇÃO: Finalizar um set
// ============================================
export class FinalizarSetDTO {
  constructor({
    jogo_id,
    numero_set,
    placar_time,
    placar_adversario,
    vencedor
  }) {
    this.jogo_id = jogo_id;
    this.numero_set = numero_set;
    this.placar_time = placar_time;
    this.placar_adversario = placar_adversario;
    this.vencedor = vencedor;
  }

  isValid() {
    return this.jogo_id && 
           this.numero_set && 
           this.placar_time !== undefined && 
           this.placar_adversario !== undefined && 
           this.vencedor;
  }
}

// ============================================
// REQUISIÇÃO: Finalizar jogo
// ============================================
export class FinalizarJogoDTO {
  constructor({
    jogo_id,
    resultado_final,
    placar_final
  }) {
    this.jogo_id = jogo_id;
    this.resultado_final = resultado_final;
    this.placar_final = placar_final;
  }

  isValid() {
    return this.jogo_id && 
           this.resultado_final && 
           this.placar_final;
  }
}

// ============================================
// RESPOSTA: Jogo completo com detalhes
// ============================================
export class JogoResponseDTO {
  constructor(jogo) {
    this.id = jogo.id;
    this.data_jogo = jogo.match_date;
    this.local = jogo.location;
    this.resultado_final = jogo.final_result;
    this.placar_final = `${jogo.home_score ?? 0}x${jogo.away_score ?? 0}`;
    this.home_score = jogo.home_score;
    this.away_score = jogo.away_score;
    this.time_id = jogo.home_team_id;
    this.time_adversario_id = jogo.away_team_id;
    this.sets = jogo.sets || [];
    this.criado_em = jogo.created_at;
  }
}

// ============================================
// RESPOSTA: Ação registrada
// ============================================
export class AcaoResponseDTO {
  constructor(acao) {
    this.id = acao.id;
    this.jogador_id = acao.player_id;
    this.tipo_acao = acao.action_type;
    this.resultado = acao.result;
    this.set_id = acao.set_id;
    this.timestamp = acao.action_timestamp;
    this.descricao = acao.description;
  }
}

// ============================================
// RESPOSTA: Estatísticas do jogador em um jogo
// ============================================
export class EstatisticaJogadorResponseDTO {
  constructor(stats) {
    this.jogador_id = stats.player_id;
    this.pontos_totais = stats.total_points;
    this.saques = stats.serves;
    this.recepcoes = stats.receptions;
    this.levantamentos = stats.sets;
    this.ataques = stats.attacks;
    this.bloqueios = stats.blocks;
    this.defesas = stats.defense;
    this.taxa_efetividade = stats.effectiveness;
  }
}
