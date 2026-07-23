// ============================================
// CONTROLLER DE TIMES
// ============================================
// Gerencia times do treinador autenticado

import { v4 as uuid } from 'uuid';
import { supabase } from '../config/supabase.js';

// ============================================
// LISTAR TODOS OS TIMES DO TREINADOR
// ============================================
// GET /api/teams
// Header: Authorization: Bearer <token>
export const listarTimes = async (req, res) => {
  try {
    const userId = req.user.id;

    // Busca todos os times do treinador
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({
        mensagem: 'Erro ao buscar times',
        erro: error.message
      });
    }

    res.status(200).json(data);
  } catch (erro) {
    res.status(500).json({
      mensagem: 'Erro interno do servidor',
      erro: erro.message
    });
  }
};

// ============================================
// BUSCAR UM TIME ESPECÍFICO
// ============================================
// GET /api/teams/:id
// Header: Authorization: Bearer <token>
export const buscarTime = async (req, res) => {
  try {
    const userId = req.user.id;
    const teamId = req.params.id;

    // Busca o time e verifica se pertence ao treinador
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          mensagem: 'Time não encontrado'
        });
      }
      return res.status(400).json({
        mensagem: 'Erro ao buscar time',
        erro: error.message
      });
    }

    res.status(200).json(data);
  } catch (erro) {
    res.status(500).json({
      mensagem: 'Erro interno do servidor',
      erro: erro.message
    });
  }
};

// ============================================
// CRIAR UM NOVO TIME
// ============================================
// POST /api/teams
// Header: Authorization: Bearer <token>
// Body: { name }
export const criarTime = async (req, res) => {
  try {
    const userId = req.user.id;
    const nomeTime = (req.body?.name || '').trim();

    if (!nomeTime) {
      return res.status(400).json({
        mensagem: 'Nome do time é obrigatório'
      });
    }

    // Cria um novo time respeitando o schema atual do banco
    const novoTime = {
      id: uuid(),
      user_id: userId,
      name: nomeTime
    };

    const { data, error } = await supabase
      .from('teams')
      .insert([novoTime])
      .select();

    if (error) {
      // "new row violates row-level security policy" é o sintoma mais comum
      // quando SUPABASE_SERVICE_ROLE_KEY não está configurada no .env do
      // backend — o cliente cai pra anon key e o insert é barrado pelo RLS.
      // Sem essa mensagem específica, o técnico só via um erro genérico do
      // Postgres e a tela parecia simplesmente "não deixar criar o time".
      const ehErroDePermissao = /row-level security/i.test(error.message || '');
      return res.status(400).json({
        mensagem: ehErroDePermissao
          ? 'O servidor não tem permissão para gravar no banco. Configure SUPABASE_SERVICE_ROLE_KEY no .env do backend e reinicie o servidor.'
          : 'Erro ao criar time',
        erro: error.message
      });
    }

    res.status(201).json({
      mensagem: 'Time criado com sucesso',
      time: data[0]
    });
  } catch (erro) {
    res.status(500).json({
      mensagem: 'Erro interno do servidor',
      erro: erro.message
    });
  }
};

// ============================================
// ATUALIZAR UM TIME
// ============================================
// PUT /api/teams/:id
// Header: Authorization: Bearer <token>
// Body: { name }
export const atualizarTime = async (req, res) => {
  try {
    const userId = req.user.id;
    const teamId = req.params.id;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        mensagem: 'Nome do time é obrigatório'
      });
    }

    // Verifica se o time pertence ao treinador antes de atualizar
    const { data: timeVerify, error: verifyError } = await supabase
      .from('teams')
      .select('id')
      .eq('id', teamId)
      .eq('user_id', userId)
      .single();

    if (verifyError || !timeVerify) {
      return res.status(404).json({
        mensagem: 'Time não encontrado ou não pertence a você'
      });
    }

    // Atualiza o time
    const { data, error } = await supabase
      .from('teams')
      .update({ name })
      .eq('id', teamId)
      .select();

    if (error) {
      return res.status(400).json({
        mensagem: 'Erro ao atualizar time',
        erro: error.message
      });
    }

    res.status(200).json({
      mensagem: 'Time atualizado com sucesso',
      time: data[0]
    });
  } catch (erro) {
    res.status(500).json({
      mensagem: 'Erro interno do servidor',
      erro: erro.message
    });
  }
};

// ============================================
// DELETAR UM TIME
// ============================================
// DELETE /api/teams/:id
// Header: Authorization: Bearer <token>
export const deletarTime = async (req, res) => {
  try {
    const userId = req.user.id;
    const teamId = req.params.id;

    // Verifica se o time pertence ao treinador antes de deletar
    const { data: timeVerify, error: verifyError } = await supabase
      .from('teams')
      .select('id')
      .eq('id', teamId)
      .eq('user_id', userId)
      .single();

    if (verifyError || !timeVerify) {
      return res.status(404).json({
        mensagem: 'Time não encontrado ou não pertence a você'
      });
    }

    // Deleta o time
    const { data, error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId)
      .select();

    if (error) {
      return res.status(400).json({
        mensagem: 'Erro ao deletar time',
        erro: error.message
      });
    }

    res.status(200).json({
      mensagem: 'Time removido com sucesso'
    });
  } catch (erro) {
    res.status(500).json({
      mensagem: 'Erro interno do servidor',
      erro: erro.message
    });
  }
};
