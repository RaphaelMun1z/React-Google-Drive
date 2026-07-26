export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface StoredFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  ownerId: string;
  folderId: string | null;
  uploadedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  parentFolderId: string | null;
  createdAt: string;
}

export interface ApiError {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
  fields?: Record<string, string>;
}

export type SharePermission = "READ" | "EDIT";
