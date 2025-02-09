export interface Workspace {
  id: string;
  user_id: string;
  name: string;
  status: 'draft' | 'scheduled' | 'active' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface WorkspaceProduct {
  id: string;
  workspace_id: string;
  product_id: string;
  created_at: string;
}

export interface WorkspaceContent {
  id: string;
  workspace_id: string;
  content_type: 'social' | 'image';
  content_id: string;
  created_at: string;
}

export interface WorkspaceSchedule {
  id: string;
  workspace_id: string;
  platform: string;
  scheduled_at: string;
  content_id: string;
  status: 'pending' | 'published' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface WorkspaceStep {
  step: number;
  title: string;
  description: string;
  completed: boolean;
}

export interface WorkspaceForm {
  name: string;
  selectedProducts: string[];
  selectedContent: {
    social: string[];
    image: string[];
  };
  schedules: {
    platform: string;
    contentId: string;
    scheduledAt: string;
  }[];
}