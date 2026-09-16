import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY, AUTH_EXPIRES_AT_KEY, JWT_EXPIRES_IN_MINUTES } from "@/constants/auth";
import { authApi } from "../api/auth.api";
import type { AuthUser, LoginPayload } from "../types";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoggingIn: boolean;
  login: (payload: LoginPayload, rememberMe?: boolean) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY) ?? sessionStorage.getItem(AUTH_USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function readStoredExpiresAt(): number | null {
  const raw = localStorage.getItem(AUTH_EXPIRES_AT_KEY) ?? sessionStorage.getItem(AUTH_EXPIRES_AT_KEY);
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

function clearAuthStorage() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_EXPIRES_AT_KEY);
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_USER_KEY);
  sessionStorage.removeItem(AUTH_EXPIRES_AT_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // If a previously stored session has already passed its expiry (e.g. the
  // tab was closed and reopened days later), treat it as logged out from
  // the very first render instead of briefly showing stale authenticated UI.
  const initialExpiresAt = readStoredExpiresAt();
  const alreadyExpired = initialExpiresAt !== null && Date.now() >= initialExpiresAt;
  if (alreadyExpired) clearAuthStorage();

  const [token, setToken] = useState<string | null>(() =>
    alreadyExpired ? null : localStorage.getItem(AUTH_TOKEN_KEY) ?? sessionStorage.getItem(AUTH_TOKEN_KEY)
  );
  const [user, setUser] = useState<AuthUser | null>(() => (alreadyExpired ? null : readStoredUser()));
  const [expiresAt, setExpiresAt] = useState<number | null>(() => (alreadyExpired ? null : initialExpiresAt));
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const logout = useCallback(() => {
    clearAuthStorage();
    setToken(null);
    setUser(null);
    setExpiresAt(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const login = useCallback(async (payload: LoginPayload, rememberMe = true) => {
    setIsLoggingIn(true);
    try {
      const result = await authApi.login(payload);
      const expiry = Date.now() + JWT_EXPIRES_IN_MINUTES * 60 * 1000;
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem(AUTH_TOKEN_KEY, result.token);
      storage.setItem(AUTH_USER_KEY, JSON.stringify(result.user));
      storage.setItem(AUTH_EXPIRES_AT_KEY, String(expiry));
      setToken(result.token);
      setUser(result.user);
      setExpiresAt(expiry);
      return result.user;
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  // Schedules the auto-logout to fire exactly when the session should
  // expire — mirroring the backend's JWT_EXPIRES_IN — instead of waiting
  // for the next API call to fail with 401.
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (!token || !expiresAt) return;

    const msRemaining = expiresAt - Date.now();
    if (msRemaining <= 0) {
      logout();
      return;
    }

    // setTimeout has a ~24.8 day max delay; JWT_EXPIRES_IN is realistically
    // always far shorter, but clamp defensively anyway.
    const delay = Math.min(msRemaining, 2 ** 31 - 1);
    timeoutRef.current = setTimeout(() => {
      logout();
      toast.error("Sesi Anda telah berakhir, silakan login kembali");
    }, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [token, expiresAt, logout]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoggingIn,
      login,
      logout,
    }),
    [user, token, isLoggingIn, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
