/**
 * Servidor para produção que serve tanto a API quanto os arquivos estáticos
 */
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import fs from 'fs';

// Importar o módulo de proxy real
import puppeteer from 'puppeteer';
import { getPuppeteerOptions } from './src/backend/puppeteer-config.js';

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

// Testar a instalação do Puppeteer e do Chrome
async function testPuppeteer() {
  try {
    console.log('🔄 Testando configuração do Puppeteer...');
    console.log('Opções do Puppeteer:', getPuppeteerOptions());
    
    // Verificar se o Chrome está instalado
    try {
      const browser = await puppeteer.launch(getPuppeteerOptions());
      console.log('✅ Puppeteer conectado ao Chrome com sucesso!');
      const version = await browser.version();
      console.log(`Versão do navegador: ${version}`);
      await browser.close();
      return true;
    } catch (error) {
      console.error('❌ Erro ao iniciar o Puppeteer:', error.message);
      
      // Tentar encontrar o Chrome manualmente
      console.log('🔍 Buscando instalações do Chrome no sistema...');
      const checkPaths = [
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser'
      ];
      
      for (const chromePath of checkPaths) {
        if (fs.existsSync(chromePath)) {
          console.log(`💡 Chrome encontrado em: ${chromePath}`);
          process.env.PUPPETEER_EXECUTABLE_PATH = chromePath;
          console.log('Tentando nova conexão com o caminho encontrado...');
          try {
            const browser = await puppeteer.launch({
              ...getPuppeteerOptions(),
              executablePath: chromePath
            });
            console.log('✅ Conexão bem-sucedida com o caminho alternativo!');
            await browser.close();
            return true;
          } catch (retryError) {
            console.error(`❌ Falha ao conectar usando ${chromePath}:`, retryError.message);
          }
        }
      }
      
      console.error('❌ Nenhuma instalação válida do Chrome encontrada no sistema.');
      return false;
    }
  } catch (e) {
    console.error('❌ Erro ao testar Puppeteer:', e);
    return false;
  }
}

// Criar um router para o proxy
const proxyRouter = express.Router();

// Adicionar rota de health check
proxyRouter.get('/health', (_, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API funcionando' 
  });
});

// Implementar rota de scraping
proxyRouter.get('/proximas-partidas', async (req, res) => {
  try {
    console.log('🔄 Iniciando scraping com Puppeteer para: https://draft5.gg/equipe/330-FURIA/proximas-partidas');
    
    // Verificar se o Puppeteer está funcionando
    const puppeteerOk = await testPuppeteer();
    if (!puppeteerOk) {
      return res.status(500).json({
        success: false,
        message: 'Erro na configuração do Puppeteer. Chrome não disponível.'
      });
    }
    
    // Continuar com o scraping se o Puppeteer estiver configurado corretamente
    const browser = await puppeteer.launch(getPuppeteerOptions());
    const page = await browser.newPage();
    
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );
    
    await page.goto('https://draft5.gg/equipe/330-FURIA/proximas-partidas', { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    // Aqui você pode adicionar a lógica de scraping específica
    // Por enquanto, vamos apenas capturar o HTML da página
    const content = await page.content();
    
    await browser.close();
    
    res.json({
      success: true,
      message: 'Scraping realizado com sucesso',
      data: {
        htmlLength: content.length,
        preview: content.substring(0, 200) + '...'
      }
    });
  } catch (error) {
    console.error('❌ Erro ao fazer scraping com Puppeteer:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao fazer scraping: ${error.message}`
    });
  }
});

// Simular outras funcionalidades básicas do proxy
proxyRouter.get('*', (req, res) => {
  res.json({
    success: true,
    message: 'Endpoint não implementado',
    endpoint: req.path
  });
});

const app = express();
const PORT = process.env.PORT || 10000; // Usando a porta 10000 conforme detectado pelo Render

// Habilitar CORS
app.use(cors());

// Servir arquivos estáticos do build
app.use(express.static(path.join(__dirname, 'dist')));

// Usar as rotas do proxy
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