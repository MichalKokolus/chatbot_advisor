/**
 * Custom hook for voice recording functionality using Web Speech API
 */

import { useState, useRef, useEffect, useCallback } from 'react';

const useVoiceRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  // Check if Web Speech API is supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      // Initialize speech recognition
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      
      // Configure recognition
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      
      // Event handlers
      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        console.log('🎤 Voice recognition started');
      };
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart;
          } else {
            interimTranscript += transcriptPart;
          }
        }
        
        setTranscript(finalTranscript + interimTranscript);
        
        // Auto-stop after silence (reset timeout)
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          if (isRecording) {
            stopRecording();
          }
        }, 3000); // Stop after 3 seconds of silence
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
        setIsRecording(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
        console.log('🎤 Voice recognition ended');
      };
      
    } else {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser');
    }
    
    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported');
      return;
    }
    
    if (recognitionRef.current && !isRecording) {
      setTranscript('');
      setError(null);
      setIsRecording(true);
      
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Error starting recognition:', err);
        setError('Failed to start voice recording');
        setIsRecording(false);
      }
    }
  }, [isSupported, isRecording]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      setIsRecording(false);
      recognitionRef.current.stop();
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [isRecording]);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  // Request microphone permission
  const requestPermission = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (err) {
      console.error('Microphone permission denied:', err);
      setError('Microphone permission is required for voice input');
      return false;
    }
  }, []);

  return {
    isRecording,
    isListening,
    transcript,
    error,
    isSupported,
    startRecording,
    stopRecording,
    clearTranscript,
    requestPermission,
  };
};

export default useVoiceRecording;
