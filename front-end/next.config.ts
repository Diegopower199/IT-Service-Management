import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/**
 * Backend URL used by the cloud API proxy.
 *
 * Configured in Vercel as BACKEND_PROXY_URL.
 * When undefined, local Docker environments remain unchanged.
 */
const backendProxyUrl = process.env.BACKEND_PROXY_URL?.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  output: "standalone",

  /**
   * Proxies API requests to the Spring Boot backend
   * when the cloud backend URL is configured.
   */
  async rewrites() {
    if (!backendProxyUrl) {
      return [];
    }

    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendProxyUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
