/**
 * Serviço de cache para armazenamento de dados
 * Implementado como classe singleton para melhor encapsulamento
 */
import { LastFetch, CacheEntry } from '../types/index.js';
import { CONFIG } from '../config/config.js';

export class CacheService {
  private static instance: CacheService;
  private dataCache: Record<string, CacheEntry> = {};
  private lastFetch: LastFetch = {};

  private constructor() { }

  /**
   * Obtém a instância única do serviço de cache
   */
  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Obtém dados do cache para uma categoria específica
   */
  public getCachedData(category: string): unknown {
    const entry = this.dataCache[category];
    
    if (!entry) {
      return undefined;
    }
    
    // Verifica se a entrada tem um tempo de expiração específico
    if (entry.expiry !== null && Date.now() > entry.expiry) {
      // Expirado, remove do cache
      delete this.dataCache[category];
      delete this.lastFetch[category];
      return undefined;
    }
    
    return entry.data;
  }

  /**
   * Armazena dados no cache para uma categoria específica
   * @param ttl Tempo de vida em segundos (opcional)
   */
  public setCachedData(category: string, data: unknown, ttl?: number): void {
    // Calcula o tempo de expiração, se fornecido
    const expiry = ttl ? Date.now() + (ttl * 1000) : null;
    
    this.dataCache[category] = { 
      data, 
      expiry 
    };
    this.lastFetch[category] = Date.now();
  }

  /**
   * Verifica se o cache para uma categoria está válido
   */
  public isCacheValid(category: string): boolean {
    const entry = this.dataCache[category];
    if (!entry) {
      return false;
    }
    
    // Se tiver expiração específica, verifica
    if (entry.expiry !== null) {
      return Date.now() < entry.expiry;
    }
    
    // Caso contrário, usa a duração padrão
    const lastFetchTime = this.lastFetch[category];
    return !!lastFetchTime && (Date.now() - lastFetchTime) < CONFIG.CACHE.DURATION_MS;
  }

  /**
   * Limpa todo o cache
   */
  public clearCache(): void {
    this.dataCache = {};
    this.lastFetch = {};
  }
}