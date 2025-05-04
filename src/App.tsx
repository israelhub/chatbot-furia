import { useEffect } from 'react';
import { ensureServicesInitialized } from './core/ServiceInitializer.ts';
import AppRoutes from './routes/AppRoutes.js';

function App() {
  // Inicializa os serviços quando o aplicativo carrega
  useEffect(() => {
    // Garante que os serviços sejam inicializados na ordem correta
    ensureServicesInitialized();
  }, []);

  return (
      <AppRoutes />
  );
}


export default App
