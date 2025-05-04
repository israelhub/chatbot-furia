// filepath: c:\Users\Pc\Desktop\furia-bot\src\services\ServiceInitializer.ts
/**
 * Inicializador de serviços do FuriaBot
 * Garante a inicialização na ordem correta para evitar dependências circulares
 * Implementa o padrão de design Factory Method para inicialização de serviços
 */
import { CacheService } from './CacheService.js';
import { aiService } from './AIService.js';
import { botCore } from './BotCore.js';
import { DataService } from './data/DataService.ts';
import { CONFIG } from '../config/config.js';
import { AIProvider, AIServiceConfig } from '../types/index.js';

// ======================================================================
// FACTORY DE INICIALIZAÇÃO DE SERVIÇOS
// Adicione novos serviços aqui quando necessário
// ======================================================================

/**
 * Classe Factory para inicialização de serviços
 * Implementa o padrão Singleton para garantir inicialização única
 */
export class ServiceInitializer {
  private static instance: ServiceInitializer;
  private servicesInitialized: boolean = false;
  
  // Referências para os serviços principais
  private cacheService: CacheService;
  private dataService: DataService;
  
  private constructor() {
    this.cacheService = CacheService.getInstance();
    this.dataService = new DataService(this.cacheService); // Inicializando dataService no construtor
  }
  
  /**
   * Obtém a instância única do inicializador de serviços
   */
  public static getInstance(): ServiceInitializer {
    if (!ServiceInitializer.instance) {
      ServiceInitializer.instance = new ServiceInitializer();
    }
    return ServiceInitializer.instance;
  }
  
  /**
   * Inicializa todos os serviços na ordem correta
   * Deve ser chamado antes de qualquer uso dos serviços
   */
  public initialize(): void {
    if (this.servicesInitialized) {
      console.log('ℹ️ Serviços já foram inicializados anteriormente.');
      return;
    }
    
    console.log('🚀 Inicializando serviços do FuriaBot...');
    
    try {
      // Etapa 1: Inicializar os serviços básicos
      this.initializeBasicServices();
      
      // Etapa 2: Configurar serviços dependentes
      this.configureDependentServices();
      
      // Etapa 3: Aplicar configurações customizadas do arquivo config.ts
      this.applyCustomConfigurations();
      
      this.servicesInitialized = true;
      console.log('✅ Serviços do FuriaBot inicializados com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao inicializar serviços:', error);
      throw new Error(`Falha na inicialização dos serviços: ${error}`);
    }
  }
  
  /**
   * Inicializa os serviços básicos primeiros (sem dependências)
   */
  private initializeBasicServices(): void {
    // Etapa 1: CacheService já foi inicializado no construtor
    console.log('📦 CacheService inicializado (singleton)');
    
    // Etapa 2: DataService depende do CacheService
    console.log('📊 DataService inicializado');
  }
  
  /**
   * Configura serviços que dependem de outros serviços
   */
  private configureDependentServices(): void {
    // Injeta o CacheService no AIService
    aiService.setCacheService(this.cacheService);
    console.log('🧠 CacheService injetado no AIService');
    
    // Injeta o DataService no AIService
    aiService.setDataProvider(this.dataService);
    console.log('🔄 DataProvider injetado no AIService');
    
    // Inicializa o BotCore com o DataService
    botCore.initialize(this.dataService);
    console.log('🤖 BotCore inicializado com DataService');
  }
  
  /**
   * Aplica configurações customizadas do arquivo config.ts
   */
  private applyCustomConfigurations(): void {
    // Atualiza as configurações do AIService com os valores do CONFIG
    if (CONFIG.AI) {
      const aiConfig: AIServiceConfig = {
        provider: this.convertToAIProvider(CONFIG.AI.PROVIDER),
        apiKey: CONFIG.AI.API_KEY,
        endpoint: CONFIG.AI.ENDPOINT,
        model: CONFIG.AI.MODEL,
        contextMemorySize: CONFIG.AI.CONTEXT_MEMORY_SIZE,
        defaultTemperature: CONFIG.AI.DEFAULT_TEMPERATURE,
        maxTokens: CONFIG.AI.MAX_TOKENS,
        useCache: CONFIG.AI.USE_CACHE,
        cacheTTL: CONFIG.AI.CACHE_TTL
      };
      
      aiService.updateConfig(aiConfig);
      console.log(`⚙️ AIService configurado: ${aiConfig.provider}, modelo ${aiConfig.model}`);
    }
  }
  
  /**
   * Converte o valor do enum AIProvider para o tipo correto
   */
  private convertToAIProvider(providerEnum: AIProvider): AIProvider {
    switch (providerEnum) {
      case AIProvider.OPENAI:
        return AIProvider.OPENAI;
      case AIProvider.HUGGINGFACE:
        return AIProvider.HUGGINGFACE;
      case AIProvider.GEMINI:
        return AIProvider.GEMINI;
      case AIProvider.OLLAMA:
        return AIProvider.OLLAMA;
      case AIProvider.MOCK:
        return AIProvider.MOCK;
      default:
        console.warn(`⚠️ Provedor de IA desconhecido: ${providerEnum}. Usando MOCK como fallback.`);
        return AIProvider.MOCK;
    }
  }
  
  /**
   * Retorna o serviço de cache
   */
  public getCacheService(): CacheService {
    this.ensureInitialized();
    return this.cacheService;
  }
  
  /**
   * Retorna o serviço de dados
   */
  public getDataService(): DataService {
    this.ensureInitialized();
    return this.dataService;
  }
  
  /**
   * Garante que os serviços estejam inicializados
   */
  private ensureInitialized(): void {
    if (!this.servicesInitialized) {
      this.initialize();
    }
  }
}

/**
 * Função de conveniência para acessar a instância do inicializador
 */
export function getServiceInitializer(): ServiceInitializer {
  return ServiceInitializer.getInstance();
}

/**
 * Função de conveniência para garantir inicialização
 * Pode ser chamada múltiplas vezes sem problemas
 */
export function ensureServicesInitialized(): void {
  getServiceInitializer().initialize();
}

/**
 * Função para inicializar serviços explicitamente
 * Use esta função para inicializar todos os serviços no início da aplicação
 */
export function initializeServices(): void {
  ensureServicesInitialized();
}