import app from '../src/app.js';

// A Vercel importa este arquivo e usa o `app` do Express diretamente
// como handler serverless (Express exporta uma função (req, res) => ...,
// que é exatamente o que a runtime Node da Vercel espera).
export default app;