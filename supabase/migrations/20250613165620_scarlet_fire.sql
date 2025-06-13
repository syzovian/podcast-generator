/*
  # Add Delete Policy for Podcasts

  1. Purpose
    - Add DELETE policy to allow users to delete podcast episodes
    - Maintains consistency with existing public access pattern

  2. Security
    - Allows public deletion for demo purposes
    - In production, you'd want user-specific policies
*/

-- Add delete policy for podcasts
CREATE POLICY "Anyone can delete podcasts"
  ON podcasts
  FOR DELETE
  TO public
  USING (true);

-- Add delete policy for storage objects
CREATE POLICY "Anyone can delete audio files"
  ON storage.objects
  FOR DELETE
  TO public
  USING (bucket_id = 'podcast-audio');