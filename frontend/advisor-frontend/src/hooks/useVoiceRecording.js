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
  const retryCountRef = useRef(0);

  // Check if Web Speech API is supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser');
    }
  }, []);

  // Create a fresh recognition instance each time
  const createRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
      
    // Configure recognition for better sensitivity
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;
    
    // Event handlers
    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };
    
    recognition.onresult = (event) => {
      let fullTranscript = '';
      let interimTranscript = '';
      
      // Build complete transcript from all results
      for (let i = 0; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          fullTranscript += transcriptPart;
        } else {
          interimTranscript += transcriptPart;
        }
      }
      
      const newTranscript = fullTranscript + interimTranscript;
      setTranscript(newTranscript);
      
      // Set auto-stop timeout for silence detection
      if (isRecording && (fullTranscript || interimTranscript)) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          if (isRecording) {
            stopRecording();
          }
        }, 3000);
      }
    };
    
    recognition.onerror = (event) => {
      setIsListening(false);
      setIsRecording(false);
      
      if (event.error === 'aborted') {
        return;
      }
      
      let errorMessage = '';
      switch(event.error) {
        case 'network':
          errorMessage = 'Network error. Please check your internet connection and try again.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone permissions and try again.';
          break;
        case 'no-speech':
          errorMessage = 'No speech detected. Try speaking louder or closer to the microphone.';
          break;
        case 'audio-capture':
          errorMessage = 'Audio capture failed. Please check your microphone and try again.';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }
      
      setError(errorMessage);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    return recognition;
  }, [isRecording]);

  const startRecording = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported');
      return;
    }
    
    if (!isRecording) {
      // Create a completely fresh recognition instance
      const newRecognition = createRecognition();
      if (!newRecognition) {
        setError('Failed to create speech recognition');
        return;
      }
      
      recognitionRef.current = newRecognition;
      
      setTranscript('');
      setError(null);
      setIsRecording(true);
      
      try {
        recognitionRef.current.start();
      } catch (err) {
        setError('Failed to start voice recording');
        setIsRecording(false);
      }
    }
  }, [isSupported, isRecording, createRecognition]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // Ignore errors when stopping
      }
      recognitionRef.current = null;
    }
    
    setIsRecording(false);
    setIsListening(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  // Test microphone levels
  const testMicrophone = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });
      
      // Create audio context to analyze microphone input
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // Monitor audio levels for 3 seconds
      const startTime = Date.now();
      let maxVolume = 0;
      
      const checkLevels = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        maxVolume = Math.max(maxVolume, average);
        
        if (Date.now() - startTime < 3000) {
          requestAnimationFrame(checkLevels);
        } else {
          // Clean up
          stream.getTracks().forEach(track => track.stop());
          audioContext.close();
          
          if (maxVolume < 5) {
            setError('Microphone levels very low. Check if microphone is working or increase volume.');
          } else if (maxVolume < 15) {
            setError('Microphone levels are low. Try speaking louder or increase microphone volume in Windows settings.');
          } else {
            setError(null);
          }
        }
      };
      
      checkLevels();
      
    } catch (err) {
      setError('Microphone test failed. Check microphone connection.');
    }
  }, []);

  // Request microphone permission
  const requestPermission = useCallback(async () => {
    try {
      // Check if microphone is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Microphone not available in this browser. Try using Chrome or Edge.');
        return false;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Stop the stream immediately (we just needed permission)
      stream.getTracks().forEach(track => track.stop());
      
      return true;
    } catch (err) {
      
      let errorMessage = '';
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Microphone access denied. Please click the microphone icon in your browser address bar and allow access.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No microphone found. Please connect a microphone and try again.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'Microphone not supported in this browser. Try using Chrome or Edge.';
      } else {
        errorMessage = 'Error accessing microphone. Please check your browser settings.';
      }
      
      setError(errorMessage);
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
    testMicrophone,
  };
};

export default useVoiceRecording;
