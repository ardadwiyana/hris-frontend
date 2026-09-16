export const AUTH_TOKEN_KEY = "hris_token";
export const AUTH_USER_KEY = "hris_user";
export const AUTH_EXPIRES_AT_KEY = "hris_token_expires_at";

// Must match the backend's JWT_EXPIRES_IN duration — see .env.example.
export const JWT_EXPIRES_IN_MINUTES = Number(import.meta.env.VITE_JWT_EXPIRES_IN_MINUTES) || 1440;

export const ROLES = ["admin", "manager", "employee"] as const;
export type Role = (typeof ROLES)[number];
