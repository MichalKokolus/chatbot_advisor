/**
 * Custom hook for text-to-speech functionality using Web Speech API
 */

import { useState, useRef, useCallback, useEffect } from 'react';

const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);
  
  const synthRef = useRef(null);
  const utteranceRef = useRef(null);

  // Check if Web Speech Synthesis API is supported
  useEffect(() => {
    if ('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) {
      setIsSupported(true);
      synthRef.current = window.speechSynthesis;
      console.log('🔊 Text-to-Speech supported');
    } else {
      setIsSupported(false);
      setError('Text-to-speech not supported in this browser');
      console.log('❌ Text-to-Speech not supported');
    }
  }, []);

  const speak = useCallback((text, options = {}) => {
    if (!isSupported || !synthRef.current) {
      console.log('❌ Text-to-Speech not available');
      return;
    }

    // Stop any ongoing speech
    stop();

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;
      
      // Configure voice settings
      utterance.rate = options.rate || 0.9;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 0.8;
      utterance.lang = options.lang || 'en-US';
      
      // Try to use a pleasant voice
      const voices = synthRef.current.getVoices();
      const preferredVoices = voices.filter(voice => 
        voice.lang.startsWith('en') && 
        (voice.name.includes('Female') || voice.name.includes('Samantha') || voice.name.includes('Karen'))
      );
      
      if (preferredVoices.length > 0) {
        utterance.voice = preferredVoices[0];
      } else if (voices.length > 0) {
        // Fallback to first English voice
        const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
        if (englishVoice) utterance.voice = englishVoice;
      }

      // Event handlers
      utterance.onstart = () => {
        setIsSpeaking(true);
        setError(null);
        console.log('🔊 Started speaking');
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        console.log('🔊 Finished speaking');
      };

      utterance.onerror = (event) => {
        setIsSpeaking(false);
        setError(`Speech synthesis error: ${event.error}`);
        console.error('🔊 Speech synthesis error:', event.error);
      };

      // Start speaking
      synthRef.current.speak(utterance);
      
    } catch (err) {
      setError('Failed to start text-to-speech');
      console.error('🔊 Text-to-Speech error:', err);
    }
  }, [isSupported]);

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      console.log('🔊 Stopped speaking');
    }
  }, []);

  const pause = useCallback(() => {
    if (synthRef.current && isSpeaking) {
      synthRef.current.pause();
      console.log('🔊 Paused speaking');
    }
  }, [isSpeaking]);

  const resume = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.resume();
      console.log('🔊 Resumed speaking');
    }
  }, []);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isSupported,
    error,
  };
};

export default useTextToSpeech;
