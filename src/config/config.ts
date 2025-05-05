/**
 * Configurações globais do bot
 */
import { Config, AIProvider } from '../types/index.js';

// Determinar a URL base para APIs com base no ambiente
const getBaseApiUrl = () => {
  // Se estiver em produção (Render, Vercel, etc)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    // Usa o mesmo host/porta onde a aplicação está rodando
    return window.location.origin + '/api';
  }
  // Em desenvolvimento local
  return 'http://localhost:3001/api';
};

export const CONFIG: Config = {
  // Configuração do cache
  CACHE: {
    DURATION_MS: 3600000 // 1 hora em milissegundos (reduzido para desenvolvimento)
  },
  
  // Configuração do Liquipedia
  LIQUIPEDIA: {
    API_URL: "https://liquipedia.net/counterstrike/api.php",
    USER_AGENT: "FuriaFanBot/1.0",
    PROXY_URL: `${getBaseApiUrl()}/liquipedia`,
    USE_PROXY: true, // Ativado para buscar dados reais
    USE_MOCK_DATA: false // Nunca usar dados mockados
  },

  // Configuração do Draft5.gg
  DRAFT5: {
    PROXY_URL: `${getBaseApiUrl()}/draft5`,
    USE_PROXY: true, // Ativado para buscar dados reais
  },
  
  // Configuração da Inteligência Artificial
  AI: {
    PROVIDER: AIProvider.GEMINI, // Usando Google Gemini
    API_KEY: "AIzaSyAqe29AS47IZIPWBnTxXX2M663pwu6A2HY", // Chave API do Gemini fornecida
    ENDPOINT: "", // Deixar vazio para usar o padrão baseado no provedor
    MODEL: "gemini-2.0-flash", // Modelo Gemini Pro (compatível com a API)
    CONTEXT_MEMORY_SIZE: 5, // Número de pares de mensagens a manter no histórico
    DEFAULT_TEMPERATURE: 0.7, // Criatividade das respostas (0-1)
    MAX_TOKENS: 300, // Tamanho máximo das respostas
    USE_CACHE: true, // Habilitar cache para respostas de IA
    CACHE_TTL: 86400, // TTL do cache em segundos (24 horas)
    FALLBACK_TO_TRADITIONAL: true // Usar método tradicional como fallback
  }
};
