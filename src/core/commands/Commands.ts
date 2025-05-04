// filepath: c:\Users\Pc\Desktop\furia-bot\src\core\commands\Commands.ts
/**
 * Definição dos comandos disponíveis no bot
 */
import { Command } from '../../types/index.ts';

// Lista de comandos disponíveis
export const BOT_COMMANDS: Command[] = [
  {
    id: 'help',
    command: '/ajuda',
    description: 'Lista todos os comandos disponíveis',
    template: 'Comandos disponíveis:\n\n{commandList}\n\nDigite um desses comandos ou faça qualquer pergunta sobre a FURIA! 🐾 🔥'
  },
  {
    id: 'players',
    command: '/jogadores',
    description: 'Exibe o elenco atual do CS:GO',
    template: 'O elenco atual da FURIA é:\n\n{players}\n\nEsse é o nosso esquadrão! 🐾 🔥',
    requiresData: ['players']
  },
  {
    id: 'results',
    command: '/resultados',
    description: 'Mostra os resultados recentes da FURIA no CS:GO',
    template: 'Aqui estão os resultados recentes da FURIA no CS:GO:\n\n{results}\n\nSempre na torcida pelo nosso esquadrão! 🐾 🔥',
    requiresData: ['results']
  },
  {
    id: 'last_match',
    command: '/ultimojogo',
    description: 'Exibe informações sobre o último jogo da FURIA no CS:GO',
    template: 'O último jogo da FURIA foi:\n\n{lastMatch}\n\nSempre na torcida pelo nosso esquadrão! 🐾 🔥',
    requiresData: ['lastMatch']
  },
  {
    id: 'history',
    command: '/historia',
    description: 'Conta a história da FURIA no CS:GO',
    template: '{history}\n\nSomos FURIA! 🐾 🔥',
    requiresData: ['history']
  },
  {
    id: 'quiz',
    command: '/quiz',
    description: 'Inicia um quiz sobre a FURIA',
    template: '{quizResponse}',
    requiresData: ['quizResponse']
  },
  {
    id: 'social_media',
    command: '/redes',
    description: 'Mostra as redes sociais da FURIA',
    template: 'Nossas redes sociais:\n- [link:https://www.instagram.com/furiagg:Instagram]\n- [link:https://x.com/furia:X (Twitter)]\n- [link:https://www.facebook.com/furiagg:Facebook]\n- [link:https://www.youtube.com/channel/UCE4elIT7DqDv545IA71feHg:YouTube]\n- [link:https://www.twitch.tv/furiatv:Twitch]\nFique por dentro de tudo que acontece com os times da FURIA — jogos, bastidores, conteúdos exclusivos e muito mais! Siga os perfis oficiais! 🐾 🔥'
  },
  {
    id: 'next_matches',
    command: '/proximosjogos',
    description: 'Exibe a agenda de próximos jogos da FURIA no CS:GO',
    template: '{nextMatches}\n\nFique atento para mais informações em breve! 🐾 🔥',
    requiresData: ['nextMatches']
  },
  {
    id: 'bot_info',
    command: '/bot',
    description: 'Informações sobre o bot',
    template: 'Eu sou o bot oficial da FURIA! Fui criado para fornecer informações sobre o time, jogadores e resultados. Estou sempre pronto para ajudar os furiosos! 🐾 🔥'
  }
];