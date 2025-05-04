/**
 * Arquivo barrel (index) para exportar as principais funcionalidades do core
 * Permite importação simplificada e agrupa as exportações principais em um único ponto
 */
import { botCore } from './BotCore.js';
import { aiService } from './AIService.js';
import { ensureServicesInitialized } from './ServiceInitializer.js';

// Exporta a função processarPergunta do BotCore
export const processarPergunta = botCore.processarPergunta;

// Re-exportações dos serviços principais
export { botCore, aiService, ensureServicesInitialized };

// Exportação default para uso conveniente
export default {
  processarPergunta,
  botCore,
  aiService,
  ensureServicesInitialized
};