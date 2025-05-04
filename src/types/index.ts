import { RefObject } from "react";

/**
 * Tipos compartilhados para todo o projeto
 */

// Enum para os tipos de dados disponíveis
export enum DataType {
  PLAYERS = "players",
  RESULTS = "results",
  HISTORY = "history",
  NEXT_MATCHES = "nextMatches",
  LAST_MATCH = "lastMatch"
}

// Interface para dados de próximas partidas
export interface Team {
  name: string;
  logo: string;
  score: string;
}

export interface Match {
  date: string;
  time: string;
  team1: Team;
  team2: Team;
  format: string;
  tournament: string;
  url: string;
}

// Interfaces para o cache
export interface DataCache {
  [category: string]: unknown;
}

export interface LastFetch {
  [category: string]: number;
}

// Interface para templates de resposta
export interface ResponseTemplate {
  id: string;
  keywords: string[];
  template: string;
  requiresData?: string[];
  priority?: number;
}

// Interface para o bot
export interface BotData {
  [key: string]: string;
}

// Interface para botões de opções de resposta
export interface ResponseButton {
  text: string;
  value: string;
  action?: () => void;
}

// Interface para mensagens na UI
export interface Message {
  content: string;
  isUser: boolean;
  responseButtons?: ResponseButton[];
}

// Configurações do chat
export interface ChatConfig {
  maxMessages?: number;
  initialMessages?: Message[];
}

// Definição do estado do chat
export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  showIntro: boolean;
  quizActive?: boolean;
  currentQuizQuestion?: number;
  quizScore?: number;
}

// Interface para as configurações
export interface CacheConfig {
  DURATION_MS: number;
}

export interface LiquipediaConfig {
  API_URL: string;
  USER_AGENT: string;
  PROXY_URL: string;
  USE_PROXY: boolean;
  USE_MOCK_DATA: boolean;
}

// Interface para configuração do Draft5.gg
export interface Draft5Config {
  PROXY_URL: string;
  USE_PROXY: boolean;
}

// Configuração da IA
export interface AIConfig {
  PROVIDER: AIProvider;
  API_KEY: string;
  ENDPOINT: string;
  MODEL: string;
  CONTEXT_MEMORY_SIZE: number;
  DEFAULT_TEMPERATURE: number;
  MAX_TOKENS: number;
  USE_CACHE: boolean;
  CACHE_TTL: number;
  FALLBACK_TO_TRADITIONAL: boolean;
}

export interface Config {
  CACHE: CacheConfig;
  LIQUIPEDIA: LiquipediaConfig;
  DRAFT5: Draft5Config;
  AI?: AIConfig;
}

// Tipos de API
export interface LiquipediaResponse {
  html: string;
  success: boolean;
}

// Interfaces para o quiz
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface QuizState {
  active: boolean;
  currentQuestion: number;
  score: number;
  totalQuestions: number;
  userAnswers: number[];
  selectedQuestions: number[]; // Array de índices das perguntas selecionadas
}

// Interface para comandos do bot
export interface Command {
  id: string;
  command: string;
  description: string;
  template: string;
  requiresData?: string[];
}

export interface IDataProvider {
  getActivePlayers(): Promise<string>;
  getRecentResults(): Promise<string>;
  getHistory(): Promise<string>;
  getNextMatches(): Promise<string>;
  getLastMatch(): Promise<string>;
}

export interface ISimpleCache {
  getCachedData(key: string): unknown;
  setCachedData(key: string, data: unknown, ttl?: number): void;
}

export interface AIServiceConfig {
  provider: AIProvider;
  apiKey: string;
  endpoint: string;
  model: string;
  contextMemorySize: number;
  defaultTemperature: number;
  maxTokens: number;
  useCache: boolean;
  cacheTTL: number;
}

export enum AIProvider {
  OPENAI = "openai",
  HUGGINGFACE = "huggingface",
  GEMINI = "gemini",
  OLLAMA = "ollama",
  MOCK = "mock",
}

export interface AIRequestPayload {
  prompt: string;
  context?: string;
  maxTokens?: number;
  temperature?: number;
}

// Interface para o serviço de processamento de perguntas
export interface IBotCore {
  processarPergunta(pergunta: string): Promise<Message>;
}

// Mapeamento dos tipos de dados e suas funções correspondentes
export interface DataFunctions {
  [key: string]: () => Promise<string>;
}

export interface CacheEntry {
  data: unknown;
  expiry: number | null; // null significa usar a duração padrão
}

export interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: RefObject<HTMLDivElement>;
  onButtonClick?: (value: string) => void;
}

export interface ChatIntroProps {
  onSuggestionClick: (suggestion: string) => void;
}

export interface InputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}
