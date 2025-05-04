# Configuração do Ambiente de Desenvolvimento

Este guia descreve como configurar um ambiente de desenvolvimento completo para trabalhar no Furia Bot.

## Requisitos

- **Node.js** (versão 18.x ou superior)
- **npm** (versão 9.x ou superior)
- **Git** para controle de versão
- **IDE** recomendada: Visual Studio Code com as extensões recomendadas
- **Navegador moderno** (Chrome, Firefox, Edge) para testes

## Passos para Configuração

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/furia-bot.git
cd furia-bot
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
VITE_API_BASE_URL=http://localhost:3000
VITE_ENV=development
```

### 4. Inicie o Servidor de Desenvolvimento e Proxy

```bash
npm run start
```

Isso iniciará o servidor de desenvolvimento Vite e abrirá automaticamente a aplicação no seu navegador padrão, geralmente em http://localhost:5173.

## Estrutura do Projeto para Desenvolvimento

Abaixo estão as pastas e arquivos principais que você irá trabalhar durante o desenvolvimento:

- `/src/components` - Componentes React reutilizáveis 
- `/src/core` - A lógica central do Bot (BotCore, ResponseService, etc.)
- `/src/features` - Features específicas como QuizManager
- `/src/types` - Definições de tipos TypeScript
- `/src/utils` - Funções utilitárias

## Fluxo de Trabalho Recomendado

1. **Crie uma branch**: Para cada nova feature ou correção
   ```bash
   git checkout -b feature/nome-da-feature
   ```

2. **Desenvolvimento**: Implemente suas mudanças seguindo os padrões do projeto

3. **Testes**: Teste suas alterações localmente
   ```bash
   npm run test
   ```

4. **Linting e Formatação**: Garanta que seu código segue os padrões
   ```bash
   npm run lint
   npm run format
   ```

5. **Construção**: Verifique se a aplicação compila sem erros
   ```bash
   npm run build
   ```

6. **Commit e Push**: Envie suas alterações para o repositório
   ```bash
   git add .
   git commit -m "Descrição clara da sua alteração"
   git push origin feature/nome-da-feature
   ```

7. **Pull Request**: Crie um PR para o branch principal

## Configuração do VS Code

Recomendamos instalar as seguintes extensões no VS Code para melhorar sua experiência de desenvolvimento:

- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- React DevTools
- vscode-icons

## Depuração

Para depurar a aplicação:

1. Inicie o servidor de desenvolvimento e proxy: `npm run start`
2. Abra DevTools no navegador (F12)
3. Use a aba "Sources" para definir breakpoints
4. Utilize `console.log()` estrategicamente para monitorar valores durante a execução

### Erro ao instalar dependências

```bash
npm cache clean --force
npm install
```

### Problemas com Hot Reload

Reinicie o servidor de desenvolvimento:
```bash
CTRL+C (para parar o servidor)
npm run start (para reiniciar)
```

### Erros de TypeScript

Verifique se todos os tipos estão corretamente definidos em `src/types` e se você está importando-os corretamente.

## Recursos Adicionais

- [Documentação do React](https://reactjs.org/docs/getting-started.html)
- [Documentação do TypeScript](https://www.typescriptlang.org/docs/)
- [Documentação do Vite](https://vitejs.dev/guide/)

## Próximos Passos

Após configurar seu ambiente, recomendamos:

1. Familiarizar-se com a [Visão Geral da Arquitetura](../architecture/overview.md)
2. Explorar a documentação do [Bot Core](./bot-core.md)