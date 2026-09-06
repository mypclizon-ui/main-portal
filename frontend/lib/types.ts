// Shared TypeScript types for the main job portal.

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string | null;
  skills?: string | null;
  bio?: string | null;
  cv_url?: string | null;
  role: string;  // "user" | "admin"
  created_at: string;
}

export interface Job {
  id: number;
  title: string;
  company?: string | null;
  location?: string | null;
  job_type?: string | null;
  category?: string | null;
  salary?: string | null;
  description?: string | null;
  requirements?: string | null;
  deadline?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Application {
  id: number;
  job_id: number;
  user_id: number;
  status: string;
  cover_note?: string | null;
  snapshot?: { title?: string; company?: string; location?: string; salary?: string } | null;
  applied_at: string;
  updated_at: string;
  job?: Job | null;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}