import app from './app.js';

// Lê a porta da variável de ambiente ou usa 3000 como padrão
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});