/**
 * BotCore: Classe principal para processamento de perguntas
 * Implementa padrões de design como Injeção de Dependência, Singleton e princípios SOLID
 */
import { CommandsService } from './commands/index.ts';
import { BotData, Message, IDataProvider, IBotCore, DataFunctions } from '../types/index.js';
import { quizManager } from '../features/QuizManager.js';
import { AIService } from './AIService.js';
import { aiService } from './AIService.js';

export class BotCore implements IBotCore {
  private static instance: BotCore;
  private commandsService: CommandsService;
  private dataProvider!: IDataProvider; // Utilizando o operador '!' para indicar que será inicializado posteriormente
  private aiService: AIService;
  private initialized: boolean = false;
  
  /**
   * Construtor privado para seguir o padrão Singleton
   */
  private constructor() {
    this.commandsService = new CommandsService();
    this.aiService = aiService;
    // O dataProvider será injetado posteriormente pelo ServiceInitializer
  }
  
  /**
   * Obtém a instância única do BotCore (Singleton)
   */
  public static getInstance(): BotCore {
    if (!BotCore.instance) {
      BotCore.instance = new BotCore();
    }
    return BotCore.instance;
  }
  
  /**
   * Inicializa o BotCore com as dependências necessárias
   */
  public initialize(dataProvider: IDataProvider): void {
    if (this.initialized) {
      console.log('ℹ️ BotCore já foi inicializado anteriormente.');
      return;
    }
    
    this.dataProvider = dataProvider;
    this.initialized = true;
    console.log(`🤖 BotCore inicializado com IA como resposta padrão e sistema de comandos`);
  }
  
  /**
   * Verifica se o BotCore foi inicializado
   */
  private ensureInitialized(): void {
    if (!this.initialized || !this.dataProvider) {
      throw new Error('BotCore não foi inicializado corretamente. Chame initialize() primeiro.');
    }
  }
  
  /**
   * Processa a pergunta do usuário conforme a lógica:
   * 1. Verifica se é um quiz ativo
   * 2. Verifica se a mensagem é um comando (começa com /)
   * 3. Se for comando, processa o comando específico
   * 4. Se for apenas "/", lista os comandos disponíveis
   * 5. Caso contrário, usa a IA para gerar uma resposta
   */
  public processarPergunta = async (pergunta: string): Promise<Message> => {
    this.ensureInitialized();
    
    try {
      // Verifica se já temos um quiz ativo
      if (this.isQuizActive()) {
        return this.processQuizAnswer(pergunta);
      }
      
      // Verifica se é um comando
      if (this.isCommand(pergunta)) {
        return this.processCommand(pergunta);
      }
      
      // Se não for um comando, processa como pergunta para a IA
      return this.processAIQuery(pergunta);
      
    } catch (erro) {
      console.error('Erro ao processar resposta:', erro);
      return this.createErrorMessage();
    }
  }
  
  /**
   * Verifica se há um quiz ativo
   */
  private isQuizActive(): boolean {
    return quizManager.isQuizActive();
  }
  
  /**
   * Processa uma resposta para o quiz
   */
  private processQuizAnswer(resposta: string): Message {
    const quizResponse = quizManager.processAnswer(resposta);
    return {
      content: quizResponse.content,
      isUser: false,
      responseButtons: quizResponse.responseButtons
    };
  }
  
  /**
   * Verifica se a mensagem é um comando
   */
  private isCommand(mensagem: string): boolean {
    return this.commandsService.isCommand(mensagem);
  }
  
  /**
   * Processa um comando
   */
  private async processCommand(comando: string): Promise<Message> {
    // Verifica se é apenas "/" para listar comandos
    if (this.commandsService.isCommandList(comando)) {
      return this.getCommandList();
    }
    
    // Busca o comando específico
    const command = this.commandsService.findCommand(comando);
    
    if (command) {
      console.log(`✅ Comando identificado: ${command.id}`);
      
      // Verifica se é o comando de quiz
      if (command.id === 'quiz') {
        return this.startQuiz();
      }
      
      // Busca os dados necessários para o comando
      const requiredData = await this.getRequiredData(command);
      
      // Formata a resposta com o comando
      const responseContent = this.commandsService.formatCommandResponse(command, requiredData);
      
      return {
        content: responseContent,
        isUser: false
      };
    }
    
    // Comando não reconhecido
    return {
      content: `Comando não reconhecido. Digite "/" para ver a lista de comandos disponíveis. 🐾 🔥`,
      isUser: false
    };
  }
  
  /**
   * Retorna a lista de comandos disponíveis
   */
  private getCommandList(): Message {
    return {
      content: this.commandsService.formatCommandResponse({
        id: 'help',
        command: '/ajuda',
        description: 'Lista todos os comandos disponíveis',
        template: 'Comandos disponíveis:\n\n{commandList}\n\nDigite um desses comandos ou faça qualquer pergunta sobre a FURIA! 🐾 🔥'
      }, {}),
      isUser: false
    };
  }
  
  /**
   * Inicia um novo quiz
   */
  private startQuiz(): Message {
    const quizOptions = quizManager.showQuizOptions();
    return {
      content: quizOptions.content,
      isUser: false,
      responseButtons: quizOptions.responseButtons
    };
  }
  
  /**
   * Processa uma pergunta usando IA
   */
  private async processAIQuery(pergunta: string): Promise<Message> {
    try {
      console.log('Enviando pergunta para IA');
      const aiResponse = await this.aiService.generateResponse(pergunta);
      
      return {
        content: aiResponse,
        isUser: false
      };
    } catch (aiError) {
      console.error('❌ Erro ao processar resposta com IA:', aiError);
      
      return {
        content: 'Desculpe, estou com dificuldades para processar sua pergunta no momento. Você pode tentar novamente ou usar um dos comandos disponíveis digitando "/" no chat. 🐾 🔥',
        isUser: false
      };
    }
  }
  
  /**
   * Cria uma mensagem de erro
   */
  private createErrorMessage(): Message {
    return {
      content: '🤖 Tive um problema para responder. Tente novamente mais tarde ou use um dos comandos disponíveis digitando "/" no chat! 🐾 🔥',
      isUser: false
    };
  }
  
  /**
   * Mapeamento dos tipos de dados para as funções correspondentes
   */
  private getDataFunctions(): DataFunctions {
    return {
      players: () => this.dataProvider.getActivePlayers(),
      results: () => this.dataProvider.getRecentResults(),
      history: () => this.dataProvider.getHistory(),
      quizResponse: async () => Promise.resolve(quizManager.startQuiz().content),
      nextMatches: () => this.dataProvider.getNextMatches(),
      lastMatch: () => this.dataProvider.getLastMatch()
    };
  }
  
  /**
   * Busca dados por tipos específicos
   */
  private async getRequiredDataByTypes(types: string[]): Promise<BotData> {
    const allData: BotData = {};
    const dataFunctions = this.getDataFunctions();
    
    // Processa todos os tipos de dados em paralelo para melhor performance
    const results = await Promise.allSettled(
      types.map(async (type) => {
        if (dataFunctions[type]) {
          try {
            const data = await dataFunctions[type]();
            return { type, data };
          } catch (error) {
            console.error(`Erro ao buscar dados do tipo ${type}:`, error);
            throw error;
          }
        }
        return null;
      })
    );
    
    // Processa os resultados
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        const { type, data } = result.value;
        allData[type] = data;
      }
    });
    
    return allData;
  }
  
  /**
   * Busca os dados necessários para o comando ou template
   */
  private async getRequiredData(commandOrTemplate: { requiresData?: string[] }): Promise<BotData> {
    // Se não requer dados específicos, retorna objeto vazio
    if (!commandOrTemplate.requiresData || commandOrTemplate.requiresData.length === 0) {
      return {};
    }
    
    return this.getRequiredDataByTypes(commandOrTemplate.requiresData);
  }
}

// Exportação da instância única do BotCore para uso global
export const botCore = BotCore.getInstance();