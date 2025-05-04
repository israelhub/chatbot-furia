import { FC } from 'react';
import './ChatIntro.css';
import logoTigre from '../../assets/logo-furia-tigre.png';
import iconBook from '../../assets/icon-book.png';
import iconHistorico from '../../assets/icon-historico.png';
import iconLineup from '../../assets/icon-lineup.png';
import iconQuiz from '../../assets/icon-quiz.png';
import iconNext from '../../assets/icon-next.png'
import { ChatIntroProps } from '../../types/index.js';

const ChatIntro: FC<ChatIntroProps> = ({ onSuggestionClick }) => {
  return (
    <div className="chat-intro">
      <img src={logoTigre} alt="FURIA Tigre" className="tigre-logo" />
      
      <div className="intro-text">
        <h2>Converse sobre o universo</h2>
        <h2>de CS:GO da FURIA!</h2>
      </div>
      
      <div className="suggestion-buttons">
        <button 
          className="suggestion-btn"
          onClick={() => onSuggestionClick('Qual é a história da furia no cs:go?')}
        >
          <img src={iconBook} alt="" className="suggestion-icon"/>
          <span>Qual é a história da furia no cs:go?</span>
        </button>
        
        <button 
          className="suggestion-btn"
          onClick={() => onSuggestionClick('Últimas partidas disputadas')}
        >
          <img src={iconHistorico} alt="" className="suggestion-icon" />
          <span>Últimas partidas disputadas</span>
        </button>
        
        <button 
          className="suggestion-btn"
          onClick={() => onSuggestionClick('Qual a lineup atual?')}
        >
          <img src={iconLineup} alt="" className="suggestion-icon" />
          <span>Qual a lineup atual?</span>
        </button>
        
        <button 
          className="suggestion-btn"
          onClick={() => onSuggestionClick('Próximas partidas da FURIA')}
        >
          <img src={iconNext} alt="" className="suggestion-icon" />
          <span>Próximas partidas da FURIA</span>
        </button>
        
        <button 
          className="suggestion-btn"
          onClick={() => onSuggestionClick('quiz')}
        >
          <img src={iconQuiz} alt="" className="suggestion-icon" />
          <span>Teste seus conhecimentos sobre a FURIA</span>
        </button>
      </div>
    </div>
  );
};

export default ChatIntro;