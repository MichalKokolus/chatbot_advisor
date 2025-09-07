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
      
      // Initialize speech recognition
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      
      // Configure recognition for better sensitivity
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      
      // Additional settings for better speech detection
      // Note: Don't set grammars to null as it causes errors in Chrome
      if ('serviceURI' in recognition) {
        recognition.serviceURI = ''; // Use default service
      }
      
      // Event handlers
      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        retryCountRef.current = 0; // Reset retry count on successful start
        console.log('🎤 Voice recognition started');
      };
      
      recognition.onresult = (event) => {
        console.log('🎤 Speech result event:', event.results.length, 'results');
        
        let fullTranscript = '';
        let interimTranscript = '';
        
        // Build complete transcript from all results
        for (let i = 0; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            fullTranscript += transcriptPart;
            console.log('🎤 Final transcript part:', transcriptPart);
          } else {
            interimTranscript += transcriptPart;
            console.log('🎤 Interim transcript part:', transcriptPart);
          }
        }
        
        const newTranscript = fullTranscript + interimTranscript;
        setTranscript(newTranscript);
        console.log('🎤 Complete transcript:', newTranscript);
        
        // Set auto-stop timeout for silence detection (only reset on any speech activity)
        if (isRecording && (fullTranscript || interimTranscript)) {
          // Clear existing timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          
          // Set new timeout for silence detection
          timeoutRef.current = setTimeout(() => {
            console.log('🎤 Auto-stop timeout triggered after silence');
            if (isRecording) {
              stopRecording();
            }
          }, 3000); // 3 seconds of silence to auto-stop
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error, event);
        
        let errorMessage = '';
        switch(event.error) {
          case 'network':
            errorMessage = 'Network error. Please check your internet connection and try again.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone permissions and try again.';
            break;
          case 'no-speech':
            errorMessage = 'No speech detected. Try speaking louder, getting closer to the microphone, or check your microphone settings.';
            break;
          case 'audio-capture':
            errorMessage = 'Audio capture failed. Please check your microphone and try again.';
            break;
          case 'service-not-allowed':
            errorMessage = 'Speech recognition service not allowed. Try using HTTPS or a different browser.';
            break;
          case 'aborted':
            console.log('🎤 Speech recognition was aborted (likely due to quick stop/start)');
            setIsListening(false);
            
            // If user was trying to record, try to restart once
            if (isRecording && retryCountRef.current < 1) {
              retryCountRef.current++;
              console.log('🎤 Retrying speech recognition after abort...');
              setTimeout(() => {
                if (isRecording && recognitionRef.current) {
                  try {
                    recognitionRef.current.start();
                  } catch (err) {
                    console.error('🎤 Retry failed:', err);
                    setIsRecording(false);
                  }
                }
              }, 500);
              return;
            }
            
            setIsRecording(false);
            retryCountRef.current = 0;
            return; // Exit early without setting error
          default:
            errorMessage = `Speech recognition error: ${event.error}. Try refreshing the page.`;
        }
        
        setError(errorMessage);
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
      console.log('🎤 SIMPLE start recording...');
      
      // Simple reset
      setTranscript('');
      setError(null);
      setIsRecording(true);
      
      try {
        recognitionRef.current.start();
        console.log('🎤 Recognition started successfully');
      } catch (err) {
        console.error('Error starting recognition:', err);
        setError('Failed to start voice recording');
        setIsRecording(false);
      }
    }
  }, [isSupported, isRecording]);

  const stopRecording = useCallback(() => {
    console.log('🎤 Stop recording called, current state:', { isRecording, isListening });
    
    if (recognitionRef.current) {
      try {
        // Force stop regardless of state
        recognitionRef.current.stop();
        console.log('🎤 Recognition.stop() called');
      } catch (err) {
        console.error('🎤 Error stopping recognition:', err);
      }
    }
    
    // Clear states
    setIsRecording(false);
    setIsListening(false);
    
    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    console.log('🎤 Recording stopped, states cleared');
  }, [isRecording, isListening]);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  // Test microphone levels
  const testMicrophone = useCallback(async () => {
    try {
      console.log('🎤 Testing microphone...');
      
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
          
          console.log(`🎤 Microphone test complete. Max volume detected: ${maxVolume}`);
          if (maxVolume < 5) {
            setError('Microphone levels very low. Check if microphone is working or increase volume.');
          } else if (maxVolume < 15) {
            console.log('🎤 Microphone detected but levels are low. Speech recognition may not work reliably.');
            setError('Microphone levels are low. Try speaking louder or increase microphone volume in Windows settings.');
          } else {
            console.log('🎤 Microphone appears to be working correctly');
            setError(null); // Clear any previous errors
          }
        }
      };
      
      checkLevels();
      
    } catch (err) {
      console.error('🎤 Microphone test failed:', err);
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
      
      console.log('✅ Microphone permission granted');
      return true;
    } catch (err) {
      console.error('Microphone permission error:', err);
      
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
