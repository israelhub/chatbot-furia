import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: {
      host: 'localhost',
    },
    proxy: {},
    cors: true,
    // Adicionando o host do ngrok à lista de hosts permitidos
    allowedHosts: [
      '0ff3-2804-2370-ba00-962-843a-1433-75f5-c0fb.ngrok-free.app',
      '.ngrok-free.app', // Permitir todos os subdomínios do ngrok
      'localhost'
    ],
  },
  build: {
    // Otimizações para o ambiente de produção
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
})
