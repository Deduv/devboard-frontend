export interface Project {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  owner_id: number;
}

export interface ProjectListResponse {
  data: Project[];
  total: number;
  skip: number;
  limit: number;
}
