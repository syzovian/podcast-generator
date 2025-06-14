/*
  # Add Summary Column to Podcasts Table

  1. Purpose
    - Add summary column to store AI-generated episode summaries
    - Enable instant access to summaries without API calls
    - Improve user experience with cached summaries

  2. Changes
    - Add `summary` text column to podcasts table
    - Column is nullable to support existing records
    - No default value needed as summaries will be generated on demand

  3. Backward Compatibility
    - Existing records will have null summaries initially
    - Summaries will be generated and saved when first requested
    - No data migration needed
*/

-- Add summary column to podcasts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'podcasts' AND column_name = 'summary'
  ) THEN
    ALTER TABLE podcasts ADD COLUMN summary text;
  END IF;
END $$;