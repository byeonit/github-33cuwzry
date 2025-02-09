/*
  # Add Product Descriptions Table

  1. New Tables
    - `product_descriptions`
      - `id` (uuid, primary key)
      - `name` (text)
      - `details` (text)
      - `generated_description` (text)
      - `tone` (text)
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create product_descriptions table
CREATE TABLE IF NOT EXISTS product_descriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  details text NOT NULL,
  generated_description text NOT NULL,
  tone text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE product_descriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can read own product descriptions"
  ON product_descriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own product descriptions"
  ON product_descriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own product descriptions"
  ON product_descriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own product descriptions"
  ON product_descriptions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS product_descriptions_user_id_idx ON product_descriptions(user_id);
CREATE INDEX IF NOT EXISTS product_descriptions_created_at_idx ON product_descriptions(created_at DESC);