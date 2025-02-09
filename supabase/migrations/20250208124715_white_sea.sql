/*
  # Digital Workspace Schema

  1. New Tables
    - `workspaces`
      - Primary workspace table for multi-channel marketing campaigns
    - `workspace_products`
      - Links products to workspaces
    - `workspace_content`
      - Links selected AI-generated content to workspaces
    - `workspace_schedules`
      - Stores publication schedules for each platform

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create workspace_products table
CREATE TABLE IF NOT EXISTS workspace_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(workspace_id, product_id)
);

-- Create workspace_content table
CREATE TABLE IF NOT EXISTS workspace_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  content_type text NOT NULL, -- 'social' or 'image'
  content_id uuid NOT NULL, -- References either social_content.id or generated_images.id
  created_at timestamptz DEFAULT now()
);

-- Create workspace_schedules table
CREATE TABLE IF NOT EXISTS workspace_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  content_id uuid NOT NULL, -- References workspace_content.id
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for workspaces
CREATE POLICY "Users can read own workspaces"
  ON workspaces FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workspaces"
  ON workspaces FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workspaces"
  ON workspaces FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workspaces"
  ON workspaces FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for workspace_products
CREATE POLICY "Users can manage own workspace products"
  ON workspace_products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE id = workspace_products.workspace_id
      AND user_id = auth.uid()
    )
  );

-- Create policies for workspace_content
CREATE POLICY "Users can manage own workspace content"
  ON workspace_content FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE id = workspace_content.workspace_id
      AND user_id = auth.uid()
    )
  );

-- Create policies for workspace_schedules
CREATE POLICY "Users can manage own workspace schedules"
  ON workspace_schedules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE id = workspace_schedules.workspace_id
      AND user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS workspaces_user_id_idx ON workspaces(user_id);
CREATE INDEX IF NOT EXISTS workspaces_status_idx ON workspaces(status);
CREATE INDEX IF NOT EXISTS workspace_products_workspace_id_idx ON workspace_products(workspace_id);
CREATE INDEX IF NOT EXISTS workspace_content_workspace_id_idx ON workspace_content(workspace_id);
CREATE INDEX IF NOT EXISTS workspace_schedules_workspace_id_idx ON workspace_schedules(workspace_id);
CREATE INDEX IF NOT EXISTS workspace_schedules_scheduled_at_idx ON workspace_schedules(scheduled_at);

-- Create updated_at triggers
CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON workspaces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspace_schedules_updated_at
  BEFORE UPDATE ON workspace_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();