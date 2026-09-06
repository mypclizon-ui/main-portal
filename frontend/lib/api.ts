"use client";

import type { Application, Job, TokenResponse, User } from "./types";

const API_BASE = "/api"; // proxied to http://localhost:8000 via next.config.mjs

const TOKEN_KEY = "bdgc_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

async function json<T>(url: string, options: RequestInit = {}, auth = false): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return (await res.json()) as T;
}

// ------------------------------------------------------------- Auth
export async function signup(email: string, full_name: string, password: string): Promise<TokenResponse> {
  return json<TokenResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, full_name, password }),
  });
}

export async function login(email: string, password: string, remember_me = false): Promise<TokenResponse> {
  return json<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, remember_me }),
  });
}

export async function forgotPassword(email: string): Promise<{ status: string; reset_code?: string }> {
  return json<{ status: string; reset_code?: string }>("/auth/forgot", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(email: string, reset_code: string, new_password: string): Promise<TokenResponse> {
  return json<TokenResponse>("/auth/reset", {
    method: "POST",
    body: JSON.stringify({ email, reset_code, new_password }),
  });
}

export async function googleLogin(id_token: string): Promise<TokenResponse> {
  return json<TokenResponse>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ id_token }),
  });
}

export async function me(): Promise<User> {
  return json<User>("/auth/me", {}, true);
}

// ------------------------------------------------------------- Profile
export async function updateProfile(payload: Partial<User>): Promise<User> {
  return json<User>("/profile", { method: "PUT", body: JSON.stringify(payload) }, true);
}

export async function uploadCv(file: File): Promise<User> {
  const fd = new FormData();
  fd.append("file", file);
  const token = getToken();
  const res = await fetch(`${API_BASE}/profile/cv`, {
    method: "POST",
    body: fd,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return (await res.json()) as User;
}

// ------------------------------------------------------------- Jobs
export async function listJobs(params: Record<string, string> = {}): Promise<Job[]> {
  const qs = new URLSearchParams(params).toString();
  return json<Job[]>(`/jobs${qs ? `?${qs}` : ""}`);
}

/** Live portal stats (job count, user count, applications) from the DB. */
export async function getStats(): Promise<{ jobs: number; users: number; applications: number }> {
  return json("/stats");
}

export async function createJob(payload: Partial<Job> & { title: string }): Promise<Job> {
  return json<Job>("/jobs", {
    method: "POST",
    body: JSON.stringify(payload),
  }, true);
}

export async function getJob(id: number): Promise<Job> {
  return json<Job>(`/jobs/${id}`);
}

export async function getFilters(): Promise<{ categories: string[]; locations: string[]; types: string[] }> {
  return json("/jobs/filters/meta");
}

// ------------------------------------------------------------- Applications
export async function applyToJob(job_id: number, cover_note: string): Promise<Application> {
  return json<Application>(`/jobs/${job_id}/apply`, {
    method: "POST",
    body: JSON.stringify({ cover_note }),
  }, true);
}

export async function myApplications(): Promise<Application[]> {
  return json<Application[]>("/applications/me", {}, true);
}