/**
 * Quiz da FURIA - Sistema de perguntas e respostas sobre a organização
 */
import { QuizQuestion, QuizState, ResponseButton } from '../types/index.js';

// Lista com todas as perguntas do quiz
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "Qual é o animal que representa a FURIA?",
    options: ["Leão", "Onça-pintada", "Lobo", "Tigre"],
    correctAnswer: 1, // B) Onça-pintada
    explanation: "A FURIA é representada por uma onça-pintada, um dos predadores mais poderosos da América do Sul!"
  },
  {
    question: "Em que país a FURIA foi fundada?",
    options: ["Argentina", "Estados Unidos", "Brasil", "Portugal"],
    correctAnswer: 2, // C) Brasil
    explanation: "A FURIA foi fundada no Brasil, onde mantém suas raízes e principal torcida!"
  },
  {
    question: "Qual jogo levou a FURIA à fama internacional?",
    options: ["League of Legends", "Free Fire", "CS:GO", "Dota 2"],
    correctAnswer: 2, // C) CS:GO
    explanation: "Foi através do Counter-Strike: Global Offensive que a FURIA ganhou reconhecimento mundial!"
  },
  {
    question: "Quem é o player conhecido por jogadas super agressivas?",
    options: ["KSCERATO", "arT", "yuurih", "FalleN"],
    correctAnswer: 1, // B) arT
    explanation: "Andrei 'arT' Piovezan é famoso por seu estilo agressivo e imprevisível de jogo!"
  },
  {
    question: "Qual é a cor principal da identidade visual da FURIA?",
    options: ["Azul", "Vermelho", "Roxo", "Preto"],
    correctAnswer: 3, // D) Preto
    explanation: "O preto é a cor principal da identidade visual da FURIA, simbolizando força e determinação!"
  },
  {
    question: "Em que ano a FURIA foi criada?",
    options: ["2015", "2017", "2019", "2020"],
    correctAnswer: 1, // B) 2017
    explanation: "A FURIA foi fundada em 2017, tornando-se rapidamente uma das principais organizações de eSports do Brasil!"
  },
  {
    question: "Qual é o nome do coach lendário da FURIA?",
    options: ["guerri", "Apoka", "zews", "Dead"],
    correctAnswer: 0, // A) guerri
    explanation: "Nicholas 'guerri' Nogueira é o coach que ajudou a transformar a FURIA em uma potência no CS:GO!"
  },
  {
    question: "A FURIA já teve time em quais jogos além de CS e LoL?",
    options: ["Valorant", "StarCraft", "PUBG", "Fortnite"],
    correctAnswer: 0, // A) Valorant
    explanation: "A FURIA expandiu para Valorant, outro FPS tático que se tornou muito popular!"
  },
  {
    question: "Qual foi o resultado da FURIA no Major do Rio (2022)?",
    options: ["Campeã", "Vice-campeã", "Semifinalista", "Eliminada na fase de grupos"],
    correctAnswer: 2, // C) Semifinalista
    explanation: "A FURIA chegou até as semifinais do Major do Rio em 2022, com uma campanha incrível diante da torcida brasileira!"
  },
  {
    question: "Quem ficou famoso pelo clutch 1v5 contra a G2?",
    options: ["saffee", "drop", "yuurih", "KSCERATO"],
    correctAnswer: 2, // C) yuurih
    explanation: "Yuri 'yuurih' Santos entrou para a história com esse clutch épico contra a G2 Esports!"
  },
  {
    question: "Qual apelido a torcida usa para o time nas redes?",
    options: ["A Onça", "A FERA", "FURIAzuda", "Os Brabos"],
    correctAnswer: 1, // B) A FERA
    explanation: "A torcida costuma chamar o time de 'A FERA' nas redes sociais!"
  },
  {
    question: "Em que cidade brasileira nasceu a FURIA?",
    options: ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Brasília"],
    correctAnswer: 3, // D) Brasília
    explanation: "A FURIA nasceu em Brasília, a capital do Brasil!"
  },
  {
    question: "Qual jogador é conhecido por estilo calmo e preciso?",
    options: ["KSCERATO", "arT", "drop", "FalleN"],
    correctAnswer: 0, // A) KSCERATO
    explanation: "Kaike 'KSCERATO' Cerato é conhecido por sua mira precisa e estilo de jogo calculado!"
  },
  {
    question: "Em que ano a FURIA entrou no Top 10 mundial no CS:GO?",
    options: ["2017", "2018", "2019", "2020"],
    correctAnswer: 2, // C) 2019
    explanation: "Foi em 2019 que a FURIA entrou para o top 10 do ranking mundial de CS:GO!"
  },
  {
    question: "Qual foi a primeira line-up da FURIA no CS:GO?",
    options: ["arT, yuurih, VINI, KSCERATO, guerri", "arT, yuurih, ableJ, VINI, RCF", "FalleN, fer, coldzera, TACO, boltz", "drop, saffee, arT, yuurih, KSCERATO"],
    correctAnswer: 1, // B) arT, yuurih, ableJ, VINI, RCF
    explanation: "A primeira lineup oficial da FURIA CS:GO contava com arT, yuurih, ableJ, VINI e RCF!"
  },
  {
    question: "Em qual campeonato a FURIA venceu a Liquid com virada épica em 2020?",
    options: ["IEM Katowice", "DreamHack Open", "ESL Pro League", "BLAST Premier"],
    correctAnswer: 2, // C) ESL Pro League
    explanation: "Foi na ESL Pro League que a FURIA conseguiu uma virada histórica contra a Team Liquid em 2020!"
  },
  {
    question: "Onde fica o centro de treinamento internacional da FURIA?",
    options: ["Alemanha", "Estados Unidos", "Portugal", "Suécia"],
    correctAnswer: 1, // B) Estados Unidos
    explanation: "O centro de treinamento internacional da FURIA fica nos Estados Unidos, em Miami!"
  },
  {
    question: "Quem saiu da FURIA em 2023 para jogar na Europa?",
    options: ["VINI", "KSCERATO", "yuurih", "guerri"],
    correctAnswer: 0, // A) VINI
    explanation: "Vinicius 'VINI' Figueiredo deixou a FURIA em 2023 para seguir carreira na Europa!"
  },
  {
    question: "Qual é o lema usado pela torcida da FURIA?",
    options: ["Somos a fera", "Joga e vence", "Vai com tudo", "Caça no sangue"],
    correctAnswer: 0, // A) Somos a fera
    explanation: "A torcida da FURIA costuma usar o lema 'Somos a fera' para apoiar o time!"
  },
  {
    question: "Em qual mapa a FURIA ficou conhecida por execuções agressivas?",
    options: ["Mirage", "Inferno", "Vertigo", "Nuke"],
    correctAnswer: 2, // C) Vertigo
    explanation: "A FURIA se destacou por suas execuções agressivas e inovadoras no mapa Vertigo!"
  }
];

export class QuizManager {
  private quizState: QuizState;
  
  constructor() {
    this.quizState = {
      active: false,
      currentQuestion: 0,
      score: 0,
      totalQuestions: 0,
      userAnswers: [],
      selectedQuestions: []
    };
  }
  
  /**
   * Apresenta as opções de quantidade de perguntas
   */
  public showQuizOptions(): { content: string, responseButtons: ResponseButton[] } {
    return {
      content: "📝 QUIZ FURIA - Quantas perguntas você quer responder?",
      responseButtons: [
        { text: "5 perguntas", value: "quiz_5" },
        { text: "10 perguntas", value: "quiz_10" },
        { text: "15 perguntas", value: "quiz_15" },
        { text: "Todas (20 perguntas)", value: "quiz_20" }
      ]
    };
  }
  
  /**
   * Inicia um novo quiz com número específico de perguntas
   */
  public startQuiz(questionCount: number = 20): { content: string, responseButtons?: ResponseButton[] } {
    // Limita o número de perguntas ao máximo disponível
    const count = Math.min(questionCount, QUIZ_QUESTIONS.length);
    
    // Seleciona aleatoriamente 'count' perguntas do total
    const selectedQuestions = this.selectRandomQuestions(count);
    
    this.quizState = {
      active: true,
      currentQuestion: 0,
      score: 0,
      totalQuestions: count,
      userAnswers: [],
      selectedQuestions: selectedQuestions
    };
    
    return this.getCurrentQuestionWithButtons();
  }
  
  /**
   * Seleciona aleatoriamente um número específico de perguntas
   */
  private selectRandomQuestions(count: number): number[] {
    // Se for o total de perguntas, retorna todas em ordem
    if (count >= QUIZ_QUESTIONS.length) {
      return [...Array(QUIZ_QUESTIONS.length).keys()]; // [0, 1, 2, ..., 19]
    }
    
    // Cria um array com todos os índices de perguntas
    const allIndices = [...Array(QUIZ_QUESTIONS.length).keys()];
    
    // Embaralha os índices
    for (let i = allIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]]; // swap
    }
    
    // Retorna os primeiros 'count' índices
    return allIndices.slice(0, count);
  }
  
  /**
   * Verifica se o quiz está ativo
   */
  public isQuizActive(): boolean {
    return this.quizState.active;
  }
  
  /**
   * Verifica se a resposta está correta e atualiza a pontuação
   */
  public processAnswer(answer: string): { content: string, responseButtons?: ResponseButton[] } {
    if (!this.quizState.active) {
      return { 
        content: "O quiz não está ativo. Digite 'quiz' para começar!",
        responseButtons: [{ text: "Iniciar Quiz", value: "quiz" }]
      };
    }
    
    // Converte a letra da resposta para índice (A=0, B=1, etc.)
    const answerMap: { [key: string]: number } = {
      'a': 0, 'b': 1, 'c': 2, 'd': 3,
      '1': 0, '2': 1, '3': 2, '4': 3,
      'A': 0, 'B': 1, 'C': 2, 'D': 3
    };
    
    const answerIndex = answerMap[answer];
    
    if (answerIndex === undefined) {
      return { 
        content: "Por favor, responda com A, B, C, D!",
        responseButtons: this.createOptionButtons()
      };
    }
    
    // Obtém o índice da pergunta atual no array de perguntas selecionadas
    const currentQuestionIndex = this.quizState.selectedQuestions[this.quizState.currentQuestion];
    const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    
    // Registra a resposta do usuário
    this.quizState.userAnswers.push(answerIndex);
    
    // Atualiza a pontuação se estiver correta
    if (isCorrect) {
      this.quizState.score += 1;
    }
    
    // Prepara a resposta
    let response = isCorrect ? 
      "✅ CORRETO! " : 
      `❌ INCORRETO! A resposta certa era: ${String.fromCharCode(65 + currentQuestion.correctAnswer)}. `;
    
    // Adiciona a explicação se existir
    if (currentQuestion.explanation) {
      response += currentQuestion.explanation + " ";
    }
    
    // Avança para a próxima pergunta
    this.quizState.currentQuestion += 1;
    
    // Verifica se o quiz acabou
    if (this.quizState.currentQuestion >= this.quizState.totalQuestions) {
      this.quizState.active = false;
      return { 
        content: this.getFinalResults(),
        responseButtons: [{ text: "Jogar novamente", value: "quiz" }]
      };
    }
    
    // Retorna resultado da resposta atual + próxima pergunta com botões
    const nextQuestion = this.getCurrentQuestionWithButtons();
    return { 
      content: response + "\n\n" + nextQuestion.content,
      responseButtons: nextQuestion.responseButtons 
    };
  }
  
  /**
   * Retorna o texto da pergunta atual formatado com botões de opção
   */
  private getCurrentQuestionWithButtons(): { content: string, responseButtons: ResponseButton[] } {
    // Obtém o índice da pergunta atual no array de perguntas selecionadas
    const currentQuestionIndex = this.quizState.selectedQuestions[this.quizState.currentQuestion];
    const question = QUIZ_QUESTIONS[currentQuestionIndex];
    
    const questionNumber = this.quizState.currentQuestion + 1;
    const totalQuestions = this.quizState.totalQuestions;
    
    let formattedQuestion = `📝 QUIZ FURIA - Pergunta ${questionNumber}/${totalQuestions}\n\n`;
    formattedQuestion += `${question.question}`;
    
    // Cria os botões de resposta
    const responseButtons = this.createOptionButtons();
    
    return {
      content: formattedQuestion,
      responseButtons: responseButtons
    };
  }
  
  /**
   * Cria os botões para as opções de resposta
   */
  private createOptionButtons(): ResponseButton[] {
    const optionLetters = ['A', 'B', 'C', 'D'];
    // Obtém o índice da pergunta atual no array de perguntas selecionadas
    const currentQuestionIndex = this.quizState.selectedQuestions[this.quizState.currentQuestion];
    const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex];
    
    return currentQuestion.options.map((option, index) => ({
      text: `${optionLetters[index]} - ${option}`,
      value: optionLetters[index]
    }));
  }
  
  /**
   * Retorna os resultados finais do quiz
   */
  private getFinalResults(): string {
    const score = this.quizState.score;
    const total = this.quizState.totalQuestions;
    const percentage = Math.round((score / total) * 100);
    
    let result = `🏆 FIM DO QUIZ FURIA! 🏆\n\n`;
    result += `Sua pontuação: ${score}/${total} (${percentage}%)\n\n`;
    
    // Mensagem baseada na pontuação
    if (percentage >= 90) {
      result += "IMPRESSIONANTE! Você é um verdadeiro FURIOSO! Conhece todos os detalhes sobre a FURIA! 🐾 🔥";
    } else if (percentage >= 70) {
      result += "MUITO BOM! Você realmente conhece a FURIA! Continue acompanhando o time! 🐾 🔥";
    } else if (percentage >= 50) {
      result += "BOM TRABALHO! Você conhece bastante sobre a FURIA, mas ainda pode aprender mais! 🐾 🔥";
    } else if (percentage >= 30) {
      result += "VOCÊ ESTÁ COMEÇANDO! Continue acompanhando a FURIA para aprender mais sobre o time! 🐾 🔥";
    } else {
      result += "VOCÊ ESTÁ NO CAMINHO! A FURIA te convida a conhecer mais sobre sua história e seus jogadores! 🐾 🔥";
    }
    
    result += "\n\nDigite 'quiz' ou clique no botão abaixo para jogar mais uma rodada!";
    
    return result;
  }
  
  /**
   * Retorna os resultados parciais do quiz
   */
  public getQuizStatus(): string {
    if (!this.quizState.active) {
      return "O quiz não está ativo. Digite 'quiz' para começar!";
    }
    
    return `Você está na pergunta ${this.quizState.currentQuestion + 1} de ${this.quizState.totalQuestions}. Pontuação atual: ${this.quizState.score}`;
  }
}

// Exporta uma instância única do QuizManager para ser usada em todo o aplicativo
export const quizManager = new QuizManager();