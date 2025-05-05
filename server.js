/**
 * Servidor para produção que serve tanto a API quanto os arquivos estáticos
 */
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Verificando o caminho do arquivo proxy para depuração
let proxyPath = './dist/backend/proxy.js';
if (!fs.existsSync(path.resolve(__dirname, proxyPath))) {
  console.log(`Arquivo não encontrado: ${path.resolve(__dirname, proxyPath)}`);
  proxyPath = './src/backend/proxy.js';
  console.log(`Tentando caminho alternativo: ${path.resolve(__dirname, proxyPath)}`);
}

// Importação dinâmica para lidar com resolução de caminhos em tempo de execução
let proxyRouter;
try {
  const module = await import(proxyPath);
  proxyRouter = module.default;
  console.log('Módulo proxy carregado com sucesso!');
} catch (error) {
  console.error(`Erro ao importar o proxy: ${error.message}`);
  console.error(`Detalhes do erro: ${error.stack}`);
  
  // Criar um router vazio para não quebrar a aplicação
  proxyRouter = express.Router();
  proxyRouter.get('/health', (_, res) => {
    res.json({ status: 'warning', message: 'Servidor funcionando, mas o módulo proxy não foi carregado' });
  });
}

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS
app.use(cors());

// Servir arquivos estáticos do build
app.use(express.static(path.join(__dirname, 'dist')));

// Usar as rotas da API do arquivo proxy
app.use('/api', proxyRouter);

// Endpoint de saúde para verificações do Render
app.get('/health', (_, res) => {
  res.json({ status: 'ok', message: 'Servidor em produção funcionando corretamente' });
});

// Para qualquer outra rota, servir o index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor em produção rodando na porta ${PORT}`);
});