"use client"
import { useState, useRef } from "react";
import { SendHorizonalIcon } from "lucide-react";

export function ChatInput({ onSend, disabled }: { onSend?: (message: string) => void, disabled?: boolean }) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      onSend?.(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 pb-6 z-20">
      <div className="flex items-end gap-2 bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-3">
        <textarea
          ref={textareaRef}
          className="flex-1 resize-none bg-transparent outline-none text-white placeholder-gray-400 p-2 min-h-[40px] max-h-40 text-base"
          rows={1}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          disabled={disabled}
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="bg-indigo-700 hover:bg-indigo-800 disabled:bg-gray-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors shadow-md"
        >
          <SendHorizonalIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
