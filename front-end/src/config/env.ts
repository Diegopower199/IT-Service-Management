const webServer = process.env.NEXT_PUBLIC_WEB_SERVER;
const backendPort = process.env.NEXT_PUBLIC_WEB_PORT_BACK_END;

if (!webServer || !backendPort) {
  throw new Error("Backend environment variables are not configured");
}

export const API_URL_BACK_END = `http://${webServer}:${backendPort}/api/v1`;
