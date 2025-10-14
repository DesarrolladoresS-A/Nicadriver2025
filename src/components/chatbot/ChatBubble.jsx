import React from "react";

const ChatBubble = ({ from, text }) => (
    <div className={`chat-bubble ${from}`}>
        <div className={`bubble ${from === "bot" ? "bot-bubble" : "user-bubble"}`}>
        {text}
        </div>
    </div>
);

export default ChatBubble;
