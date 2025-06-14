import React, { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff } from "lucide-react";
import { speechService } from "../services/speechService";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
}) => {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleVoiceInput = async () => {
    if (!speechService.isSupported()) {
      alert("Voice input is not supported in your browser");
      return;
    }

    if (isListening) return;

    setIsListening(true);
    try {
      const transcript = await speechService.startListening();
      setMessage(transcript);
    } catch (error) {
      console.error("Voice input error:", error);
    } finally {
      setIsListening(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center space-x-2 p-4 bg-white border-t border-gray-200"
    >
      <input
        ref={inputRef}
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask about crypto prices, trends, or manage your portfolio..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
        disabled={disabled}
      />

      <button
        type="button"
        onClick={handleVoiceInput}
        className={`relative p-2 rounded-full transition-colors ${
          isListening
            ? "bg-red-100 text-red-600 hover:bg-red-200"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
        disabled={disabled}
        title="Voice input"
      >
        {/* Listening effect */}
        {isListening && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-red-200 opacity-75"></span>
          </span>
        )}
        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
      </button>

      <button
        type="submit"
        disabled={!message.trim() || disabled}
        className="p-2 bg-black text-white rounded-full hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        title="Send message"
      >
        <Send size={20} />
      </button>
    </form>
  );
};

export default ChatInput;
