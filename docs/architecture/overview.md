# Visão Geral da Arquitetura

## Introdução

O Furia Bot é uma aplicação web moderna construída utilizando React, TypeScript e Vite como ferramenta de build. A arquitetura foi projetada para ser modular, escalável e de fácil manutenção, seguindo os princípios de desenvolvimento de software modernos.

## Estrutura de Alto Nível

A aplicação está estruturada nas seguintes camadas principais:

```
Frontend (Interface do Usuário)
    ↓
Gerenciamento de Estado e Roteamento
    ↓
Core do Bot (Lógica Central)
    ↓
Serviços (IA, Cache, Dados, Backend)
```

## Componentes Principais

### Frontend
- **Componentes React**: Implementam a interface do usuário com componentes modulares
- **Páginas**: Representam as diferentes telas da aplicação 
- **Roteamento**: Gerencia a navegação entre páginas

### Core do Bot
- **BotCore**: Controla a lógica central do bot e processa as perguntas do usuário
- **CommandsService**: Gerencia os comandos disponíveis (e.g., /ajuda, /quiz)
- **AIService**: Integra com o provedor de IA (Google Gemini) para processamento de linguagem natural
- **CacheService**: Otimiza desempenho através de caching

### Features
- **QuizManager**: Implementa a funcionalidade de quiz interativo
- Estrutura extensível para adição de novas features

### Serviços
- **DataService**: Gerencia dados e comunicação com APIs externas (Liquipedia, Draft5.gg)
- **CacheService**: Implementa políticas de cache e armazenamento local
- **Proxy Backend**: Interface para serviços externos com controle de acesso e rate limiting

## Fluxo de Dados

1. O usuário interage com o frontend através da interface de chat
2. A mensagem é processada pelo BotCore que determina:
   - Se é um comando (começa com /)
   - Se é parte de um quiz ativo
   - Se deve ser processada pela IA
3. Dados relevantes são coletados através do DataService
4. Respostas são formatadas usando utilitários específicos
5. As respostas são apresentadas de volta para o usuário no frontend

## Tecnologias Principais

- **React**: Biblioteca frontend para construção da UI
- **TypeScript**: Linguagem tipada para desenvolvimento robusto
- **Vite**: Ferramenta de build e desenvolvimento
- **CSS Modules**: Estilização modular e isolada
- **Google Gemini**: API de IA para processamento de linguagem natural

## Arquivos e Pastas Principais

```
src/
  ├── components/      # Componentes reutilizáveis da UI
  ├── pages/           # Páginas da aplicação
  ├── core/            # Lógica central do bot e comandos
  │   ├── commands/    # Sistema de comandos
  │   ├── data/        # Serviços de dados
  │   ├── AIService.ts # Serviço de IA
  │   ├── BotCore.ts   # Núcleo do bot
  │   └── CacheService.ts # Serviço de cache
  ├── features/        # Features específicas do bot (Quiz)
  ├── types/           # Definições de tipos TypeScript
  ├── utils/           # Funções utilitárias de formatação
  ├── assets/          # Recursos estáticos (imagens, ícones)
  ├── config/          # Configurações da aplicação
  └── backend/         # Proxy para comunicação com backend
```

## Considerações de Escalabilidade

A arquitetura foi projetada para permitir:
- Adição de novos componentes de UI
- Implementação de novas features sem afetar o código existente
- Substituição ou adição de novos serviços e provedores de IA
- Expansão do core com novas capacidades

## Documentação Relacionada

Para entender melhor outros aspectos do sistema, consulte os seguintes documentos:
- [Configuração do Ambiente](../development/setup.md)
- [Core do Bot](../development/bot-core.md)
- [Análise de Requisitos](../requirements/requirements-analysis.md)

---