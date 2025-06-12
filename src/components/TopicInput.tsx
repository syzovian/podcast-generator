import React, { useState } from 'react';
import { Mic, Sparkles } from 'lucide-react';

interface TopicInputProps {
  onGenerate: (topic: string) => void;
  isGenerating: boolean;
}

export function TopicInput({ onGenerate, isGenerating }: TopicInputProps) {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isGenerating) {
      onGenerate(topic.trim());
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
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a fascinating topic..."
              className="glass-input w-full px-4 py-4 text-white placeholder-gray-300 focus:outline-none transition-all duration-200"
              disabled={isGenerating}
            />
            <Mic className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-300" />
          </div>
        </div>

        <button
          type="submit"
          disabled={!topic.trim() || isGenerating}
          className="glass-button w-full bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:from-purple-700/90 hover:to-blue-700/90 disabled:from-gray-600/60 disabled:to-gray-700/60 text-white font-semibold py-4 px-6 transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
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
              onClick={() => setTopic(suggestedTopic)}
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