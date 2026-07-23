import cors from 'cors';
import express from 'express';
import authRoutes from './routes/authRoutes.js';
import timesRoutes from './routes/timesRoutes.js';
import jogadorRoutes from './routes/jogadorRoutes.js';
import jogosRoutes from './routes/jogosRoutes.js';

const app = express();

app.use(cors());
// limite maior que o padrão (100kb) porque a foto do atleta vai em base64
// dentro do JSON (não tem upload de arquivo/storage configurado no projeto)
app.use(express.json({ limit: '8mb' }));

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      mensagem: 'JSON inválido',
      erro: 'O corpo da requisição precisa ser um JSON válido'
    });
  }

  next(err);
});

app.get('/', (req, res) => {
  res.send('API Volei funcionando!');
});

// Rotas de Autenticação (sem middleware de auth)
app.use('/api/auth', authRoutes);

// Rotas da API (com middleware de auth em jogosRoutes)
app.use('/api', timesRoutes);
app.use('/api', jogadorRoutes);
app.use('/api', jogosRoutes);

// Rota inexistente
app.use((req, res) => {
  res.status(404).json({ mensagem: 'Rota não encontrada' });
});

// Handler de erro genérico (precisa ser o ÚLTIMO middleware registrado;
// erros lançados dentro das rotas acima só chegam até aqui, nunca nos
// handlers registrados antes das rotas)
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({
    mensagem: 'Erro interno do servidor',
    erro: err.message
  });
});

export default app;