/**
 * Serviço de Inteligência Artificial para o FuriaBot
 * Responsável pela integração com modelos de linguagem avançados
 * Suporta múltiplos provedores de IA
 */
import axios from 'axios';
import { ISimpleCache, AIServiceConfig, AIProvider, AIRequestPayload, IDataProvider } from '../types/index.js';

// ======================================================================
// CONFIGURAÇÕES PADRÃO DO SERVIÇO DE IA 
// Modifique estas constantes para alterar o comportamento padrão
// ======================================================================
const DEFAULT_CONFIG: AIServiceConfig = {
  provider: AIProvider.GEMINI,
  apiKey: "",
  endpoint: "",
  model: "gemini-2.0-flash",
  contextMemorySize: 5,
  defaultTemperature: 0.7,
  maxTokens: 300,
  useCache: true,
  cacheTTL: 3600 * 24 // 24 horas
};

// Mapeamento de modelos recomendados para cada provedor
// Adicione novos modelos aqui conforme necessário
const MODEL_MAP = {
  [AIProvider.OPENAI]: ["gpt-3.5-turbo", "gpt-4", "gpt-4o"],
  [AIProvider.HUGGINGFACE]: ["meta-llama/Llama-2-7b-chat-hf", "mistralai/Mistral-7B-Instruct-v0.2"],
  [AIProvider.GEMINI]: ["gemini-2.0-flash", "gemini-2.0-pro"],
  [AIProvider.OLLAMA]: ["llama2", "mistral", "gemma"],
  [AIProvider.MOCK]: ["mock-model"] // Adicionando provedor MOCK
};

// Mapeamento de endpoints padrão para cada provedor
const ENDPOINT_MAP = {
  [AIProvider.OPENAI]: 'https://api.openai.com/v1/chat/completions',
  [AIProvider.HUGGINGFACE]: 'https://api-inference.huggingface.co/models/',
  [AIProvider.GEMINI]: 'https://generativelanguage.googleapis.com/v1beta/models/',
  [AIProvider.OLLAMA]: 'http://localhost:11434/api/generate',
  [AIProvider.MOCK]: 'http://localhost:0000/mock' // Adicionando endpoint mock
};

export class AIService {
  private cacheService: ISimpleCache | null = null;
  private conversationHistory: string[] = [];
  private config: AIServiceConfig;
  private dataProvider: IDataProvider | null = null;
  
  constructor(config: Partial<AIServiceConfig> = {}) {
    // Inicia com as configurações padrão sem dependência do CONFIG
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    console.log(`🤖 AIService inicializado usando provedor: ${this.config.provider}`);
  }
  
  /**
   * Método para atualizar a configuração da IA com os valores do CONFIG
   * Este método deve ser chamado após a inicialização para evitar dependência circular
   */
  public updateConfig(config: Partial<AIServiceConfig>): void {
    this.config = { ...this.config, ...config };
    console.log(`🔄 AIService reconfigurado: ${this.config.provider}, modelo: ${this.config.model}`);
  }
  
  /**
   * Método para injetar o serviço de cache após a inicialização
   * Isso evita a dependência circular
   */
  public setCacheService(cacheService: ISimpleCache): void {
    this.cacheService = cacheService;
  }
  
  /**
   * Método para injetar o provedor de dados após a inicialização
   * Isso evita a dependência circular
   */
  public setDataProvider(dataProvider: IDataProvider): void {
    this.dataProvider = dataProvider;
    console.log('📊 DataProvider configurado no AIService');
  }
  
  /**
   * Retorna o endpoint padrão baseado no provedor
   */
  public getDefaultEndpoint(provider?: AIProvider): string {
    const useProvider = provider || this.config.provider;
    return ENDPOINT_MAP[useProvider] || ENDPOINT_MAP[AIProvider.GEMINI];
  }
  
  /**
   * Retorna o modelo padrão baseado no provedor
   */
  public getDefaultModel(provider?: AIProvider): string {
    const useProvider = provider || this.config.provider;
    const models = MODEL_MAP[useProvider] || MODEL_MAP[AIProvider.GEMINI];
    return models[0]; // Retorna o primeiro modelo na lista (o recomendado)
  }

  /**
   * Retorna os modelos disponíveis para um provedor específico
   * Útil para interfaces que permitem seleção de modelo
   */
  public getAvailableModels(provider?: AIProvider): string[] {
    const useProvider = provider || this.config.provider;
    return MODEL_MAP[useProvider] || [];
  }
  
  /**
   * Gera uma resposta utilizando IA com base na pergunta do usuário
   */
  public async generateResponse(userQuery: string, context?: string): Promise<string> {
    const cacheKey = `ai_response:${userQuery}`;
    
    // Verifica se há resposta em cache (se o cache estiver disponível)
    if (this.config.useCache && this.cacheService) {
      const cachedResponse = this.cacheService.getCachedData(cacheKey) as string;
      if (cachedResponse) {
        console.log(`🧠 Usando resposta em cache para: "${userQuery.substring(0, 30)}..."`);
        return cachedResponse;
      }
    }
    
    try {
      // Mantém histórico da conversa para contexto
      this.updateConversationHistory(userQuery);
      
      // Prepara o contexto para a IA incluindo dados sobre a FURIA
      console.log('Context adicional recebido:', context);
      
      // Se o context já contiver dados, vamos evitar duplicação
      const enrichedContext = await this.prepareContext(context);
      
      // Chama a API de IA
      const prompt = this.buildPrompt(userQuery, enrichedContext);
      
      // Verifica se há dados duplicados com rótulos em inglês
      if (prompt.includes('PLAYERS:') || prompt.includes('RESULTS:') || 
          prompt.includes('HISTORY:') || prompt.includes('LASTMATCH:')) {
        console.warn('⚠️ Detectada possível duplicação de dados no prompt com rótulos em inglês');
      }
      
      const response = await this.callAIAPI({
        prompt,
        maxTokens: this.config.maxTokens,
        temperature: this.config.defaultTemperature
      });
      
      // Formata e valida a resposta
      const formattedResponse = this.formatResponse(response);
      
      // Atualiza o histórico com a resposta
      this.updateConversationHistory(formattedResponse, false);
      
      // Armazena em cache (se o cache estiver disponível)
      if (this.config.useCache && this.cacheService) {
        this.cacheService.setCachedData(cacheKey, formattedResponse, this.config.cacheTTL);
      }
      
      return formattedResponse;
    } catch (error) {
      console.error('Erro ao gerar resposta com IA:', error);
      // Fallback para método tradicional em caso de erro
      return this.generateFallbackResponse(userQuery);
    }
  }
  
  // ======================================================================
  // CUSTOMIZAÇÃO DO PROMPT - PERSONALIZE AQUI
  // Modifique esta função para ajustar o comportamento do bot
  // ======================================================================
  private buildPrompt(userQuery: string, context: string): string {
    // Adicionando log do contexto completo para depuração
    console.log('🧠 Contexto completo enviado para IA:', context);
    
    return `Você é um BOT oficial da equipe FURIA de CS:GO. Use linguagem casual e amigável, com estilo amistoso de fã. Evite ser muito aleatório.
    
Contexto sobre a FURIA para suas respostas:
${context}

Histórico de conversa:
${this.conversationHistory.join('\n')}

Regras importantes:
1. Priorize informações do contexto fornecido
2. Seja preciso ao falar sobre jogadores, partidas e história da FURIA
3. Use emojis 🐾 e 🔥 ocasionalmente para representar a FURIA
4. Se você não souber a resposta com base no contexto, diga que não tem essa informação no momento
5. Mantenha respostas concisas (máximo 3-4 parágrafos)
6. Não invente informações que não estejam no contexto
7. Lembre-se que o usuário pode usar comandos iniciando com "/" para acessar informações específicas, para saber todos os comandos pode usar "/ajuda"
8. Quando se referir ao usuário, use "Furioso(a)"
9. Evite usar saudações como "E ai", "Oi", "Olá", "Fala" ou "Salve" em todas as respostas, principalmente se já houver uma conversa anterior
10. Caso o usuario pergunte sobre a historia da furia responda exatamente o que está no contexto, sem adicionar mais informações ou fazer comparações com outros times

Comandos disponíveis:
- /ajuda - Lista todos os comandos disponíveis

Pergunta do usuário: ${userQuery}

Sua resposta (em português):`;
  }
  
  /**
   * Prepara o contexto para a IA com informações sobre a FURIA obtidas em tempo real
   */
  private async prepareContext(additionalContext?: string): Promise<string> {
    // Verifica se o DataProvider está configurado
    if (!this.dataProvider) {
      console.warn('⚠️ DataProvider não configurado no AIService. Usando contexto mínimo.');
      return additionalContext || 'Sem informações contextuais disponíveis.';
    }
    
    try {
      // Coleta dados em tempo real usando o DataProvider
      const [players, results, lastMatch, history, nextMatches] = await Promise.allSettled([
        this.dataProvider.getActivePlayers(),
        this.dataProvider.getRecentResults(),
        this.dataProvider.getLastMatch(),
        this.dataProvider.getHistory(),
        this.dataProvider.getNextMatches()
      ]);
      
      // Constrói o contexto combinando todas as informações disponíveis
      const baseContext = `
INFORMAÇÕES SOBRE JOGADORES ATUAIS:
${players.status === 'fulfilled' ? players.value : 'Informações de jogadores indisponíveis no momento.'}

RESULTADOS RECENTES:
${results.status === 'fulfilled' ? results.value : 'Resultados recentes indisponíveis no momento.'}

ÚLTIMO JOGO:
${lastMatch.status === 'fulfilled' ? lastMatch.value : 'Informações do último jogo indisponíveis no momento.'}

HISTÓRIA DA FURIA:
${history.status === 'fulfilled' ? history.value : 'História da FURIA indisponível no momento.'}

PRÓXIMAS PARTIDAS:
${nextMatches.status === 'fulfilled' ? nextMatches.value : 'Próximas partidas indisponíveis no momento.'}
`;

      return additionalContext ? `${baseContext}\n\n${additionalContext}` : baseContext;
    } catch (error) {
      console.error('Erro ao preparar contexto a partir do DataProvider:', error);
      return additionalContext || 'Contexto indisponível devido a erro na obtenção de dados.';
    }
  }
  
  /**
   * Atualiza o histórico de conversa para fornecer contexto à IA
   */
  private updateConversationHistory(message: string, isUser: boolean = true): void {
    const formattedMessage = isUser ? `Usuário: ${message}` : `Bot: ${message}`;
    this.conversationHistory.push(formattedMessage);
    
    // Limita o tamanho do histórico para não exceder o contexto
    if (this.conversationHistory.length > this.config.contextMemorySize * 2) {
      // Remove as mensagens mais antigas, mantendo o par pergunta/resposta
      this.conversationHistory = this.conversationHistory.slice(2);
    }
  }
  
  // ======================================================================
  // INTEGRAÇÕES COM PROVEDORES DE IA - ADICIONE NOVOS PROVEDORES AQUI
  // ======================================================================
  /**
   * Chama a API de IA com as configurações adequadas, suportando múltiplas APIs
   */
  private async callAIAPI(payload: AIRequestPayload): Promise<string> {
    if (this.config.provider === AIProvider.MOCK || 
        (this.config.provider !== AIProvider.OLLAMA && !this.config.apiKey)) {
      console.log('🧪 Modo de simulação de IA ativado');
      return this.simulateAIResponse(payload.prompt);
    }
    
    try {
      // Delegação para o método específico do provedor
      const providerHandlers = {
        [AIProvider.OPENAI]: this.callOpenAI.bind(this),
        [AIProvider.HUGGINGFACE]: this.callHuggingFace.bind(this),
        [AIProvider.GEMINI]: this.callGemini.bind(this),
        [AIProvider.OLLAMA]: this.callOllama.bind(this)
        // Adicione novos provedores aqui seguindo o mesmo padrão
      };
      
      const handler = providerHandlers[this.config.provider];
      if (!handler) {
        throw new Error(`Provedor de IA não suportado: ${this.config.provider}`);
      }
      
      return handler(payload);
    } catch (error) {
      console.error(`Erro ao chamar API de IA (${this.config.provider}):`, error);
      throw error;
    }
  }
  
  /**
   * Chamada à API da OpenAI (paga)
   */
  private async callOpenAI(payload: AIRequestPayload): Promise<string> {
    const response = await axios.post(
      this.config.endpoint || this.getDefaultEndpoint(AIProvider.OPENAI),
      {
        model: this.config.model || this.getDefaultModel(AIProvider.OPENAI),
        messages: [{ role: "user", content: payload.prompt }],
        max_tokens: payload.maxTokens,
        temperature: payload.temperature
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        timeout: 10000
      }
    );
    
    return response.data.choices[0].message.content;
  }
  
  /**
   * Chamada à API do Hugging Face (tem cota gratuita)
   */
  private async callHuggingFace(payload: AIRequestPayload): Promise<string> {
    const fullEndpoint = `${this.config.endpoint || this.getDefaultEndpoint(AIProvider.HUGGINGFACE)}${this.config.model || this.getDefaultModel(AIProvider.HUGGINGFACE)}`;
    const response = await axios.post(
      fullEndpoint,
      { inputs: payload.prompt, parameters: { temperature: payload.temperature, max_new_tokens: payload.maxTokens } },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        timeout: 30000
      }
    );
    
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data[0].generated_text || '';
    } else if (response.data.generated_text) {
      return response.data.generated_text;
    }
    
    return JSON.stringify(response.data);
  }
  
  /**
   * Chamada à API do Google Gemini (tem cota gratuita)
   */
  private async callGemini(payload: AIRequestPayload): Promise<string> {
    const modelToUse = this.config.model || this.getDefaultModel(AIProvider.GEMINI);
    const fullEndpoint = `${this.config.endpoint || this.getDefaultEndpoint(AIProvider.GEMINI)}${modelToUse}:generateContent?key=${this.config.apiKey}`;
    
    console.log(`🔄 Enviando requisição para Gemini - Endpoint: ${fullEndpoint.split('?key=')[0]}`);
    console.log(`🔑 Chave API configurada: ${this.config.apiKey ? 'Sim (primeiros 5 caracteres: ' + this.config.apiKey.substring(0, 5) + '...)' : 'Não'}`);
    
    try {
      console.log(`📤 Enviando prompt para Gemini (tamanho: ${payload.prompt.length} caracteres)`);
      
      const response = await axios.post(
        fullEndpoint,
        {
          contents: [{ 
            parts: [{ text: payload.prompt }] 
          }],
          generationConfig: {
            temperature: payload.temperature,
            maxOutputTokens: payload.maxTokens,
            topP: 0.8,
            topK: 40
          }
        },
        { 
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log(`📥 Resposta recebida do Gemini (status: ${response.status})`);
      
      if (response.data.candidates && response.data.candidates.length > 0) {
        const candidate = response.data.candidates[0];
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          const responseText = candidate.content.parts[0].text || '';
          console.log(`✅ Texto extraído com sucesso (tamanho: ${responseText.length} caracteres)`);
          return responseText;
        }
      }
      
      console.error('Resposta do Gemini não contém o formato esperado:', JSON.stringify(response.data));
      throw new Error('Formato de resposta do Gemini inválido');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`❌ Erro na chamada à API do Gemini: ${error.message}`);
        if (error.response) {
          console.error('Detalhes do erro:', JSON.stringify(error.response.data));
          
          if (error.response.status === 400) {
            console.error('Possível erro no formato da requisição');
          } else if (error.response.status === 401 || error.response.status === 403) {
            console.error('Problema de autenticação - verifique sua chave API');
          } else if (error.response.status === 404) {
            console.error('Modelo não encontrado - o nome do modelo pode estar incorreto');
          }
        } else if (error.request) {
          console.error('Sem resposta do servidor Gemini - possível problema de rede ou timeout');
        }
      } else {
        console.error('Erro desconhecido ao chamar Gemini:', error);
      }
      throw error;
    }
  }
  
  /**
   * Chamada à API do Ollama (local, gratuita)
   */
  private async callOllama(payload: AIRequestPayload): Promise<string> {
    const response = await axios.post(
      this.config.endpoint || this.getDefaultEndpoint(AIProvider.OLLAMA),
      {
        model: this.config.model || this.getDefaultModel(AIProvider.OLLAMA),
        prompt: payload.prompt,
        options: {
          temperature: payload.temperature,
          num_predict: payload.maxTokens
        }
      },
      { timeout: 30000 }
    );
    
    return response.data.response || '';
  }
  
  // ======================================================================
  // FORMATAÇÃO E FALLBACK DE RESPOSTAS
  // ======================================================================
  /**
   * Formata e valida a resposta da IA
   */
  private formatResponse(rawResponse: string): string {
    let response = rawResponse.trim();
    
    if (!response.includes('🐾') && !response.includes('🔥')) {
      response += ' 🐾 🔥';
    }
    
    return response;
  }
  
  /**
   * Gera uma resposta simulada para testes ou quando a API não está disponível
   */
  private simulateAIResponse(prompt: string): string {
    console.log('Simulando resposta da IA para prompt:', prompt.substring(0, 100) + '...');
    
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('jogadores') || lowerPrompt.includes('lineup') || lowerPrompt.includes('elenco')) {
      return `O elenco atual da FURIA conta com jogadores incríveis como KSCERATO, yuurih, FalleN, molodoy e YEKINDAR. Cada um deles traz habilidades únicas para o time! 🐾 🔥`;
    }
    
    if (lowerPrompt.includes('últimas partidas') || lowerPrompt.includes('resultados') || lowerPrompt.includes('jogos recentes')) {
      return `Nos últimos jogos, a FURIA enfrentou desafios importantes! Tivemos algumas vitórias e derrotas, com destaque para o último jogo contra a NAVI, que foi muito disputado. Continue acompanhando para ver a evolução do time! 🐾 🔥`;
    }
    
    if (lowerPrompt.includes('história') || lowerPrompt.includes('fundação') || lowerPrompt.includes('trajetória')) {
      return `A FURIA tem uma história incrível no cenário de CS:GO! Fundada em 2017, a organização rapidamente se destacou com seu estilo de jogo agressivo e inovador. Desde então, conquistou seu espaço no cenário mundial com grandes momentos em torneios importantes. A chegada de FalleN em 2023 trouxe ainda mais experiência para o time! 🐾 🔥`;
    }
    
    return `Obrigado pela sua pergunta sobre a FURIA! Estamos sempre evoluindo e buscando representar o Brasil da melhor forma possível nos torneios internacionais. Posso te ajudar com informações sobre jogadores, resultados recentes ou a história do time. O que mais você gostaria de saber? 🐾 🔥`;
  }
  
  /**
   * Gera uma resposta de fallback usando o método tradicional
   */
  private async generateFallbackResponse(userQuery: string): Promise<string> {
    if (this.dataProvider) {
      try {
        if (userQuery.toLowerCase().includes('jogadores')) {
          const players = await this.dataProvider.getActivePlayers();
          return `O elenco atual da FURIA é:\n\n${players}\n\nEsse é o nosso esquadrão! 🐾 🔥`;
        }
        
        if (userQuery.toLowerCase().includes('resultados')) {
          const results = await this.dataProvider.getRecentResults();
          return `Aqui estão os resultados recentes da FURIA no CS:GO:\n\n${results}\n\nSempre na torcida pelo nosso esquadrão! 🐾 🔥`;
        }
        
        if (userQuery.toLowerCase().includes('história')) {
          const history = await this.dataProvider.getHistory();
          return `${history}\n\nSomos FURIA! 🐾 🔥`;
        }
        
        if (userQuery.toLowerCase().includes('próximo') || userQuery.toLowerCase().includes('agenda')) {
          const nextMatches = await this.dataProvider.getNextMatches();
          return `Próximos jogos da FURIA:\n\n${nextMatches}\n\nVamos torcer juntos! 🐾 🔥`;
        }
        
        if (userQuery.toLowerCase().includes('último jogo')) {
          const lastMatch = await this.dataProvider.getLastMatch();
          return `Último jogo da FURIA:\n\n${lastMatch}\n\nSempre apoiando nosso time! 🐾 🔥`;
        }
      } catch (error) {
        console.error('Erro ao gerar resposta de fallback com DataProvider:', 
          error instanceof Error ? error.message : 'Erro desconhecido');
      }
    }
    
    return 'Desculpe, estou com problemas para processar sua pergunta. Tente novamente ou pergunte sobre jogadores, resultados ou história da FURIA! 🐾 🔥';
  }
  
  /**
   * Limpa o histórico de conversa
   */
  public clearConversationHistory(): void {
    this.conversationHistory = [];
  }
}

// Exporta uma instância singleton para uso global
const aiServiceInstance = new AIService();
export { aiServiceInstance as aiService };