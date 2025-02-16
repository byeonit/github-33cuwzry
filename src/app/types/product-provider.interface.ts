export interface PinterestBoardsProvider {
  id: string;
  crated_at: string;
  name: string;
  owner: string;
  description: string;
  board_id: string;
  is_active: boolean;
  settings: Record<string, any>;
}
