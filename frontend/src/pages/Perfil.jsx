import { useState, useEffect, useRef } from 'react';
import '../../css/perfil.css';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import editarfotoImg from '../assets/IMG/editarfoto.png';
import sairImg from '../assets/IMG/sair.png';
import editarImg from '../assets/IMG/editar.png';
import olhoImg from '../assets/IMG/olho.png';
import olhoFechadoImg from '../assets/IMG/olho-fechado.png';
import casaImg from '../assets/IMG/casa.png';
import { apiRequest, getUsuarioLogado, setUsuarioLogado, logout } from '../services/api.js';

export default function Perfil() {
  // guarda a instância do cropper pra poder destruir quando fechar
  const cropperRef = useRef(null);

  const [fotoSrc, setFotoSrc]             = useState('');
  const [modalCropAberto, setModalCropAberto] = useState(false);
  const [imagemCropSrc, setImagemCropSrc]   = useState('');
  const [modalEditarAberto, setModalEditarAberto] = useState(false);

  const usuarioSalvo = getUsuarioLogado();

  const [perfilNome, setPerfilNome]   = useState(usuarioSalvo?.nome || '');
  const [valorEmail, setValorEmail]   = useState(usuarioSalvo?.email || '');
  const [valorCpf,   setValorCpf]     = useState('•••.•••.•••-••');
  const [carregandoPerfil, setCarregandoPerfil] = useState(true);

  const [editNome,  setEditNome]  = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCpf,   setEditCpf]   = useState('');
  const [editSenha, setEditSenha] = useState('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [campoVazio, setCampoVazio] = useState('');

  const inputFotoRef  = useRef(null);
  const imagemCropRef = useRef(null);

  // FOTO DE PERFIL
  // o botão de editar foto aciona o input de arquivo escondido
  function handleEditarFoto() {
    inputFotoRef.current?.click();
  }

  // quando o técnico escolhe uma foto, abre o modal de crop
  function handleFotoChange(e) {
    const arquivo = e.target.files[0];
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = function (ev) {
      abrirModalCrop(ev.target.result);
    };
    leitor.readAsDataURL(arquivo);
  }

  // abre o modal e inicializa o cropper na imagem escolhida
  function abrirModalCrop(src) {
    setImagemCropSrc(src);
    setModalCropAberto(true);
  }

  // inicializa o Cropper.js depois que o modal abrir
  useEffect(() => {
    if (!modalCropAberto || !imagemCropRef.current) return;

    // espera o modal estar visível antes de inicializar o cropper
    // senão ele não consegue calcular as dimensões direito
    const timer = setTimeout(() => {
      if (cropperRef.current) {
        cropperRef.current.destroy();
        cropperRef.current = null;
      }

      cropperRef.current = new Cropper(imagemCropRef.current, {
        aspectRatio: 1,         // recorte quadrado — fica bem no círculo do perfil
        viewMode: 1,            // não deixa o recorte sair da imagem
        dragMode: 'move',       // arrasta a foto, não a caixa de recorte
        autoCropArea: 0.85,     // começa com 85% selecionado
        guides: false,
        highlight: false,
        cropBoxMovable: false,
        cropBoxResizable: false,
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [modalCropAberto, imagemCropSrc]);

  // fecha o modal de crop sem salvar nada
  function fecharModalCrop() {
    setModalCropAberto(false);

    if (cropperRef.current) {
      cropperRef.current.destroy();
      cropperRef.current = null;
    }

    if (inputFotoRef.current) inputFotoRef.current.value = '';
  }

  // confirma o recorte e aplica no círculo do perfil
  function confirmarCrop() {
    if (!cropperRef.current) return;

    const canvas    = cropperRef.current.getCroppedCanvas({ width: 300, height: 300 });
    const fotoFinal = canvas.toDataURL('image/jpeg', 0.9);

    setFotoSrc(fotoFinal);

    // quando a api estiver pronta, enviar a foto atualizada aqui.
    // const formData = new FormData();
    // formData.append('foto', dataURLtoBlob(fotoFinal));
    // await fetch('/api/perfil/foto', { method: 'POST', body: formData });

    fecharModalCrop();
  }

  // MODAL DE EDITAR INFORMAÇÕES
  // abre o modal e preenche os campos com os dados atuais da tela
  function abrirModalEditar() {
    setEditNome(perfilNome);
    setEditEmail(valorEmail);
    setEditSenha('');
    setEditCpf('');

    // garante que o campo volta pro modo oculto e o ícone volta pro olho aberto ao abrir o modal
    setSenhaVisivel(false);

    // quando o banco estiver pronto, preencher o cpf real aqui
    // setEditCpf(cpfReal);

    setModalEditarAberto(true);
  }

  // fecha o modal de edição
  function fecharModalEditar() {
    setModalEditarAberto(false);
  }

  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [erroEditar, setErroEditar] = useState('');

  // salva as alterações e atualiza a tela
  async function confirmarEditar() {
    // nome e email são obrigatórios
    if (!editNome.trim())  { destacarVazio('editNome');  return; }
    if (!editEmail.trim()) { destacarVazio('editEmail'); return; }

    setErroEditar('');
    setSalvandoEdicao(true);
    try {
      // A API (PUT /auth/profile) hoje só atualiza o nome (user_metadata) —
      // trocar e-mail/senha no Supabase Auth exige um fluxo de confirmação
      // separado (link por e-mail / senha atual), então por enquanto só o
      // nome é realmente persistido aqui.
      const resposta = await apiRequest('/auth/profile', {
        method: 'PUT',
        body: { nome: editNome.trim() }
      });

      const nomeAtualizado = resposta?.usuario?.user_metadata?.nome || editNome.trim();
      setPerfilNome(nomeAtualizado);
      setValorEmail(editEmail.trim());
      if (editCpf) setValorCpf(editCpf);
      setUsuarioLogado({ id: resposta?.usuario?.id, nome: nomeAtualizado, email: resposta?.usuario?.email || valorEmail });

      if (editSenha) {
        setErroEditar('Nome atualizado. Pra trocar a senha, use "Esqueceu a senha?" na tela de login por enquanto.');
      } else {
        fecharModalEditar();
      }
    } catch (err) {
      setErroEditar(err.message || 'Erro ao atualizar perfil');
    } finally {
      setSalvandoEdicao(false);
    }
  }

  // pisca vermelho no campo vazio
  function destacarVazio(id) {
    setCampoVazio(id);
    setTimeout(() => setCampoVazio(''), 2000);
  }

  function vazioBorder(id) {
    return campoVazio === id ? { borderColor: 'rgba(232, 39, 58, 0.7)' } : {};
  }

  // cpf: formata enquanto o técnico digita no modal: 000.000.000-00
  function handleEditCpfChange(e) {
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 9) v = v.slice(0,3) + '.' + v.slice(3,6) + '.' + v.slice(6,9) + '-' + v.slice(9);
    else if (v.length > 6) v = v.slice(0,3) + '.' + v.slice(3,6) + '.' + v.slice(6);
    else if (v.length > 3) v = v.slice(0,3) + '.' + v.slice(3);
    setEditCpf(v);
  }

  // SAIR DA CONTA
  function handleSair() {
    logout(); // limpa token + usuário + time selecionado e manda pro login
  }

  // carrega os dados reais do técnico logado. O que já veio salvo do login
  // (localStorage) aparece na hora; essa chamada só confirma/atualiza com o
  // que está no Supabase Auth (ex: se o nome foi editado em outro dispositivo).
  useEffect(() => {
    let ativo = true;
    async function carregarPerfil() {
      try {
        const resposta = await apiRequest('/auth/profile');
        if (!ativo) return;
        const nome = resposta?.usuario?.user_metadata?.nome || resposta?.usuario?.email?.split('@')[0] || '';
        const email = resposta?.usuario?.email || '';
        setPerfilNome(nome);
        setValorEmail(email);
        setUsuarioLogado({ id: resposta?.usuario?.id, nome, email });
      } catch {
        // se falhar (ex: token expirado), fica com o que já tinha em cache
      } finally {
        if (ativo) setCarregandoPerfil(false);
      }
    }
    carregarPerfil();
    return () => { ativo = false; };
  }, []);

  return (
    <div className="pagina-app">
      <main className="perfil-conteudo">

        <h1 className="perfil-titulo">Perfil</h1>

        <div className="perfil-layout">

          <div className="perfil-col-foto">
            <div className="perfil-foto-ring">

              <div className="perfil-foto-placeholder" id="fotoPlaceholder" style={{ display: fotoSrc ? 'none' : '' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>

              {fotoSrc && <img className="perfil-foto-img" id="fotoPerfilImg" src={fotoSrc} alt="" />}

              <button className="perfil-foto-edit" id="btnEditarFoto" aria-label="Alterar foto" onClick={handleEditarFoto}>
                <img src={editarfotoImg} className="icone-editarfoto" />
              </button>

              <input type="file" id="inputFotoPerfil" ref={inputFotoRef} accept="image/*" style={{ display: 'none' }} onChange={handleFotoChange} />

            </div>

            <span className="perfil-nome" id="perfilNome">{perfilNome || (carregandoPerfil ? 'Carregando…' : '—')}</span>
            <span className="perfil-cargo">Técnico</span>
            <div className="perfil-divider"></div>

            <button className="btn-sair" id="btnSair" onClick={handleSair}>
              <img src={sairImg} className="icone-sair" />
              Sair da conta
            </button>
          </div>

          <div className="perfil-col-dados">
            <div className="perfil-secao">
              <div className="perfil-secao-titulo">Informações da conta</div>

              <div className="perfil-campo">
                <span className="perfil-campo-label">E-mail</span>
                <span className="perfil-campo-valor" id="valorEmail">{valorEmail}</span>
              </div>

              <div className="perfil-campo">
                <span className="perfil-campo-label">CPF</span>
                <span className="perfil-campo-valor" id="valorCpf">{valorCpf}</span>
              </div>

              <div className="perfil-campo">
                <span className="perfil-campo-label">Senha</span>
                <span className="perfil-campo-valor">••••••••</span>
              </div>
            </div>

            <button className="btn-editar" id="btnEditar" onClick={abrirModalEditar}>
              <img src={editarImg} className="icone-editar" />
              Editar Informações
            </button>
          </div>

        </div>

      </main>

      <footer className="rodape">
        <a href="#" className="botao-inicio">
          <img src={casaImg} className="icone-casa" />
          Início
        </a>
      </footer>

      {/* modal de editar informações */}
      <div
        className={`modal-overlay${modalEditarAberto ? ' aberto' : ''}`}
        id="modalEditarOverlay"
        onClick={e => { if (e.target === e.currentTarget) fecharModalEditar(); }}
      >
        <div className="modal">

          <h2 className="modal-titulo">Editar Informações</h2>
          <div className="modal-divisor"></div>

          <div className="modal-campo">
            <label className="modal-label" htmlFor="editNome">Nome</label>
            <input className="modal-input" type="text" id="editNome" placeholder="Seu nome completo"
              value={editNome} onChange={e => setEditNome(e.target.value)} style={vazioBorder('editNome')} />
          </div>

          <div className="modal-campo">
            <label className="modal-label" htmlFor="editEmail">E-mail</label>
            <input className="modal-input" type="email" id="editEmail" placeholder="seu@email.com"
              value={editEmail} onChange={e => setEditEmail(e.target.value)} style={vazioBorder('editEmail')} />
          </div>

          <div className="modal-campo">
            <label className="modal-label" htmlFor="editCpf">CPF</label>
            <input className="modal-input" type="text" id="editCpf" placeholder="000.000.000-00"
              value={editCpf} onChange={handleEditCpfChange} />
          </div>

          <div className="modal-campo">
            <label className="modal-label" htmlFor="editSenha">
              Nova senha
              <span className="modal-label-obs">(deixe em branco pra manter)</span>
            </label>
            <div className="modal-input-wrapper">
              <input className="modal-input" type={senhaVisivel ? 'text' : 'password'} id="editSenha" placeholder="••••••••"
                value={editSenha} onChange={e => setEditSenha(e.target.value)} />
              {/* VER SENHA */}
              {/* alterna entre mostrar e esconder a senha, trocando o ícone junto */}
              <button className="btn-ver-senha" id="btnVerSenha" type="button" onClick={() => setSenhaVisivel(v => !v)}>
                <img src={senhaVisivel ? olhoFechadoImg : olhoImg} id="iconeOlho" className="icone-olho" />
              </button>
            </div>
          </div>

          {erroEditar && <p className="mensagem-erro" style={{ marginTop: 4 }}>{erroEditar}</p>}

          <div className="modal-acoes">
            <button className="btn-modal-cancelar" id="btnEditarCancelar" onClick={fecharModalEditar}>Cancelar</button>
            <button className="btn-modal-confirmar" id="btnEditarConfirmar" onClick={confirmarEditar} disabled={salvandoEdicao}>
              {salvandoEdicao ? 'Salvando...' : 'Salvar'}
            </button>
          </div>

        </div>
      </div>

      {/* modal de crop da foto */}
      <div
        className={`modal-crop-overlay${modalCropAberto ? ' aberto' : ''}`}
        id="modalCropOverlay"
        onClick={e => { if (e.target === e.currentTarget) fecharModalCrop(); }}
      >
        <div className="modal-crop">

          <h2 className="modal-crop-titulo">Posicionar foto</h2>
          <div className="modal-crop-divisor"></div>

          <div className="crop-area">
            <img id="imagemCrop" ref={imagemCropRef} src={imagemCropSrc} alt="foto" />
          </div>

          <p className="crop-dica">Arraste para ajustar o enquadramento</p>

          <div className="modal-crop-acoes">
            <button className="btn-crop-cancelar" id="btnCropCancelar" onClick={fecharModalCrop}>Cancelar</button>
            <button className="btn-crop-confirmar" id="btnCropConfirmar" onClick={confirmarCrop}>Confirmar</button>
          </div>

        </div>
      </div>
    </div>
  );
}
