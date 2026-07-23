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

// ── USUÁRIO LOGADO ───────────────────────────
// Login.jsx salva o usuário retornado pela API em 'scout_usuario' logo
// depois do login. Qualquer página (avatar no cabeçalho, Perfil, etc.)
// pode usar isso pra saber se tem alguém logado e quem é, sem precisar
// pedir de novo pro backend.
export function getUsuarioLogado() {
  try {
    const bruto = localStorage.getItem('scout_usuario');
    return bruto ? JSON.parse(bruto) : null;
  } catch {
    return null;
  }
}

export function setUsuarioLogado(usuario) {
  if (usuario) {
    localStorage.setItem('scout_usuario', JSON.stringify(usuario));
  }
}

export function estaLogado() {
  return Boolean(getAuthToken() && getUsuarioLogado());
}

// limpa tudo (token + dados do usuário + time selecionado) e manda pro login
export function logout() {
  clearAuthToken();
  localStorage.removeItem('scout_usuario');
  localStorage.removeItem('time_selecionado');
  window.location.hash = '#/login';
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
    throw new Error(data.mensagem || data.erro || data.error || 'Erro na requisição');
  }

  return data;
}

export default API_BASE_URL;
