/**
 * Serviço para chamadas à API externas
 * Concentra todas as funções de requisição e parsing de dados
 */
import axios from "axios";
import * as cheerio from "cheerio";
import { CONFIG } from "../../config/config.js";
import { parseFirstTable } from "../../utils/utils.js";

/**
 * Classe responsável por fazer chamadas à API e processar os dados recebidos
 */
export class ApiService {
  /**
   * Busca o HTML de uma página do Liquipedia
   */
  public async fetchPageHTML(page: string): Promise<string> {
    try {
      // Se não estiver usando proxy, lança erro
      if (!CONFIG.LIQUIPEDIA.USE_PROXY) {
        console.log(`⚠️ Proxy desativado para: ${page}`);
        throw new Error(`Dados reais não disponíveis para: ${page}`);
      }
      
      // Se estiver usando proxy, faz a requisição real
      console.log(`🌐 Requisitando HTML da página ${page} via proxy: ${CONFIG.LIQUIPEDIA.PROXY_URL}`);
      const res = await axios.get(CONFIG.LIQUIPEDIA.PROXY_URL, {
        params: { page },
        timeout: 5000,
      });
      
      console.log(`📥 Resposta recebida do proxy para ${page}:`, 
        res.status, 
        res.data ? 'Dados recebidos' : 'Sem dados', 
        res.data?.html ? 'Com HTML' : 'Sem HTML'
      );
      
      if (res.data?.html) {
        console.log(`✅ HTML obtido para ${page}:`, res.data.html.substring(0, 100) + '...');
        return res.data.html;
      }
      
      throw new Error("Formato de resposta inválido");
    } catch (error) {
      console.error(`❌ Erro ao buscar página ${page}:`, error);
      throw new Error(`Não foi possível obter dados para ${page}`);
    }
  }

  /**
   * Faz scraping de uma página web usando Axios
   */
  public async fetchWebPage(url: string): Promise<string> {
    try {
      console.log(`🌐 Requisitando página web: ${url}`);
      
      // Verifica se a URL é do Draft5.gg e se o proxy está ativado
      if (url.includes("draft5.gg") && CONFIG.DRAFT5.USE_PROXY) {
        console.log(`🔄 Usando proxy para Draft5.gg: ${CONFIG.DRAFT5.PROXY_URL}`);
        const response = await axios.get(CONFIG.DRAFT5.PROXY_URL, {
          params: { url },
          timeout: 5000,
        });
        
        if (response.data?.html) {
          console.log(`✅ HTML obtido via proxy para ${url}`);
          return response.data.html;
        }
        
        throw new Error("Formato de resposta inválido do proxy do Draft5");
      }
      
      // Para outras URLs, faz a requisição direta
      const response = await axios.get(url, {
        timeout: 5000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });
      
      console.log(`📥 Resposta recebida para ${url}:`, 
        response.status, 
        response.data ? 'Dados recebidos' : 'Sem dados',
        typeof response.data === 'string' ? `Tamanho: ${response.data.length} caracteres` : 'Não é string'
      );
      
      if (typeof response.data === 'string') {
        console.log(`✅ HTML obtido para ${url}:`, response.data.substring(0, 100) + '...');
      }
      
      return response.data;
    } catch (error) {
      console.error(`❌ Erro ao fazer scraping da página ${url}:`, error);
      throw error;
    }
  }

  /**
   * Faz scraping de uma página web usando o proxy com Puppeteer
   */
  public async fetchWebPageWithPuppeteerProxy(url: string): Promise<string> {
    try {
      console.log(`🌐 Requisitando página web com Puppeteer via proxy: ${url}`);
      
      // Usa a nova rota do proxy com Puppeteer
      const puppeteerProxyUrl = CONFIG.DRAFT5.PROXY_URL.replace('/draft5', '/draft5/puppeteer');
      console.log(`🔄 Usando proxy Puppeteer: ${puppeteerProxyUrl}`);
      
      const response = await axios.get(puppeteerProxyUrl, {
        params: { url },
        timeout: 30000, // Timeout mais longo para processar o JavaScript
      });
      
      if (response.data?.html) {
        console.log(`✅ HTML renderizado obtido via proxy Puppeteer para ${url}`);
        return response.data.html;
      }
      
      throw new Error("Formato de resposta inválido do proxy Puppeteer");
    } catch (error) {
      console.error(`❌ Erro ao fazer scraping da página com Puppeteer: ${error}`);
      throw error;
    }
  }

  /**
   * Processa HTML para obter próximas partidas
   */
  public async parseNextMatches(html: string): Promise<string> {
    console.log(`🔍 Iniciando parsing de próximas partidas. Tamanho do HTML: ${html.length} caracteres`);
    
    const $ = cheerio.load(html);
    
    // Buscar diretamente a div específica usando o seletor de classe exato
    const contentContainer = $('div.id__ContentContainer-sc-1x9brse-2');
    console.log(`🔍 Elemento div.id__ContentContainer-sc-1x9brse-2 encontrado: ${contentContainer.length > 0 ? 'Sim' : 'Não'}`);
    
    if (contentContainer.length > 0) {
      // Obter o HTML completo do container encontrado
      const containerHtml = contentContainer.html();
      console.log(`✅ HTML do container encontrado com tamanho: ${containerHtml ? containerHtml.length : 0} caracteres`);
      
      // Retorna o HTML completo, não formatado
      return containerHtml || "Container vazio.";
    }
    
    // Se não encontrar pelo seletor exato, tenta buscar usando atributo parcial
    const contentContainerAlt = $('div[class*="id__ContentContainer"]');
    console.log(`🔍 Elemento div[class*="id__ContentContainer"] encontrado: ${contentContainerAlt.length > 0 ? 'Sim' : 'Não'}`);
    
    if (contentContainerAlt.length > 0) {
      // Obter o HTML completo do container encontrado
      const containerHtmlAlt = contentContainerAlt.html();
      console.log(`✅ HTML do container alternativo encontrado com tamanho: ${containerHtmlAlt ? containerHtmlAlt.length : 0} caracteres`);
      
      // Retorna o HTML completo, não formatado
      return containerHtmlAlt || "Container alternativo vazio.";
    }
    
    // Se nenhum dos métodos acima funcionar, tenta buscar no HTML completo
    console.log(`⚠️ Tentando encontrar a estrutura diretamente no HTML...`);
    
    // Usar regex para encontrar a div completa
    const divRegex = /<div\s+class="id__ContentContainer[^"]*"[^>]*>([\s\S]*?)<\/div>/;
    const divMatch = html.match(divRegex);
    
    if (divMatch && divMatch[0]) {
      console.log(`✅ HTML encontrado via regex com tamanho: ${divMatch[0].length} caracteres`);
      return divMatch[0];
    }
    
    console.log(`❌ Não foi possível encontrar o container específico.`);
    return "Não foi possível encontrar o conteúdo HTML do container de próximas partidas.";
  }

  /**
   * Busca e processa os jogadores ativos da equipe FURIA
   */
  public async fetchPlayers(): Promise<string> {
    try {
      const html = await this.fetchPageHTML("FURIA");
      const tableData = parseFirstTable(
        html,
        ".table-responsive.roster-card-wrapper table.roster-card"
      );
      return tableData;
    } catch (error) {
      console.error("Erro ao buscar jogadores:", error);
      throw error;
    }
  }

  /**
   * Busca e processa os resultados recentes da equipe FURIA
   */
  public async fetchResults(): Promise<string> {
    try {
      const html = await this.fetchPageHTML("FURIA/Matches");
      const tableData = parseFirstTable(html, "table");
      return tableData;
    } catch (error) {
      console.error("Erro ao buscar resultados:", error);
      throw error;
    }
  }

  /**
   * Busca e processa as próximas partidas da equipe FURIA
   */
  public async fetchNextMatches(): Promise<string> {
    try {
      const url = "https://draft5.gg/equipe/330-FURIA/proximas-partidas";
      
      // Usa o proxy com Puppeteer para obter o HTML com JavaScript renderizado
      console.log(`🔄 Obtendo próximas partidas com proxy Puppeteer para garantir carregamento dinâmico`);
      const html = await this.fetchWebPageWithPuppeteerProxy(url);
      
      // Processa o HTML para extrair o conteúdo relevante
      return await this.parseNextMatches(html);
    } catch (error) {
      console.error("Erro ao buscar próximas partidas:", error);
      throw error;
    }
  }
}

// Exporta uma instância única do serviço para ser compartilhada
export const apiService = new ApiService();