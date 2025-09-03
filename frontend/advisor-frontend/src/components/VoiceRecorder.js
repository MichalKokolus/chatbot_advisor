/**
 * Voice recorder component with visual feedback
 */

import React, { useEffect } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
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
  } = useVoiceRecording();

  // Send transcript to parent when recording stops
  useEffect(() => {
    if (!isRecording && transcript.trim() && onTranscript) {
      onTranscript(transcript.trim());
      clearTranscript();
    }
  }, [isRecording, transcript, onTranscript, clearTranscript]);

  const handleToggleRecording = async () => {
    if (!isSupported) {
      return;
    }

    if (!isRecording) {
      const hasPermission = await requestPermission();
      if (hasPermission) {
        startRecording();
      }
    } else {
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
    <div className="voice-recorder">
      {/* Voice Recording Button */}
      <button
        onClick={handleToggleRecording}
        disabled={disabled}
        className={`relative w-12 h-12 rounded-full border-2 transition-all duration-200 ${
          isRecording
            ? 'bg-red-500 border-red-600 text-white animate-pulse'
            : disabled
            ? 'bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed'
            : 'bg-primary-500 border-primary-600 text-white hover:bg-primary-600 active:scale-95'
        }`}
        title={isRecording ? 'Stop recording' : 'Start voice recording'}
      >
        {isRecording ? (
          <MicOff className="w-5 h-5 mx-auto" />
        ) : (
          <Mic className="w-5 h-5 mx-auto" />
        )}
        
        {/* Recording indicator pulse */}
        {isRecording && (
          <div className="absolute inset-0 rounded-full border-2 border-red-300 animate-ping" />
        )}
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
