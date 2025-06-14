import React, { useState, useEffect, useRef } from 'react';
import { History, Play, Pause, Calendar, FileText, ChevronDown, ChevronUp, Volume2, Trash2, Download } from 'lucide-react';
import { getPodcasts, deletePodcast, type Podcast } from '../lib/supabase';
import { toTitleCase } from '../lib/utils';
import { ConfirmationModal } from './ConfirmationModal';

interface PodcastHistoryProps {
  onLoadPodcast: (podcast: Podcast) => void;
  refreshTrigger: number;
}

export function PodcastHistory({ onLoadPodcast, refreshTrigger }: PodcastHistoryProps) {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSummary, setExpandedSummary] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<{ [key: string]: number }>({});
  const [audioDuration, setAudioDuration] = useState<{ [key: string]: number }>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; podcast: Podcast | null }>({
    isOpen: false,
    podcast: null
  });
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  useEffect(() => {
    loadPodcasts();
  }, [refreshTrigger]);

  const loadPodcasts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPodcasts(20);
      setPodcasts(data);
    } catch (err) {
      console.error('Error loading podcasts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load podcasts');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (podcast: Podcast, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, podcast });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.podcast) return;

    const podcastId = deleteModal.podcast.id;

    try {
      setDeletingId(podcastId);
      
      // Stop audio if it's playing
      if (playingAudio === podcastId) {
        const audio = audioRefs.current[podcastId];
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
        setPlayingAudio(null);
      }
      
      // Delete from database
      await deletePodcast(podcastId);
      
      // Remove from local state
      setPodcasts(prev => prev.filter(p => p.id !== podcastId));
      
      // Clean up audio ref and loading states
      delete audioRefs.current[podcastId];
      setAudioProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[podcastId];
        return newProgress;
      });
      setAudioDuration(prev => {
        const newDuration = { ...prev };
        delete newDuration[podcastId];
        return newDuration;
      });
      
      // Close modal
      setDeleteModal({ isOpen: false, podcast: null });
      
    } catch (error) {
      console.error('Error deleting podcast:', error);
      alert('Failed to delete episode. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, podcast: null });
  };

  const handleDownloadAudio = async (podcast: Podcast, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!podcast.audio_url) return;

    try {
      // Fetch the audio file
      const response = await fetch(podcast.audio_url);
      if (!response.ok) throw new Error('Failed to fetch audio file');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `brainwaves-${podcast.topic.toLowerCase().replace(/\s+/g, '-')}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading audio:', error);
      alert('Failed to download audio file. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleSummary = (podcast: Podcast, e: React.MouseEvent) => {
    e.stopPropagation();
    const podcastId = podcast.id;
    
    if (expandedSummary === podcastId) {
      setExpandedSummary(null);
    } else {
      setExpandedSummary(podcastId);
    }
  };

  const handleProgressBarClick = (podcast: Podcast, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!podcast.audio_url) return;

    const audioId = podcast.id;
    
    // Get or create audio element if it doesn't exist
    if (!audioRefs.current[audioId]) {
      const audio = new Audio(podcast.audio_url);
      audioRefs.current[audioId] = audio;
      
      audio.addEventListener('loadedmetadata', () => {
        setAudioDuration(prev => ({
          ...prev,
          [audioId]: audio.duration
        }));
      });
      
      audio.addEventListener('timeupdate', () => {
        setAudioProgress(prev => ({
          ...prev,
          [audioId]: (audio.currentTime / audio.duration) * 100 || 0
        }));
      });
      
      audio.addEventListener('ended', () => {
        setPlayingAudio(null);
        setAudioProgress(prev => ({ ...prev, [audioId]: 0 }));
      });
    }

    const audio = audioRefs.current[audioId];
    
    // Wait for metadata to load if not already loaded
    if (!audioDuration[audioId]) {
      // Capture the current target element and its dimensions immediately
      const currentTarget = e.currentTarget as HTMLElement;
      const rect = currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const progressPercent = clickX / rect.width;
      
      audio.addEventListener('loadedmetadata', () => {
        // Use the captured values instead of trying to access e.currentTarget
        const newTime = progressPercent * audio.duration;
        
        audio.currentTime = newTime;
        setAudioProgress(prev => ({
          ...prev,
          [audioId]: progressPercent * 100
        }));
      }, { once: true });
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progressPercent = clickX / rect.width;
    const newTime = progressPercent * audioDuration[audioId];
    
    audio.currentTime = newTime;
    setAudioProgress(prev => ({
      ...prev,
      [audioId]: progressPercent * 100
    }));
  };

  const toggleAudio = async (podcast: Podcast, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!podcast.audio_url) return;

    const audioId = podcast.id;
    
    // Stop any currently playing audio
    if (playingAudio && playingAudio !== audioId) {
      const currentAudio = audioRefs.current[playingAudio];
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
    }

    // Get or create audio element
    if (!audioRefs.current[audioId]) {
      const audio = new Audio(podcast.audio_url);
      audioRefs.current[audioId] = audio;
      
      audio.addEventListener('loadedmetadata', () => {
        setAudioDuration(prev => ({
          ...prev,
          [audioId]: audio.duration
        }));
      });
      
      audio.addEventListener('timeupdate', () => {
        setAudioProgress(prev => ({
          ...prev,
          [audioId]: (audio.currentTime / audio.duration) * 100 || 0
        }));
      });
      
      audio.addEventListener('ended', () => {
        setPlayingAudio(null);
        setAudioProgress(prev => ({ ...prev, [audioId]: 0 }));
      });
    }

    const audio = audioRefs.current[audioId];

    if (playingAudio === audioId) {
      // Pause current audio
      audio.pause();
      setPlayingAudio(null);
    } else {
      // Play new audio
      try {
        await audio.play();
        setPlayingAudio(audioId);
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="glass-morphism glass-history p-6">
        <div className="flex items-center gap-3 mb-6">
          <History className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-semibold text-white">All Episodes</h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-button p-4 animate-pulse">
              <div className="h-4 bg-white/10 rounded mb-2"></div>
              <div className="h-3 bg-white/5 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-morphism glass-history p-6">
        <div className="flex items-center gap-3 mb-6">
          <History className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-semibold text-white">All Episodes</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">Failed to load history</p>
          <button
            onClick={loadPodcasts}
            className="glass-button px-4 py-2 text-sm text-blue-300 hover:text-blue-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="glass-morphism glass-history p-6 relative">
        <div className="flex items-center gap-3 mb-6">
          <History className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-semibold text-white">All Episodes</h3>
        </div>

        {podcasts.length === 0 ? (
          <div className="text-center py-8">
            <History className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No episodes yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Generate your first podcast to see it here
            </p>
          </div>
        ) : (
          <div 
            className="space-y-3 pr-4" 
            style={{ 
              height: '400px',
              overflowY: 'auto' 
            }}
          >
            {podcasts.map((podcast, index) => (
              <div 
                key={podcast.id} 
                className={`glass-button p-3 transition-all duration-150 group hover:bg-white/15 relative ${
                  index === 0 ? 'mt-1' : ''
                } ${deletingId === podcast.id ? 'opacity-50 pointer-events-none' : ''}`}
                style={{ 
                  zIndex: podcasts.length - index, 
                  minHeight: expandedSummary === podcast.id ? 'auto' : '120px',
                  height: expandedSummary === podcast.id ? 'auto' : '120px'
                }}
              >
                {/* Main Episode Info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white text-sm mb-1 group-hover:text-purple-300 transition-colors duration-150">
                      {truncateText(toTitleCase(podcast.topic), 45)}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(podcast.created_at)}
                      </div>
                      {podcast.audio_url && (
                        <div className="flex items-center gap-1 text-emerald-400">
                          <Volume2 className="w-3 h-3" />
                          Audio
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDeleteClick(podcast, e)}
                    disabled={deletingId === podcast.id}
                    className="glass-button p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-150 opacity-0 group-hover:opacity-100"
                    title="Delete episode"
                  >
                    {deletingId === podcast.id ? (
                      <div className="w-3 h-3 border border-red-400/30 border-t-red-400 rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                  </button>
                </div>

                {/* Audio Progress Bar - Always visible if audio exists, clickable */}
                {podcast.audio_url && (
                  <div className="mt-2 mb-2">
                    <div 
                      className="w-full bg-white/10 rounded-full h-1 cursor-pointer hover:h-1.5 transition-all duration-150"
                      onClick={(e) => handleProgressBarClick(podcast, e)}
                      title="Click to seek"
                    >
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${audioProgress[podcast.id] || 0}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {podcast.audio_url && (
                    <>
                      <button
                        onClick={(e) => toggleAudio(podcast, e)}
                        className="glass-button px-3 py-1.5 text-xs text-emerald-300 hover:text-emerald-200 transition-all duration-150 flex items-center gap-1"
                      >
                        {playingAudio === podcast.id ? (
                          <>
                            <Pause className="w-3 h-3" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3" />
                            Play
                          </>
                        )}
                      </button>

                      <button
                        onClick={(e) => handleDownloadAudio(podcast, e)}
                        className="glass-button px-3 py-1.5 text-xs text-gray-300 hover:text-white transition-all duration-150 flex items-center gap-1"
                        title="Download audio"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={(e) => toggleSummary(podcast, e)}
                    className="glass-button px-3 py-1.5 text-xs text-blue-300 hover:text-blue-200 transition-all duration-150 flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3" />
                    Summary
                    {expandedSummary === podcast.id ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLoadPodcast(podcast);
                    }}
                    className="glass-button px-3 py-1.5 text-xs text-purple-300 hover:text-purple-200 transition-all duration-150 ml-auto"
                  >
                    Load Full
                  </button>
                </div>

                {/* Expanded Summary */}
                {expandedSummary === podcast.id && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="glass-input bg-black/20 rounded-lg p-3">
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {podcast.summary || 'Summary not available for this episode.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Deletion Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Episode"
        message={`Are you sure you want to delete "${deleteModal.podcast?.topic}"? This action cannot be undone and will permanently remove both the script and audio file.`}
        confirmText="Delete Episode"
        cancelText="Keep Episode"
        isDestructive={true}
        isLoading={deletingId === deleteModal.podcast?.id}
      />
    </>
  );
}