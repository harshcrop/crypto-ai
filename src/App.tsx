import React, { useEffect, useRef } from "react";
import { Bot } from "lucide-react";
import Message from "./components/Message";
import ChatInput from "./components/ChatInput";
import TypingIndicator from "./components/TypingIndicator";
import { useChatBot } from "./hooks/useChatBot";

function App() {
  const { messages, isLoading, processMessage } = useChatBot();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center space-x-3">
        <div className="bg-black text-white p-2 rounded-full">
          <Bot size={24} />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-black">Crypto Assistant</h1>
          <p className="text-sm text-gray-600">
            Your personal crypto companion
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="max-w-4xl mx-auto w-full">
        <ChatInput onSendMessage={processMessage} disabled={isLoading} />
      </div>
    </div>
  );
}

export default App;
