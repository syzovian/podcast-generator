/*
  # Create Podcasts Storage System

  1. New Tables
    - `podcasts`
      - `id` (uuid, primary key)
      - `topic` (text, the discussion topic)
      - `script` (text, the generated script)
      - `audio_url` (text, optional URL to audio file)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `podcasts` table
    - Add policies for public read access (since this is a demo app)
    - Add policies for creating new podcasts

  3. Storage
    - Create storage bucket for audio files
    - Set up public access policies for audio files
*/

-- Create podcasts table
CREATE TABLE IF NOT EXISTS podcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  script text NOT NULL,
  audio_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (demo app)
CREATE POLICY "Anyone can read podcasts"
  ON podcasts
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create podcasts"
  ON podcasts
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update podcasts"
  ON podcasts
  FOR UPDATE
  TO public
  USING (true);

-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('podcast-audio', 'podcast-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Anyone can upload audio files"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'podcast-audio');

CREATE POLICY "Anyone can read audio files"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'podcast-audio');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_podcasts_updated_at
  BEFORE UPDATE ON podcasts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();