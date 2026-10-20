"use client";

import { UserRole } from "@/types/roleTypes";
import { createContext, useEffect, useState, type ReactNode } from "react";

interface AuthUser {
  username: string;
  rol: UserRole;
}

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  setAuthentication: (token: string, username: string, rol: UserRole) => void;
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
    const storedRol = localStorage.getItem("rol") as UserRole | null;

    if (storedToken && storedUsername && storedRol) {
      setToken(storedToken);

      setUser({
        username: storedUsername,
        rol: storedRol,
      });
    }

    setIsAuthReady(true);
  }, []);

  const setAuthentication = (
    newToken: string,
    username: string,
    rol: UserRole,
  ) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("username", username);
    localStorage.setItem("rol", rol);

    setToken(newToken);

    setUser({
      username,
      rol,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("rol");

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
