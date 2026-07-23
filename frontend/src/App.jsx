// App.jsx — roteamento entre as páginas do Scout Live
// Por enquanto usa hash na URL para navegar sem precisar de servidor.
// Quando o backend estiver pronto, trocar por React Router ou Next.js.

import { useState, useEffect } from 'react'
import Inicial          from './pages/Inicial.jsx'
import Login            from './pages/Login.jsx'
import ScoutLive        from './pages/ScoutLive.jsx'
import Jogos            from './pages/Jogos.jsx'
import Atletas          from './pages/Atletas.jsx'
import Perfil           from './pages/Perfil.jsx'
import AdicionarAtletas from './pages/AdicionarAtletas.jsx'
import AtletaDetalhes   from './pages/AtletaDetalhes.jsx'
import DetalheJogo      from './pages/DetalheJogo.jsx'

const rotas = {
  '':                    <Inicial />,
  '#/login':             <Login />,
  '#/scoutlive':         <ScoutLive />,
  '#/jogos':             <Jogos />,
  '#/atletas':           <Atletas />,
  '#/perfil':            <Perfil />,
  '#/adicionar-atletas': <AdicionarAtletas />,
  '#/atleta-detalhes':   <AtletaDetalhes />,
  '#/detalhe-jogo':      <DetalheJogo />,
}

export default function App() {
  const [hash, setHash] = useState(window.location.hash || '')

  useEffect(() => {
    const onHash = () => setHash(window.location.hash || '')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // separa o caminho da query string: "#/detalhe-jogo?id=123" -> "#/detalhe-jogo"
  // sem isso, qualquer link com "?id=" não batia com nenhuma chave de `rotas`
  // e caía sempre na tela inicial.
  const caminho = hash.split('?')[0]

  return rotas[caminho] ?? <Inicial />
}
