import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import type { RefreshTokenResponse } from "@/types/authTypes";
import { API_URL_BACK_END } from "./env";

/**
 * Extends the Axios request configuration with a retry flag.
 *
 * This flag indicates whether a failed request has already been retried after
 * refreshing the access token.
 *
 * It prevents infinite refresh/retry loops when the retried request also
 * returns HTTP 401.
 */
interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Handlers used by the authentication response interceptor.
 *
 * Axios is responsible for detecting authentication-related HTTP situations,
 * while the authentication layer is responsible for updating application
 * state and handling navigation.
 */
interface AuthInterceptorHandlers {
  onAccessTokenRefreshed: (token: string) => void;
  onSessionExpired: () => void;
}

/**
 * Shared Axios instance used to communicate with the back-end API.
 *
 * Credentials are enabled so the browser can automatically send and receive
 * the HttpOnly refresh token cookie used by the authentication flow.
 */
const api = axios.create({
  baseURL: API_URL_BACK_END,
  withCredentials: true,
});

/**
 * Determines whether a request targets an authentication endpoint.
 *
 * Authentication endpoints do not require the current access token in the
 * Authorization header.
 *
 * @param url request URL
 * @returns true when the request targets an authentication endpoint
 */
const isAuthEndpoint = (url?: string): boolean => {
  return (
    url?.includes("/auth/login") === true ||
    url?.includes("/auth/refresh") === true ||
    url?.includes("/auth/logout") === true
  );
};

/**
 * Represents the refresh operation currently in progress.
 *
 * Several protected requests may receive HTTP 401 simultaneously when the
 * access token expires.
 *
 * Sharing the same promise ensures that only one refresh request is sent to
 * the backend. The remaining failed requests wait for that same operation.
 *
 * This is especially important because refresh tokens are rotated and should
 * not be reused simultaneously.
 */
let refreshPromise: Promise<string> | null = null;

/**
 * Request interceptor.
 *
 * Adds the current access token to protected API requests using the Bearer
 * authentication scheme.
 *
 * Authentication endpoints are excluded because:
 *
 * - Login uses username and password.
 * - Refresh uses the HttpOnly refresh token cookie.
 * - Logout uses the HttpOnly refresh token cookie.
 */
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

    if (token && !isAuthEndpoint(config.url)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

/**
 * Registers the response interceptor responsible for automatic access-token
 * renewal.
 *
 * Authentication flow:
 *
 * 1. A protected request returns HTTP 401.
 * 2. The interceptor calls POST /auth/refresh.
 * 3. The browser automatically sends the HttpOnly refresh token cookie.
 * 4. The backend validates and rotates the refresh token.
 * 5. The backend returns a new access token.
 * 6. The authentication layer is notified about the new token.
 * 7. The original failed request is retried automatically.
 *
 * If the refresh operation fails, the authentication layer is notified that
 * the current session can no longer be renewed.
 *
 * @param handlers callbacks used to update the authentication state
 * @returns Axios interceptor identifier
 */
export const setupResponseInterceptor = ({
  onAccessTokenRefreshed,
  onSessionExpired,
}: AuthInterceptorHandlers): number => {
  return api.interceptors.response.use(
    /**
     * Successful responses are returned without modification.
     */
    (response) => response,

    /**
     * Handles failed responses.
     */
    async (error: AxiosError) => {
      const originalRequest = error.config as
        | RetryableRequestConfig
        | undefined;

      /**
       * Without the original request configuration, Axios cannot retry the
       * failed request.
       */
      if (!originalRequest) {
        return Promise.reject(error);
      }

      const isUnauthorized = error.response?.status === 401;

      /**
       * Do not attempt a refresh when:
       *
       * - The response is not HTTP 401.
       * - The failed request targets an authentication endpoint.
       * - The request has already been retried once.
       */
      if (
        !isUnauthorized ||
        isAuthEndpoint(originalRequest.url) ||
        originalRequest._retry
      ) {
        return Promise.reject(error);
      }

      /**
       * Mark the original request as already retried.
       */
      originalRequest._retry = true;

      /**
       * Create a refresh operation only when another one is not already
       * running.
       */
      if (!refreshPromise) {
        refreshPromise = api
          .post<RefreshTokenResponse>("/auth/refresh")
          .then((response) => {
            const newToken = response.data.token;

            /**
             * Notify the authentication layer so it can persist the new token
             * and update its React state.
             */
            onAccessTokenRefreshed(newToken);

            return newToken;
          })
          .catch((refreshError) => {
            /**
             * The refresh token can no longer renew the current session.
             *
             * Possible causes include expiration, revocation, an invalid token,
             * or a disabled user.
             */
            onSessionExpired();

            throw refreshError;
          })
          .finally(() => {
            /**
             * Clear the shared operation so a future access-token expiration
             * can trigger a new refresh request.
             */
            refreshPromise = null;
          });
      }

      try {
        /**
         * Wait for the refresh operation to finish.
         */
        await refreshPromise;

        /**
         * Retry the original request.
         *
         * The request interceptor executes again and attaches the newly
         * persisted access token.
         */
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    },
  );
};

export default api;
