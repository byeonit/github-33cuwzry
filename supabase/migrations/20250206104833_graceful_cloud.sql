/*
  # Add Generated Images Table

  1. New Tables
    - `generated_images`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `user_id` (uuid, foreign key to auth.users)
      - `platform` (text)
      - `image_url` (text)
      - `prompt` (text)
      - `options` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `generated_images` table
    - Add policies for authenticated users to manage their own images
*/

-- Create generated_images table
CREATE TABLE IF NOT EXISTS generated_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL,
  image_url text NOT NULL,
  prompt text NOT NULL,
  options jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can read own generated images"
  ON generated_images
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own generated images"
  ON generated_images
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own generated images"
  ON generated_images
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS generated_images_product_id_idx ON generated_images(product_id);
CREATE INDEX IF NOT EXISTS generated_images_user_id_idx ON generated_images(user_id);
CREATE INDEX IF NOT EXISTS generated_images_platform_idx ON generated_images(platform);
CREATE INDEX IF NOT EXISTS generated_images_created_at_idx ON generated_images(created_at DESC);