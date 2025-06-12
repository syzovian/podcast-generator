import React from 'react';
import { Radio, Waves } from 'lucide-react';

export function Header() {
  return (
    <header className="text-center mb-12">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="relative">
          <Radio className="w-8 h-8 text-purple-400" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
        </div>
        <h1 className="text-4xl font-bold text-white">Brainwaves</h1>
        <Waves className="w-8 h-8 text-blue-400" />
      </div>
      <p className="text-xl text-gray-300 mb-2">AI Podcast Generator</p>
      <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
        Generate dynamic conversations between hosts Evan and Alex on any topic. 
        Create engaging podcast scripts and high-quality audio in minutes.
      </p>
    </header>
  );
}