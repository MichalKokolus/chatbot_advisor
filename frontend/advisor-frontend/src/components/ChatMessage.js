/**
 * Individual chat message component
 */

import React from 'react';
import { User, Bot } from 'lucide-react';

const ChatMessage = ({ message, isUser, timestamp }) => {
  return (
    <div className={`flex items-start space-x-3 mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isUser ? 'order-first' : ''}`}>
        <div
          className={`px-4 py-3 rounded-2xl shadow-md ${
            isUser
              ? 'bg-primary-500 text-white ml-auto'
              : 'bg-white text-gray-800'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
        </div>
        
        {timestamp && (
          <p className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {new Date(timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        )}
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
