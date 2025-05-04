import { FC, useState, KeyboardEvent } from "react";
import "./Input.css";
import iconSend from "../../assets/icon-send.png";
import { InputProps } from "../../types/index.js";

const Input: FC<InputProps> = ({ onSend, isLoading }) => {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (input.trim() === "" || isLoading) return;
    onSend(input);
    setInput("");
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="input-container">
      <div className="input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Pergunte ao bot da FURIA (CS:GO)"
          rows={1}
          disabled={isLoading}
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading || input.trim() === ""}
          className={input.trim() !== "" ? "active" : ""}
        >
          <img src={iconSend} alt="Enviar" className="send-icon" />
        </button>
      </div>
      <div className="disclaimer-text">
        Este é um recurso em desenvolvimento — o FURIA BOT pode cometer erros.
        Sempre confira as informações compartilhadas.
      </div>
    </div>
  );
};

export default Input;
