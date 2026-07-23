// ============================================
// CONTROLLER DE JOGADORES
// ============================================
// Este arquivo contém todas as funções que lidam com operações
// de jogadores no banco de dados (CRUD: Create, Read, Update, Delete)

import { v4 as uuid } from 'uuid';
import { supabase } from '../config/supabase.js';
import { formatarErro } from '../utils/helpers.js';

// ============================================
// LISTAR TODOS OS JOGADORES
// ============================================
// GET /api/players?team_id=<uuid>
// Header: Authorization: Bearer <token>
// Retorna uma lista com todos os jogadores de um time específico
export const listarJogadores = async (req, res) => {
  try {
    const userId = req.user.id;
    const { team_id } = req.query;

    if (!team_id) {
      return res.status(400).json({
        mensagem: 'team_id é obrigatório'
      });
    }

    // Verifica se o time pertence ao treinador
    const { data: timeVerify, error: verifyError } = await supabase
      .from('teams')
      .select('id')
      .eq('id', team_id)
      .eq('user_id', userId)
      .single();

    if (verifyError || !timeVerify) {
      return res.status(403).json({
        mensagem: 'Acesso negado. Time não pertence a você'
      });
    }

    // Executa uma query no Supabase para buscar todos os jogadores do time
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', team_id);

    // Se houver erro na operação, retorna status 400 com mensagem de erro
    if (error) {
      return res.status(400).json({ 
        mensagem: 'Erro ao buscar jogadores', 
        erro: error.message 
      });
    }

    // Se tudo correr bem, retorna os dados com status 200 (OK)
    res.status(200).json(data);
  } catch (erro) {
    // Captura erros inesperados e retorna status 500 (Erro interno)
    res.status(500).json({ 
      mensagem: 'Erro interno do servidor', 
      erro: erro.message 
    });
  }
};

// ============================================
// BUSCAR UM JOGADOR ESPECÍFICO
// ============================================
// GET /api/players/:id
// Header: Authorization: Bearer <token>
// Retorna os dados de um jogador específico pelo ID
export const buscarJogador = async (req, res) => {
  try {
    const userId = req.user.id;
    const playerId = req.params.id;

    // Busca um jogador com ID específico
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('*')
      .eq('id', playerId)
      .single();

    if (playerError || !player) {
      if (playerError?.code === 'PGRST116') {
        return res.status(404).json({ 
          mensagem: 'Jogador não encontrado' 
        });
      }
      return res.status(400).json({ 
        mensagem: 'Erro ao buscar jogador', 
        erro: playerError?.message 
      });
    }

    // Verifica se o time do jogador pertence ao treinador
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id')
      .eq('id', player.team_id)
      .eq('user_id', userId)
      .single();

    if (teamError || !team) {
      return res.status(403).json({
        mensagem: 'Acesso negado. Jogador não pertence a seu time'
      });
    }

    // Retorna os dados do jogador encontrado
    res.status(200).json(player);
  } catch (erro) {
    res.status(500).json({ 
      mensagem: 'Erro interno do servidor', 
      erro: erro.message 
    });
  }
};

// ============================================
// CRIAR UM NOVO JOGADOR
// ============================================
// POST /api/players
// Header: Authorization: Bearer <token>
// Body: { name, position, height, cpf, team_id }
// Cria um novo registro de jogador no banco de dados
export const criarJogador = async (req, res) => {
  try {
    const userId = req.user.id;
    // Extrai os dados enviados no corpo da requisição
    const {
      name, nome, position, height, cpf, team_id, teamId, jersey_number,
      rg, age, idade, weight, peso, photo_url, foto
    } = req.body;
    const nomeJogador = name || nome;
    const teamIdResolvido = team_id || teamId;
    const idadeResolvida = age ?? idade;
    const pesoResolvido = weight || peso;
    const fotoResolvida = photo_url || foto;

    // Valida se todos os campos obrigatórios foram enviados
    if (!nomeJogador || !position || !height || !cpf || !teamIdResolvido) {
      return res.status(400).json({
        mensagem: 'Todos os campos são obrigatórios: name (ou nome), position, height, cpf, team_id'
      });
    }

    // Verifica se o time pertence ao treinador
    const { data: teamVerify, error: verifyError } = await supabase
      .from('teams')
      .select('id')
      .eq('id', teamIdResolvido)
      .eq('user_id', userId)
      .single();

    if (verifyError || !teamVerify) {
      return res.status(403).json({
        mensagem: 'Time não encontrado ou não pertence a você'
      });
    }

    // Cria um objeto com os dados do novo jogador
    const novoJogador = {
      id: uuid(),  // Gera um ID único usando uuid
      name: nomeJogador,
      position,
      height,
      cpf,
      team_id: teamIdResolvido
    };

    if (jersey_number !== undefined) {
      novoJogador.jersey_number = jersey_number;
    }
    // Campos opcionais (não fazem parte da validação obrigatória acima,
    // mas precisam ser salvos quando o técnico preenche eles no formulário)
    if (rg !== undefined && rg !== '') novoJogador.rg = rg;
    if (idadeResolvida !== undefined && idadeResolvida !== '') novoJogador.age = idadeResolvida;
    if (pesoResolvido !== undefined && pesoResolvido !== '') novoJogador.weight = pesoResolvido;
    if (fotoResolvida !== undefined && fotoResolvida !== '') novoJogador.photo_url = fotoResolvida;

    // Insere o novo jogador no banco de dados
    const { data, error } = await supabase
      .from('players')
      .insert([novoJogador])  // Insert recebe um array
      .select();  // .select() retorna os dados inseridos

    if (error) {
      return res.status(400).json(formatarErro('Erro ao criar jogador', error));
    }

    // Retorna status 201 (Created) com os dados do novo jogador
    res.status(201).json({
      mensagem: 'Jogador cadastrado com sucesso',
      jogador: data[0]  // data é um array, pegamos o primeiro elemento
    });
  } catch (erro) {
    res.status(500).json({ 
      mensagem: 'Erro interno do servidor', 
      erro: erro.message 
    });
  }
};

// ============================================
// ATUALIZAR UM JOGADOR
// ============================================
// PUT /api/players/:id
// Header: Authorization: Bearer <token>
// Body: { name?, position?, height?, cpf? }
// Atualiza os dados de um jogador existente (campos opcionais)
export const atualizarJogador = async (req, res) => {
  try {
    const userId = req.user.id;
    const playerId = req.params.id;
    // Extrai apenas os campos que foram enviados na requisição
    const {
      name, position, height, cpf, jersey_number,
      rg, age, idade, weight, peso, photo_url, foto
    } = req.body;
    const idadeResolvida = age ?? idade;
    const pesoResolvido = weight || peso;
    const fotoResolvida = photo_url || foto;

    // Busca o jogador para verificar se pertence ao treinador
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('team_id')
      .eq('id', playerId)
      .single();

    if (playerError || !player) {
      return res.status(404).json({
        mensagem: 'Jogador não encontrado'
      });
    }

    // Verifica se o time do jogador pertence ao treinador
    const { data: teamVerify, error: teamError } = await supabase
      .from('teams')
      .select('id')
      .eq('id', player.team_id)
      .eq('user_id', userId)
      .single();

    if (teamError || !teamVerify) {
      return res.status(403).json({
        mensagem: 'Acesso negado. Jogador não pertence a seu time'
      });
    }

    // Cria um objeto com apenas os campos que foram fornecidos
    const camposAtualizar = {};
    if (name) camposAtualizar.name = name;
    if (position) camposAtualizar.position = position;
    if (height) camposAtualizar.height = height;
    if (jersey_number !== undefined) camposAtualizar.jersey_number = jersey_number;
    if (cpf) camposAtualizar.cpf = cpf;
    if (rg !== undefined) camposAtualizar.rg = rg;
    if (idadeResolvida !== undefined) camposAtualizar.age = idadeResolvida;
    if (pesoResolvido !== undefined) camposAtualizar.weight = pesoResolvido;
    if (fotoResolvida !== undefined) camposAtualizar.photo_url = fotoResolvida;

    // Atualiza o jogador com o ID especificado
    const { data, error } = await supabase
      .from('players')
      .update(camposAtualizar)
      .eq('id', playerId)
      .select();  // Retorna os dados atualizados

    if (error) {
      return res.status(400).json({ 
        mensagem: 'Erro ao atualizar jogador', 
        erro: error.message 
      });
    }

    res.status(200).json({
      mensagem: 'Jogador atualizado com sucesso',
      jogador: data[0]
    });
  } catch (erro) {
    res.status(500).json({ 
      mensagem: 'Erro interno do servidor', 
      erro: erro.message 
    });
  }
};

// ============================================
// DELETAR UM JOGADOR
// ============================================
// DELETE /api/players/:id
// Header: Authorization: Bearer <token>
// Remove um jogador do banco de dados
export const deletarJogador = async (req, res) => {
  try {
    const userId = req.user.id;
    const playerId = req.params.id;

    // Busca o jogador para verificar se pertence ao treinador
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('team_id')
      .eq('id', playerId)
      .single();

    if (playerError || !player) {
      return res.status(404).json({
        mensagem: 'Jogador não encontrado'
      });
    }

    // Verifica se o time do jogador pertence ao treinador
    const { data: teamVerify, error: teamError } = await supabase
      .from('teams')
      .select('id')
      .eq('id', player.team_id)
      .eq('user_id', userId)
      .single();

    if (teamError || !teamVerify) {
      return res.status(403).json({
        mensagem: 'Acesso negado. Jogador não pertence a seu time'
      });
    }

    // Deleta o jogador com o ID especificado
    const { data, error } = await supabase
      .from('players')
      .delete()
      .eq('id', playerId)
      .select();  // Retorna os dados do registro deletado

    if (error) {
      return res.status(400).json({ 
        mensagem: 'Erro ao deletar jogador', 
        erro: error.message 
      });
    }

    // Retorna status 200 confirmando a exclusão
    res.status(200).json({
      mensagem: 'Jogador removido com sucesso'
    });
  } catch (erro) {
    res.status(500).json({ 
      mensagem: 'Erro interno do servidor', 
      erro: erro.message 
    });
  }
};