import app from './app.js';

// Roda o listen apenas se estiver em ambiente local (desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

// OBRIGATÓRIO PARA A VERCEL: Exporta o app para que a Vercel responda às requisições
export default app;
