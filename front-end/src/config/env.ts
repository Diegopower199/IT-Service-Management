/**
 * Cloud API configuration (Vercel).
 *
 * Example: NEXT_PUBLIC_API_BASE_URL=/api/v1
 * Configured in Vercel environment variables.
 */
const cloudApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Local API configuration (Docker DEV / PROD).
 *
 * Uses the existing environment variables.
 */
const webServer = process.env.NEXT_PUBLIC_WEB_SERVER;
const backendPort = process.env.NEXT_PUBLIC_WEB_PORT_BACK_END;

const localApiBaseUrl =
  webServer && backendPort
    ? `http://${webServer}:${backendPort}/api/v1`
    : undefined;

/**
 * Prefer the cloud API URL when configured.
 * Otherwise, use the local Docker configuration.
 */
export const API_URL_BACK_END = cloudApiBaseUrl || localApiBaseUrl;

if (!API_URL_BACK_END) {
  throw new Error("Backend environment variables are not configured");
}
