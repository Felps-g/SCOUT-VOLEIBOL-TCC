import '../../css/inicial.css';
import hipicaImg from '../assets/IMG/hipica.png';
import perfil1Img from '../assets/IMG/perfil1.png';
import bolaImg from '../assets/IMG/bola.png';
import atletasImg from '../assets/IMG/atletas.png';
import perfilImg from '../assets/IMG/perfil.png';
import { getUsuarioLogado, obterIniciais } from '../services/auth.js';

export default function Inicial() {
  const usuario = getUsuarioLogado();
  const nomeExibido = usuario ? (usuario.nome || usuario.email) : 'Entrar';

  return (
    <div className="aplicativo">

      <header className="cabecalho">
        <a href="#" className="logo-equipe">
          <img src={hipicaImg} alt="Logo da equipe" className="logo-equipe-img" />
        </a>

        <h1 className="logo">SCOUT LIVE</h1>

        <div className="cabecalho-direita">
          <a href={usuario ? '#/perfil' : '#/login'} className="usuario-chip" id="usuarioChip">
            <div className="usuario-avatar" id="usuarioAvatar">
              {usuario ? (
                <span className="usuario-avatar-iniciais">{obterIniciais(nomeExibido)}</span>
              ) : (
                <img src={perfil1Img} className="icone-usuario" />
              )}
            </div>
            {!usuario && <span className="usuario-nome">{nomeExibido}</span>}
          </a>
        </div>
      </header>

      {/* GRADE DE NAVEGAÇÃO */}
      <div className="grade-navegacao">

        <a href="#/scoutlive" className="botao-nav botao-nav--ao-vivo">
          <div className="icone-nav">
            <div className="indicador-ao-vivo"></div>
            <svg viewBox="0 0 24 24" fill="none" stroke="#e8273a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="4" fill="#e8273a" stroke="none"/>
            </svg>
          </div>
          <span className="rotulo-nav">Scout Live</span>
        </a>

        <a href="#/jogos" className="botao-nav botao-nav--jogos">
          <div className="icone-nav">
            <img src={bolaImg} />
          </div>
          <span className="rotulo-nav">Jogos</span>
        </a>

        <a href="#/atletas" className="botao-nav botao-nav--atletas">
          <div className="icone-nav">
            <img src={atletasImg} />
          </div>
          <span className="rotulo-nav">Atletas</span>
        </a>

        <a href="#/perfil" className="botao-nav botao-nav--perfil">
          <div className="icone-nav">
            <img src={perfilImg} />
          </div>
          <span className="rotulo-nav">Perfil</span>
        </a>

      </div>

    </div>
  );
}