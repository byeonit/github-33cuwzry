-- Create campaign_providers table
CREATE TABLE IF NOT EXISTS campaign_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider text NOT NULL,
  webhook_url text,
  is_active boolean DEFAULT true,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- Enable Row Level Security
ALTER TABLE campaign_providers ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can read own campaign providers"
  ON campaign_providers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own campaign providers"
  ON campaign_providers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaign providers"
  ON campaign_providers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaign providers"
  ON campaign_providers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS campaign_providers_user_id_idx ON campaign_providers(user_id);
CREATE INDEX IF NOT EXISTS campaign_providers_provider_idx ON campaign_providers(provider);

-- Create updated_at trigger
CREATE TRIGGER update_campaign_providers_updated_at
  BEFORE UPDATE ON campaign_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
