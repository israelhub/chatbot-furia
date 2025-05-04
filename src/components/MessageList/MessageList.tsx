import { FC } from 'react';
import './MessageList.css';
import { MessageListProps, ResponseButton } from '../../types/index.js';
import logoTigre from '../../assets/logo-furia-tigre.png';


const MessageList: FC<MessageListProps> = ({ messages, isLoading, messagesEndRef, onButtonClick }) => {

  // Função para processar links em formato especial [link:URL:TEXT]
  const processSpecialLinks = (text: string) => {
    const linkRegex = /\[link:(https?:\/\/[^\]]+):(.*?)\]/g;
    return text.replace(linkRegex, (match, url, linkText) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="message-link">${linkText}</a>`;
    });
  };

  // Função para processar formatação Markdown básica (negrito, itálico, etc)
  const processMarkdown = (text: string) => {
    // Processa negrito: **texto** -> <strong>texto</strong>
    let processed = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Processa itálico: *texto* -> <em>texto</em> (só processa se não estiver dentro de **)
    processed = processed.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
    
    // Processa sublinhado: __texto__ -> <u>texto</u>
    processed = processed.replace(/__(.*?)__/g, '<u>$1</u>');
    
    return processed;
  };

  // Renderiza botões de resposta
  const RenderResponseButtons = ({ buttons }: { buttons?: ResponseButton[] }) => {
    if (!buttons || buttons.length === 0) return null;
    
    return (
      <div className="response-buttons">
        {buttons.map((button, index) => (
          <button 
            key={index} 
            className="response-button"
            onClick={() => onButtonClick && onButtonClick(button.value)}
          >
            {button.text}
          </button>
        ))}
      </div>
    );
  };

  // Função para formatar o conteúdo da mensagem preservando quebras de linha e processando links especiais
  const FormatMessageContent = ({ content }: { content: string }) => {
    // Verifica se o conteúdo contém marcações de link em formato especial ou formatação Markdown
    const hasSpecialLinks = content.includes('[link:');
    const hasMarkdown = content.includes('**') || content.includes('__') || 
                        (content.includes('*') && !content.includes('**'));
    
    if (hasSpecialLinks || hasMarkdown) {
      // Divide o conteúdo em linhas
      const lines = content.split('\n');
      
      // Renderiza cada linha com links especiais e formatação Markdown
      return (
        <div className="message-content-list">
          {lines.map((line, index) => {
            // Processa formatação Markdown e links especiais
            let processedLine = line;
            
            if (hasMarkdown) {
              processedLine = processMarkdown(processedLine);
            }
            
            if (line.includes('[link:')) {
              processedLine = processSpecialLinks(processedLine);
            }
            
            if (processedLine !== line) {
              // Se a linha foi processada (contém HTML), use dangerouslySetInnerHTML
              return (
                <div 
                  key={index} 
                  className="list-item"
                  dangerouslySetInnerHTML={{ __html: processedLine }}
                />
              );
            } else if (line.trim() === '') {
              // Linha em branco (espaçamento)
              return <br key={index} />;
            } else {
              // Texto normal
              return <div key={index}>{line}</div>;
            }
          })}
        </div>
      );
    } else if (content.includes('•')) {
      // Caso para mensagens com listas de marcadores sem links especiais
      const lines = content.split('\n');
      
      return (
        <div className="message-content-list">
          {lines.map((line, index) => {
            if (line.trim().startsWith('•')) {
              return (
                <div key={index} className="list-item">
                  {line}
                </div>
              );
            } else if (line.trim() === '') {
              return <br key={index} />;
            } else {
              return <div key={index}>{line}</div>;
            }
          })}
        </div>
      );
    } else {
      // Texto normal, apenas preserva quebras de linha
      return (
        <>
          {content.split('\n').map((line, index) => (
            <span key={index}>
              {line}
              {index < content.split('\n').length - 1 && <br />}
            </span>
          ))}
        </>
      );
    }
  };

  return (
    <div className="messages-container">
      {messages.map((message, index) => (
        <div 
          key={index} 
          className={`message ${message.isUser ? 'user-message' : 'bot-message'}`}
        >
          {message.isUser ? (
            <div className="message-content">
              <FormatMessageContent content={message.content} />
            </div>
          ) : (
            <div className="bot-message-container">
              <div className="bot-avatar">
                <img src={logoTigre} alt="FURIA Bot" className="bot-avatar-img" />
              </div>
              <div className="message-content">
                <FormatMessageContent content={message.content} />
                <RenderResponseButtons buttons={message.responseButtons} />
              </div>
            </div>
          )}
        </div>
      ))}
      
      {isLoading && (
        <div className="message bot-message">
          <div className="bot-message-container">
            <div className="bot-avatar">
              <img src={logoTigre} alt="FURIA Bot" className="bot-avatar-img" />
            </div>
            <div className="message-content">
              <div className="loading-indicator">
                <span>.</span><span>.</span><span>.</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;