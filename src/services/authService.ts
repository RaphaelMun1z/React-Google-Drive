import type { AuthResponse } from "@/types/api";
import { http } from "@/services/http";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
}

export const authService = {
  async login(payload: LoginPayload) {
    const { data } = await http.post<AuthResponse>("/api/auth/login", payload);
    return data;
  },

  async register(payload: RegisterPayload) {
    const { data } = await http.post<AuthResponse>("/api/auth/registro", payload);
    return data;
  },
};
