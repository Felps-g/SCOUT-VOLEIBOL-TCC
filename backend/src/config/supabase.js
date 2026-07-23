// ============================================
// CONFIGURAÇÃO DO SUPABASE
// ============================================
// Este arquivo configura a conexão com o banco de dados Supabase
// Ele cria um cliente que será utilizado em toda a aplicação

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Importa as variáveis de ambiente configuradas
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseKey = supabaseServiceRoleKey || supabaseAnonKey;

// Valida se as variáveis de ambiente foram configuradas corretamente
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Erro: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (ou SUPABASE_ANON_KEY) são necessárias. Configure-as no arquivo .env'
  );
}

// Diagnóstico no boot: se a service_role key não estiver configurada, o
// backend cai pro anon key silenciosamente — e qualquer insert/update vai
// bater na Row Level Security como se fosse um usuário anônimo, com erros
// do tipo "new row violates row-level security policy". Isso avisa antes.
if (!supabaseServiceRoleKey) {
  console.warn(
    '⚠️  SUPABASE_SERVICE_ROLE_KEY não encontrada no .env — usando SUPABASE_ANON_KEY.\n' +
    '   Operações de escrita (criar time, jogador, jogo, etc.) provavelmente vão falhar\n' +
    '   com "row-level security policy" até a service_role key ser configurada e o\n' +
    '   servidor reiniciado.'
  );
} else {
  console.log('✅ Supabase: usando SUPABASE_SERVICE_ROLE_KEY (RLS bypassado no backend).');
}

// Cria e exporta uma instância do cliente Supabase
// No backend, prefira usar SERVICE_ROLE_KEY para permitir operações com RLS ativado.
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey || supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});
