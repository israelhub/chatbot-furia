/**
 * Servidor para produção que serve tanto a API quanto os arquivos estáticos
 */
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import fs from 'fs';
import axios from 'axios';
import puppeteer from 'puppeteer';

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

// Importar a configuração do Puppeteer se possível
let getPuppeteerOptions = () => ({
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  headless: 'new'
});

try {
  const puppeteerConfigPath = path.join(__dirname, 'src', 'backend', 'puppeteer-config.js');
  if (fs.existsSync(puppeteerConfigPath)) {
    console.log('Carregando configuração do Puppeteer de:', puppeteerConfigPath);
    import(puppeteerConfigPath).then(module => {
      getPuppeteerOptions = module.getPuppeteerOptions;
      console.log('Configuração do Puppeteer carregada com sucesso');
    }).catch(err => {
      console.error('Erro ao importar configuração do Puppeteer:', err);
    });
  }
} catch (e) {
  console.error('Erro ao verificar configuração do Puppeteer:', e);
}

// Função auxiliar para lidar com rotas assíncronas
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Implementar as funcionalidades reais do proxy
const proxyRouter = express.Router();

// Adicionar rota de health check
proxyRouter.get('/health', (_, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API proxy integrada funcionando corretamente' 
  });
});

// Rota do proxy para o Liquipedia
proxyRouter.get('/liquipedia', asyncHandler(async (req, res) => {
  const page = req.query.page;
  
  if (!page) {
    return res.status(400).json({ error: 'Parâmetro "page" é obrigatório' });
  }
  
  console.log(`🔄 Processando requisição para Liquipedia: ${page}`);
  
  try {
    // Faz a requisição para a API do Liquipedia
    const response = await axios.get('https://liquipedia.net/counterstrike/api.php', {
      params: {
        action: 'parse',
        format: 'json',
        page: page,
        prop: 'text'
      },
      headers: {
        'User-Agent': 'FuriaFanBot/1.0'
      }
    });
    
    const result = { 
      html: response.data.parse.text['*'],
      success: true 
    };
    
    // Retorna o HTML do conteúdo
    return res.json(result);
  } catch (error) {
    console.error(`❌ Erro ao acessar Liquipedia: ${error.message}`);
    return res.status(500).json({ 
      error: `Erro ao acessar Liquipedia: ${error.message}`,
      success: false 
    });
  }
}));

// Rota do proxy para o Draft5.gg
proxyRouter.get('/draft5', asyncHandler(async (req, res) => {
  const url = req.query.url;
  
  if (!url) {
    return res.status(400).json({ error: 'Parâmetro "url" é obrigatório' });
  }
  
  console.log(`🔄 Processando requisição para Draft5: ${url}`);
  
  try {
    // Faz a requisição para o site Draft5.gg
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    // Retorna o HTML da página
    return res.json({ 
      html: response.data,
      success: true 
    });
  } catch (error) {
    console.error(`❌ Erro ao acessar Draft5: ${error.message}`);
    return res.status(500).json({ 
      error: `Erro ao acessar Draft5: ${error.message}`,
      success: false 
    });
  }
}));

// Rota do proxy para o Draft5.gg com Puppeteer (para conteúdo JavaScript dinâmico)
proxyRouter.get('/draft5/puppeteer', asyncHandler(async (req, res) => {
  const url = req.query.url;
  
  if (!url) {
    return res.status(400).json({ error: 'Parâmetro "url" é obrigatório' });
  }
  
  console.log(`🔄 Iniciando scraping com Puppeteer para: ${url}`);
  
  let browser = null;
  try {
    // Inicia o navegador com as configurações otimizadas para produção
    browser = await puppeteer.launch(getPuppeteerOptions());
    
    console.log(`✅ Navegador Puppeteer iniciado no servidor`);
    
    // Abre uma nova página
    const page = await browser.newPage();
    
    // Configura o user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );
    
    // Navega para a URL
    console.log(`🔄 Navegando para: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Aguarda um tempo para garantir que todo o conteúdo dinâmico seja carregado
    console.log(`⏱️ Aguardando carregamento completo da página...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Aguarda especificamente pelo elemento que contém as próximas partidas
    try {
      console.log(`🔍 Aguardando pelo elemento das próximas partidas...`);
      await page.waitForSelector('div[class*="id__ContentContainer"]', { timeout: 5000 });
      console.log(`✅ Elemento das próximas partidas encontrado`);
    } catch (error) {
      console.log(`⚠️ Elemento das próximas partidas não encontrado, continuando mesmo assim...`);
    }
    
    // Obtém o HTML da página após o carregamento do JavaScript
    const html = await page.content();
    console.log(`📥 HTML com JavaScript renderizado obtido, tamanho: ${html.length} caracteres`);
    
    // Retorna o HTML completo da página
    return res.json({ 
      html: html,
      success: true 
    });
  } catch (error) {
    console.error(`❌ Erro ao fazer scraping com Puppeteer: ${error.message}`);
    return res.status(500).json({ 
      error: `Erro ao processar a página: ${error.message}`,
      success: false 
    });
  } finally {
    // Garante que o navegador seja fechado mesmo se ocorrer um erro
    if (browser) {
      console.log(`🔄 Fechando navegador Puppeteer`);
      await browser.close();
    }
  }
}));

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS
app.use(cors());

// Servir arquivos estáticos do build
app.use(express.static(path.join(__dirname, 'dist')));

// Usar as rotas do proxy real
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