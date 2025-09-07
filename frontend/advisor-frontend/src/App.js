/**
 * Main App component for Psychological Advisor
 */

import React, { useState, useEffect, useRef } from 'react';
import { Heart, Shield, MessageCircle, AlertTriangle, Wifi, WifiOff, Volume2, VolumeX } from 'lucide-react';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import { sendMessage, healthCheck } from './services/api';
import useTextToSpeech from './hooks/useTextToSpeech';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const messagesEndRef = useRef(null);
  
  // Text-to-speech hook
  const { speak, stop, isSpeaking, isSupported: ttsSupported } = useTextToSpeech();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check backend connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await healthCheck();
        setIsConnected(true);
        
        // Add welcome message
        setMessages([{
          id: 'welcome',
          text: "Hello! I'm here to provide psychological support and guidance. I'm a safe space where you can share your thoughts and feelings. How are you doing today?",
          isUser: false,
          timestamp: new Date().toISOString(),
        }]);
      } catch (err) {
        setIsConnected(false);
        setError('Unable to connect to the advisor service. Please check if the backend is running.');
      }
    };

    checkConnection();
  }, []);

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: messageText,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendMessage(messageText, sessionId);
      
      // Update session ID if this is the first message
      if (!sessionId) {
        setSessionId(response.sessionId);
      }

      const assistantMessage = {
        id: Date.now() + 1,
        text: response.response,
        isUser: false,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsConnected(true);
      
      // Temporarily disable auto-speech to test voice recording
      // TODO: Re-enable once voice recording works reliably
      // if (speechEnabled && ttsSupported && response.response) {
      //   setTimeout(() => {
      //     speak(response.response);
      //   }, 300);
      // }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message. Please try again.');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Psychological Advisor
                </h1>
                <p className="text-sm text-gray-600">
                  AI-powered emotional support & guidance
                </p>
              </div>
            </div>
            
            {/* Connection status and controls */}
            <div className="flex items-center space-x-4">
              {/* Speech toggle */}
              {ttsSupported && (
                <button
                  onClick={() => {
                    if (isSpeaking) {
                      stop();
                    }
                    setSpeechEnabled(!speechEnabled);
                  }}
                  className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
                    speechEnabled 
                      ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                      : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                  }`}
                  title={speechEnabled ? 'Speech enabled - Click to disable' : 'Speech disabled - Click to enable'}
                >
                  {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span className="text-xs">
                    {isSpeaking ? 'Speaking...' : speechEnabled ? 'Speech On' : 'Speech Off'}
                  </span>
                </button>
              )}
              
              {/* Connection status */}
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <div className="flex items-center text-green-600">
                    <Wifi className="w-4 h-4 mr-1" />
                    <span className="text-sm">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <WifiOff className="w-4 h-4 mr-1" />
                    <span className="text-sm">Disconnected</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Safety Notice */}
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <strong>Privacy & Safety:</strong> This is an AI assistant for emotional support. 
              For crisis situations, please contact emergency services (911) or a crisis hotline (988).
              This tool doesn't replace professional therapy.
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <main className="max-w-4xl mx-auto px-4 pb-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ height: 'calc(100% - 120px)' }}>
            {messages.length === 0 && !isConnected && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <AlertTriangle className="w-12 h-12 mb-4" />
                <p className="text-lg font-medium">Connection Error</p>
                <p className="text-sm text-center max-w-md">
                  Unable to connect to the advisor service. Please make sure the backend is running.
                </p>
              </div>
            )}

            {messages.length === 0 && isConnected && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageCircle className="w-12 h-12 mb-4" />
                <p className="text-lg font-medium">Welcome to your safe space</p>
                <p className="text-sm text-center max-w-md">
                  Share your thoughts and feelings. I'm here to listen and provide support.
                </p>
              </div>
            )}

            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message.text}
                isUser={message.isUser}
                timestamp={message.timestamp}
              />
            ))}

            {isLoading && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white rounded-2xl px-4 py-3 shadow-md">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Error Display */}
          {error && (
            <div className="px-6 py-2">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Chat Input */}
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            disabled={!isConnected}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
