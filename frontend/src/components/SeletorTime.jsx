import { useState, useEffect } from 'react';
import { listarTimes, criarTime, getTimeSelecionado, setTimeSelecionado } from '../services/time.js';

// Componente pequeno e autocontido: busca os times reais do técnico
// logado, deixa escolher um como "time selecionado" (guardado no
// localStorage) e permite criar um time novo quando ainda não existe
// nenhum. Sem isso, não havia NENHUM lugar no frontend que criasse ou
// selecionasse um time — por isso o ScoutLive nunca conseguia salvar nada.
export default function SeletorTime({ onChange }) {
  const [times, setTimes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [nomeNovoTime, setNomeNovoTime] = useState('');
  const [criando, setCriando] = useState(false);
  const [selecionadoId, setSelecionadoId] = useState(getTimeSelecionado()?.id || '');

  async function carregar() {
    setCarregando(true);
    setErro('');
    try {
      const lista = await listarTimes();
      setTimes(lista || []);

      const salvo = getTimeSelecionado();
      const aindaExiste = salvo && lista?.some(t => t.id === salvo.id);

      if (aindaExiste) {
        setSelecionadoId(salvo.id);
        onChange?.(salvo);
      } else if (lista?.length > 0) {
        setTimeSelecionado(lista[0]);
        setSelecionadoId(lista[0].id);
        onChange?.(lista[0]);
      } else {
        onChange?.(null);
      }
    } catch (err) {
      setErro(err.message || 'Erro ao carregar times');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  function selecionar(id) {
    const time = times.find(t => t.id === id);
    if (!time) return;
    setSelecionadoId(id);
    setTimeSelecionado(time);
    onChange?.(time);
  }

  async function handleCriarTime() {
    if (!nomeNovoTime.trim()) return;
    setCriando(true);
    setErro('');
    try {
      const novo = await criarTime(nomeNovoTime.trim());
      setNomeNovoTime('');
      setTimeSelecionado(novo);
      setSelecionadoId(novo.id);
      onChange?.(novo);
      // busca a lista de novo do servidor em vez de só colar o time criado
      // no state local — garante que a tela mostra exatamente o que foi
      // persistido, mesmo se outro time já tiver sido criado em paralelo
      await carregar();
    } catch (err) {
      setErro(err.message || 'Erro ao criar time');
    } finally {
      setCriando(false);
    }
  }

  const estiloCaixa = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    background: '#0b1730',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: '10px 14px',
    marginBottom: 16,
    color: '#fff',
    fontFamily: 'inherit'
  };

  const estiloInput = {
    background: '#060d1c',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 6,
    color: '#fff',
    padding: '6px 10px',
    fontSize: 14
  };

  const estiloBotao = {
    background: '#e8273a',
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    padding: '6px 12px',
    fontSize: 14,
    cursor: 'pointer',
    opacity: criando || !nomeNovoTime.trim() ? 0.5 : 1
  };

  const estiloNomeTime = {
    fontSize: 15,
    fontWeight: 600,
  };

  if (carregando) {
    return <div style={estiloCaixa}>Carregando times…</div>;
  }

  // Já existe pelo menos um time salvo: a "mensagem" de criar time some daqui
  // pra frente e passa a mostrar o nome do time já cadastrado (persistido no
  // localStorage via setTimeSelecionado/getTimeSelecionado). O formulário de
  // criação só volta a aparecer se o técnico ainda não tiver nenhum time.
  const temTime = times.length > 0;

  return (
    <div style={estiloCaixa}>
      {temTime ? (
        <>
          <span style={{ opacity: 0.7, fontSize: 14 }}>Time:</span>

          {times.length > 1 ? (
            <select
              value={selecionadoId}
              onChange={e => selecionar(e.target.value)}
              style={estiloInput}
            >
              {times.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          ) : (
            <span style={estiloNomeTime}>{times[0].name}</span>
          )}
        </>
      ) : (
        <>
          <span style={{ fontSize: 14, opacity: 0.7 }}>Você ainda não tem um time. Crie o seu:</span>
          <input
            type="text"
            placeholder="Nome do seu time"
            value={nomeNovoTime}
            onChange={e => setNomeNovoTime(e.target.value)}
            style={{ ...estiloInput, minWidth: 160 }}
          />
          <button type="button" onClick={handleCriarTime} disabled={criando || !nomeNovoTime.trim()} style={estiloBotao}>
            {criando ? 'Criando…' : 'Criar time'}
          </button>
        </>
      )}

      {erro && <span style={{ color: '#ff6b7a', fontSize: 13 }}>{erro}</span>}
    </div>
  );
}