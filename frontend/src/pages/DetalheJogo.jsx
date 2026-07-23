import { useEffect, useRef, useState } from 'react';
import '../../css/detalhe-jogos.css';
import Chart from 'chart.js/auto';
import lixeiraImg from '../assets/IMG/lixeira.png';
import voltarImg from '../assets/IMG/voltar.png';
import { apiRequest } from '../services/api.js';
import { listarTimes, listarJogadores } from '../services/time.js';

function formatarData(isoDate) {
  if (!isoDate) return '—';
  const [ano, mes, dia] = isoDate.split('T')[0].split('-');
  return `${dia}/${mes}/${ano}`;
}

// soma acertos e erros por set a partir das ações reais do jogo
function calcularDadosGrafico(acoes, setIdParaNumero) {
  const sets = {};

  acoes.forEach(acao => {
    const numeroSet = setIdParaNumero[acao.set_id] ?? '?';
    if (!sets[numeroSet]) sets[numeroSet] = { acertos: 0, erros: 0 };

    if (acao.resultado === 'ponto') sets[numeroSet].acertos += 1;
    if (acao.resultado === 'erro')  sets[numeroSet].erros += 1;
  });

  // ordena pelos números de set
  return Object.fromEntries(
    Object.entries(sets).sort(([a], [b]) => Number(a) - Number(b))
  );
}

// calcula quem teve o maior aproveitamento (acertos / acertos + erros) no jogo todo
function calcularAtletaDestaque(acoes, nomesJogadores, posicoesJogadores) {
  const porJogador = {};

  acoes.forEach(acao => {
    if (!porJogador[acao.jogador_id]) {
      porJogador[acao.jogador_id] = { acertos: 0, erros: 0 };
    }
    if (acao.resultado === 'ponto') porJogador[acao.jogador_id].acertos += 1;
    if (acao.resultado === 'erro')  porJogador[acao.jogador_id].erros += 1;
  });

  let melhor = null;
  let melhorAproveitamento = -1;

  Object.entries(porJogador).forEach(([jogadorId, { acertos, erros }]) => {
    const aproveitamento = acertos + erros > 0
      ? Math.round((acertos / (acertos + erros)) * 100)
      : 0;

    if (aproveitamento > melhorAproveitamento) {
      melhorAproveitamento = aproveitamento;
      melhor = {
        jogadorId,
        nome: nomesJogadores[jogadorId] || 'Atleta',
        posicao: posicoesJogadores[jogadorId] || '—',
        totalAcertos: acertos,
        totalErros: erros,
        aproveitamento
      };
    }
  });

  return melhor;
}

export default function DetalheJogo() {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  // pega o id do jogo que veio na url: #/detalhe-jogo?id=123
  // (com hash routing o query string fica dentro do hash, não em location.search)
  const queryString = window.location.hash.split('?')[1] || '';
  const params = new URLSearchParams(queryString);
  const jogoId = params.get('id');

  const [jogo, setJogo]         = useState(null);
  const [acoes, setAcoes]       = useState([]);
  const [dadosGrafico, setDadosGrafico] = useState({});
  const [destaque, setDestaque] = useState(null);
  const [adversarioNome, setAdversarioNome] = useState('Adversário');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  async function carregar() {
    if (!jogoId) {
      setErro('Jogo não informado na URL.');
      setCarregando(false);
      return;
    }

    setCarregando(true);
    setErro('');
    try {
      const [resJogo, resSets, resAcoes, times] = await Promise.all([
        apiRequest(`/matches/${jogoId}`),
        apiRequest(`/matches/${jogoId}/sets`),
        apiRequest(`/matches/${jogoId}/acoes`),
        listarTimes()
      ]);

      const jogoCarregado = resJogo.jogo;
      setJogo(jogoCarregado);

      const nomeAdv = times.find(t => t.id === jogoCarregado.time_adversario_id)?.name;
      setAdversarioNome(nomeAdv || 'Adversário');

      const setIdParaNumero = {};
      (resSets.sets || []).forEach(s => { setIdParaNumero[s.id] = s.set_number; });

      const acoesCarregadas = resAcoes.acoes || [];
      setAcoes(acoesCarregadas);
      setDadosGrafico(calcularDadosGrafico(acoesCarregadas, setIdParaNumero));

      // busca nomes/posições reais dos atletas do time pra montar o destaque
      const jogadores = jogoCarregado.time_id ? await listarJogadores(jogoCarregado.time_id) : [];
      const nomesJogadores = {};
      const posicoesJogadores = {};
      jogadores.forEach(j => { nomesJogadores[j.id] = j.name; posicoesJogadores[j.id] = j.position; });

      setDestaque(calcularAtletaDestaque(acoesCarregadas, nomesJogadores, posicoesJogadores));
    } catch (err) {
      setErro(err.message || 'Erro ao carregar o jogo');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregar(); }, [jogoId]);

  // monta o gráfico assim que os dados chegarem
  useEffect(() => {
    if (!canvasRef.current || carregando || Object.keys(dadosGrafico).length === 0) return;

    const labels  = Object.keys(dadosGrafico).map(s => `Set ${s}`);
    const acertos = Object.values(dadosGrafico).map(s => s.acertos);
    const erros   = Object.values(dadosGrafico).map(s => s.erros);

    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Acertos',
            data: acertos,
            backgroundColor: 'rgba(45, 127, 255, 0.7)',
            borderColor: 'rgba(45, 127, 255, 1)',
            borderWidth: 1,
            borderRadius: 6,
          },
          {
            label: 'Erros',
            data: erros,
            backgroundColor: 'rgba(232, 39, 58, 0.6)',
            borderColor: 'rgba(232, 39, 58, 1)',
            borderWidth: 1,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: 'rgba(255,255,255,0.6)',
              font: { family: 'Nexa, Arial, sans-serif', size: 11 },
            },
          },
        },
        scales: {
          x: {
            ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 11 } },
            grid:  { color: 'rgba(255,255,255,0.05)' },
          },
          y: {
            beginAtZero: true,
            ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 11 } },
            grid:  { color: 'rgba(255,255,255,0.05)' },
          },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [dadosGrafico, carregando]);

  async function handleExcluir() {
    const confirmar = window.confirm('Tem certeza que deseja excluir este jogo?');
    if (!confirmar) return;

    try {
      await apiRequest(`/matches/${jogoId}`, { method: 'DELETE' });
      window.location.hash = '#/jogos';
    } catch (err) {
      alert(err.message || 'Erro ao excluir jogo');
    }
  }

  if (carregando) {
    return (
      <div className="pagina-app">
        <div className="titulo-wrapper"><h1 className="titulo-pagina">Jogos</h1></div>
        <main className="conteudo">
          <p style={{ color: '#fff', opacity: 0.7 }}>Carregando jogo…</p>
        </main>
      </div>
    );
  }

  if (erro || !jogo) {
    return (
      <div className="pagina-app">
        <div className="titulo-wrapper"><h1 className="titulo-pagina">Jogos</h1></div>
        <main className="conteudo">
          <p style={{ color: '#ff6b7a' }}>{erro || 'Jogo não encontrado.'}</p>
        </main>
        <footer className="rodape">
          <a href="#/jogos" className="botao-voltar">
            <img src={voltarImg} className="icone-voltar" />
            Voltar
          </a>
        </footer>
      </div>
    );
  }

  return (
    <div className="pagina-app">
      <div className="titulo-wrapper">
        <h1 className="titulo-pagina">Jogos</h1>
      </div>

      <main className="conteudo">

        <div className="jogo-topo">
          <div className="jogo-info">
            <span className="jogo-adversario">{adversarioNome}</span>
            <div className="jogo-meta">
              <span className="jogo-data">{formatarData(jogo.data_jogo)}</span>
              <span className="jogo-placar">
                {jogo.home_score ?? 0} <span className="x">×</span> {jogo.away_score ?? 0}
              </span>
              {jogo.resultado_final && (
                <span className={`jogo-resultado jogo-resultado--${jogo.resultado_final}`}>
                  {jogo.resultado_final === 'vitoria' ? 'Vitória' : 'Derrota'}
                </span>
              )}
            </div>
          </div>
          <button className="btn-excluir" id="btnExcluir" onClick={handleExcluir}>
            <img src={lixeiraImg} className="icone-lixo" />
            Excluir jogo
          </button>
        </div>

        <div className="grade-principal">

          {/* Gráfico */}
          <div className="card card-grafico">
            <div className="card-titulo">
              <span>Desempenho geral por Set</span>
            </div>
            <div className="grafico-wrapper">
              {acoes.length === 0
                ? <p style={{ color: '#fff', opacity: 0.6, padding: 16 }}>Nenhuma ação de scout registrada neste jogo ainda.</p>
                : <canvas id="graficoSets" ref={canvasRef}></canvas>}
            </div>
          </div>

          <div className="card card-destaque">
            <div className="card-titulo">
              <span>Atleta Destaque</span>
            </div>
            <div className="destaque-conteudo" id="atletaDestaque">
              <div className="destaque-foto">
                <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <span className="destaque-nome">{destaque?.nome ?? '—'}</span>
              <span className="destaque-posicao">{destaque?.posicao ?? ''}</span>
              <div className="destaque-stats">
                <div className="destaque-stat">
                  <span className="destaque-stat-valor">{destaque?.totalAcertos ?? 0}</span>
                  <span className="destaque-stat-label">Acertos</span>
                </div>
                <div className="destaque-stat-divisor"></div>
                <div className="destaque-stat">
                  <span className="destaque-stat-valor">{destaque?.totalErros ?? 0}</span>
                  <span className="destaque-stat-label">Erros</span>
                </div>
                <div className="destaque-stat-divisor"></div>
                <div className="destaque-stat">
                  <span className="destaque-stat-valor">{destaque ? destaque.aproveitamento + '%' : '0%'}</span>
                  <span className="destaque-stat-label">Aproveit.</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </main>

      <footer className="rodape">
        <a href="#/jogos" className="botao-voltar">
          <img src={voltarImg} className="icone-voltar" />
          Voltar
        </a>
      </footer>
    </div>
  );
}
