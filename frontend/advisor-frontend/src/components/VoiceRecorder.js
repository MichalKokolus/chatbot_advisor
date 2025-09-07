/**
 * Voice recorder component with visual feedback
 */

import React, { useEffect } from 'react';
import { Mic, MicOff, Volume2, TestTube } from 'lucide-react';
import useVoiceRecording from '../hooks/useVoiceRecording';

const VoiceRecorder = ({ onTranscript, disabled }) => {
  const {
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
  } = useVoiceRecording();

  // Send transcript to parent when recording stops (with debouncing)
  useEffect(() => {
    if (!isRecording && !isListening && transcript.trim() && onTranscript) {
      console.log('🎤 Recording fully stopped, sending voice transcript:', transcript.trim());
      
      // Store the transcript and clear it immediately to prevent re-processing
      const finalTranscript = transcript.trim();
      clearTranscript(); // Clear immediately
      
      // Send to parent with a small delay to ensure state is clean
      setTimeout(() => {
        onTranscript(finalTranscript);
      }, 100);
    }
  }, [isRecording, isListening, transcript, onTranscript, clearTranscript]);

  const handleToggleRecording = async () => {
    if (!isSupported) {
      return;
    }

    console.log('🎤 Simple toggle clicked, current states:', { isRecording, isListening });

    if (!isRecording && !isListening) {
      // Start recording - SIMPLE approach
      console.log('🎤 Starting recording...');
      startRecording();
    } else {
      // Stop recording
      console.log('🎤 Stopping recording...');
      stopRecording();
    }
  };

  if (!isSupported) {
    return (
      <div className="flex items-center justify-center p-4 bg-red-50 border border-red-200 rounded-lg">
        <MicOff className="w-5 h-5 text-red-500 mr-2" />
        <span className="text-sm text-red-700">
          Voice recording not supported in this browser
        </span>
      </div>
    );
  }

      return (
      <div className="voice-recorder flex items-center space-x-2">
        {/* Voice Recording Button */}
        <button
        onClick={handleToggleRecording}
        disabled={disabled}
        className={`relative w-12 h-12 rounded-full border-2 transition-all duration-200 ${
          (isRecording || isListening)
            ? 'bg-red-500 border-red-600 text-white animate-pulse'
            : disabled
            ? 'bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed'
            : 'bg-primary-500 border-primary-600 text-white hover:bg-primary-600 active:scale-95'
        }`}
        title={(isRecording || isListening) ? 'Stop recording' : 'Start voice recording'}
      >
        {isRecording ? (
          <MicOff className="w-5 h-5 mx-auto" />
        ) : (
          <Mic className="w-5 h-5 mx-auto" />
        )}
        
        {/* Recording indicator pulse */}
        {(isRecording || isListening) && (
          <div className="absolute inset-0 rounded-full border-2 border-red-300 animate-ping" />
        )}
      </button>

      {/* Microphone Test Button */}
      <button
        onClick={testMicrophone}
        disabled={disabled || isRecording}
        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all duration-200 disabled:opacity-50"
        title="Test microphone levels"
      >
        <TestTube className="w-4 h-4 mx-auto" />
      </button>

      {/* Status indicator */}
      {isListening && (
        <div className="flex items-center mt-2 text-sm text-gray-600">
          <Volume2 className="w-4 h-4 mr-1 animate-bounce" />
          <span>Listening...</span>
        </div>
      )}

      {/* Live transcript preview */}
      {transcript && isRecording && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Speaking:</span> {transcript}
          </p>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
