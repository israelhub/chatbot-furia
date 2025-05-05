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

// Tentar importar diretamente o proxy como primeira opção
let proxyRouter;
try {
  // Primeiro tenta importar da forma mais simples
  console.log('Tentando importar proxy usando caminho relativo simples...');
  const { default: router } = await import('./src/backend/proxy.js');
  proxyRouter = router;
  console.log('Módulo proxy carregado com sucesso usando caminho relativo!');
} catch (initialError) {
  console.log(`Não foi possível carregar usando caminho relativo simples: ${initialError.message}`);
  
  // Se falhar, tenta com os caminhos absolutos (abordagem mais robusta)
  try {
    // Verificando caminhos alternativos
    const distProxyPath = path.join(__dirname, 'dist', 'backend', 'proxy.js');
    const srcProxyPath = path.join(__dirname, 'src', 'backend', 'proxy.js');
    
    let importPath;
    if (fs.existsSync(distProxyPath)) {
      console.log(`Usando arquivo proxy compilado: ${distProxyPath}`);
      importPath = `file://${distProxyPath}`;
    } else if (fs.existsSync(srcProxyPath)) {
      console.log(`Usando arquivo proxy de desenvolvimento: ${srcProxyPath}`);
      importPath = `file://${srcProxyPath}`;
    } else {
      console.log(`Arquivo proxy não encontrado em nenhum caminho esperado.`);
      throw new Error('Nenhum caminho de arquivo válido encontrado');
    }
    
    // Tenta a importação com o caminho absoluto
    console.log(`Tentando importar de: ${importPath}`);
    const module = await import(importPath);
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
    
    // Criar um proxy básico para requisições simples
    proxyRouter.get('*', (_, res) => {
      res.status(503).json({ 
        status: 'error', 
        message: 'API temporariamente indisponível. Módulo proxy não pôde ser carregado.' 
      });
    });
  }
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