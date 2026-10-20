"use client";

import { createContext, useEffect, useState, type ReactNode } from "react";

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  setAuthentication: (token: string) => void;
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
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      setToken(storedToken);
    }

    setIsAuthReady(true);
  }, []);

  const setAuthentication = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  const isAuthenticated = token !== null;

  return (
    <AuthContext.Provider
      value={{
        token,
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
