import React from 'react';
import { FileText, Volume2, CheckCircle, FileSearch } from 'lucide-react';

interface LoadingStateProps {
  currentStep: 'idle' | 'script' | 'summary' | 'audio';
}

export function LoadingState({ currentStep }: LoadingStateProps) {
  const steps = [
    { key: 'script', icon: FileText, label: 'Generating Script', description: 'Creating conversational dialogue...' },
    { key: 'summary', icon: FileSearch, label: 'Creating Summary', description: 'Generating episode preview...' },
    { key: 'audio', icon: Volume2, label: 'Synthesizing Audio', description: 'Converting to speech with AI voices...' },
  ];

  return (
    <div className="glass-morphism glass-loading p-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-semibold text-white mb-2">Creating Your Podcast</h3>
        <p className="text-gray-300">Sit tight while we work our magic</p>
      </div>

      <div className="space-y-6">
        {steps.map((step, index) => {
          const isActive = currentStep === step.key;
          const isCompleted = 
            (step.key === 'script' && ['summary', 'audio'].includes(currentStep)) ||
            (step.key === 'summary' && ['audio'].includes(currentStep)) ||
            (step.key === 'audio' && currentStep === 'idle');

          return (
            <div key={step.key} className="flex items-center gap-4">
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                isCompleted 
                  ? 'bg-green-500/80 text-white backdrop-blur-sm' 
                  : isActive 
                    ? 'bg-amber-500/80 text-white backdrop-blur-sm' 
                    : 'glass-button text-gray-400'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <step.icon className={`w-6 h-6 ${isActive ? 'animate-pulse' : ''}`} />
                )}
              </div>
              
              <div className="flex-1">
                <h4 className={`font-medium ${isActive || isCompleted ? 'text-white' : 'text-gray-400'}`}>
                  {step.label}
                </h4>
                <p className={`text-sm ${isActive ? 'text-gray-300' : 'text-gray-500'}`}>
                  {step.description}
                </p>
              </div>

              {isActive && (
                <div className="w-6 h-6 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}