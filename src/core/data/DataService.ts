/**
 * Serviço para obtenção e gerenciamento de dados do FuriaBot
 * Implementa padrão de design Factory para fontes de dados
 */
import { CacheService } from "../CacheService.ts";
import { formatMatchResults, formatPlayerInfo, formatNextMatches, getReadableDataTypeName } from "../../utils/utils.ts";
import { IDataProvider, DataType } from "../../types/index.ts";
import { apiService } from "./ApiService.ts";

// ======================================================================
// DADOS ESTÁTICOS
// Dados que não precisam ser buscados dinamicamente
// ======================================================================


export const STATIC_DATA = {
  HISTORY: "A história da FURIA no CS:GO é marcada por garra, inovação e muita paixão! 🐾🎯 Fundada em 2017 por André Akkari, Jaime Pádua e Cris Guedes, a FURIA nasceu em Uberlândia-MG com a missão de colocar o Brasil no topo do cenário internacional. A equipe rapidamente se destacou pelo seu estilo de jogo agressivo e ousado. Em 2018, a dedicação começou a dar frutos, e em 2019 a FURIA conquistou seu espaço no cenário mundial, alcançando o Top 5 do ranking da HLTV e brilhando em torneios como DreamHack Masters e ECS Finals. Com nomes como KSCERATO, yuurih e arT, o time se consolidou como uma das potências do CS:GO. Desde então, a FURIA segue evoluindo, investindo em novos talentos e emocionando torcidas. 🔥🏆"
};

export class DataService implements IDataProvider {
  private cacheService: CacheService;

  constructor(cacheService = CacheService.getInstance()) {
    this.cacheService = cacheService;
  }

  /**
   * Busca dados com cache, atualizando se necessário
   */
  private async fetchDataWithCache(
    type: DataType,
    fetchFunction: () => Promise<string>
  ): Promise<string> {
    if (!this.cacheService.isCacheValid(type)) {
      console.log(`🔄 Atualizando dados: ${type}...`);
      try {
        // Busca os dados reais
        console.log(`🌐 Buscando dados reais para ${type}...`);
        const data = await fetchFunction();
        console.log(`✅ Dados reais obtidos para ${type}:`, data);
        this.cacheService.setCachedData(type, data);
        return data;
      } catch (error) {
        console.error(`❌ Erro ao buscar ${type}:`, error);
        const existingCache = this.cacheService.getCachedData(type);
        
        if (existingCache) {
          console.log(`🔄 Usando dados em cache para ${type}:`, existingCache);
          return existingCache as string;
        }
        
        // Sem cache - retorna mensagem de erro
        console.log(`❌ Dados não encontrados para ${type}.`);
        return `Dados de ${getReadableDataTypeName(type)} não encontrados.`;
      }
    }
    
    const cachedData = this.cacheService.getCachedData(type) as string;
    console.log(`💾 Usando dados em cache válidos para ${type}:`, cachedData);
    return cachedData || `Dados de ${getReadableDataTypeName(type)} indisponíveis.`;
  }


  // ======================================================================
  // MÉTODOS DE BUSCA DE DADOS - Implementações de IDataProvider
  // ======================================================================
  /**
   * Busca informações sobre jogadores ativos
   */
  public async getActivePlayers(): Promise<string> {
    return this.fetchDataWithCache(DataType.PLAYERS, async () => {
      const data = await apiService.fetchPlayers();
      return formatPlayerInfo(data);
    });
  }

  /**
   * Busca resultados recentes de partidas
   */
  public async getRecentResults(): Promise<string> {
    return this.fetchDataWithCache(DataType.RESULTS, async () => {
      const data = await apiService.fetchResults();
      return formatMatchResults(data);
    });
  }

  /**
   * Busca apenas o último jogo da FURIA
   */
  public async getLastMatch(): Promise<string> {
    return this.fetchDataWithCache(DataType.LAST_MATCH, async () => {
      const data = await apiService.fetchResults();
      
      try {
        // Parseamos o JSON para obter apenas o primeiro resultado
        const parsedData = JSON.parse(data);
        const { rows } = parsedData;
        
        if (rows && rows.length > 0) {
          // Criamos um novo objeto com apenas a primeira linha para formatação
          const singleMatchData = JSON.stringify({ 
            headers: parsedData.headers, 
            rows: [rows[0]] 
          });
          
          return formatMatchResults(singleMatchData);
        }
        throw new Error("Nenhum jogo encontrado");
      } catch (error) {
        console.error('Erro ao formatar último jogo:', error);
        return "Não foi possível encontrar informações sobre o último jogo da FURIA.";
      }
    });
  }

  /**
   * Retorna histórico da FURIA
   * Usa dados estáticos pré-definidos
   */
  public async getHistory(): Promise<string> {
    // Retorna diretamente o dado estático, sem cache
    return STATIC_DATA.HISTORY;
  }

  /**
   * Busca as próximas partidas da FURIA
   */
  public async getNextMatches(): Promise<string> {
    return this.fetchDataWithCache(DataType.NEXT_MATCHES, async () => {
      const htmlData = await apiService.fetchNextMatches();
      return formatNextMatches(htmlData);
    });
  }
}