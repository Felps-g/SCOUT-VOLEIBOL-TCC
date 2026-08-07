const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function getAuthToken() {
  return localStorage.getItem('scout_token') || localStorage.getItem('authToken');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('scout_token', token);
    localStorage.setItem('authToken', token);
  }
}

export function clearAuthToken() {
  localStorage.removeItem('scout_token');
  localStorage.removeItem('authToken');
}

export async function apiRequest(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {};

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getAuthToken();
  if (auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  const rawText = await response.text();
  let data = {};

  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { mensagem: rawText };
    }
  }

  if (!response.ok) {
    // o backend às vezes manda a mensagem genérica em "erro"/"mensagem" e o
    // motivo real (o que o Supabase respondeu) separado em "detalhes" —
    // sem isso aqui, erros como "Invalid login credentials" ou
    // "Email not confirmed" ficavam escondidos atrás de "Falha na autenticação"
    const base = data.mensagem || data.erro || data.error || 'Erro na requisição';
    const detalhe = data.detalhes && data.detalhes !== base ? data.detalhes : null;
    throw new Error(detalhe ? `${base}: ${detalhe}` : base);
  }

  return data;
}

export default API_BASE_URL;