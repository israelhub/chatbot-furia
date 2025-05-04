/**
 * Servidor proxy para contornar restrições de CORS nas requisições ao Liquipedia e Draft5
 * Versão TypeScript do servidor original
 */
import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import cors from 'cors';
import puppeteer from 'puppeteer';
import { LiquipediaResponse } from '../types/index.js';
import { getPuppeteerOptions } from './puppeteer-config.js';

const router = express.Router();

// Função auxiliar para lidar com rotas assíncronas
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Rota do proxy para o Liquipedia
router.get('/liquipedia', asyncHandler(async (req: Request, res: Response) => {
  const page = req.query.page as string;
  
  if (!page) {
    return res.status(400).json({ error: 'Parâmetro "page" é obrigatório' });
  }
  
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
  
  const result: LiquipediaResponse = { 
    html: response.data.parse.text['*'],
    success: true 
  };
  
  // Retorna o HTML do conteúdo
  return res.json(result);
}));

// Rota do proxy para o Draft5.gg
router.get('/draft5', asyncHandler(async (req: Request, res: Response) => {
  const url = req.query.url as string;
  
  if (!url) {
    return res.status(400).json({ error: 'Parâmetro "url" é obrigatório' });
  }
  
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
}));

// Rota do proxy para o Draft5.gg com Puppeteer (para conteúdo JavaScript dinâmico)
router.get('/draft5/puppeteer', asyncHandler(async (req: Request, res: Response) => {
  const url = req.query.url as string;
  
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
    } catch {
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
  } catch (error: unknown) {
    console.error(`❌ Erro ao fazer scraping com Puppeteer: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    return res.status(500).json({ 
      error: `Erro ao processar a página: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
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

// Endpoint de status para verificação de saúde
router.get('/health', (_, res) => {
  res.json({ status: 'ok', message: 'Servidor proxy funcionando corretamente' });
});

// Se estiver sendo executado diretamente (não importado)
if (import.meta.url === (await import('node:url')).pathToFileURL(process.argv[1]).href) {
  const app = express();
  const PORT = process.env.PORT || 3001;
  
  // Habilitar CORS para permitir requisições do frontend
  app.use(cors());
  
  // Usar as rotas do proxy
  app.use('/api', router);
  
  // Iniciar o servidor
  app.listen(PORT, () => {
    console.log(`Servidor proxy rodando na porta ${PORT}`);
  });
}

export default router;