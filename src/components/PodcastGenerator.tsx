import React, { useState } from 'react';
import { TopicInput } from './TopicInput';
import { ScriptDisplay } from './ScriptDisplay';
import { AudioPlayer } from './AudioPlayer';
import { LoadingState } from './LoadingState';

export interface PodcastData {
  script: string;
  audioUrl?: string;
}

export function PodcastGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [podcastData, setPodcastData] = useState<PodcastData | null>(null);
  const [currentStep, setCurrentStep] = useState<'idle' | 'script' | 'audio'>('idle');

  const handleGeneratePodcast = async (topic: string) => {
    setIsGenerating(true);
    setCurrentStep('script');
    setPodcastData(null);

    try {
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase is not configured. Please click "Connect to Supabase" in the top right corner to set up your project.');
      }

      // Generate script using Supabase Edge Function
      const script = await generateScript(topic);
      setPodcastData({ script });

      setCurrentStep('audio');

      // Generate audio using Supabase Edge Function
      const audioUrl = await generateAudio(script);
      
      setPodcastData(prev => prev ? { ...prev, audioUrl } : null);
    } catch (error) {
      console.error('Error generating podcast:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to generate podcast. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Supabase is not configured')) {
          errorMessage = 'Please set up Supabase first by clicking "Connect to Supabase" in the top right corner.';
        } else if (error.message.includes('ELEVENLABS_API_KEY')) {
          errorMessage = 'ElevenLabs API key is not configured. Please add ELEVENLABS_API_KEY to your Supabase Edge Functions environment variables.';
        } else if (error.message.includes('Voice IDs not configured')) {
          errorMessage = 'Voice IDs are not configured. Please add ALEX_VOICE_ID and EVAN_VOICE_ID to your Supabase Edge Functions environment variables.';
        } else if (error.message.includes('Invalid ElevenLabs API key')) {
          errorMessage = 'Invalid ElevenLabs API key. Please check your ELEVENLABS_API_KEY in Supabase Edge Functions settings.';
        } else if (error.message.includes('Invalid voice ID')) {
          errorMessage = 'Invalid voice ID. Please check your ALEX_VOICE_ID and EVAN_VOICE_ID in Supabase Edge Functions settings.';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'ElevenLabs API rate limit exceeded. Please wait a moment and try again.';
        } else if (error.message.includes('OPENAI_API_KEY')) {
          errorMessage = 'OpenAI API key is not configured. Please add OPENAI_API_KEY to your Supabase Edge Functions environment variables.';
        } else if (error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsGenerating(false);
      setCurrentStep('idle');
    }
  };

  const generateScript = async (topic: string): Promise<string> => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(`${supabaseUrl}/functions/v1/generate-script`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic }),
    });

    if (!response.ok) {
      let errorMessage = `Script generation failed: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // If we can't parse the error response, use the default message
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (!data.script) {
      throw new Error('No script generated');
    }

    return data.script;
  };

  const generateAudio = async (script: string): Promise<string> => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(`${supabaseUrl}/functions/v1/generate-audio`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ script }),
    });

    if (!response.ok) {
      let errorMessage = `Audio generation failed: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // If we can't parse the error response, use the default message
      }
      
      throw new Error(errorMessage);
    }

    // Get the audio blob and create a URL
    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <TopicInput onGenerate={handleGeneratePodcast} isGenerating={isGenerating} />
      
      {isGenerating && <LoadingState currentStep={currentStep} />}
      
      {podcastData && (
        <div className="space-y-6">
          <ScriptDisplay script={podcastData.script} />
          {podcastData.audioUrl && <AudioPlayer audioUrl={podcastData.audioUrl} />}
        </div>
      )}
    </div>
  );
}