import React, { useState } from "react";
import ChatBot from "./ChatBot";
import "../../styles/ChatButton.css";

const ChatButton = () => {
    const [open, setOpen] = useState(false);

    return (
        <>
        {open && <ChatBot onClose={() => setOpen(false)} />}
        <button
            className="chatbot-btn btn btn-primary rounded-circle shadow-lg"
            onClick={() => setOpen(!open)}
        >
            💬
        </button>
        </>
    );
};

export default ChatButton;
