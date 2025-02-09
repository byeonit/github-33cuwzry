/*
  # Add RLS Policies for Workspace System

  1. Security
    - Enable RLS on workspace tables
    - Add policies for authenticated users to manage their own workspaces
    - Add policies for related tables (workspace_products, workspace_content, workspace_schedules)

  2. Changes
    - Add RLS policies for workspaces table
    - Add RLS policies for workspace_products table
    - Add RLS policies for workspace_content table
    - Add RLS policies for workspace_schedules table
*/

-- Workspaces table policies
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create own workspaces"
  ON workspaces FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own workspaces"
  ON workspaces FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own workspaces"
  ON workspaces FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workspaces"
  ON workspaces FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Workspace products table policies
ALTER TABLE workspace_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage workspace products"
  ON workspace_products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE id = workspace_products.workspace_id
      AND user_id = auth.uid()
    )
  );

-- Workspace content table policies
ALTER TABLE workspace_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage workspace content"
  ON workspace_content FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE id = workspace_content.workspace_id
      AND user_id = auth.uid()
    )
  );

-- Workspace schedules table policies
ALTER TABLE workspace_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage workspace schedules"
  ON workspace_schedules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE id = workspace_schedules.workspace_id
      AND user_id = auth.uid()
    )
  );