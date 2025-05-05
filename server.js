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

// Listar diretórios para depuração no Render
console.log('Diretório atual:', __dirname);
console.log('Listando arquivos no diretório raiz:');
try {
  const files = fs.readdirSync(__dirname);
  console.log(files);
} catch (e) {
  console.error('Erro ao listar diretório raiz:', e);
}

console.log('Verificando existência de src/:');
const srcPath = path.join(__dirname, 'src');
if (fs.existsSync(srcPath)) {
  console.log('src/ existe, listando conteúdo:');
  try {
    const srcFiles = fs.readdirSync(srcPath);
    console.log(srcFiles);
    
    if (srcFiles.includes('backend')) {
      console.log('backend/ existe, listando conteúdo:');
      const backendPath = path.join(srcPath, 'backend');
      const backendFiles = fs.readdirSync(backendPath);
      console.log(backendFiles);
    }
  } catch (e) {
    console.error('Erro ao listar conteúdo de src/:', e);
  }
} else {
  console.log('Diretório src/ não existe!');
}

// Criar um router simples sem depender do módulo proxy
const proxyRouter = express.Router();

// Adicionar rota de health check
proxyRouter.get('/health', (_, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API funcionando em modo básico - sem o módulo proxy' 
  });
});

// Simular algumas das funcionalidades básicas do proxy
proxyRouter.get('*', (req, res) => {
  res.json({
    success: true,
    simpleMode: true,
    message: 'API funcionando em modo básico. Os endpoints específicos não estão disponíveis no momento.',
    endpoint: req.path
  });
});

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS
app.use(cors());

// Servir arquivos estáticos do build
app.use(express.static(path.join(__dirname, 'dist')));

// Usar as rotas do proxy simplificado
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