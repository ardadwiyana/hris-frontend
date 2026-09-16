import axios, { AxiosError } from "axios";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY, AUTH_EXPIRES_AT_KEY } from "@/constants/auth";

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  // Fail loudly in dev if the env var was never set, instead of silently
  // hitting a relative path that would 404 against the Vite dev server.
  console.warn(
    "VITE_API_URL is not set. Requests will fail until it is defined in .env"
  );
}

export const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY) ?? sessionStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Standard shape returned by the HRIS backend's error middleware.
export interface ApiErrorPayload {
  success: false;
  message?: string;
  error?: string;
  errors?: { field: string; message: string }[];
}

export class ApiError extends Error {
  status?: number;
  fieldErrors?: { field: string; message: string }[];

  constructor(message: string, status?: number, fieldErrors?: { field: string; message: string }[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorPayload>) => {
    const status = error.response?.status;
    const payload = error.response?.data;

    if (status === 401 || status === 403) {
      // Token missing/invalid/expired, or role not authorized.
      // Clear session and force a re-login rather than leaving the app
      // in a half-authenticated state.
      const isAuthEndpoint = error.config?.url?.includes("/auth/");
      if (status === 401 && !isAuthEndpoint) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
        localStorage.removeItem(AUTH_EXPIRES_AT_KEY);
        sessionStorage.removeItem(AUTH_TOKEN_KEY);
        sessionStorage.removeItem(AUTH_USER_KEY);
        sessionStorage.removeItem(AUTH_EXPIRES_AT_KEY);
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    const message =
      payload?.message ||
      payload?.error ||
      error.message ||
      "Terjadi kesalahan, silakan coba lagi";

    return Promise.reject(new ApiError(message, status, payload?.errors));
  }
);
