import type { Role } from "@/constants/auth";

export interface AuthUser {
  id: number;
  username: string;
  role: Role;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
