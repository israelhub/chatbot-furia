// filepath: c:\Users\Pc\Desktop\furia-bot\src\core\commands\CommandsService.ts
/**
 * Serviço para gerenciamento de comandos do bot
 */
import { Command } from '../../types/index.js';
import { BOT_COMMANDS } from './Commands.js';

export class CommandsService {
  private commands: Command[];
  
  constructor(commands: Command[] = BOT_COMMANDS) {
    this.commands = commands;
  }
  
  /**
   * Verifica se a mensagem do usuário é um comando ou uma pergunta
   */
  public isCommand(mensagem: string): boolean {
    return mensagem.trim().startsWith('/');
  }
  
  /**
   * Verifica se a mensagem é apenas uma barra (para listar comandos disponíveis)
   */
  public isCommandList(mensagem: string): boolean {
    return mensagem.trim() === '/';
  }
  
  /**
   * Encontra o comando correspondente à mensagem do usuário
   */
  public findCommand(mensagem: string): Command | null {
    const commandText = mensagem.trim().toLowerCase();
    return this.commands.find(cmd => cmd.command.toLowerCase() === commandText) || null;
  }
  
  /**
   * Gera uma lista formatada de todos os comandos disponíveis
   */
  public getCommandList(): string {
    return this.commands.map(cmd => `${cmd.command} - ${cmd.description}`).join('\n');
  }
  
  /**
   * Substitui os placeholders no template com os dados reais
   */
  public formatResponse(template: string, data: { [key: string]: string }): string {
    let response = template;
    
    // Substitui cada placeholder {chave} pelo valor correspondente
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      response = response.replace(placeholder, value);
    });
    
    return response;
  }
  
  /**
   * Formata a resposta para um comando específico
   */
  public formatCommandResponse(command: Command, data: { [key: string]: string }): string {
    // Se for o comando de ajuda, adiciona a lista de comandos aos dados
    if (command.id === 'help') {
      data.commandList = this.getCommandList();
    }
    
    return this.formatResponse(command.template, data);
  }
}