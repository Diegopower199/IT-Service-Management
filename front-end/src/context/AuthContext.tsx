"use client";

import api, { setupResponseInterceptor } from "@/config/axios";
import { logout } from "@/app/modules/auth/services/authService";
import type { UserRole } from "@/types/roleTypes";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

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
  signOut: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Global authentication context.
 *
 * Provides the current authentication state and authentication-related
 * operations to components rendered inside the AuthProvider.
 */
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

/**
 * Provides authentication state and operations to the application.
 *
 * The provider is responsible for:
 *
 * - Restoring persisted authentication data when the application starts.
 * - Keeping React authentication state synchronized with localStorage.
 * - Updating the access token after an automatic token refresh.
 * - Clearing the authentication state when the session expires.
 * - Connecting the authentication state with the Axios response interceptor.
 * - Performing the complete sign-out flow.
 *
 * @param children components rendered inside the authentication provider
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  /**
   * Restores persisted authentication information when the provider is
   * initialized.
   */
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

  /**
   * Updates the access token after a successful automatic refresh.
   */
  const handleAccessTokenRefreshed = useCallback((newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  }, []);

  /**
   * Clears all authentication information stored locally.
   */
  const clearAuthentication = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    setToken(null);
    setUser(null);
  }, []);

  /**
   * Handles a session that can no longer be renewed.
   */
  const handleSessionExpired = useCallback(() => {
    clearAuthentication();
    router.replace("/login");
  }, [clearAuthentication, router]);

  /**
   * Registers the Axios response interceptor used by the automatic token
   * refresh mechanism.
   */
  useEffect(() => {
    const interceptorId = setupResponseInterceptor({
      onAccessTokenRefreshed: handleAccessTokenRefreshed,
      onSessionExpired: handleSessionExpired,
    });

    return () => {
      api.interceptors.response.eject(interceptorId);
    };
  }, [handleAccessTokenRefreshed, handleSessionExpired]);

  /**
   * Stores authentication information after a successful login.
   *
   * @param newToken access token returned by the authentication API
   * @param username authenticated username
   * @param role authenticated user's role
   */
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

  /**
   * Signs out the current authenticated session.
   *
   * The backend is notified so it can revoke the current refresh token and
   * remove the HttpOnly refresh token cookie.
   *
   * Local authentication data is always cleared, even if the logout request
   * fails.
   */
  const signOut = async (): Promise<void> => {
    try {
      await logout();
    } finally {
      clearAuthentication();
      router.replace("/login");
    }
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
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
