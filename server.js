/**
 * Servidor para produção que serve tanto a API quanto os arquivos estáticos
 */
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import proxyRouter from './src/backend/proxy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS
app.use(cors());

// Servir arquivos estáticos do build
app.use(express.static(path.join(__dirname, 'dist')));

// Usar as rotas da API do arquivo proxy.ts
app.use('/api', proxyRouter);

// Para qualquer outra rota, servir o index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Endpoint de saúde para verificações do Render
app.get('/health', (_, res) => {
  res.json({ status: 'ok', message: 'Servidor em produção funcionando corretamente' });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor em produção rodando na porta ${PORT}`);
});