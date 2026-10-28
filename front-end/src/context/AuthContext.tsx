"use client";

import type { UserRole } from "@/types/roleTypes";
import { createContext, useEffect, useState, type ReactNode } from "react";

interface AuthUser {
  username: string;
  role: UserRole;
}

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  setAuthentication: (token: string, username: string, role: UserRole) => void;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role") as UserRole | null;

    if (storedToken && storedUsername && storedRole) {
      setToken(storedToken);

      setUser({
        username: storedUsername,
        role: storedRole,
      });
    }

    setIsAuthReady(true);
  }, []);

  const setAuthentication = (
    newToken: string,
    username: string,
    role: UserRole,
  ) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("username", username);
    localStorage.setItem("role", role);

    setToken(newToken);

    setUser({
      username,
      role,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    setToken(null);
    setUser(null);
  };

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        isAuthReady,
        setAuthentication,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
