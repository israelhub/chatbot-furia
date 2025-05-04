import { useState, useEffect, useRef } from 'react';
import './index.css';
import Header from '../../components/Header/Header.js';
import ChatIntro from '../../components/Chat/ChatIntro.js';
import MessageList from '../../components/MessageList/MessageList.js';
import Input from '../../components/Input/Input.js';
import { processarPergunta } from '../../core/index.js';
import { Message } from '../../types/index.ts';
import { quizManager } from '../../features/QuizManager.js';

const Home = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll para a última mensagem quando a lista de mensagens mudar
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Processar e enviar mensagem
  const handleSendMessage = async (userInput: string) => {
    if (userInput.trim() === '') return;
    
    // Se for a primeira mensagem, esconde a intro
    if (showIntro) {
      setShowIntro(false);
    }
    
    // Verifica se é o comando para iniciar o quiz
    if (userInput.toLowerCase() === 'quiz') {
      await handleQuizCommand();
      return;
    }
    
    // Adiciona a mensagem do usuário
    const userMessage: Message = { content: userInput, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Processa a pergunta e obtém a resposta usando a função processarPergunta do core
      const botResponse = await processarPergunta(userInput);
      
      // Adiciona a resposta do bot (incluindo possíveis botões de resposta)
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      setMessages(prev => [...prev, { 
        content: '🤖 Tive um problema para responder. Tente novamente mais tarde!', 
        isUser: false 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Lidar com o comando de quiz
  const handleQuizCommand = async () => {
    // Adiciona a mensagem do usuário
    const userMessage: Message = { content: 'quiz', isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Obter as opções de quiz diretamente
      const quizOptions = quizManager.showQuizOptions();
      
      // Adiciona a resposta com os botões
      setMessages(prev => [...prev, {
        content: quizOptions.content,
        isUser: false,
        responseButtons: quizOptions.responseButtons
      }]);
    } catch (error) {
      console.error('Erro ao iniciar quiz:', error);
      setMessages(prev => [...prev, { 
        content: '🤖 Tive um problema para iniciar o quiz. Tente novamente mais tarde!', 
        isUser: false 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Lidar com cliques em sugestões de perguntas
  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };
  
  // Lidar com cliques nos botões de resposta
  const handleResponseButtonClick = (value: string) => {
    console.log("Botão clicado com valor:", value);
    
    // Tratamento especial para botões de quiz (seleção de quantidade de perguntas)
    if (value.startsWith("quiz_")) {
      handleQuizQuantitySelection(value);
      return;
    }
    
    // Para outros botões, mostra o valor como mensagem do usuário
    handleSendMessage(value);
  };
  
  // Tratar a seleção de quantidade de perguntas
  const handleQuizQuantitySelection = async (value: string) => {
    setIsLoading(true);
    
    try {
      // Extrai o número de perguntas da string (ex: quiz_10 -> 10)
      const questionCount = parseInt(value.split("_")[1], 10);
      
      // Inicia o quiz com a quantidade selecionada
      const quizFirstQuestion = quizManager.startQuiz(questionCount);
      
      // Adiciona a primeira pergunta do quiz
      setMessages(prev => [...prev, {
        content: quizFirstQuestion.content,
        isUser: false,
        responseButtons: quizFirstQuestion.responseButtons
      }]);
    } catch (error) {
      console.error('Erro ao iniciar quiz com quantidade selecionada:', error);
      setMessages(prev => [...prev, { 
        content: '🤖 Tive um problema para iniciar o quiz. Tente novamente mais tarde!', 
        isUser: false 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="home-container">
      <Header />
      
      <div className="chat-container">
        <div className="chat-content">
          {showIntro ? (
            <ChatIntro onSuggestionClick={handleSuggestionClick} />
          ) : (
            <MessageList 
              messages={messages}
              isLoading={isLoading}
              messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
              onButtonClick={handleResponseButtonClick}
            />
          )}
        </div>
        
        <Input 
          onSend={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Home;