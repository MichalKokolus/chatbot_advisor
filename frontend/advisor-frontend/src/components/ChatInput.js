/**
 * Chat input component with text and voice input
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, RotateCcw } from 'lucide-react';
import VoiceRecorder from './VoiceRecorder';

const ChatInput = ({ onSendMessage, isLoading, disabled }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceTranscript = (transcript) => {
    if (transcript) {
      setMessage(transcript);
      // Auto-send voice messages or let user review first
      // For better UX, let's set the text and let user decide
      textareaRef.current?.focus();
    }
  };

  const handleNewConversation = () => {
    if (window.confirm('Start a new conversation? This will clear the current chat.')) {
      window.location.reload(); // Simple way to reset state
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        {/* Text input area */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? "Please wait..." : "Type your message or use voice recording..."}
            disabled={disabled || isLoading}
            className={`w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
              disabled || isLoading 
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                : 'bg-white'
            }`}
            rows={1}
            maxLength={1000}
          />
          
          {/* Character count */}
          <div className="absolute bottom-1 right-2 text-xs text-gray-400">
            {message.length}/1000
          </div>
        </div>

        {/* Voice recorder */}
        <VoiceRecorder 
          onTranscript={handleVoiceTranscript}
          disabled={disabled || isLoading}
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={!message.trim() || isLoading || disabled}
          className={`w-12 h-12 rounded-full transition-all duration-200 ${
            !message.trim() || isLoading || disabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary-500 text-white hover:bg-primary-600 active:scale-95 shadow-lg hover:shadow-xl'
          }`}
          title="Send message"
        >
          <Send className="w-5 h-5 mx-auto" />
        </button>

        {/* New conversation button */}
        <button
          type="button"
          onClick={handleNewConversation}
          disabled={isLoading}
          className="w-12 h-12 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200 active:scale-95"
          title="Start new conversation"
        >
          <RotateCcw className="w-5 h-5 mx-auto" />
        </button>
      </form>

      {/* Quick tips */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        Press Enter to send • Shift+Enter for new line • Click mic for voice input
      </div>
    </div>
  );
};

export default ChatInput;
