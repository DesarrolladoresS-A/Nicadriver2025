import React, { useState } from "react";
import ChatBubble from "./ChatBubble";
import { getWeatherResponse } from "./botLogic";
import "../../styles/ChatButton.css";

const ChatBot = ({ onClose }) => {
    const [messages, setMessages] = useState([
        { from: "bot", text: "👋 ¡Hola! Soy NicaClimaBot. Pregúntame sobre el clima de tu ciudad o el pronóstico de hoy." }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { from: "user", text: input };
        setMessages((prev) => [...prev, userMsg]);
        setLoading(true);

        const botResponse = await getWeatherResponse(input);
        setMessages((prev) => [...prev, { from: "bot", text: botResponse }]);
        setInput("");
        setLoading(false);
    };

    return (
        <div className="chatbot-container shadow-lg">
        <div className="chatbot-header bg-primary text-white d-flex justify-content-between align-items-center px-3 py-2">
            <span>☁️ NicaClimaBot</span>
            <button onClick={onClose} className="btn-close btn-close-white"></button>
        </div>

        <div className="chatbot-body">
            {messages.map((msg, i) => (
            <ChatBubble key={i} from={msg.from} text={msg.text} />
            ))}
            {loading && <p className="text-center text-muted small">Consultando clima...</p>}
        </div>

        <form onSubmit={handleSend} className="chatbot-input p-2 d-flex gap-2">
            <input
            type="text"
            className="form-control"
            placeholder="Escribe tu consulta..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            />
            <button className="btn btn-primary">Enviar</button>
        </form>
        </div>
    );
};

export default ChatBot;
