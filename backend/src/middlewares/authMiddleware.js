// ============================================
// MIDDLEWARE DE AUTENTICAÇÃO COM SUPABASE
// ============================================
// Valida o token JWT enviado pelo frontend e anexa o usuário em req.user

import { supabase } from '../config/supabase.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ mensagem: 'Token não fornecido' });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      // a tela sempre mostra a mesma mensagem genérica pro usuário, então
      // sem logar aqui não dá pra saber se é token realmente expirado,
      // apikey errada, projeto pausado, etc — olha o terminal do backend
      console.error('[authMiddleware] supabase.auth.getUser falhou:', error?.message || 'sem detalhes', error?.status ? `(status ${error.status})` : '');
      return res.status(401).json({
        mensagem: 'Token inválido ou expirado',
        erro: error?.message || 'Usuário não encontrado'
      });
    }

    req.user = data.user;
    next();
  } catch (erro) {
    return res.status(500).json({
      mensagem: 'Erro ao validar token',
      erro: erro.message
    });
  }
};