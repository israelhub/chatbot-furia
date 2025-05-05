/**
 * Script para substituir importações .ts por .js após a compilação TypeScript
 */
import fs from 'fs';
import path from 'path';

// Função para percorrer recursivamente a pasta dist e substituir extensões .ts por .js
function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.js')) {
      fixImports(filePath);
    }
  }
}

// Função para substituir importações .ts por .js em um arquivo
function fixImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Substituir importações com extensão .ts para .js
    const updatedContent = content.replace(/from\s+['"](.+)\.ts['"]/g, 'from "$1.js"');
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`Corrigido: ${filePath}`);
    }
  } catch (error) {
    console.error(`Erro ao processar o arquivo ${filePath}:`, error);
  }
}

// Diretório de saída da compilação
const distDir = path.resolve('./dist');

// Verificar se o diretório existe
if (fs.existsSync(distDir)) {
  console.log('Iniciando o processamento de arquivos para corrigir importações...');
  processDirectory(distDir);
  console.log('Processamento concluído!');
} else {
  console.error(`O diretório ${distDir} não existe.`);
}