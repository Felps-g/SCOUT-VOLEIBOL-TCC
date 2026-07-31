/**
 * ROTAS DE AUTENTICAÇÃO
 * Login, logout, registrar técnico
 * Integrado com Supabase Auth
 */

import { Router } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase.js';

const router = Router();

// ============================================
// POST - LOGIN (Técnico)
// ============================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar entrada
    if (!email || !password) {
      return res.status(400).json({
        erro: 'Email e senha são obrigatórios'
      });
    }

    // Fazer login com Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({
        erro: 'Falha na autenticação',
        detalhes: error.message
      });
    }

    res.status(200).json({
      mensagem: 'Login realizado com sucesso',
      token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      usuario: {
        id: data.user.id,
        email: data.user.email
      },
      expires_in: data.session.expires_in
    });
  } catch (erro) {
    console.error('Erro no login:', erro);
    res.status(500).json({
      erro: 'Erro ao fazer login',
      detalhes: erro.message
    });
  }
});

// ============================================
// POST - REGISTRAR (Novo Técnico)
// ============================================
router.post('/registrar', async (req, res) => {
  try {
    const { email, password, nome } = req.body;

    // Validar entrada
    if (!email || !password) {
      return res.status(400).json({
        erro: 'Email e senha são obrigatórios'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        erro: 'Senha deve ter pelo menos 6 caracteres'
      });
    }

    // Registrar com Supabase usando a chave de serviço para criar a conta imediatamente
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nome: nome || email.split('@')[0]
      }
    });

    if (error) {
      return res.status(400).json({
        erro: 'Erro ao registrar',
        detalhes: error.message,
        codigo: error.code
      });
    }

    res.status(201).json({
      mensagem: 'Registro realizado com sucesso',
      usuario: {
        id: data.user.id,
        email: data.user.email
      }
    });
  } catch (erro) {
    console.error('Erro ao registrar:', erro);
    res.status(500).json({
      erro: 'Erro ao registrar'
    });
  }
});

// ============================================
// POST - REFRESH TOKEN
// ============================================
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        erro: 'Refresh token é obrigatório'
      });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    });

    if (error) {
      return res.status(401).json({
        erro: 'Falha ao renovar token',
        detalhes: error.message
      });
    }

    res.status(200).json({
      mensagem: 'Token renovado com sucesso',
      token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in
    });
  } catch (erro) {
    console.error('Erro ao renovar token:', erro);
    res.status(500).json({
      erro: 'Erro ao renovar token'
    });
  }
});

// ============================================
// POST - LOGOUT
// ============================================
router.post('/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(400).json({
        erro: 'Erro ao fazer logout',
        detalhes: error.message
      });
    }

    res.status(200).json({
      mensagem: 'Logout realizado com sucesso'
    });
  } catch (erro) {
    console.error('Erro no logout:', erro);
    res.status(500).json({
      erro: 'Erro ao fazer logout'
    });
  }
});

// ============================================
// GET - PROFILE (Dados do Técnico Autenticado)
// ============================================
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        erro: 'Token não fornecido'
      });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      return res.status(401).json({
        erro: 'Token inválido',
        detalhes: error.message
      });
    }

    res.status(200).json({
      mensagem: 'Perfil do técnico',
      usuario: {
        id: data.user.id,
        email: data.user.email,
        user_metadata: data.user.user_metadata,
        created_at: data.user.created_at,
        last_sign_in_at: data.user.last_sign_in_at
      }
    });
  } catch (erro) {
    console.error('Erro ao buscar perfil:', erro);
    res.status(500).json({
      erro: 'Erro ao buscar perfil'
    });
  }
});

// ============================================
// PUT - ATUALIZAR PERFIL
// ============================================
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        erro: 'Token não fornecido'
      });
    }

    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError) {
      return res.status(401).json({
        erro: 'Token inválido'
      });
    }

    const { nome, telefone } = req.body;

    // supabase.auth.updateUser() atualiza a sessão ATUAL do client que a
    // chama — mas este `supabase` (servidor) nunca fez login como esse
    // usuário, então a chamada nunca teria efeito nenhum (passar o token
    // como "headers" não é como esse método funciona). O jeito certo de
    // atualizar QUALQUER usuário a partir do servidor é pelo admin API,
    // usando o id do usuário já validado acima.
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userData.user.id,
      {
        user_metadata: {
          nome: nome || userData.user.user_metadata?.nome,
          telefone: telefone || userData.user.user_metadata?.telefone
        }
      }
    );

    if (error) {
      return res.status(400).json({
        erro: 'Erro ao atualizar perfil',
        detalhes: error.message
      });
    }

    res.status(200).json({
      mensagem: 'Perfil atualizado com sucesso',
      usuario: {
        id: data.user.id,
        email: data.user.email,
        user_metadata: data.user.user_metadata
      }
    });
  } catch (erro) {
    console.error('Erro ao atualizar perfil:', erro);
    res.status(500).json({
      erro: 'Erro ao atualizar perfil'
    });
  }
});

// ============================================
// POST - TROCAR SENHA
// ============================================
router.post('/trocar-senha', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        erro: 'Token não fornecido'
      });
    }

    const { senha_atual, senha_nova } = req.body;

    if (!senha_atual || !senha_nova) {
      return res.status(400).json({
        erro: 'Senha atual e nova são obrigatórias'
      });
    }

    // Primeiro, fazer login novamente para confirmar
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError) {
      return res.status(401).json({
        erro: 'Token inválido'
      });
    }

    // Mesmo caso do PUT /profile: o client do servidor não tem sessão
    // desse usuário, então supabase.auth.updateUser() não teria efeito.
    // updateUserById (admin) é o jeito certo de trocar a senha de um
    // usuário específico a partir do servidor.
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      userData.user.id,
      { password: senha_nova }
    );

    if (error) {
      return res.status(400).json({
        erro: 'Erro ao trocar senha',
        detalhes: error.message
      });
    }

    res.status(200).json({
      mensagem: 'Senha alterada com sucesso'
    });
  } catch (erro) {
    console.error('Erro ao trocar senha:', erro);
    res.status(500).json({
      erro: 'Erro ao trocar senha'
    });
  }
});

export default router;
