import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Volume2, SkipBack, SkipForward } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string;
  topic?: string;
}

export function AudioPlayer({ audioUrl, topic }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    setVolume(newVolume);
  };

  const skipTime = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds));
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    
    try {
      setIsDownloading(true);
      
      // Fetch the audio file as blob to avoid CORS issues
      const response = await fetch(audioUrl);
      if (!response.ok) throw new Error('Failed to fetch audio file');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = topic 
        ? `brainwaves-${topic.toLowerCase().replace(/\s+/g, '-')}.mp3`
        : 'brainwaves-episode.mp3';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading audio:', error);
      alert('Failed to download audio file. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="glass-morphism glass-audio p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Volume2 className="w-6 h-6 text-emerald-400" />
          <div>
            <h3 className="text-xl font-semibold text-white">Podcast Audio</h3>
            {topic && (
              <p className="text-sm text-gray-400 mt-1">Topic: {topic}</p>
            )}
          </div>
        </div>
        
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="glass-button p-2 text-gray-300 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Download audio"
        >
          {isDownloading ? (
            <div className="w-4 h-4 border border-gray-300/30 border-t-gray-300 rounded-full animate-spin"></div>
          ) : (
            <Download className="w-4 h-4" />
          )}
        </button>
      </div>

      <audio ref={audioRef} src={audioUrl} />

      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 slider appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => skipTime(-10)}
            className="glass-button p-2 text-gray-300 hover:text-white transition-all duration-200"
            title="Skip back 10s"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlayPause}
            className="glass-button p-4 bg-gradient-to-r from-emerald-600/80 to-blue-600/80 hover:from-emerald-700/90 hover:to-blue-700/90 rounded-full transition-all duration-200 text-white"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </button>

          <button
            onClick={() => skipTime(10)}
            className="glass-button p-2 text-gray-300 hover:text-white transition-all duration-200"
            title="Skip forward 10s"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3">
          <Volume2 className="w-4 h-4 text-gray-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="flex-1 h-2 slider appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}