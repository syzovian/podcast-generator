import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Sparkles } from 'lucide-react';

interface TopicInputProps {
  onGenerate: (topic: string) => void;
  isGenerating: boolean;
  currentTopic: string;
  setCurrentTopic: (topic: string) => void;
}

export function TopicInput({ onGenerate, isGenerating, currentTopic, setCurrentTopic }: TopicInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
      
      // Initialize speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setCurrentTopic(transcript);
        setIsListening(false);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access and try again.');
        } else if (event.error === 'no-speech') {
          alert('No speech detected. Please try again.');
        } else {
          alert('Speech recognition error. Please try again.');
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [setCurrentTopic]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(currentTopic.trim());
  };

  const toggleVoiceInput = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        alert('Failed to start voice input. Please try again.');
      }
    }
  };

  const suggestedTopics = [
    'The Future of Artificial Intelligence',
    'Climate Change Solutions',
    'Space Exploration and Mars Colonization',
    'The Psychology of Social Media',
    'Renewable Energy Technologies',
    'Mental Health in the Digital Age'
  ];

  return (
    <div className="glass-morphism glass-topic p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="topic" className="block text-lg font-medium text-white mb-3">
            What topic should Evan and Alex discuss?
          </label>
          <div className="relative">
            <input
              id="topic"
              type="text"
              value={currentTopic}
              onChange={(e) => setCurrentTopic(e.target.value)}
              placeholder="Enter a fascinating topic..."
              className="glass-input w-full px-4 py-4 pr-14 text-white placeholder-gray-300 focus:outline-none transition-all duration-200"
              disabled={isGenerating}
            />
            
            {speechSupported && (
              <button
                type="button"
                onClick={toggleVoiceInput}
                disabled={isGenerating}
                className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors duration-200 ${
                  isListening 
                    ? 'text-red-400 hover:text-red-300' 
                    : 'text-gray-400 hover:text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={isListening ? 'Stop voice input' : 'Start voice input'}
              >
                {isListening ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
          
          {isListening && (
            <div className="mt-2 flex items-center gap-2 text-sm text-red-400">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              Listening... Speak your topic now
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isGenerating}
          className="glass-button w-full bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:from-purple-700/90 hover:to-blue-700/90 disabled:from-gray-600/60 disabled:to-gray-700/60 text-white font-semibold py-4 px-6 transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Generating Podcast...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Brainwaves Episode
            </>
          )}
        </button>
      </form>

      <div className="mt-8">
        <p className="text-sm text-gray-300 mb-4">Need inspiration? Try these topics:</p>
        <div className="flex flex-wrap gap-2">
          {suggestedTopics.map((suggestedTopic, index) => (
            <button
              key={index}
              onClick={() => setCurrentTopic(suggestedTopic)}
              disabled={isGenerating}
              className="glass-button px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {suggestedTopic}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}