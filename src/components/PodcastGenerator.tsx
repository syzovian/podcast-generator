import React, { useState, useRef } from 'react';
import { TopicInput } from './TopicInput';
import { ScriptDisplay } from './ScriptDisplay';
import { AudioPlayer } from './AudioPlayer';
import { LoadingState } from './LoadingState';
import { PodcastHistory } from './PodcastHistory';
import { WarningModal } from './WarningModal';
import { savePodcast, updatePodcastAudio, type Podcast } from '../lib/supabase';

export interface PodcastData {
  id?: string;
  script: string;
  audioUrl?: string;
  topic?: string;
}

export function PodcastGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [podcastData, setPodcastData] = useState<PodcastData | null>(null);
  const [currentStep, setCurrentStep] = useState<'idle' | 'script' | 'audio'>('idle');
  const [refreshHistory, setRefreshHistory] = useState(0);
  const [currentTopic, setCurrentTopic] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const scriptRef = useRef<HTMLDivElement>(null);

  const handleGeneratePodcast = async (topic: string) => {
    if (!topic.trim()) {
      setShowWarning(true);
      return;
    }

    setIsGenerating(true);
    setCurrentStep('script');
    setPodcastData(null);
    setCurrentTopic(''); // Clear the topic field immediately

    try {
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase is not configured. Please click "Connect to Supabase" in the top right corner to set up your project.');
      }

      // Generate script using Supabase Edge Function
      const script = await generateScript(topic);
      
      // Save podcast to database
      const savedPodcast = await savePodcast(topic, script);
      
      setPodcastData({ 
        id: savedPodcast.id,
        script, 
        topic,
      });

      setCurrentStep('audio');

      // Generate audio using Supabase Edge Function
      const audioBlob = await generateAudio(script);
      
      // Upload audio and get URL
      const audioUrl = await updatePodcastAudio(savedPodcast.id, audioBlob);
      
      setPodcastData(prev => prev ? { ...prev, audioUrl } : null);
      
      // Refresh history to show the new podcast
      setRefreshHistory(prev => prev + 1);
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

  const handleLoadPodcast = (podcast: Podcast) => {
    setPodcastData({
      id: podcast.id,
      script: podcast.script,
      audioUrl: podcast.audio_url,
      topic: podcast.topic,
    });

    // Instant scroll to script section
    setTimeout(() => {
      scriptRef.current?.scrollIntoView({ 
        behavior: 'auto', // Changed from 'smooth' to 'auto' for instant scroll
        block: 'start' 
      });
    }, 100);
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

  const generateAudio = async (script: string): Promise<Blob> => {
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

    // Return the audio blob directly
    return await response.blob();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <TopicInput 
        onGenerate={handleGeneratePodcast} 
        isGenerating={isGenerating}
        currentTopic={currentTopic}
        setCurrentTopic={setCurrentTopic}
      />
      
      {isGenerating && <LoadingState currentStep={currentStep} />}
      
      {podcastData && (
        <div className="space-y-6" ref={scriptRef}>
          <ScriptDisplay script={podcastData.script} topic={podcastData.topic} />
          {podcastData.audioUrl && <AudioPlayer audioUrl={podcastData.audioUrl} topic={podcastData.topic} />}
        </div>
      )}

      <PodcastHistory 
        onLoadPodcast={handleLoadPodcast} 
        refreshTrigger={refreshHistory}
      />

      <WarningModal
        isOpen={showWarning}
        onClose={() => setShowWarning(false)}
        title="Topic Required"
        message="Please enter a topic for your podcast episode before generating."
      />
    </div>
  );
}