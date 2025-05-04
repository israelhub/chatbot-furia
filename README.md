# FURIA Bot - Assistente virtual do time FURIA

Este bot fornece informações sobre o time FURIA de CS:GO/CS2.

## Configuração

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Execute o projeto: `npm run start`

## Scripts disponíveis

- `npm run dev`: Inicia o aplicativo React no modo de desenvolvimento
- `npm run proxy`: Inicia o servidor proxy (necessário para contornar restrições de CORS)
- `npm run start`: Inicia tanto o servidor proxy quanto o aplicativo React em paralelo
- `npm run build`: Compila o projeto para produção

### CORS e requisições ao Liquipedia

O navegador impõe restrições de segurança (CORS) que impedem que o frontend acesse diretamente a API do Liquipedia.
Para contornar isso, este projeto inclui um servidor proxy simples que faz as requisições em nome do frontend.

Se estiver enfrentando problemas com as requisições:

1. Certifique-se de que o servidor proxy está rodando (`npm run proxy`)

## React + TypeScript + Vite

Este template fornece uma configuração mínima para trabalhar com React em Vite com HMR e algumas regras ESLint.

Atualmente, dois plugins oficiais estão disponíveis:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
