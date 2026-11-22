"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { emitAuthChanged } from "@/lib/auth-events";
import { ApiError, api } from "@/lib/api";
import type { StoreCustomer } from "@/types/store";

type AuthContextValue = {
  user: StoreCustomer | null;
  loading: boolean;
  error: string | null;
  refreshMe: () => Promise<void>;
  login: (email: string, password: string) => Promise<StoreCustomer>;
  loginWithOtp: (phone: string, otp: string) => Promise<StoreCustomer>;
  requestOtp: (phone: string) => Promise<{ message: string; phone: string; devOtp?: string }>;
  register: (input: { name: string; email: string; password: string }) => Promise<StoreCustomer>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoreCustomer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshMe = useCallback(async () => {
    try {
      const me = await api.getMe();
      setUser(me);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setUser(null);
        setError(null);
      } else {
        setError(err instanceof ApiError ? err.message : "Could not load account");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  const login = useCallback(async (email: string, password: string) => {
    const next = await api.login({ email, password });
    setUser(next);
    setError(null);
    emitAuthChanged();
    return next;
  }, []);

  const requestOtp = useCallback(async (phone: string) => {
    const result = await api.requestOtp(phone);
    setError(null);
    return result;
  }, []);

  const loginWithOtp = useCallback(async (phone: string, otp: string) => {
    const next = await api.verifyOtp({ phone, otp });
    setUser(next);
    setError(null);
    emitAuthChanged();
    return next;
  }, []);

  const register = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      const next = await api.register(input);
      setUser(next);
      setError(null);
      emitAuthChanged();
      return next;
    },
    [],
  );

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
    setError(null);
    emitAuthChanged();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      refreshMe,
      login,
      loginWithOtp,
      requestOtp,
      register,
      logout,
    }),
    [user, loading, error, refreshMe, login, loginWithOtp, requestOtp, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
