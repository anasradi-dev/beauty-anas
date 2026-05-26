"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signinAccount,
  signoutAccount,
  signupAccount,
} from "@/src/api/auth-api";

type User = { email: string; role: "admin" | "user" };

type AuthContextType = {
  user: User | null;
  signup: (
    email: string,
    password: string,
    adminCode?: string,
  ) => Promise<AuthResult>;
  signin: (email: string, password: string) => Promise<AuthResult>;
  signout: () => Promise<void>;
  isAdmin: boolean;
};

type AuthResult = {
  ok: boolean;
  error?: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_KEY = "beauty_current_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const raw = window.localStorage.getItem(CURRENT_KEY);
      if (raw) {
        try {
          setUser(JSON.parse(raw));
        } catch {
          window.localStorage.removeItem(CURRENT_KEY);
        }
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  async function signup(email: string, password: string, adminCode?: string) {
    try {
      const { user: newUser } = await signupAccount({
        email,
        password,
        adminCode,
      });
      window.localStorage.setItem(CURRENT_KEY, JSON.stringify(newUser));
      setUser(newUser);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to create account.",
      };
    }
  }

  async function signin(email: string, password: string) {
    try {
      const { user: current } = await signinAccount({ email, password });
      window.localStorage.setItem(CURRENT_KEY, JSON.stringify(current));
      setUser(current);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to sign in.",
      };
    }
  }

  async function signout() {
    await signoutAccount().catch(() => null);
    window.localStorage.removeItem(CURRENT_KEY);
    setUser(null);
  }

  const value: AuthContextType = {
    user,
    signup,
    signin,
    signout,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
