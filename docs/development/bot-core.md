# Bot Core - Documentação

## Introdução

O Bot Core é o coração do Furia Bot, responsável pela lógica central que processa as entradas do usuário e coordena as respostas. Este documento explica os componentes principais do Bot Core e como eles interagem entre si.

## Componentes do Bot Core

### 1. BotCore

O `BotCore` é o componente principal que gerencia o fluxo de processamento das mensagens. Ele implementa a interface `IBotCore` e foi projetado seguindo os princípios SOLID e de injeção de dependência:

- Recebe as mensagens dos usuários
- Analisa o conteúdo das mensagens para identificar comandos
- Verifica se há um quiz ativo
- Determina se deve usar IA para processar a pergunta
- Coordena a obtenção de dados e formatação das respostas

#### Métodos Principais

- `processarPergunta(pergunta: string)`: Método público principal que processa as mensagens de entrada e determina a resposta
- `isQuizActive()`: Verifica se há um quiz ativo
- `processQuizAnswer(resposta: string)`: Processa a resposta do usuário para um quiz ativo
- `isCommand(mensagem: string)`: Verifica se uma mensagem é um comando
- `processCommand(comando: string)`: Processa comandos específicos
- `processAIQuery(pergunta: string)`: Processa perguntas usando inteligência artificial

### 2. CommandsService

O `CommandsService` gerencia todos os comandos disponíveis no bot:

- Mantém um registro de comandos disponíveis (ex: /jogadores, /historia, /quiz)
- Identifica e valida comandos na entrada do usuário
- Formata respostas para comandos específicos
- Gerencia os dados necessários para cada comando

### 3. AIService

O `AIService` é responsável pela integração com APIs de inteligência artificial:

- Conecta-se com o provedor de IA configurado (Google Gemini 2.0 Flash)
- Gerencia o histórico de conversas para manter contexto
- Implementa cache de respostas para otimização (configurável via CONFIG.AI.USE_CACHE)
- Fornece fallbacks caso ocorra algum erro (CONFIG.AI.FALLBACK_TO_TRADITIONAL)
- Utiliza parâmetros configuráveis para temperatura e tamanho máximo de tokens

### 4. DataService

O `DataService` implementa `IDataProvider` e gerencia a obtenção de dados externos:

- Busca dados de jogadores, resultados, histórico e próximas partidas
- Comunica-se com APIs externas através de proxies
- Implementa cache de dados para reduzir chamadas de API

#### Métodos Principais

- `getActivePlayers()`: Obtém a lista de jogadores ativos
- `getRecentResults()`: Obtém resultados recentes
- `getNextMatches()`: Obtém próximas partidas agendadas
- `getHistory()`: Obtém dados históricos do time
- `getLastMatch()`: Obtém dados da última partida

## Fluxo de Processamento

1. **Recebimento da Mensagem**:
   - O usuário envia uma mensagem através da interface
   - `processarPergunta()` é chamado no BotCore

2. **Verificação de Quiz Ativo**:
   - `isQuizActive()` verifica se há um quiz em andamento
   - Se sim, a resposta é processada pelo QuizManager

3. **Verificação de Comando**:
   - `isCommand()` verifica se a mensagem é um comando
   - Se for um comando, `processCommand()` é chamado
   - Comandos específicos como `/quiz` são tratados separadamente

4. **Processamento com IA**:
   - Se não for um comando ou quiz, `processAIQuery()` é chamado
   - AIService gera uma resposta contextualizada

5. **Obtenção de Dados**:
   - Para comandos, os dados necessários são obtidos via `getRequiredData()`
   - Os dados são buscados em paralelo para melhor performance

6. **Formatação e Envio da Resposta**:
   - A resposta é formatada de acordo com o tipo de processamento
   - A resposta formatada é retornada para exibição na interface

## Integração com Features

O Bot Core foi projetado para ser modular e extensível, integrando-se com features como o QuizManager:

- O QuizManager é acessado via singleton importado
- BotCore verifica o estado do quiz e delega o processamento quando necessário
- Features podem incluir botões de resposta ou outros elementos interativos

## Exemplo de uso do BotCore

```typescript
// Importações necessárias
import { CommandsService } from './commands/index.ts';
import { BotCore } from './BotCore.js';
import { DataService } from './data/DataService.ts';
import { aiService } from './AIService.ts';

// Inicialização dos serviços
const commandsService = new CommandsService();
const dataService = new DataService();
const bot = new BotCore(commandsService, dataService, aiService);

// Processamento de pergunta do usuário
const resposta = await bot.processarPergunta("Quem são os jogadores atuais?");
console.log(resposta.content);
```

## Estrutura de Utilitários

O sistema utiliza funções utilitárias específicas para formatação de dados, respeitando o princípio de responsabilidade única (SRP):

- `parseFirstTable(html, selector)`: Extrai e formata tabelas de HTML usando Cheerio, retornando um JSON estruturado
- `formatMatchResults(resultsText)`: Formata resultados de partidas em português com datas localizadas
- `formatPlayerInfo(playersText)`: Formata informações de jogadores incluindo nomes reais e apelidos
- `formatNextMatches(nextMatchesHtml)`: Função principal para processar dados de próximas partidas
- `extractNextMatchesFromHtml(html)`: Extrai dados estruturados de HTML para um formato padronizado (responsabilidade isolada)
- `formatNextMatchesData(matches)`: Formata os dados já extraídos para exibição ao usuário (responsabilidade isolada)

Todas as funções implementam logs detalhados e tratamento de erros para facilitar diagnóstico.

## Configurações

O sistema utiliza um objeto de configuração centralizado para:

- Configurações de cache (duração, políticas)
- Configurações de APIs externas (Liquipedia, Draft5.gg)
- Configurações da IA (provedor, chave, modelo, temperatura)
  - Suporte ao modelo Gemini 2.0 Flash
  - Configuração detalhada de temperatura e tokens
  - Cache de IA configurável
- Configurações de proxy e fallbacks
- Suporte a domínios ngrok para desenvolvimento

## Considerações de Desempenho

- O sistema utiliza cache em múltiplos níveis (dados e respostas)
- Processamento paralelo para busca de múltiplos dados
- Sistema de fallback para lidar com erros de APIs externas
- Configuração flexível de TTL para diferentes tipos de dados
- Funções otimizadas para processamento de HTML com Cheerio

## Atualizações Recentes

- Implementação de funções específicas para formatação de dados em português
- Estruturação de funções seguindo o princípio de responsabilidade única
- Atualização para suporte ao modelo Gemini 2.0 Flash
- Melhorias na tradução de datas para formato brasileiro
- Adição de suporte a mapeamento de nomes de jogadores (apelidos para nomes reais)
- Melhorias no sistema de logs para diagnóstico

## Próximos Passos no Desenvolvimento

- Ampliação do conjunto de comandos disponíveis
- Integração com mais fontes de dados esportivos
- Melhoria nas capacidades de processamento de linguagem natural
- Implementação de mais features interativas além do quiz