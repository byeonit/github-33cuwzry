/*
  # Create social content table

  1. New Tables
    - `social_content`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `user_id` (uuid, foreign key to auth.users)
      - `platform` (text)
      - `content` (text)
      - `hashtags` (text)
      - `options` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `social_content` table
    - Add policies for authenticated users to manage their own content
    
  3. Indexes
    - Create indexes for frequently queried columns
*/

-- Create social_content table
CREATE TABLE IF NOT EXISTS social_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL,
  content text NOT NULL,
  hashtags text,
  options jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE social_content ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can read own social content"
  ON social_content
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own social content"
  ON social_content
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own social content"
  ON social_content
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS social_content_product_id_idx ON social_content(product_id);
CREATE INDEX IF NOT EXISTS social_content_user_id_idx ON social_content(user_id);
CREATE INDEX IF NOT EXISTS social_content_platform_idx ON social_content(platform);
CREATE INDEX IF NOT EXISTS social_content_created_at_idx ON social_content(created_at DESC);