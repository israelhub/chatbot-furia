/**
 * Configuração do Puppeteer para ambientes de produção (Render)
 */

export const getPuppeteerOptions = (isProduction = process.env.NODE_ENV === 'production') => {
  // Opções base para desenvolvimento e produção
  const baseOptions = {
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1280,720'
    ]
  };
  
  // Opções específicas para o ambiente Render
  if (isProduction) {
    console.log('🔧 Configurando Puppeteer para ambiente de produção (Render)');
    return {
      ...baseOptions,
      // Tenta usar o Chrome fornecido pelo Render no caminho padrão, ou deixa o Puppeteer buscar automaticamente
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome-stable',
      // Opções adicionais para produção
      args: [
        ...baseOptions.args,
        '--single-process', // Importante para alguns ambientes de hospedagem
      ]
    };
  }
  
  return baseOptions;
};