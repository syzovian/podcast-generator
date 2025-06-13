import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Podcast {
  id: string;
  topic: string;
  script: string;
  audio_url?: string;
  created_at: string;
  updated_at: string;
}

export async function savePodcast(topic: string, script: string): Promise<Podcast> {
  const { data, error } = await supabase
    .from('podcasts')
    .insert([{ topic, script }])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save podcast: ${error.message}`);
  }

  return data;
}

export async function updatePodcastAudio(id: string, audioBlob: Blob): Promise<string> {
  // Upload audio file to storage
  const fileName = `${id}.mp3`;
  const { error: uploadError } = await supabase.storage
    .from('podcast-audio')
    .upload(fileName, audioBlob, {
      contentType: 'audio/mpeg',
      upsert: true
    });

  if (uploadError) {
    throw new Error(`Failed to upload audio: ${uploadError.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('podcast-audio')
    .getPublicUrl(fileName);

  // Update podcast record with audio URL
  const { error: updateError } = await supabase
    .from('podcasts')
    .update({ audio_url: publicUrl })
    .eq('id', id);

  if (updateError) {
    throw new Error(`Failed to update podcast with audio URL: ${updateError.message}`);
  }

  return publicUrl;
}

export async function getPodcasts(limit = 10): Promise<Podcast[]> {
  const { data, error } = await supabase
    .from('podcasts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch podcasts: ${error.message}`);
  }

  return data || [];
}

export async function getPodcast(id: string): Promise<Podcast | null> {
  const { data, error } = await supabase
    .from('podcasts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch podcast: ${error.message}`);
  }

  return data;
}

export async function deletePodcast(id: string): Promise<void> {
  // First, try to delete the audio file from storage
  try {
    const fileName = `${id}.mp3`;
    await supabase.storage
      .from('podcast-audio')
      .remove([fileName]);
  } catch (error) {
    // Continue even if audio deletion fails - the database record is more important
    console.warn('Failed to delete audio file:', error);
  }

  // Delete the podcast record
  const { error } = await supabase
    .from('podcasts')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete podcast: ${error.message}`);
  }
}